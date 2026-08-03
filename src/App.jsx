import React, { useEffect, useRef, useState } from "react";
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
import {
  lessonsByOrder,
  challengesByOrder,
  examsByOrder,
} from "./data/lessons";
import { getPhase } from "./data/phases";
import {
  isCourseComplete,
  requiredCourseIds,
} from "./utils/courseProgress.js";
import {
  isTrialExpired,
} from "./utils/subscription";
import { resolveFullAccess } from "./utils/access.js";
import { consumePartnerFragment } from "./utils/partnerLinks.js";
import {
  claimPartnerSeat,
  fetchPartnerAccess,
  previewInvite,
} from "./services/partnerAccess.js";
import AppShell from "./components/AppShell";
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
import PartnerAccessError from "./screens/PartnerAccessError";
import { authErrorMessage } from "./utils/authErrors.js";
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
const requiredLearningIds = requiredCourseIds(
  lessonsByOrder,
  challengesByOrder,
  examsByOrder,
);
const subscriptionBypassEnabled =
  import.meta.env.DEV && import.meta.env.VITE_BYPASS_SUBSCRIPTION === "true";
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

function capturePartnerFragment() {
  const hash = window.location.hash;
  const isLearnerFragment =
    hash === "#partner" ||
    hash.startsWith("#partner=") ||
    hash.startsWith("#partner&");
  const fragment = consumePartnerFragment({ hash });
  if (fragment) return fragment;
  return isLearnerFragment ? { kind: "learner-invalid", token: null } : null;
}

function statusForPartnerError(error) {
  if (error?.code === "INVALID_INVITE") return "invalid";
  if (error?.code === "PARTNER_FULL") return "full";
  if (error?.code === "PARTNER_SUSPENDED") return "suspended";
  return "unavailable";
}

function codeForPartnerStatus(status) {
  if (status === "invalid") return "INVALID_INVITE";
  if (status === "full") return "PARTNER_FULL";
  if (status === "suspended") return "PARTNER_SUSPENDED";
  return "PARTNER_UNAVAILABLE";
}

class StalePartnerOperationError extends Error {
  constructor() {
    super("This sponsored access operation is no longer current.");
    this.name = "StalePartnerOperationError";
  }
}

async function fetchAuthoritativePartnerAccess(firebaseUser) {
  const idToken = await firebaseUser.getIdToken(true);
  return fetchPartnerAccess({ idToken });
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
  const [partnerFragment, setPartnerFragment] = useState(capturePartnerFragment);
  const [partnerStatus, setPartnerStatus] = useState(() => {
    if (partnerFragment?.kind === "learner") return "previewing";
    if (partnerFragment?.kind === "learner-invalid") return "invalid";
    return "idle";
  });
  const [partner, setPartner] = useState(null);
  const [partnerOwnerUid, setPartnerOwnerUid] = useState(null);
  const [partnerRecovery, setPartnerRecovery] = useState(null);
  const [signupRetry, setSignupRetry] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [partnerPreviewAttempt, setPartnerPreviewAttempt] = useState(0);
  const [pendingSponsoredInterview, setPendingSponsoredInterview] = useState(null);
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
  const authGenerationRef = useRef(0);
  const currentAuthUidRef = useRef(null);
  const operationIdRef = useRef(0);
  const activeOperationRef = useRef(null);
  const partnerFragmentRef = useRef(partnerFragment);
  const partnerRecoveryRef = useRef(null);

  const updatePartnerFragment = (next) => {
    partnerFragmentRef.current = next;
    setPartnerFragment(next);
  };

  const updatePartnerRecovery = (next) => {
    partnerRecoveryRef.current = next;
    setPartnerRecovery(next);
  };

  const clearAuthoritativePartner = () => {
    setPartnerOwnerUid(null);
    setPartner(null);
    if (!partnerFragmentRef.current?.token) setPartnerStatus("idle");
  };

  const beginPartnerOperation = (email) => {
    const operation = {
      id: operationIdRef.current + 1,
      authGeneration: authGenerationRef.current,
      email,
      uid: null,
      kind: "signup",
    };
    operationIdRef.current = operation.id;
    activeOperationRef.current = operation;
    return operation;
  };

  const partnerOperationIsCurrent = (operation, expectedUid = null) => {
    if (operationIdRef.current !== operation.id) return false;
    if (authGenerationRef.current === operation.authGeneration) return true;
    if (expectedUid && currentAuthUidRef.current === expectedUid) {
      operation.authGeneration = authGenerationRef.current;
      return true;
    }
    return false;
  };

  const finishPartnerOperation = (operation) => {
    if (activeOperationRef.current?.id === operation.id) {
      activeOperationRef.current = null;
    }
  };

  const beginStrictPartnerOperation = (expectedUid, email) => {
    if (!expectedUid || currentAuthUidRef.current !== expectedUid) return null;
    const operation = beginPartnerOperation(email);
    operation.uid = expectedUid;
    operation.kind = "strict-recovery";
    return operation;
  };

  const strictPartnerOperationIsCurrent = (operation) =>
    Boolean(
      operation &&
        operationIdRef.current === operation.id &&
        activeOperationRef.current?.id === operation.id &&
        authGenerationRef.current === operation.authGeneration &&
        currentAuthUidRef.current === operation.uid,
    );

  useEffect(() => {
    if (partnerFragment?.kind !== "learner" || !partnerFragment.token) {
      return undefined;
    }

    let cancelled = false;
    setPartnerStatus("previewing");
    previewInvite({ inviteToken: partnerFragment.token })
      .then((preview) => {
        if (cancelled) return;
        const branding = preview.branding || { name: preview.name };
        setPartner(branding);
        if (preview.seatAvailable) {
          setPartnerStatus("ready");
        } else {
          setPartnerStatus("full");
          updatePartnerFragment(null);
        }
      })
      .catch((error) => {
        if (cancelled) return;
        const nextStatus = statusForPartnerError(error);
        setPartnerStatus(nextStatus);
        if (nextStatus !== "unavailable") updatePartnerFragment(null);
      });

    return () => {
      cancelled = true;
    };
  }, [partnerFragment, partnerPreviewAttempt]);

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
      const generation = authGenerationRef.current + 1;
      authGenerationRef.current = generation;
      currentAuthUidRef.current = u?.uid || null;
      console.log(
        "[Everwise][auth] state changed:",
        u ? "logged in" : "no user logged in"
      );
      setUser(u);
      setAuthChecked(false);

      const activeOperation = activeOperationRef.current;
      const normalizedUserEmail = u?.email?.trim().toLowerCase() || null;
      const belongsToActiveSignup = Boolean(
        u &&
          activeOperation &&
          activeOperation.kind === "signup" &&
          ((activeOperation.uid && activeOperation.uid === u.uid) ||
            (!activeOperation.uid &&
              normalizedUserEmail &&
              normalizedUserEmail === activeOperation.email)),
      );

      if (!u) {
        setProfile(null);
        setPartnerOwnerUid(null);
        const recoveryKind = partnerRecoveryRef.current?.kind;
        const preserveSponsoredRetry =
          recoveryKind === "cleanup-pending" || recoveryKind === "cleanup";
        if (!preserveSponsoredRetry) {
          updatePartnerRecovery(null);
          setPartner(null);
          if (!partnerFragmentRef.current?.token) setPartnerStatus("idle");
          setPendingSponsoredInterview(null);
          setSignupRetry(null);
          setProfileCompletion(null);
          setScreen("landing");
        }
        setAuthChecked(true);
        return;
      }

      if (belongsToActiveSignup) {
        setAuthChecked(true);
        return;
      }

      setPartnerOwnerUid(null);
      setPartner(null);
      setPartnerStatus("idle");
      updatePartnerRecovery(null);
      setPendingSponsoredInterview(null);
      setSignupRetry(null);
      setProfileCompletion(null);

      try {
        console.log("[Everwise][firestore] Loading learner profile.");
        const snap = await getDoc(doc(db, "users", u.uid));
        if (
          generation !== authGenerationRef.current ||
          currentAuthUidRef.current !== u.uid
        ) {
          return;
        }
        if (!snap.exists()) {
          console.warn("[Everwise][firestore] No profile doc for this user yet.");
          try {
            const authoritativeAccess = await fetchAuthoritativePartnerAccess(u);
            if (
              generation !== authGenerationRef.current ||
              currentAuthUidRef.current !== u.uid
            ) {
              return;
            }
            if (authoritativeAccess.status === "active") {
              setPartnerOwnerUid(u.uid);
              setPartner(
                authoritativeAccess.branding || {
                  name: authoritativeAccess.name,
                },
              );
              setPartnerStatus("active");
              updatePartnerRecovery({
                kind: "missing-profile",
                user: u,
                entitlement: authoritativeAccess,
              });
              setScreen("partner-error");
            } else if (authoritativeAccess.status === "suspended") {
              setPartnerOwnerUid(u.uid);
              setPartner(
                authoritativeAccess.branding || {
                  name: authoritativeAccess.name,
                },
              );
              setPartnerStatus("suspended");
              setScreen("partner-error");
            } else {
              setPartnerOwnerUid(null);
              setPartner(null);
              setPartnerStatus("idle");
            }
          } catch {
            if (
              generation === authGenerationRef.current &&
              currentAuthUidRef.current === u.uid
            ) {
              setPartnerStatus("idle");
            }
          }
          setAuthChecked(true);
          return;
        }

        console.log("[Everwise][firestore] Learner profile loaded.");
        const normalized = await normalizeSubscription(u.uid, snap.data());
        if (
          generation !== authGenerationRef.current ||
          currentAuthUidRef.current !== u.uid
        ) {
          return;
        }

        let authoritativeAccess;
        try {
          authoritativeAccess = await fetchAuthoritativePartnerAccess(u);
        } catch {
          if (
            generation !== authGenerationRef.current ||
            currentAuthUidRef.current !== u.uid
          ) {
            return;
          }
          const mirroredPartner =
            normalized.accessSource === "partner" ||
            typeof normalized.partnerId === "string";
          if (mirroredPartner) {
            setProfile(normalized);
            setPartnerStatus("unavailable");
            updatePartnerRecovery({
              kind: "returning-access",
              user: u,
              profile: normalized,
            });
            setScreen("partner-error");
            setAuthChecked(true);
            return;
          }
          authoritativeAccess = { status: "none" };
        }

        if (
          generation !== authGenerationRef.current ||
          currentAuthUidRef.current !== u.uid
        ) {
          return;
        }

        setProfile(normalized);
        if (authoritativeAccess.status === "active") {
          setPartnerOwnerUid(u.uid);
          setPartner(
            authoritativeAccess.branding || { name: authoritativeAccess.name },
          );
          setPartnerStatus("active");
        } else if (authoritativeAccess.status === "suspended") {
          setPartnerOwnerUid(u.uid);
          setPartner(
            authoritativeAccess.branding || { name: authoritativeAccess.name },
          );
          setPartnerStatus("suspended");
          setScreen("partner-error");
        } else {
          setPartnerOwnerUid(null);
          setPartner(null);
          setPartnerStatus("idle");
        }
        updatePartnerRecovery(null);
        if (
          authoritativeAccess.status !== "suspended" &&
          !belongsToActiveSignup
        ) {
          setScreen("home");
        }
      } catch (err) {
        if (
          generation === authGenerationRef.current &&
          currentAuthUidRef.current === u.uid
        ) {
          console.error("[Everwise][firestore] Failed to load profile:", err);
        }
      } finally {
        if (
          generation === authGenerationRef.current &&
          currentAuthUidRef.current === u.uid
        ) {
          setAuthChecked(true);
        }
      }
    });
    return () => {
      window.clearTimeout(startupFallback);
      unsub();
    };
  }, []);

  const activeLesson = lessonsByOrder[activeIndex];
  const completedLessons = profile?.completedLessons ?? [];
  const allDone = isCourseComplete(completedLessons, requiredLearningIds);
  const subscriptionStatus = profile?.subscriptionStatus ?? "expired";
  const sponsoredActive = Boolean(
    user?.uid &&
      partnerStatus === "active" &&
      partnerOwnerUid === user.uid,
  );
  const access = resolveFullAccess({
    sponsoredStatus: sponsoredActive ? "active" : "none",
    subscriptionStatus,
    developmentBypass: subscriptionBypassEnabled,
  });
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
    if (sponsoredActive) {
      goHome();
      return;
    }
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

  const cleanUpFailedSponsoredSignup = async (newUser) => {
    let deleted = false;
    let signedOut = false;
    try {
      await deleteUser(newUser);
      deleted = true;
    } catch (error) {
      console.error("[Everwise][auth] New account cleanup failed:", error);
    }
    try {
      await signOut(auth);
      signedOut = true;
    } catch (error) {
      console.error("[Everwise][auth] Sign out after cleanup failed:", error);
    }
    return { deleted, signedOut };
  };

  const signUp = async (
    interview,
    { fromRetry = false, sponsoredContext = null } = {},
  ) => {
    const {
      name,
      email,
      password,
      researchConsent,
      researchSnapshot,
      ...profileInterview
    } = interview;
    const signupFragment =
      sponsoredContext?.partnerFragment || partnerFragmentRef.current;
    const signupPartner = sponsoredContext?.partner || partner;
    const inviteToken = signupFragment?.token;
    const sponsoredSignup =
      signupFragment?.kind === "learner" &&
      Boolean(inviteToken) &&
      Boolean(signupPartner);
    const operation = beginPartnerOperation(email);
    let sponsoredAccountCreated = false;
    let failureHandled = false;
    try {
      if (sponsoredSignup) setPartnerStatus("claiming");
      console.log("[Everwise][auth] Creating learner account.");
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      sponsoredAccountCreated = sponsoredSignup;
      operation.uid = cred.user.uid;
      if (!partnerOperationIsCurrent(operation, cred.user.uid)) {
        finishPartnerOperation(operation);
        throw new StalePartnerOperationError();
      }
      console.log("[Everwise][auth] Learner account created.");

      let sponsoredEntitlement = null;
      if (sponsoredSignup) {
        try {
          const idToken = await cred.user.getIdToken(true);
          if (!partnerOperationIsCurrent(operation, cred.user.uid)) {
            throw new StalePartnerOperationError();
          }
          sponsoredEntitlement = await claimPartnerSeat({
            idToken,
            inviteToken,
            researchConsent,
            researchSnapshot,
          });
          if (!partnerOperationIsCurrent(operation, cred.user.uid)) {
            throw new StalePartnerOperationError();
          }
        } catch (claimError) {
          if (claimError instanceof StalePartnerOperationError) throw claimError;
          if (!partnerOperationIsCurrent(operation, cred.user.uid)) {
            throw new StalePartnerOperationError();
          }
          failureHandled = true;
          const nextStatus = statusForPartnerError(claimError);
          const retryContext = {
            interview,
            partner: signupPartner,
            partnerFragment: signupFragment,
          };
          updatePartnerRecovery({
            kind: "cleanup-pending",
            retryContext,
          });
          const cleanup = await cleanUpFailedSponsoredSignup(cred.user);
          finishPartnerOperation(operation);
          if (!cleanup.deleted || !cleanup.signedOut) {
            setPendingSponsoredInterview(null);
            setSignupRetry(null);
            setUser(cleanup.signedOut ? null : cred.user);
            setProfile(null);
            setPartnerStatus("unavailable");
            updatePartnerRecovery({
              kind: "cleanup",
              user: cred.user,
              cleanup,
              originalStatus: nextStatus,
              retryContext,
            });
            setScreen("partner-error");
            throw claimError;
          }
          updatePartnerRecovery(null);
          setPendingSponsoredInterview(
            nextStatus === "unavailable" ? retryContext : null,
          );
          setUser(null);
          setProfile(null);
          setPartner(signupPartner);
          setPartnerStatus(nextStatus);
          setScreen("partner-error");
          if (nextStatus !== "unavailable") updatePartnerFragment(null);
          throw claimError;
        }
      }

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
        ...(sponsoredEntitlement?.status === "active"
          ? {
              accessSource: "partner",
              partnerId: sponsoredEntitlement.partnerId,
            }
          : {}),
      };
      console.log("[Everwise][firestore] Saving learner profile.");
      try {
        await setDoc(doc(db, "users", cred.user.uid), initial);
      } catch (profileError) {
        if (!partnerOperationIsCurrent(operation, cred.user.uid)) {
          throw new StalePartnerOperationError();
        }
        if (sponsoredEntitlement?.status === "active") {
          failureHandled = true;
          finishPartnerOperation(operation);
          setUser(cred.user);
          setPartnerOwnerUid(cred.user.uid);
          setPartner(
            sponsoredEntitlement.branding || { name: sponsoredEntitlement.name },
          );
          setPartnerStatus("active");
          updatePartnerFragment(null);
          setPendingSponsoredInterview(null);
          setSignupRetry(null);
          updatePartnerRecovery({
            kind: "profile-write",
            user: cred.user,
            profile: initial,
            entitlement: sponsoredEntitlement,
            busy: false,
          });
          setScreen("partner-error");
        }
        throw profileError;
      }
      if (!partnerOperationIsCurrent(operation, cred.user.uid)) {
        finishPartnerOperation(operation);
        throw new StalePartnerOperationError();
      }
      console.log("[Everwise][firestore] profile document created.");

      setUser(cred.user);
      setProfile(initial);
      if (sponsoredEntitlement?.status === "active") {
        setPartnerOwnerUid(cred.user.uid);
        setPartnerStatus("active");
        setPartner(sponsoredEntitlement.branding || {
          name: sponsoredEntitlement.name,
        });
        updatePartnerFragment(null);
        setPendingSponsoredInterview(null);
        setSignupRetry(null);
        updatePartnerRecovery(null);
      } else {
        setPaywallVariant("subscribe");
      }
      setScreen("personal-plan");
      finishPartnerOperation(operation);
    } catch (err) {
      if (err instanceof StalePartnerOperationError) {
        finishPartnerOperation(operation);
        throw err;
      }
      if (sponsoredSignup && !sponsoredAccountCreated && !failureHandled) {
        setPartnerStatus("ready");
        setScreen("interview");
        if (fromRetry) {
          setSignupRetry({
            interview,
            error: authErrorMessage(err),
          });
        }
      }
      if (!failureHandled) finishPartnerOperation(operation);
      console.error("[Everwise][auth] Sign up failed:", err.code, err.message);
      throw err;
    }
  };

  const retryPartnerAccess = () => {
    if (pendingSponsoredInterview) {
      const retryContext = pendingSponsoredInterview;
      const { interview } = retryContext;
      setPartner(retryContext.partner);
      updatePartnerFragment(retryContext.partnerFragment);
      setSignupRetry({ interview, error: "" });
      setScreen("interview");
      setPartnerStatus("ready");
      void signUp(interview, {
        fromRetry: true,
        sponsoredContext: retryContext,
      }).catch(() => {});
      return;
    }
    setPartnerPreviewAttempt((current) => current + 1);
  };

  const retryReturningPartnerAccess = async () => {
    const recovery = partnerRecoveryRef.current;
    if (recovery?.kind !== "returning-access") return;
    const { user: returningUser, profile: returningProfile } = recovery;
    const generation = authGenerationRef.current;
    updatePartnerRecovery({ ...recovery, busy: true });
    setAuthChecked(false);
    try {
      const authoritativeAccess = await fetchAuthoritativePartnerAccess(returningUser);
      if (
        generation !== authGenerationRef.current ||
        currentAuthUidRef.current !== returningUser.uid
      ) {
        return;
      }
      setProfile(returningProfile);
      if (authoritativeAccess.status === "active") {
        setPartnerOwnerUid(returningUser.uid);
        setPartner(
          authoritativeAccess.branding || { name: authoritativeAccess.name },
        );
        setPartnerStatus("active");
        updatePartnerRecovery(null);
        setScreen("home");
      } else if (authoritativeAccess.status === "suspended") {
        setPartnerOwnerUid(returningUser.uid);
        setPartner(
          authoritativeAccess.branding || { name: authoritativeAccess.name },
        );
        setPartnerStatus("suspended");
        updatePartnerRecovery(null);
        setScreen("partner-error");
      } else {
        clearAuthoritativePartner();
        updatePartnerRecovery(null);
        setScreen("home");
      }
    } catch {
      if (
        generation === authGenerationRef.current &&
        currentAuthUidRef.current === returningUser.uid
      ) {
        setPartnerStatus("unavailable");
        updatePartnerRecovery({ ...recovery, busy: false });
        setScreen("partner-error");
      }
    } finally {
      if (
        generation === authGenerationRef.current &&
        currentAuthUidRef.current === returningUser.uid
      ) {
        setAuthChecked(true);
      }
    }
  };

  const retrySponsoredProfileWrite = async () => {
    const recovery = partnerRecoveryRef.current;
    if (recovery?.kind !== "profile-write" || recovery.busy) return;
    const expectedUid = recovery.user?.uid;
    const operation = beginStrictPartnerOperation(
      expectedUid,
      recovery.user?.email,
    );
    if (!operation || !strictPartnerOperationIsCurrent(operation)) return;
    updatePartnerRecovery({ ...recovery, busy: true });
    try {
      await setDoc(doc(db, "users", expectedUid), recovery.profile);
      if (!strictPartnerOperationIsCurrent(operation)) {
        finishPartnerOperation(operation);
        return;
      }
      finishPartnerOperation(operation);
      setUser(recovery.user);
      setProfile(recovery.profile);
      setPartnerOwnerUid(expectedUid);
      setPartner(
        recovery.entitlement.branding || { name: recovery.entitlement.name },
      );
      setPartnerStatus("active");
      updatePartnerRecovery(null);
      setScreen("personal-plan");
    } catch {
      if (strictPartnerOperationIsCurrent(operation)) {
        finishPartnerOperation(operation);
        updatePartnerRecovery({ ...recovery, busy: false });
      } else {
        finishPartnerOperation(operation);
      }
    }
  };

  const startMissingProfileCompletion = () => {
    const recovery = partnerRecoveryRef.current;
    if (recovery?.kind !== "missing-profile") return;
    setProfileCompletion({
      user: recovery.user,
      entitlement: recovery.entitlement,
    });
    updatePartnerRecovery(null);
    setScreen("interview");
  };

  const completeMissingSponsoredProfile = async (interview) => {
    const completion = profileCompletion;
    if (!completion) return;
    const expectedUid = completion.user?.uid;
    const operation = beginStrictPartnerOperation(
      expectedUid,
      completion.user?.email,
    );
    if (!operation || !strictPartnerOperationIsCurrent(operation)) {
      throw new StalePartnerOperationError();
    }
    const {
      name,
      email: _email,
      password: _password,
      researchConsent: _researchConsent,
      researchSnapshot: _researchSnapshot,
      ...profileInterview
    } = interview;
    const initial = {
      name,
      email: completion.user.email || interview.email || "",
      profileInterview,
      onboardingCompleted: true,
      scamsCaught: 0,
      badges: [],
      completedLessons: [],
      trialStartedAt: null,
      subscriptionStatus: "expired",
      plan: null,
      accessSource: "partner",
      partnerId: completion.entitlement.partnerId,
    };
    try {
      await setDoc(doc(db, "users", expectedUid), initial);
      if (!strictPartnerOperationIsCurrent(operation)) {
        finishPartnerOperation(operation);
        throw new StalePartnerOperationError();
      }
      finishPartnerOperation(operation);
      setProfile(initial);
      setPartnerOwnerUid(expectedUid);
      setPartner(
        completion.entitlement.branding || {
          name: completion.entitlement.name,
        },
      );
      setPartnerStatus("active");
      setProfileCompletion(null);
      updatePartnerRecovery(null);
      setScreen("personal-plan");
    } catch (error) {
      if (
        !(error instanceof StalePartnerOperationError) &&
        strictPartnerOperationIsCurrent(operation)
      ) {
        finishPartnerOperation(operation);
        setProfileCompletion(null);
        updatePartnerRecovery({
          kind: "profile-write",
          user: completion.user,
          profile: initial,
          entitlement: completion.entitlement,
          busy: false,
        });
        setScreen("partner-error");
      } else {
        finishPartnerOperation(operation);
      }
      throw error;
    }
  };

  const retryCleanupSignOut = async () => {
    const recovery = partnerRecoveryRef.current;
    if (recovery?.kind !== "cleanup" || recovery.busy) return;
    updatePartnerRecovery({ ...recovery, busy: true });
    try {
      await signOut(auth);
      const nextRecovery = {
        ...recovery,
        cleanup: { ...recovery.cleanup, signedOut: true },
        busy: false,
      };
      setUser(null);
      setProfile(null);
      setPartnerOwnerUid(null);
      updatePartnerRecovery(nextRecovery);
      setPartnerStatus("unavailable");
      setScreen("partner-error");
    } catch {
      updatePartnerRecovery({ ...recovery, busy: false });
    }
  };

  const logIn = async (email, password) => {
    try {
      console.log("[Everwise][auth] Signing in learner account.");
      await signInWithEmailAndPassword(auth, email, password);
      console.log("[Everwise][auth] Learner account signed in.");
    } catch (err) {
      console.error("[Everwise][auth] Log in failed:", err.code, err.message);
      throw err;
    }
  };

  const logOut = async () => {
    operationIdRef.current += 1;
    activeOperationRef.current = null;
    try {
      console.log("[Everwise][auth] signOut");
      await signOut(auth);
      console.log("[Everwise][auth] signed out.");
      authGenerationRef.current += 1;
      currentAuthUidRef.current = null;
      setUser(null);
      setProfile(null);
      setPartnerOwnerUid(null);
      setPartner(null);
      setPartnerStatus("idle");
      updatePartnerFragment(null);
      updatePartnerRecovery(null);
      setPendingSponsoredInterview(null);
      setSignupRetry(null);
      setProfileCompletion(null);
      setAuthChecked(true);
      setScreen("landing");
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

  if (
    !authChecked ||
    !launchAnimationDone ||
    partnerStatus === "previewing"
  ) {
    return (
      <AppShell screen="loading">
        <Loading />
      </AppShell>
    );
  }

  if (partnerRecovery?.kind === "returning-access") {
    return (
      <AppShell screen="partner-error" isAuthenticated={Boolean(user)}>
        <PartnerAccessError
          code="PARTNER_ACCESS_UNCONFIRMED"
          partnerName={partner?.name}
          onRetry={retryReturningPartnerAccess}
          onLogOut={logOut}
        />
      </AppShell>
    );
  }

  if (partnerRecovery?.kind === "profile-write") {
    return (
      <AppShell screen="partner-error" isAuthenticated={Boolean(user)}>
        <PartnerAccessError
          code="PARTNER_PROFILE_INCOMPLETE"
          partnerName={partner?.name}
          onRetry={retrySponsoredProfileWrite}
          retryLabel={
            partnerRecovery.busy ? "Saving profile…" : "Retry saving profile"
          }
        />
      </AppShell>
    );
  }

  if (partnerRecovery?.kind === "missing-profile") {
    return (
      <AppShell screen="partner-error" isAuthenticated={Boolean(user)}>
        <PartnerAccessError
          code="PARTNER_PROFILE_MISSING"
          partnerName={partner?.name}
          onRetry={startMissingProfileCompletion}
          retryLabel="Complete my profile"
          onLogOut={logOut}
        />
      </AppShell>
    );
  }

  if (partnerRecovery?.kind === "cleanup") {
    return (
      <AppShell screen="partner-error" isAuthenticated={Boolean(user)}>
        <PartnerAccessError
          code="PARTNER_CLEANUP_INCOMPLETE"
          partnerName={partner?.name}
          onLogOut={
            partnerRecovery.cleanup.signedOut ? null : retryCleanupSignOut
          }
          logOutLabel={
            partnerRecovery.busy ? "Logging out…" : "Try to log out"
          }
          showSupport
        />
      </AppShell>
    );
  }

  if (["invalid", "full", "suspended", "unavailable"].includes(partnerStatus)) {
    const authenticatedSuspension = Boolean(
      partnerStatus === "suspended" &&
        user?.uid &&
        partnerOwnerUid === user.uid,
    );
    return (
      <AppShell
        screen="partner-error"
        isAuthenticated={authenticatedSuspension}
      >
        <PartnerAccessError
          code={codeForPartnerStatus(partnerStatus)}
          partnerName={partner?.name}
          onRetry={retryPartnerAccess}
          onLogOut={authenticatedSuspension ? logOut : undefined}
        />
      </AppShell>
    );
  }

  let content;
  switch (screen) {
    case "landing":
      content = (
        <Landing
          partner={partnerStatus === "ready" ? partner : null}
          onGetStarted={() => setScreen("interview")}
          onLogIn={() => setScreen("login")}
        />
      );
      break;
    case "interview":
      content = (
        <ProfileInterview
          key={
            profileCompletion
              ? "missing-profile-completion"
              : signupRetry
                ? "sponsored-retry"
                : "new-interview"
          }
          partner={
            profileCompletion ||
            partnerStatus === "ready" ||
            partnerStatus === "claiming"
              ? partner
              : null
          }
          initialInterview={signupRetry?.interview || null}
          existingAccountEmail={profileCompletion?.user.email || ""}
          externalBusy={partnerStatus === "claiming"}
          externalError={signupRetry?.error || ""}
          onComplete={
            profileCompletion ? completeMissingSponsoredProfile : signUp
          }
          onBack={() => {
            if (profileCompletion) {
              updatePartnerRecovery({
                kind: "missing-profile",
                user: profileCompletion.user,
                entitlement: profileCompletion.entitlement,
              });
              setProfileCompletion(null);
              setScreen("partner-error");
              return;
            }
            operationIdRef.current += 1;
            activeOperationRef.current = null;
            setSignupRetry(null);
            setScreen("landing");
          }}
          onLogIn={() => {
            operationIdRef.current += 1;
            activeOperationRef.current = null;
            setSignupRetry(null);
            setScreen("login");
          }}
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
          sponsored={sponsoredActive}
          partner={sponsoredActive ? partner : null}
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
          sponsored={sponsoredActive}
          onContinue={() => {
            if (sponsoredActive) goHome();
            else {
              setPaywallVariant("subscribe");
              setScreen("paywall");
            }
          }}
        />
      );
      break;
    case "path":
      content = (
        <LessonPath
          completedLessons={completedLessons}
          textSize={textSize}
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
    <AppShell
      screen={screen}
      isAuthenticated={Boolean(user)}
      onHome={goHome}
      onCourse={goPath}
      onScamChecker={goScamChecker}
      onBadges={goBadges}
      onSettings={goSettings}
    >
      <div
        key={screen}
        className="screen-content-frame flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden"
      >
        {content}
      </div>
    </AppShell>
  );
}
