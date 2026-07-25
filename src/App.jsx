import { useEffect, useRef, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { lessonsByOrder } from "./data/lessons";
import { getPhase } from "./data/phases";
import {
  hasFullAccess,
  isTrialExpired,
  trialDaysLeft,
} from "./utils/subscription";
import {
  dayString,
  addDays,
  nextStreak,
  liveStreak,
  isDoneToday,
  streakAtRisk,
  milestoneReached,
} from "./utils/streak";
import PhoneShell from "./components/PhoneShell";
import Badges from "./screens/Badges";
import Landing from "./screens/Landing";
import SignUp from "./screens/SignUp";
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

/** Keep the last 60 practice days for the week strip, newest first. */
function nextPracticeDays(prev = [], today) {
  if (prev.includes(today)) return prev;
  return [today, ...prev].slice(0, 60);
}

/** Ensure subscription fields exist and expire trials past 3 days. */
async function normalizeSubscription(uid, data) {
  const now = Timestamp.now();
  let next = { ...data };
  const updates = {};

  if (!next.subscriptionStatus) {
    updates.trialStartedAt = next.trialStartedAt || now;
    updates.subscriptionStatus = "trial";
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
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [screen, setScreen] = useState("landing");
  const [paywallVariant, setPaywallVariant] = useState("subscribe");
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeExam, setActiveExam] = useState(null);
  const [activeChallenge, setActiveChallenge] = useState(null);
  // Streak milestone to celebrate on the next Complete screen, if any.
  const [celebrateStreak, setCelebrateStreak] = useState(null);
  // After signup we route to the intro paywall; don't let auth state overwrite it.
  const skipAuthHomeRef = useRef(false);

  useEffect(() => {
    console.log("speech supported:", "speechSynthesis" in window);
  }, []);

  useEffect(() => {
    console.log("[Everwise][auth] Subscribing to onAuthStateChanged…");
    const unsub = onAuthStateChanged(auth, async (u) => {
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
    return unsub;
  }, []);

  const activeLesson = lessonsByOrder[activeIndex];
  const completedLessons = profile?.completedLessons ?? [];
  const allDone = completedLessons.length >= lessonsByOrder.length;
  const subscriptionStatus = profile?.subscriptionStatus ?? "trial";
  const access = hasFullAccess(subscriptionStatus);
  const daysLeft = trialDaysLeft(profile?.trialStartedAt);
  const lessonIdSet = new Set(lessonsByOrder.map((l) => l.id));
  const lessonsCompletedCount = completedLessons.filter((id) =>
    lessonIdSet.has(id)
  ).length;
  const badgesEarnedCount = (profile?.badges ?? []).length;

  // A streak only counts if the last lesson was today or yesterday.
  const rawStreak = profile?.streak ?? 0;
  const lastCompletedDate = profile?.lastCompletedDate ?? null;
  const currentStreak = liveStreak(rawStreak, lastCompletedDate);
  const doneToday = isDoneToday(lastCompletedDate);
  const atRisk = streakAtRisk(rawStreak, lastCompletedDate);
  const practiceDays = profile?.practiceDays ?? [];

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

  /** Dev only: force a streak value and backfill matching practice days. */
  const devSetStreak = async (n) => {
    if (!user) return;
    const today = new Date();
    const days = [];
    for (let i = 0; i < n; i++) days.push(dayString(addDays(today, -i)));
    const updates = {
      streak: n,
      lastCompletedDate: n > 0 ? dayString(today) : null,
      practiceDays: days,
    };
    setProfile((p) => ({ ...p, ...updates }));
    try {
      console.log("[Everwise][firestore] dev set streak users/", user.uid, updates);
      await updateDoc(doc(db, "users", user.uid), updates);
    } catch (err) {
      console.error("[Everwise][firestore] Failed to set streak:", err);
    }
  };

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

  const signUp = async (name, email, password) => {
    try {
      // Prevent onAuthStateChanged from jumping to Home before the intro paywall.
      skipAuthHomeRef.current = true;
      console.log("[Everwise][auth] createUserWithEmailAndPassword:", email);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      console.log("[Everwise][auth] account created, uid:", cred.user.uid);

      const initial = {
        name,
        email,
        streak: 0,
        scamsCaught: 0,
        totalXp: 0,
        badges: [],
        completedLessons: [],
        lastCompletedDate: null,
        practiceDays: [],
        trialStartedAt: Timestamp.now(),
        subscriptionStatus: "trial",
        plan: null,
      };
      console.log("[Everwise][firestore] setDoc users/", cred.user.uid, initial);
      await setDoc(doc(db, "users", cred.user.uid), initial);
      console.log("[Everwise][firestore] profile document created.");

      setUser(cred.user);
      setProfile(initial);
      setPaywallVariant("intro");
      setScreen("paywall");
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

  const startFreeTrial = async () => {
    // TODO: replace with Stripe checkout
    await updateSubscription({
      subscriptionStatus: "active",
      plan: "monthly",
    });
    goHome();
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
      const today = dayString(new Date());
      const prevBadges = profile.badges ?? [];
      const prevXp = profile.totalXp ?? 0;

      const updates = {
        completedLessons: already
          ? completedLessons
          : [...completedLessons, activeLesson.id],
        totalXp: already ? prevXp : prevXp + (activeLesson.xp ?? 20),
        badges:
          already || prevBadges.includes(activeLesson.badge)
            ? prevBadges
            : [...prevBadges, activeLesson.badge],
        streak: nextStreak(
          liveStreak(profile.streak ?? 0, profile.lastCompletedDate),
          profile.lastCompletedDate,
          today
        ),
        lastCompletedDate: today,
        practiceDays: nextPracticeDays(profile.practiceDays, today),
      };

      // Only celebrate the first lesson of the day, when the streak ticks up.
      setCelebrateStreak(
        profile.lastCompletedDate === today
          ? null
          : milestoneReached(updates.streak)
      );

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
    phaseBadgeXp = 0,
  }) => {
    if (user && profile && activeExam && tier) {
      const already = completedLessons.includes(activeExam.id);
      const today = dayString(new Date());
      const prevBadges = profile.badges ?? [];
      const prevXp = profile.totalXp ?? 0;

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

      const xpGain = already
        ? 0
        : (tier.xp ?? 0) + (earnedPhaseBadge ? phaseBadgeXp : 0);

      const updates = {
        completedLessons: already
          ? completedLessons
          : [...completedLessons, activeExam.id],
        totalXp: prevXp + xpGain,
        badges: nextBadges,
        streak: nextStreak(
          liveStreak(profile.streak ?? 0, profile.lastCompletedDate),
          profile.lastCompletedDate,
          today
        ),
        lastCompletedDate: today,
        practiceDays: nextPracticeDays(profile.practiceDays, today),
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

  if (!authChecked) {
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
          onGetStarted={() => setScreen("signup")}
          onLogIn={() => setScreen("login")}
        />
      );
      break;
    case "signup":
      content = (
        <SignUp
          onSignUp={signUp}
          onGoToLogIn={() => setScreen("login")}
          onBack={() => setScreen("landing")}
        />
      );
      break;
    case "login":
      content = (
        <LogIn
          onLogIn={logIn}
          onGoToSignUp={() => setScreen("signup")}
          onBack={() => setScreen("landing")}
        />
      );
      break;
    case "home":
      content = (
        <Home
          name={profile?.name ?? ""}
          streak={currentStreak}
          scamsCaught={profile?.scamsCaught ?? 0}
          badgesEarned={badgesEarnedCount}
          practiceDays={practiceDays}
          lastCompletedDate={lastCompletedDate}
          doneToday={doneToday}
          atRisk={atRisk}
          allDone={allDone}
          subscriptionStatus={subscriptionStatus}
          trialDaysLeft={daysLeft}
          onStart={goPath}
          onOpenBadges={goBadges}
          onOpenPaywall={goPaywall}
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
          onManageSubscription={() => {
            /* placeholder — no Stripe portal yet */
          }}
          onDevResetTrial={() =>
            updateSubscription({
              trialStartedAt: Timestamp.now(),
              subscriptionStatus: "trial",
              plan: null,
            })
          }
          onDevSetActive={() =>
            updateSubscription({
              subscriptionStatus: "active",
              plan: "monthly",
            })
          }
          onDevSetExpired={() =>
            updateSubscription({
              subscriptionStatus: "expired",
            })
          }
          streak={currentStreak}
          onDevSetStreak={devSetStreak}
        />
      );
      break;
    case "paywall":
      content = (
        <Paywall
          key={`paywall-${paywallVariant}`}
          variant={paywallVariant}
          lessonsCompleted={lessonsCompletedCount}
          streak={currentStreak}
          badgesEarned={badgesEarnedCount}
          onStartTrial={startFreeTrial}
          onStartLearning={goHome}
          onMaybeLater={goHome}
        />
      );
      break;
    case "path":
      content = (
        <LessonPath
          completedLessons={completedLessons}
          streak={currentStreak}
          scamsCaught={profile?.scamsCaught ?? 0}
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
          streakMilestone={celebrateStreak}
          onDone={() => {
            setCelebrateStreak(null);
            goPath();
          }}
        />
      );
      break;
    default:
      content = null;
  }

  return (
    <PhoneShell>
      <div key={screen} className="flex flex-1 flex-col">
        {content}
      </div>
    </PhoneShell>
  );
}
