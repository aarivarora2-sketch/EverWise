import { useEffect, useRef, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import { auth, db } from "./firebase";
import { lessonsByOrder } from "./data/lessons";
import { getPhase } from "./data/phases";
import {
  hasFullAccess,
  isTrialExpired,
} from "./utils/subscription";
import PhoneShell from "./components/PhoneShell";
import Badges from "./screens/Badges";
import Landing from "./screens/Landing";
import ProfileInterview from "./screens/ProfileInterview";
import PersonalPlan from "./screens/PersonalPlan";
import LogIn from "./screens/LogIn";
import Loading from "./screens/Loading";
import Home from "./screens/Home";
import Settings from "./screens/Settings";
import Paywall from "./screens/Paywall";
import LessonPath from "./screens/LessonPath";
import LessonPlayer from "./screens/LessonPlayer";
import ChallengePlayer from "./screens/ChallengePlayer";
import ExamPlayer from "./screens/ExamPlayer";
import Complete from "./screens/Complete";
import ScamChecker from "./screens/ScamChecker";
import { warnIfNativeApiIsMissing } from "./utils/apiEndpoint";
import {
  getCurrentEntitlement,
  getSubscriptionProducts,
  nativePurchasesAvailable,
  planForProduct,
  purchaseSubscription,
  restoreSubscriptions,
} from "./services/purchases";

const TEXT_SIZE_STORAGE_KEY = "everwise-text-size";
const subscriptionBypassEnabled =
  import.meta.env.VITE_BYPASS_SUBSCRIPTION === "true";
const TEXT_SIZE_OPTIONS = new Set(
  Array.from({ length: 10 }, (_, index) => `size-${index + 1}`),
);
const LEGACY_TEXT_SIZES = {
  normal: "size-2",
  large: "size-3",
  largest: "size-4",
};

function getSavedTextSize() {
  try {
    const saved = window.localStorage.getItem(TEXT_SIZE_STORAGE_KEY);
    if (TEXT_SIZE_OPTIONS.has(saved)) return saved;
    return LEGACY_TEXT_SIZES[saved] || "size-2";
  } catch {
    return "size-2";
  }
}

/** Ensure subscription fields exist and expire trials past 7 days. */
async function normalizeSubscription(uid, data) {
  let next = { ...data };
  const updates = {};

  if (!next.subscriptionStatus) {
    updates.trialStartedAt = next.trialStartedAt || null;
    updates.subscriptionStatus = "expired";
    updates.plan = next.plan ?? null;
  } else if (
    next.subscriptionStatus === "trial" &&
    isTrialExpired(next.trialStartedAt)
  ) {
    updates.subscriptionStatus = "expired";
  }

  if (Object.keys(updates).length === 0) return next;

  next = { ...next, ...updates };
  try {
    console.log("[Everwise][firestore] subscription normalize users/", uid, updates);
    await updateDoc(doc(db, "users", uid), updates);
  } catch (err) {
    console.error("[Everwise][firestore] Failed to normalize subscription:", err);
  }
  return next;
}

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [launchAnimationDone, setLaunchAnimationDone] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [screen, setScreen] = useState("landing");
  const [paywallVariant, setPaywallVariant] = useState("subscribe");
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeExam, setActiveExam] = useState(null);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [textSize, setTextSize] = useState(getSavedTextSize);
  const [storeProducts, setStoreProducts] = useState([]);
  // After signup we route to the intro paywall; don't let auth state overwrite it.
  const skipAuthHomeRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLaunchAnimationDone(true), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    warnIfNativeApiIsMissing();

    if (Capacitor.getPlatform() === "ios") {
      Keyboard.setAccessoryBarVisible({ isVisible: false }).catch((error) => {
        console.warn("[Everwise] Keyboard accessory bar could not be hidden:", error);
      });
    }

    if (nativePurchasesAvailable()) {
      getSubscriptionProducts()
        .then(setStoreProducts)
        .catch((error) => {
          console.warn("[Everwise] Subscription products unavailable:", error);
        });
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.textSize = textSize;
    try {
      window.localStorage.setItem(TEXT_SIZE_STORAGE_KEY, textSize);
    } catch {
      // Text resizing still works for this visit when storage is unavailable.
    }
  }, [textSize]);

  useEffect(() => {
    console.log("speech supported:", "speechSynthesis" in window);
  }, []);

  useEffect(() => {
    const screenBackground = screen === "paywall" ? "#F8F5EF" : "#EFE9DC";
    const root = document.documentElement;

    // LessonPath owns its phase-aware safe-area colors. Do not overwrite them
    // from the parent after the child effect has selected the active phase.
    if (screen === "path") {
      root.style.setProperty("--everwise-safe-top", "#B5502E");
      const themeColor = document.querySelector('meta[name="theme-color"]');
      themeColor?.setAttribute("content", "#B5502E");
      return;
    }

    root.style.setProperty("--everwise-screen-background", screenBackground);
    root.style.setProperty("--everwise-safe-top", screenBackground);
    root.style.setProperty("--everwise-safe-bottom", screenBackground);

    const themeColor = document.querySelector('meta[name="theme-color"]');
    themeColor?.setAttribute("content", screenBackground);
  }, [screen]);

  useEffect(() => {
    if (!user || !nativePurchasesAvailable()) return undefined;

    let cancelled = false;
    getCurrentEntitlement()
      .then(async (entitlement) => {
        if (cancelled || !entitlement.active) return;
        const updates = {
          subscriptionStatus: "active",
          plan: planForProduct(entitlement.productId),
        };
        setProfile((current) => (current ? { ...current, ...updates } : current));
        await updateDoc(doc(db, "users", user.uid), updates);
      })
      .catch((error) => {
        console.warn("[Everwise] Current subscription could not be checked:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    console.log("[Everwise][auth] Subscribing to onAuthStateChanged…");
    let receivedInitialAuthState = false;
    const startupFallback = window.setTimeout(() => {
      if (receivedInitialAuthState) return;
      console.warn(
        "[Everwise][auth] Initial auth state timed out; opening signed-out experience.",
      );
      setAuthChecked(true);
      setScreen("landing");
    }, 2500);

    const unsub = onAuthStateChanged(auth, async (u) => {
      receivedInitialAuthState = true;
      window.clearTimeout(startupFallback);
      console.log(
        "[Everwise][auth] state changed:",
        u ? `logged in (uid: ${u.uid})` : "no user logged in"
      );
      setUser(u);
      if (u) {
        try {
          console.log("[Everwise][firestore] getDoc users/", u.uid);
          const snap = await getDoc(doc(db, "users", u.uid));
          if (snap.exists()) {
            console.log("[Everwise][firestore] profile loaded:", snap.data());
            const normalized = await normalizeSubscription(u.uid, snap.data());
            setProfile(normalized);
            if (skipAuthHomeRef.current) {
              skipAuthHomeRef.current = false;
            } else {
              setScreen("home");
            }
          } else {
            console.warn(
              "[Everwise][firestore] No profile doc for this user yet (uid:",
              u.uid + ")."
            );
          }
        } catch (err) {
          console.error("[Everwise][firestore] Failed to load profile:", err);
        }
      } else {
        setProfile(null);
        setScreen("landing");
      }
      setAuthChecked(true);
    });
    return () => {
      window.clearTimeout(startupFallback);
      unsub();
    };
  }, []);

  const activeLesson = lessonsByOrder[activeIndex];
  const completedLessons = profile?.completedLessons ?? [];
  const allDone = completedLessons.length >= lessonsByOrder.length;
  const subscriptionStatus = profile?.subscriptionStatus ?? "expired";
  const access =
    subscriptionBypassEnabled || hasFullAccess(subscriptionStatus);
  const lessonIdSet = new Set(lessonsByOrder.map((l) => l.id));
  const lessonsCompletedCount = completedLessons.filter((id) =>
    lessonIdSet.has(id)
  ).length;
  const badgesEarnedCount = (profile?.badges ?? []).length;

  const goHome = () => setScreen("home");
  const goPath = () => {
    setActiveExam(null);
    setActiveChallenge(null);
    setScreen("path");
  };
  const goPaywall = () => {
    setPaywallVariant("subscribe");
    setScreen("paywall");
  };
  const goSettings = () => setScreen("settings");
  const goBadges = () => setScreen("badges");
  const goScamChecker = () => setScreen("scam-checker");

  const updateSubscription = async (updates) => {
    if (!user) return;
    setProfile((p) => ({ ...p, ...updates }));
    try {
      console.log(
        "[Everwise][firestore] subscription update users/",
        user.uid,
        updates
      );
      await updateDoc(doc(db, "users", user.uid), updates);
    } catch (err) {
      console.error("[Everwise][firestore] Failed to update subscription:", err);
    }
  };

  const signUp = async (interview) => {
    const { name, email, password, ...profileInterview } = interview;
    try {
      // Prevent onAuthStateChanged from jumping to Home before the plan reveal.
      skipAuthHomeRef.current = true;
      console.log("[Everwise][auth] createUserWithEmailAndPassword:", email);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      console.log("[Everwise][auth] account created, uid:", cred.user.uid);

      const initial = {
        name,
        email,
        profileInterview,
        onboardingCompleted: true,
        scamsCaught: 0,
        badges: [],
        completedLessons: [],
        trialStartedAt: null,
        subscriptionStatus: "expired",
        plan: null,
      };
      console.log("[Everwise][firestore] setDoc users/", cred.user.uid, initial);
      await setDoc(doc(db, "users", cred.user.uid), initial);
      console.log("[Everwise][firestore] profile document created.");

      setUser(cred.user);
      setProfile(initial);
      setPaywallVariant("subscribe");
      setScreen("personal-plan");
    } catch (err) {
      skipAuthHomeRef.current = false;
      console.error("[Everwise][auth] Sign up failed:", err.code, err.message);
      throw err;
    }
  };

  const logIn = async (email, password) => {
    try {
      console.log("[Everwise][auth] signInWithEmailAndPassword:", email);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log("[Everwise][auth] signed in, uid:", cred.user.uid);

      console.log("[Everwise][firestore] getDoc users/", cred.user.uid);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (snap.exists()) {
        console.log("[Everwise][firestore] profile loaded:", snap.data());
        const normalized = await normalizeSubscription(
          cred.user.uid,
          snap.data()
        );
        setProfile(normalized);
      } else {
        console.warn("[Everwise][firestore] Signed in but no profile doc found.");
      }
      setUser(cred.user);
      setScreen("home");
    } catch (err) {
      console.error("[Everwise][auth] Log in failed:", err.code, err.message);
      throw err;
    }
  };

  const logOut = async () => {
    try {
      console.log("[Everwise][auth] signOut");
      await signOut(auth);
      console.log("[Everwise][auth] signed out.");
    } catch (err) {
      console.error("[Everwise][auth] Sign out failed:", err);
    }
  };

  const startLesson = (index) => {
    const lesson = lessonsByOrder[index];
    const done = lesson && completedLessons.includes(lesson.id);
    if (!access && !done) {
      goPaywall();
      return;
    }
    setActiveExam(null);
    setActiveChallenge(null);
    setActiveIndex(index);
    setScreen("lesson");
  };

  const startChallenge = (challenge) => {
    const done = completedLessons.includes(challenge.id);
    if (!access && !done) {
      goPaywall();
      return;
    }
    setActiveExam(null);
    setActiveChallenge(challenge);
    setScreen("challenge");
  };

  const startExam = (exam) => {
    const done = completedLessons.includes(exam.id);
    if (!access && !done) {
      goPaywall();
      return;
    }
    setActiveChallenge(null);
    setActiveExam(exam);
    setScreen("exam");
  };

  const startFreeTrial = async (plan = "annual") => {
    if (nativePurchasesAvailable()) {
      const entitlement = await purchaseSubscription(plan);
      if (!entitlement.active) {
        throw new Error("The subscription is not active yet.");
      }
      await updateSubscription({
        subscriptionStatus: "active",
        trialStartedAt: null,
        plan: planForProduct(entitlement.productId) || plan,
      });
    } else {
      // Browser preview only. App Store builds always use StoreKit above.
      await updateSubscription({
        subscriptionStatus: "trial",
        trialStartedAt: Timestamp.now(),
        plan,
      });
    }
    goHome();
  };

  const restorePurchase = async () => {
    const entitlement = await restoreSubscriptions();
    if (!entitlement.active) {
      throw new Error("No active subscription was found for this Apple Account.");
    }
    await updateSubscription({
      subscriptionStatus: "active",
      trialStartedAt: null,
      plan: planForProduct(entitlement.productId),
    });
    goHome();
  };

  const resetPassword = async () => {
    if (!user?.email) throw new Error("No email address is available.");
    await sendPasswordResetEmail(auth, user.email);
  };

  // Permanently deletes the learner's progress and their sign-in account.
  // Firebase requires a "recent" sign-in for account deletion; if the
  // session is stale we surface a friendly error asking them to log back
  // in and try again, rather than silently failing.
  const deleteAccount = async () => {
    if (!user) throw new Error("No account is signed in.");
    try {
      console.log("[Everwise][firestore] deleteDoc users/", user.uid);
      await deleteDoc(doc(db, "users", user.uid));
      console.log("[Everwise][auth] deleteUser", user.uid);
      await deleteUser(user);
      console.log("[Everwise][auth] account deleted.");
      setUser(null);
      setProfile(null);
      setScreen("landing");
    } catch (err) {
      console.error("[Everwise][auth] Delete account failed:", err.code, err.message);
      if (err.code === "auth/requires-recent-login") {
        throw new Error(
          "For your security, please log out and log back in, then try deleting your account again.",
        );
      }
      throw new Error(
        "We could not delete your account right now. Please try again.",
      );
    }
  };

  const finishChallenge = async () => {
    if (user && profile && activeChallenge) {
      const already = completedLessons.includes(activeChallenge.id);
      if (!already) {
        const updates = {
          completedLessons: [...completedLessons, activeChallenge.id],
        };
        setProfile((p) => ({ ...p, ...updates }));
        try {
          console.log(
            "[Everwise][firestore] challenge complete users/",
            user.uid,
            updates
          );
          await updateDoc(doc(db, "users", user.uid), updates);
          console.log("[Everwise][firestore] challenge progress saved.");
        } catch (err) {
          console.error(
            "[Everwise][firestore] Failed to save challenge:",
            err
          );
        }
      }
    }
    goPath();
  };

  const finishLesson = async () => {
    if (user && profile && activeLesson) {
      const already = completedLessons.includes(activeLesson.id);
      const prevBadges = profile.badges ?? [];

      const updates = {
        completedLessons: already
          ? completedLessons
          : [...completedLessons, activeLesson.id],
        badges:
          already || prevBadges.includes(activeLesson.badge)
            ? prevBadges
            : [...prevBadges, activeLesson.badge],
      };

      setProfile((p) => ({ ...p, ...updates }));
      try {
        console.log("[Everwise][firestore] updateDoc users/", user.uid, updates);
        await updateDoc(doc(db, "users", user.uid), updates);
        console.log("[Everwise][firestore] progress saved.");
      } catch (err) {
        console.error("[Everwise][firestore] Failed to save progress:", err);
      }
    }
    setScreen("complete");
  };

  const finishExam = async ({
    score,
    tier,
    earnedPhaseBadge,
    phaseBadge,
  }) => {
    if (user && profile && activeExam && tier) {
      const already = completedLessons.includes(activeExam.id);
      const prevBadges = profile.badges ?? [];

      let nextBadges = [...prevBadges];
      if (!already && tier.title && !nextBadges.includes(tier.title)) {
        nextBadges.push(tier.title);
      }
      if (
        earnedPhaseBadge &&
        phaseBadge &&
        !nextBadges.includes(phaseBadge)
      ) {
        nextBadges.push(phaseBadge);
      }

      const updates = {
        completedLessons: already
          ? completedLessons
          : [...completedLessons, activeExam.id],
        badges: nextBadges,
      };

      setProfile((p) => ({ ...p, ...updates }));
      try {
        console.log(
          "[Everwise][firestore] exam pass update users/",
          user.uid,
          { score, ...updates }
        );
        await updateDoc(doc(db, "users", user.uid), updates);
        console.log("[Everwise][firestore] exam progress saved.");
      } catch (err) {
        console.error("[Everwise][firestore] Failed to save exam:", err);
      }
    }
    goPath();
  };

  if (!authChecked || !launchAnimationDone) {
    return (
      <PhoneShell>
        <Loading />
      </PhoneShell>
    );
  }

  let content;
  switch (screen) {
    case "landing":
      content = (
        <Landing
          onGetStarted={() => setScreen("interview")}
          onLogIn={() => setScreen("login")}
        />
      );
      break;
    case "interview":
      content = (
        <ProfileInterview
          onComplete={signUp}
          onBack={() => setScreen("landing")}
          onLogIn={() => setScreen("login")}
        />
      );
      break;
    case "login":
      content = (
        <LogIn
          onLogIn={logIn}
          onGoToSignUp={() => setScreen("interview")}
          onBack={() => setScreen("landing")}
        />
      );
      break;
    case "home":
      content = (
        <Home
          name={profile?.name ?? ""}
          scamsCaught={profile?.scamsCaught ?? 0}
          badgesEarned={badgesEarnedCount}
          allDone={allDone}
          textSize={textSize}
          onTextSizeChange={setTextSize}
          onStart={goPath}
          onOpenBadges={goBadges}
          onOpenSettings={goSettings}
          onOpenScamChecker={goScamChecker}
        />
      );
      break;
    case "scam-checker":
      content = <ScamChecker onBack={goHome} />;
      break;
    case "badges":
      content = (
        <Badges badges={profile?.badges ?? []} onBack={goHome} />
      );
      break;
    case "settings":
      content = (
        <Settings
          subscriptionStatus={subscriptionStatus}
          trialStartedAt={profile?.trialStartedAt}
          plan={profile?.plan ?? null}
          onBack={goHome}
          onLogOut={logOut}
          onOpenPaywall={goPaywall}
          onManageSubscription={() =>
            window.open("https://apps.apple.com/account/subscriptions", "_blank")
          }
          onResetPassword={resetPassword}
          onDeleteAccount={deleteAccount}
        />
      );
      break;
    case "paywall":
      content = (
        <Paywall
          key={`paywall-${paywallVariant}`}
          variant={paywallVariant}
          textSize={textSize}
          lessonsCompleted={lessonsCompletedCount}
          badgesEarned={badgesEarnedCount}
          onStartTrial={startFreeTrial}
          onRestore={restorePurchase}
          storeProducts={storeProducts}
          onStartLearning={goHome}
          onMaybeLater={goHome}
        />
      );
      break;
    case "personal-plan":
      content = (
        <PersonalPlan
          profile={profile}
          onContinue={() => {
            setPaywallVariant("subscribe");
            setScreen("paywall");
          }}
        />
      );
      break;
    case "path":
      content = (
        <LessonPath
          completedLessons={completedLessons}
          onSelectLesson={startLesson}
          onSelectChallenge={startChallenge}
          onSelectExam={startExam}
          onBack={goHome}
        />
      );
      break;
    case "lesson":
      content = (
        <LessonPlayer
          key={activeLesson.id}
          lesson={activeLesson}
          onBack={goPath}
          onComplete={() => finishLesson()}
        />
      );
      break;
    case "challenge":
      content = (
        <ChallengePlayer
          key={activeChallenge.id}
          challenge={activeChallenge}
          onBack={goPath}
          onComplete={finishChallenge}
        />
      );
      break;
    case "exam":
      content = (
        <ExamPlayer
          key={activeExam.id}
          exam={activeExam}
          phaseColor={getPhase(activeExam.phase).accent}
          onBack={goPath}
          onPass={finishExam}
        />
      );
      break;
    case "complete":
      content = (
        <Complete
          lesson={activeLesson}
          onDone={goPath}
        />
      );
      break;
    default:
      content = null;
  }

  return (
    <PhoneShell>
      <div
        key={screen}
        className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden"
      >
        {content}
      </div>
    </PhoneShell>
  );
}
