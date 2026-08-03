import React, { useEffect, useRef, useState } from "react";
import {
  EmailAuthProvider,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  deleteUser,
  reload,
  reauthenticateWithCredential,
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
import { canOpenLesson, resolveFullAccess } from "./utils/access.js";
import { consumePartnerFragment } from "./utils/partnerLinks.js";
import {
  beginPartnerRelease,
  cancelPartnerRelease,
  claimPartnerSeat,
  confirmPartnerRelease,
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
import Settings, {
  PartnerDeletionReconciliation,
  PartnerReleaseRecovery,
} from "./screens/Settings";
import Paywall from "./screens/Paywall";
import LessonPath from "./screens/LessonPath";
import LessonPlayer from "./screens/LessonPlayer";
import ChallengePlayer from "./screens/ChallengePlayer";
import ExamPlayer from "./screens/ExamPlayer";
import Complete from "./screens/Complete";
import ScamChecker from "./screens/ScamChecker";
import PartnerAccessError from "./screens/PartnerAccessError";
import PartnerDashboard from "./screens/PartnerDashboard";
import {
  accountDeletionErrorMessage,
  authErrorMessage,
} from "./utils/authErrors.js";
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
const PARTNER_RELEASE_RECEIPT_STORAGE_KEY =
  "everwise-partner-release-receipt";
const PARTNER_RELEASE_CONFIRMABLE_STORAGE_KEY =
  "everwise-partner-release-confirmable";
const PARTNER_RELEASE_RECEIPT_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const PARTNER_RECONCILIATION_REASONS = new Set([
  "cancellation",
  "compensation",
  "storage-cleanup",
  "invalid-receipt",
  "deletion-status",
]);
const DEFINITIVE_PARTNER_CLAIM_REJECTIONS = new Set([
  "ALREADY_SPONSORED",
  "INVALID_INPUT",
  "INVALID_INVITE",
  "INVALID_RESEARCH",
  "PARTNER_FULL",
  "PARTNER_SUSPENDED",
]);
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

function storedPartnerReleaseMatchesOperation(serialized, recovery, state) {
  if (!serialized || !recovery) return false;
  try {
    const stored = JSON.parse(serialized);
    const status = partnerReleaseRecoveryStatus(stored);
    return Boolean(
      status.valid &&
        status.state === state &&
        !status.reconciliation &&
        stored.receipt === recovery.receipt &&
        stored.expiresAt === recovery.expiresAt,
    );
  } catch {
    return false;
  }
}

function removeStoredPartnerReleaseKeyIfUnchanged(key, expectedSerialized) {
  try {
    if (window.sessionStorage.getItem(key) !== expectedSerialized) {
      return "not-owner";
    }
    window.sessionStorage.removeItem(key);
    return window.sessionStorage.getItem(key) === null ? "removed" : "failed";
  } catch {
    return "failed";
  }
}

function clearStoredPartnerRelease(
  recovery,
  { requireConfirmable = false } = {},
) {
  try {
    const preparedSerialized = window.sessionStorage.getItem(
      PARTNER_RELEASE_RECEIPT_STORAGE_KEY,
    );
    if (
      !storedPartnerReleaseMatchesOperation(
        preparedSerialized,
        recovery,
        "prepared",
      )
    ) {
      return "not-owner";
    }

    const confirmableSerialized = window.sessionStorage.getItem(
      PARTNER_RELEASE_CONFIRMABLE_STORAGE_KEY,
    );
    if (requireConfirmable && confirmableSerialized === null) {
      return "not-owner";
    }
    if (
      confirmableSerialized !== null &&
      !storedPartnerReleaseMatchesOperation(
        confirmableSerialized,
        recovery,
        "confirmable",
      )
    ) {
      return "not-owner";
    }
    if (confirmableSerialized !== null) {
      const markerRemoval = removeStoredPartnerReleaseKeyIfUnchanged(
        PARTNER_RELEASE_CONFIRMABLE_STORAGE_KEY,
        confirmableSerialized,
      );
      if (markerRemoval !== "removed") return markerRemoval;
    }

    const preparedRemoval = removeStoredPartnerReleaseKeyIfUnchanged(
      PARTNER_RELEASE_RECEIPT_STORAGE_KEY,
      preparedSerialized,
    );
    return preparedRemoval === "removed" ? "cleared" : preparedRemoval;
  } catch {
    return "failed";
  }
}

function partnerReleaseRecoveryStatus(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { recoverable: false, valid: false, expired: false };
  }
  const keys = Object.keys(value);
  if (
    keys.some(
      (key) =>
        key !== "receipt" &&
        key !== "expiresAt" &&
        key !== "state" &&
        key !== "reconciliation",
    ) ||
    !PARTNER_RELEASE_RECEIPT_PATTERN.test(value.receipt)
  ) {
    return { recoverable: false, valid: false, expired: false };
  }
  const reconciliation = value.reconciliation;
  const state = value.state;
  if (
    reconciliation !== undefined &&
    !PARTNER_RECONCILIATION_REASONS.has(reconciliation)
  ) {
    return { recoverable: false, valid: false, expired: false };
  }
  if (state !== undefined && state !== "prepared" && state !== "confirmable") {
    return { recoverable: false, valid: false, expired: false };
  }
  if (typeof value.expiresAt !== "string") {
    return {
      recoverable: true,
      valid: false,
      expired: false,
      state,
      reconciliation,
    };
  }
  const expiresAtMs = Date.parse(value.expiresAt);
  if (
    !Number.isFinite(expiresAtMs) ||
    new Date(expiresAtMs).toISOString() !== value.expiresAt
  ) {
    return {
      recoverable: true,
      valid: false,
      expired: false,
      state,
      reconciliation,
    };
  }
  return {
    recoverable: true,
    valid: true,
    expired: expiresAtMs <= Date.now(),
    state,
    reconciliation,
  };
}

function storedPartnerReleaseIsConfirmable(recovery) {
  try {
    const serialized = window.sessionStorage.getItem(
      PARTNER_RELEASE_CONFIRMABLE_STORAGE_KEY,
    );
    if (!serialized) return false;
    const marker = JSON.parse(serialized);
    const status = partnerReleaseRecoveryStatus(marker);
    return Boolean(
      status.recoverable &&
        status.valid &&
        !status.expired &&
        status.state === "confirmable" &&
        !status.reconciliation &&
        marker.receipt === recovery.receipt &&
        marker.expiresAt === recovery.expiresAt,
    );
  } catch {
    return false;
  }
}

function readStoredPartnerRelease() {
  let serialized = null;
  try {
    serialized = window.sessionStorage.getItem(
      PARTNER_RELEASE_RECEIPT_STORAGE_KEY,
    );
    if (!serialized) return null;
    const recovery = JSON.parse(serialized);
    const status = partnerReleaseRecoveryStatus(recovery);
    if (status.recoverable) {
      const terminal =
        status.reconciliation ||
        (!status.valid || status.expired
          ? "expiry"
          : status.state !== "prepared" ||
              !storedPartnerReleaseIsConfirmable(recovery)
            ? "prepared"
            : null);
      return terminal ? { ...recovery, terminal } : recovery;
    }
    removeStoredPartnerReleaseKeyIfUnchanged(
      PARTNER_RELEASE_RECEIPT_STORAGE_KEY,
      serialized,
    );
  } catch {
    // A blocked or corrupted store must not prevent the signed-out experience.
  }
  return null;
}

function storeTerminalPartnerReconciliation(
  recovery,
  reconciliation,
  { requireConfirmable = false } = {},
) {
  let markerSecured = false;
  try {
    const preparedSerialized = window.sessionStorage.getItem(
      PARTNER_RELEASE_RECEIPT_STORAGE_KEY,
    );
    if (
      !storedPartnerReleaseMatchesOperation(
        preparedSerialized,
        recovery,
        "prepared",
      )
    ) {
      return "not-owner";
    }
    const confirmableSerialized = window.sessionStorage.getItem(
      PARTNER_RELEASE_CONFIRMABLE_STORAGE_KEY,
    );
    if (requireConfirmable && confirmableSerialized === null) {
      return "not-owner";
    }
    if (
      confirmableSerialized !== null &&
      !storedPartnerReleaseMatchesOperation(
        confirmableSerialized,
        recovery,
        "confirmable",
      )
    ) {
      return "not-owner";
    }
    if (confirmableSerialized !== null) {
      const markerRemoval = removeStoredPartnerReleaseKeyIfUnchanged(
        PARTNER_RELEASE_CONFIRMABLE_STORAGE_KEY,
        confirmableSerialized,
      );
      if (markerRemoval === "not-owner") return "not-owner";
      markerSecured = markerRemoval === "removed";
    } else {
      markerSecured = true;
    }

    const serialized = JSON.stringify({
      receipt: recovery.receipt,
      expiresAt: recovery.expiresAt,
      state: "prepared",
      reconciliation,
    });
    if (
      window.sessionStorage.getItem(PARTNER_RELEASE_RECEIPT_STORAGE_KEY) !==
      preparedSerialized
    ) {
      return "not-owner";
    }
    window.sessionStorage.setItem(
      PARTNER_RELEASE_RECEIPT_STORAGE_KEY,
      serialized,
    );
    const terminalVerified =
      window.sessionStorage.getItem(PARTNER_RELEASE_RECEIPT_STORAGE_KEY) ===
      serialized;
    return markerSecured || terminalVerified ? "terminalized" : "failed";
  } catch {
    return markerSecured ? "terminalized" : "failed";
  }
}

function storePreparedPartnerRelease(recovery) {
  try {
    const confirmableSerialized = window.sessionStorage.getItem(
      PARTNER_RELEASE_CONFIRMABLE_STORAGE_KEY,
    );
    if (confirmableSerialized !== null) {
      if (
        !storedPartnerReleaseMatchesOperation(
          confirmableSerialized,
          recovery,
          "confirmable",
        ) ||
        removeStoredPartnerReleaseKeyIfUnchanged(
          PARTNER_RELEASE_CONFIRMABLE_STORAGE_KEY,
          confirmableSerialized,
        ) !== "removed"
      ) {
        return false;
      }
    }
    const serialized = JSON.stringify({
      receipt: recovery.receipt,
      ...(typeof recovery.expiresAt === "string"
        ? { expiresAt: recovery.expiresAt }
        : {}),
      state: "prepared",
    });
    window.sessionStorage.setItem(
      PARTNER_RELEASE_RECEIPT_STORAGE_KEY,
      serialized,
    );
    const verified = window.sessionStorage.getItem(
      PARTNER_RELEASE_RECEIPT_STORAGE_KEY,
    );
    if (verified !== serialized) return false;
    const status = partnerReleaseRecoveryStatus(JSON.parse(verified));
    return status.valid && !status.expired && status.state === "prepared";
  } catch {
    return false;
  }
}

function storeConfirmablePartnerRelease(recovery) {
  try {
    const preparedSerialized = window.sessionStorage.getItem(
      PARTNER_RELEASE_RECEIPT_STORAGE_KEY,
    );
    if (!preparedSerialized) return false;
    const prepared = JSON.parse(preparedSerialized);
    const preparedStatus = partnerReleaseRecoveryStatus(prepared);
    if (
      !preparedStatus.valid ||
      preparedStatus.expired ||
      preparedStatus.state !== "prepared" ||
      preparedStatus.reconciliation ||
      prepared.receipt !== recovery.receipt ||
      prepared.expiresAt !== recovery.expiresAt
    ) {
      return false;
    }
    const existingConfirmable = window.sessionStorage.getItem(
      PARTNER_RELEASE_CONFIRMABLE_STORAGE_KEY,
    );
    if (
      existingConfirmable !== null &&
      !storedPartnerReleaseMatchesOperation(
        existingConfirmable,
        recovery,
        "confirmable",
      )
    ) {
      return false;
    }
    const serialized = JSON.stringify({
      receipt: recovery.receipt,
      expiresAt: recovery.expiresAt,
      state: "confirmable",
    });
    if (
      window.sessionStorage.getItem(PARTNER_RELEASE_RECEIPT_STORAGE_KEY) !==
      preparedSerialized
    ) {
      return false;
    }
    window.sessionStorage.setItem(
      PARTNER_RELEASE_CONFIRMABLE_STORAGE_KEY,
      serialized,
    );
    const verified = window.sessionStorage.getItem(
      PARTNER_RELEASE_CONFIRMABLE_STORAGE_KEY,
    );
    if (verified !== serialized) {
      if (
        storedPartnerReleaseMatchesOperation(
          verified,
          recovery,
          "confirmable",
        )
      ) {
        removeStoredPartnerReleaseKeyIfUnchanged(
          PARTNER_RELEASE_CONFIRMABLE_STORAGE_KEY,
          verified,
        );
      }
      return false;
    }
    const status = partnerReleaseRecoveryStatus(JSON.parse(verified));
    return status.valid && !status.expired && status.state === "confirmable";
  } catch {
    try {
      const confirmableSerialized = window.sessionStorage.getItem(
        PARTNER_RELEASE_CONFIRMABLE_STORAGE_KEY,
      );
      if (
        storedPartnerReleaseMatchesOperation(
          confirmableSerialized,
          recovery,
          "confirmable",
        )
      ) {
        removeStoredPartnerReleaseKeyIfUnchanged(
          PARTNER_RELEASE_CONFIRMABLE_STORAGE_KEY,
          confirmableSerialized,
        );
      }
    } catch {
      // The prepared base remains fail-closed when marker cleanup is blocked.
    }
    return false;
  }
}

function partnerReleaseWasConfirmed(result) {
  return result?.released === true;
}

function capturePartnerFragment() {
  const hash = window.location.hash;
  const isLearnerFragment =
    hash === "#partner" ||
    hash.startsWith("#partner=") ||
    hash.startsWith("#partner&");
  const isAdminFragment =
    hash === "#partner-admin" ||
    hash.startsWith("#partner-admin=") ||
    hash.startsWith("#partner-admin&");
  const fragment = consumePartnerFragment({ hash });
  if (fragment) return fragment;
  if (isAdminFragment) return { kind: "admin-invalid", token: null };
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

function isDefinitivePartnerClaimRejection(error) {
  return DEFINITIVE_PARTNER_CLAIM_REJECTIONS.has(error?.code);
}

function partnerProfileFromBase(profileBase, entitlement) {
  if (
    entitlement?.status !== "active" &&
    entitlement?.status !== "suspended"
  ) {
    return profileBase;
  }
  return {
    ...profileBase,
    accessSource: "partner",
    partnerId: entitlement.partnerId,
  };
}

async function reconcilePartnerClaim({
  firebaseUser,
  inviteToken,
  researchConsent,
  researchSnapshot,
}) {
  let access;
  try {
    access = await fetchAuthoritativePartnerAccess(firebaseUser);
  } catch {
    return null;
  }
  if (!access || typeof access !== "object") return null;
  if (access.status === "active" || access.status === "suspended") {
    return access;
  }
  if (access.status !== "none") return null;

  try {
    const idToken = await firebaseUser.getIdToken(true);
    return await claimPartnerSeat({
      idToken,
      inviteToken,
      researchConsent,
      researchSnapshot,
    });
  } catch (error) {
    if (isDefinitivePartnerClaimRejection(error)) throw error;
    try {
      access = await fetchAuthoritativePartnerAccess(firebaseUser);
      return access.status === "active" || access.status === "suspended"
        ? access
        : null;
    } catch {
      return null;
    }
  }
}

class StalePartnerOperationError extends Error {
  constructor() {
    super("This sponsored access operation is no longer current.");
    this.name = "StalePartnerOperationError";
  }
}

class StaleAccountDeletionError extends Error {
  constructor() {
    super("This account deletion is no longer current.");
    this.name = "StaleAccountDeletionError";
  }
}

class PartnerReleasePreparationError extends Error {
  constructor() {
    super("Sponsored account deletion could not be prepared safely.");
    this.name = "PartnerReleasePreparationError";
    this.code = "partner/release-preparation-failed";
  }
}

class FirebaseDeletionStatusIndeterminateError extends Error {
  constructor() {
    super("Firebase account deletion status could not be confirmed.");
    this.name = "FirebaseDeletionStatusIndeterminateError";
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
    await updateDoc(doc(db, "users", uid), updates);
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error(
        "[Everwise][firestore] Failed to normalize subscription:",
        err?.code || err?.name || "unknown",
      );
    }
  }
  return next;
}

function LearnerApp({ initialPartnerFragment }) {
  const [pendingPartnerRelease, setPendingPartnerRelease] = useState(
    readStoredPartnerRelease,
  );
  const [releaseConfirmationBusy, setReleaseConfirmationBusy] =
    useState(false);
  const [accountDeletionBusy, setAccountDeletionBusy] = useState(false);
  const [partnerFragment, setPartnerFragment] = useState(initialPartnerFragment);
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
  const authSettledRef = useRef(false);
  const currentAuthUidRef = useRef(null);
  const operationIdRef = useRef(0);
  const activeOperationRef = useRef(null);
  const accountDeletionBusyRef = useRef(false);
  const releaseConfirmationOperationIdRef = useRef(0);
  const activeReleaseConfirmationRef = useRef(null);
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

  const beginAccountDeletionOperation = (expectedUid) => {
    if (
      !expectedUid ||
      currentAuthUidRef.current !== expectedUid ||
      accountDeletionBusyRef.current
    ) {
      return null;
    }
    const operation = {
      id: operationIdRef.current + 1,
      authGeneration: authGenerationRef.current,
      uid: expectedUid,
      kind: "account-deletion",
    };
    operationIdRef.current = operation.id;
    activeOperationRef.current = operation;
    accountDeletionBusyRef.current = true;
    setAccountDeletionBusy(true);
    return operation;
  };

  const accountDeletionOperationIsCurrent = (operation) =>
    Boolean(
      operation &&
        operationIdRef.current === operation.id &&
        activeOperationRef.current?.id === operation.id &&
        activeOperationRef.current?.kind === "account-deletion" &&
        authGenerationRef.current === operation.authGeneration &&
        currentAuthUidRef.current === operation.uid,
    );

  const requireCurrentAccountDeletion = (operation) => {
    if (!accountDeletionOperationIsCurrent(operation)) {
      throw new StaleAccountDeletionError();
    }
  };

  const finishAccountDeletionOperation = (operation) => {
    if (activeOperationRef.current?.id === operation?.id) {
      activeOperationRef.current = null;
    }
    accountDeletionBusyRef.current = false;
    setAccountDeletionBusy(false);
  };

  const beginSignedOutReleaseConfirmation = () => {
    if (!authSettledRef.current || currentAuthUidRef.current !== null) {
      return null;
    }
    const operation = {
      id: releaseConfirmationOperationIdRef.current + 1,
      authGeneration: authGenerationRef.current,
    };
    releaseConfirmationOperationIdRef.current = operation.id;
    activeReleaseConfirmationRef.current = operation;
    return operation;
  };

  const signedOutReleaseConfirmationIsCurrent = (operation) =>
    Boolean(
      operation &&
        activeReleaseConfirmationRef.current?.id === operation.id &&
        releaseConfirmationOperationIdRef.current === operation.id &&
        authGenerationRef.current === operation.authGeneration &&
        authSettledRef.current &&
        currentAuthUidRef.current === null,
    );

  const finishSignedOutReleaseConfirmation = (operation) => {
    if (activeReleaseConfirmationRef.current?.id === operation?.id) {
      activeReleaseConfirmationRef.current = null;
    }
  };

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
        if (import.meta.env.DEV) {
          console.warn(
            "[Everwise] Keyboard accessory bar could not be hidden:",
            error?.code || error?.name || "unknown",
          );
        }
      });
    }

    if (nativePurchasesAvailable()) {
      getSubscriptionProducts()
        .then(setStoreProducts)
        .catch((error) => {
          if (import.meta.env.DEV) {
            console.warn(
              "[Everwise] Subscription products unavailable:",
              error?.code || error?.name || "unknown",
            );
          }
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
        if (import.meta.env.DEV) {
          console.warn(
            "[Everwise] Current subscription could not be checked:",
            error?.code || error?.name || "unknown",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    let receivedInitialAuthState = false;
    const startupFallback = window.setTimeout(() => {
      if (receivedInitialAuthState) return;
      console.warn(
        "[Everwise][auth] Initial auth state timed out; still waiting for Firebase.",
      );
    }, 2500);

    const unsub = onAuthStateChanged(auth, async (u) => {
      receivedInitialAuthState = true;
      window.clearTimeout(startupFallback);
      const generation = authGenerationRef.current + 1;
      authGenerationRef.current = generation;
      authSettledRef.current = false;
      currentAuthUidRef.current = u?.uid || null;
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
          setSignupRetry(null);
          setProfileCompletion(null);
          setScreen("landing");
        }
        setPendingPartnerRelease(readStoredPartnerRelease());
        setReleaseConfirmationBusy(false);
        authSettledRef.current = true;
        setAuthChecked(true);
        return;
      }

      if (belongsToActiveSignup) {
        authSettledRef.current = true;
        setAuthChecked(true);
        return;
      }

      setPartnerOwnerUid(null);
      setPartner(null);
      setPartnerStatus("idle");
      updatePartnerRecovery(null);
      setSignupRetry(null);
      setProfileCompletion(null);

      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (
          generation !== authGenerationRef.current ||
          currentAuthUidRef.current !== u.uid
        ) {
          return;
        }
        if (!snap.exists()) {
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
          authSettledRef.current = true;
          setAuthChecked(true);
          return;
        }

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
            authSettledRef.current = true;
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
          if (import.meta.env.DEV) {
            console.error(
              "[Everwise][firestore] Failed to load profile:",
              err?.code || err?.name || "unknown",
            );
          }
        }
      } finally {
        if (
          generation === authGenerationRef.current &&
          currentAuthUidRef.current === u.uid
        ) {
          authSettledRef.current = true;
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

  const accountDeletionAllowsNavigation = () =>
    !accountDeletionBusyRef.current;
  const goHome = () => {
    if (!accountDeletionAllowsNavigation()) return;
    setScreen("home");
  };
  const goPath = () => {
    if (!accountDeletionAllowsNavigation()) return;
    setActiveExam(null);
    setActiveChallenge(null);
    setScreen("path");
  };
  const goPaywall = () => {
    if (!accountDeletionAllowsNavigation()) return;
    if (sponsoredActive) {
      goHome();
      return;
    }
    setPaywallVariant("subscribe");
    setScreen("paywall");
  };
  const goSettings = () => {
    if (!accountDeletionAllowsNavigation()) return;
    setScreen("settings");
  };
  const goBadges = () => {
    if (!accountDeletionAllowsNavigation()) return;
    setScreen("badges");
  };
  const goScamChecker = () => {
    if (!accountDeletionAllowsNavigation()) return;
    setScreen("scam-checker");
  };

  const updateSubscription = async (updates) => {
    if (!user) return;
    setProfile((p) => ({ ...p, ...updates }));
    try {
      await updateDoc(doc(db, "users", user.uid), updates);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error(
          "[Everwise][firestore] Failed to update subscription:",
          err?.code || err?.name || "unknown",
        );
      }
    }
  };

  const cleanUpFailedSponsoredSignup = async (newUser) => {
    let deleted = false;
    let signedOut = false;
    try {
      await deleteUser(newUser);
      deleted = true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(
          "[Everwise][auth] New account cleanup failed:",
          error?.code || error?.name || "unknown",
        );
      }
    }
    try {
      await signOut(auth);
      signedOut = true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(
          "[Everwise][auth] Sign out after cleanup failed:",
          error?.code || error?.name || "unknown",
        );
      }
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
    const profileBase = {
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
    const operation = beginPartnerOperation(email);
    let sponsoredAccountCreated = false;
    let failureHandled = false;
    try {
      if (sponsoredSignup) setPartnerStatus("claiming");
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      sponsoredAccountCreated = sponsoredSignup;
      operation.uid = cred.user.uid;
      if (!partnerOperationIsCurrent(operation, cred.user.uid)) {
        finishPartnerOperation(operation);
        throw new StalePartnerOperationError();
      }

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
          let definitiveClaimError = isDefinitivePartnerClaimRejection(
            claimError,
          )
            ? claimError
            : null;
          if (!definitiveClaimError) {
            try {
              sponsoredEntitlement = await reconcilePartnerClaim({
                firebaseUser: cred.user,
                inviteToken,
                researchConsent,
                researchSnapshot,
              });
            } catch (reconciliationError) {
              if (isDefinitivePartnerClaimRejection(reconciliationError)) {
                definitiveClaimError = reconciliationError;
              }
            }
            if (!partnerOperationIsCurrent(operation, cred.user.uid)) {
              throw new StalePartnerOperationError();
            }
          }

          if (!sponsoredEntitlement && !definitiveClaimError) {
            failureHandled = true;
            finishPartnerOperation(operation);
            setUser(cred.user);
            setProfile(null);
            setPartner(signupPartner);
            setPartnerStatus("unavailable");
            setSignupRetry(null);
            updatePartnerRecovery({
              kind: "claim",
              user: cred.user,
              profileBase,
              partner: signupPartner,
              inviteToken,
              researchConsent,
              researchSnapshot,
              busy: false,
            });
            setScreen("partner-error");
            throw claimError;
          }

          if (definitiveClaimError) {
            failureHandled = true;
            const nextStatus = statusForPartnerError(definitiveClaimError);
            updatePartnerRecovery({ kind: "cleanup-pending" });
            const cleanup = await cleanUpFailedSponsoredSignup(cred.user);
            finishPartnerOperation(operation);
            if (!cleanup.deleted || !cleanup.signedOut) {
              setSignupRetry(null);
              setUser(cleanup.signedOut ? null : cred.user);
              setProfile(null);
              setPartnerStatus("unavailable");
              updatePartnerRecovery({
                kind: "cleanup",
                user: cred.user,
                cleanup,
                originalStatus: nextStatus,
              });
              setScreen("partner-error");
              throw definitiveClaimError;
            }
            updatePartnerRecovery(null);
            setUser(null);
            setProfile(null);
            setPartner(signupPartner);
            setPartnerStatus(nextStatus);
            setScreen("partner-error");
            updatePartnerFragment(null);
            throw definitiveClaimError;
          }
        }
      }

      const initial = partnerProfileFromBase(profileBase, sponsoredEntitlement);
      try {
        await setDoc(doc(db, "users", cred.user.uid), initial);
      } catch (profileError) {
        if (!partnerOperationIsCurrent(operation, cred.user.uid)) {
          throw new StalePartnerOperationError();
        }
        if (!sponsoredSignup) {
          failureHandled = true;
          const cleanup = await cleanUpFailedSponsoredSignup(cred.user);
          finishPartnerOperation(operation);
          if (!cleanup.deleted || !cleanup.signedOut) {
            setUser(cleanup.signedOut ? null : cred.user);
            setProfile(null);
            updatePartnerRecovery({
              kind: "cleanup",
              user: cred.user,
              cleanup,
            });
            setScreen("partner-error");
          }
          throw profileError;
        }
        if (
          sponsoredEntitlement?.status === "active" ||
          sponsoredEntitlement?.status === "suspended"
        ) {
          failureHandled = true;
          finishPartnerOperation(operation);
          setUser(cred.user);
          setPartnerOwnerUid(cred.user.uid);
          setPartner(
            sponsoredEntitlement.branding || { name: sponsoredEntitlement.name },
          );
          setPartnerStatus(sponsoredEntitlement.status);
          updatePartnerFragment(null);
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

      setUser(cred.user);
      setProfile(initial);
      if (
        sponsoredEntitlement?.status === "active" ||
        sponsoredEntitlement?.status === "suspended"
      ) {
        setPartnerOwnerUid(cred.user.uid);
        setPartnerStatus(sponsoredEntitlement.status);
        setPartner(sponsoredEntitlement.branding || {
          name: sponsoredEntitlement.name,
        });
        updatePartnerFragment(null);
        setSignupRetry(null);
        updatePartnerRecovery(null);
      } else {
        setPaywallVariant("subscribe");
      }
      setScreen(
        sponsoredEntitlement?.status === "suspended"
          ? "partner-error"
          : "personal-plan",
      );
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
      if (import.meta.env.DEV) {
        console.error(
          "[Everwise][auth] Sign up failed:",
          err?.code || err?.name || "unknown",
        );
      }
      throw err;
    }
  };

  const retryPartnerClaim = async () => {
    const recovery = partnerRecoveryRef.current;
    if (recovery?.kind !== "claim" || recovery.busy) return;
    const expectedUid = recovery.user?.uid;
    const operation = beginStrictPartnerOperation(
      expectedUid,
      recovery.user?.email,
    );
    if (!operation || !strictPartnerOperationIsCurrent(operation)) return;
    updatePartnerRecovery({ ...recovery, busy: true });

    try {
      const entitlement = await reconcilePartnerClaim({
        firebaseUser: recovery.user,
        inviteToken: recovery.inviteToken,
        researchConsent: recovery.researchConsent,
        researchSnapshot: recovery.researchSnapshot,
      });
      if (!strictPartnerOperationIsCurrent(operation)) {
        finishPartnerOperation(operation);
        return;
      }
      if (!entitlement) {
        finishPartnerOperation(operation);
        updatePartnerRecovery({ ...recovery, busy: false });
        return;
      }

      const initial = partnerProfileFromBase(recovery.profileBase, entitlement);
      try {
        await setDoc(doc(db, "users", expectedUid), initial);
      } catch {
        if (strictPartnerOperationIsCurrent(operation)) {
          finishPartnerOperation(operation);
          setUser(recovery.user);
          setPartnerOwnerUid(expectedUid);
          setPartner(entitlement.branding || { name: entitlement.name });
          setPartnerStatus(entitlement.status);
          updatePartnerFragment(null);
          updatePartnerRecovery({
            kind: "profile-write",
            user: recovery.user,
            profile: initial,
            entitlement,
            busy: false,
          });
          setScreen("partner-error");
        } else {
          finishPartnerOperation(operation);
        }
        return;
      }
      if (!strictPartnerOperationIsCurrent(operation)) {
        finishPartnerOperation(operation);
        return;
      }

      finishPartnerOperation(operation);
      setUser(recovery.user);
      setProfile(initial);
      setPartnerOwnerUid(expectedUid);
      setPartner(entitlement.branding || { name: entitlement.name });
      setPartnerStatus(entitlement.status);
      updatePartnerFragment(null);
      setSignupRetry(null);
      updatePartnerRecovery(null);
      setScreen(
        entitlement.status === "suspended"
          ? "partner-error"
          : "personal-plan",
      );
    } catch (error) {
      if (!isDefinitivePartnerClaimRejection(error)) {
        if (strictPartnerOperationIsCurrent(operation)) {
          updatePartnerRecovery({ ...recovery, busy: false });
        }
        finishPartnerOperation(operation);
        return;
      }

      const nextStatus = statusForPartnerError(error);
      updatePartnerRecovery({ kind: "cleanup-pending" });
      const cleanup = await cleanUpFailedSponsoredSignup(recovery.user);
      finishPartnerOperation(operation);
      if (!cleanup.deleted || !cleanup.signedOut) {
        setUser(cleanup.signedOut ? null : recovery.user);
        setProfile(null);
        setPartnerStatus("unavailable");
        updatePartnerRecovery({
          kind: "cleanup",
          user: recovery.user,
          cleanup,
          originalStatus: nextStatus,
        });
      } else {
        setUser(null);
        setProfile(null);
        setPartner(recovery.partner);
        setPartnerStatus(nextStatus);
        updatePartnerFragment(null);
        updatePartnerRecovery(null);
      }
      setScreen("partner-error");
    }
  };

  const retryPartnerAccess = () => {
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
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error(
          "[Everwise][auth] Log in failed:",
          err?.code || err?.name || "unknown",
        );
      }
      throw err;
    }
  };

  const logOut = async () => {
    if (accountDeletionBusyRef.current) return;
    operationIdRef.current += 1;
    activeOperationRef.current = null;
    try {
      await signOut(auth);
      authGenerationRef.current += 1;
      currentAuthUidRef.current = null;
      setUser(null);
      setProfile(null);
      setPartnerOwnerUid(null);
      setPartner(null);
      setPartnerStatus("idle");
      updatePartnerFragment(null);
      updatePartnerRecovery(null);
      setSignupRetry(null);
      setProfileCompletion(null);
      setAuthChecked(true);
      setScreen("landing");
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error(
          "[Everwise][auth] Sign out failed:",
          err?.code || err?.name || "unknown",
        );
      }
    }
  };

  const startLesson = (index) => {
    const lesson = lessonsByOrder[index];
    const done = lesson && completedLessons.includes(lesson.id);
    if (
      !canOpenLesson({
        lessonId: lesson?.id,
        completed: done,
        fullAccess: access,
      })
    ) {
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
    if (!nativePurchasesAvailable()) {
      throw new Error(
        "Subscriptions are not available in the browser. Use a sponsored access link to unlock the full course.",
      );
    }
    const entitlement = await purchaseSubscription(plan);
    if (!entitlement.active) {
      throw new Error("The subscription is not active yet.");
    }
    await updateSubscription({
      subscriptionStatus: "active",
      trialStartedAt: null,
      plan: planForProduct(entitlement.productId) || plan,
    });
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

  const finishDeletedAccountLocally = () => {
    authGenerationRef.current += 1;
    authSettledRef.current = true;
    currentAuthUidRef.current = null;
    setUser(null);
    setProfile(null);
    setPartnerOwnerUid(null);
    setPartner(null);
    setPartnerStatus("idle");
    updatePartnerFragment(null);
    updatePartnerRecovery(null);
    setSignupRetry(null);
    setProfileCompletion(null);
    setAuthChecked(true);
    setScreen("landing");
  };

  const retryPartnerReleaseConfirmation = async () => {
    if (
      !pendingPartnerRelease ||
      pendingPartnerRelease.terminal ||
      releaseConfirmationBusy
    ) {
      return;
    }
    const recovery = {
      receipt: pendingPartnerRelease.receipt,
      ...(pendingPartnerRelease.expiresAt
        ? { expiresAt: pendingPartnerRelease.expiresAt }
        : {}),
    };
    const recoveryStatus = partnerReleaseRecoveryStatus(recovery);
    if (!recoveryStatus.valid || recoveryStatus.expired) {
      setPendingPartnerRelease({ ...recovery, terminal: "expired" });
      return;
    }
    const confirmationOperation = beginSignedOutReleaseConfirmation();
    if (!confirmationOperation) return;
    setReleaseConfirmationBusy(true);
    try {
      const result = await confirmPartnerRelease({ receipt: recovery.receipt });
      if (!partnerReleaseWasConfirmed(result)) return;
      const cleanup = clearStoredPartnerRelease(recovery, {
        requireConfirmable: true,
      });
      if (cleanup === "failed") {
        storeTerminalPartnerReconciliation(recovery, "storage-cleanup");
        if (signedOutReleaseConfirmationIsCurrent(confirmationOperation)) {
          setPendingPartnerRelease({
            ...recovery,
            terminal: "storage-cleanup",
          });
        }
        return;
      }
      if (signedOutReleaseConfirmationIsCurrent(confirmationOperation)) {
        setPendingPartnerRelease(
          cleanup === "cleared" ? null : readStoredPartnerRelease(),
        );
      }
    } catch (error) {
      if (error?.code === "INVALID_RECEIPT") {
        const terminalization = storeTerminalPartnerReconciliation(
          recovery,
          "invalid-receipt",
          { requireConfirmable: true },
        );
        if (signedOutReleaseConfirmationIsCurrent(confirmationOperation)) {
          setPendingPartnerRelease(
            terminalization === "not-owner"
              ? readStoredPartnerRelease()
              : { ...recovery, terminal: "invalid-receipt" },
          );
        }
      }
    } finally {
      if (signedOutReleaseConfirmationIsCurrent(confirmationOperation)) {
        setReleaseConfirmationBusy(false);
      }
      finishSignedOutReleaseConfirmation(confirmationOperation);
    }
  };

  // Permanently deletes the learner's progress and sign-in account. Sponsored
  // accounts first reserve a release receipt so their seat is freed only after
  // both Firebase deletions have completed.
  const deleteAccount = async (currentPassword) => {
    if (!user) throw new Error("No account is signed in.");
    if (!sponsoredActive) {
      if (!user.email || typeof currentPassword !== "string" || !currentPassword) {
        throw new Error("Please enter your current password.");
      }
      const expectedUser = user;
      const expectedUid = user.uid;
      const cachedProfile = profile;
      const operation = beginAccountDeletionOperation(expectedUid);
      if (!operation || !cachedProfile) {
        throw new Error(
          "We could not safely prepare account deletion. Please try again.",
        );
      }
      let profileDeleted = false;
      let firebaseDeleted = false;
      try {
        const credential = EmailAuthProvider.credential(
          expectedUser.email,
          currentPassword,
        );
        await reauthenticateWithCredential(expectedUser, credential);
        requireCurrentAccountDeletion(operation);
        await deleteDoc(doc(db, "users", expectedUid));
        profileDeleted = true;
        requireCurrentAccountDeletion(operation);
        try {
          await deleteUser(expectedUser);
          firebaseDeleted = true;
        } catch (deletionError) {
          try {
            await reload(expectedUser);
          } catch (lookupError) {
            if (lookupError?.code === "auth/user-not-found") {
              firebaseDeleted = true;
            } else {
              throw new FirebaseDeletionStatusIndeterminateError();
            }
          }
          if (!firebaseDeleted) throw deletionError;
        }
      } catch (err) {
        let profileRestored = !profileDeleted || firebaseDeleted;
        if (profileDeleted && !firebaseDeleted) {
          try {
            await setDoc(doc(db, "users", expectedUid), cachedProfile);
            profileRestored = true;
          } catch {
            profileRestored = false;
          }
        }
        finishAccountDeletionOperation(operation);
        if (!profileRestored) {
          throw new Error(
            "Account deletion stopped and your saved profile could not be restored. Please contact support.",
          );
        }
        if (err instanceof FirebaseDeletionStatusIndeterminateError) {
          throw new Error(
            "We could not confirm whether your account was deleted. Please contact support before trying again.",
          );
        }
        if (err.code === "auth/requires-recent-login") {
          throw new Error(
            "For your security, please log out and log back in, then try deleting your account again.",
          );
        }
        throw new Error(
          profileDeleted
            ? "We could not delete your account right now. Your saved profile was restored."
            : "We could not delete your account right now. Please try again.",
        );
      }
      const deletionStillCurrent = accountDeletionOperationIsCurrent(operation);
      finishAccountDeletionOperation(operation);
      if (deletionStillCurrent) finishDeletedAccountLocally();
      return;
    }

    if (!user.email || typeof currentPassword !== "string" || !currentPassword) {
      throw new Error("Please enter your current password.");
    }

    const expectedUser = user;
    const expectedUid = user.uid;
    const cachedProfile = profile;
    const operation = beginAccountDeletionOperation(expectedUid);
    if (!operation || !cachedProfile) {
      throw new Error("We could not safely prepare account deletion. Please try again.");
    }

    let idToken = null;
    let receipt = null;
    let releaseRecovery = null;
    let profileDeleted = false;
    let firebaseDeleted = false;
    try {
      requireCurrentAccountDeletion(operation);
      const credential = EmailAuthProvider.credential(
        expectedUser.email,
        currentPassword,
      );
      await reauthenticateWithCredential(expectedUser, credential);
      requireCurrentAccountDeletion(operation);
      idToken = await expectedUser.getIdToken(true);
      requireCurrentAccountDeletion(operation);
      const intent = await beginPartnerRelease({ idToken });
      if (PARTNER_RELEASE_RECEIPT_PATTERN.test(intent?.receipt)) {
        receipt = intent.receipt;
        releaseRecovery = {
          receipt,
          ...(typeof intent.expiresAt === "string"
            ? { expiresAt: intent.expiresAt }
            : {}),
        };
      }
      const intentStatus = partnerReleaseRecoveryStatus(intent);
      if (
        !intentStatus.valid ||
        intentStatus.expired ||
        intentStatus.reconciliation
      ) {
        throw new PartnerReleasePreparationError();
      }
      requireCurrentAccountDeletion(operation);
      if (!storePreparedPartnerRelease(releaseRecovery)) {
        throw new PartnerReleasePreparationError();
      }
      requireCurrentAccountDeletion(operation);
      await deleteDoc(doc(db, "users", expectedUid));
      profileDeleted = true;
      requireCurrentAccountDeletion(operation);
      try {
        await deleteUser(expectedUser);
        firebaseDeleted = true;
      } catch (deletionError) {
        try {
          await reload(expectedUser);
        } catch (lookupError) {
          if (lookupError?.code === "auth/user-not-found") {
            firebaseDeleted = true;
          } else {
            throw new FirebaseDeletionStatusIndeterminateError();
          }
        }
        if (!firebaseDeleted) throw deletionError;
      }
    } catch (err) {
      if (
        err instanceof FirebaseDeletionStatusIndeterminateError &&
        releaseRecovery
      ) {
        const terminalization = storeTerminalPartnerReconciliation(
          releaseRecovery,
          "deletion-status",
        );
        const operationIsCurrent = accountDeletionOperationIsCurrent(operation);
        finishAccountDeletionOperation(operation);
        if (operationIsCurrent) {
          updatePartnerRecovery({
            kind: "deletion-reconciliation",
            reconciliation:
              terminalization === "not-owner"
                ? "storage-cleanup"
                : "deletion-status",
          });
          setScreen("partner-error");
        } else {
          setPendingPartnerRelease(readStoredPartnerRelease());
        }
        throw new Error(
          "We could not confirm whether Firebase deleted your account. Please contact support before trying again.",
        );
      }
      let releaseCancelled = !receipt;
      let profileRestored = !profileDeleted;
      if (!firebaseDeleted && receipt && idToken) {
        try {
          const cancellation = await cancelPartnerRelease({ idToken, receipt });
          releaseCancelled = cancellation?.cancelled === true;
        } catch {
          releaseCancelled = false;
        }
        if (profileDeleted) {
          try {
            await setDoc(doc(db, "users", expectedUid), cachedProfile);
            profileRestored = true;
          } catch {
            profileRestored = false;
          }
        }
      }
      let reconciliation = null;
      if (!releaseCancelled) {
        reconciliation = "cancellation";
      }
      if (!profileRestored) {
        reconciliation = "compensation";
      }
      if (!reconciliation && receipt) {
        const cleanup = clearStoredPartnerRelease(releaseRecovery);
        if (cleanup === "failed") reconciliation = "storage-cleanup";
      }
      if (reconciliation && releaseRecovery) {
        storeTerminalPartnerReconciliation(releaseRecovery, reconciliation);
      }
      const operationIsCurrent = accountDeletionOperationIsCurrent(operation);
      finishAccountDeletionOperation(operation);
      if (operationIsCurrent && reconciliation && releaseRecovery) {
        updatePartnerRecovery({
          kind: "deletion-reconciliation",
          reconciliation,
        });
        setScreen("partner-error");
        throw new Error(
          "Account deletion stopped and needs support reconciliation.",
        );
      }
      if (err instanceof StaleAccountDeletionError) throw err;
      throw new Error(accountDeletionErrorMessage(err));
    }

    const confirmationReady = storeConfirmablePartnerRelease(releaseRecovery);
    let confirmationPreparation = "terminalized";
    if (!confirmationReady) {
      confirmationPreparation = storeTerminalPartnerReconciliation(
        releaseRecovery,
        "storage-cleanup",
      );
    }
    const deletionStillCurrent = accountDeletionOperationIsCurrent(operation);
    finishAccountDeletionOperation(operation);
    // Firebase authentication is gone for the captured account. Only clear
    // its local UI when that exact auth generation is still current; a newer
    // account must remain untouched while receipt-only safety work continues.
    if (deletionStillCurrent) {
      finishDeletedAccountLocally();
    }
    const confirmationOperation = beginSignedOutReleaseConfirmation();
    if (!confirmationReady) {
      if (signedOutReleaseConfirmationIsCurrent(confirmationOperation)) {
        setPendingPartnerRelease(
          confirmationPreparation === "not-owner"
            ? readStoredPartnerRelease()
            : { ...releaseRecovery, terminal: "storage-cleanup" },
        );
      }
      finishSignedOutReleaseConfirmation(confirmationOperation);
      return;
    }
    if (signedOutReleaseConfirmationIsCurrent(confirmationOperation)) {
      setPendingPartnerRelease(releaseRecovery);
      setReleaseConfirmationBusy(true);
    }
    try {
      const result = await confirmPartnerRelease({ receipt });
      if (!partnerReleaseWasConfirmed(result)) {
        return;
      }
      const cleanup = clearStoredPartnerRelease(releaseRecovery, {
        requireConfirmable: true,
      });
      if (cleanup === "failed") {
        storeTerminalPartnerReconciliation(
          releaseRecovery,
          "storage-cleanup",
        );
        if (signedOutReleaseConfirmationIsCurrent(confirmationOperation)) {
          setPendingPartnerRelease({
            ...releaseRecovery,
            terminal: "storage-cleanup",
          });
        }
        return;
      }
      if (signedOutReleaseConfirmationIsCurrent(confirmationOperation)) {
        setPendingPartnerRelease(
          cleanup === "cleared" ? null : readStoredPartnerRelease(),
        );
      }
    } catch (error) {
      if (error?.code === "INVALID_RECEIPT") {
        const terminalization = storeTerminalPartnerReconciliation(
          releaseRecovery,
          "invalid-receipt",
          { requireConfirmable: true },
        );
        if (signedOutReleaseConfirmationIsCurrent(confirmationOperation)) {
          setPendingPartnerRelease(
            terminalization === "not-owner"
              ? readStoredPartnerRelease()
              : { ...releaseRecovery, terminal: "invalid-receipt" },
          );
        }
      }
    } finally {
      if (signedOutReleaseConfirmationIsCurrent(confirmationOperation)) {
        setReleaseConfirmationBusy(false);
      }
      finishSignedOutReleaseConfirmation(confirmationOperation);
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
          await updateDoc(doc(db, "users", user.uid), updates);
        } catch (err) {
          if (import.meta.env.DEV) {
            console.error(
              "[Everwise][firestore] Failed to save challenge:",
              err?.code || err?.name || "unknown",
            );
          }
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
        await updateDoc(doc(db, "users", user.uid), updates);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error(
            "[Everwise][firestore] Failed to save progress:",
            err?.code || err?.name || "unknown",
          );
        }
      }
    }
    setScreen("complete");
  };

  const finishExam = async ({
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
        await updateDoc(doc(db, "users", user.uid), updates);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error(
            "[Everwise][firestore] Failed to save exam:",
            err?.code || err?.name || "unknown",
          );
        }
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

  if (
    pendingPartnerRelease &&
    !user &&
    authSettledRef.current &&
    currentAuthUidRef.current === null
  ) {
    return (
      <AppShell screen="partner-error">
        <PartnerReleaseRecovery
          busy={releaseConfirmationBusy}
          terminal={pendingPartnerRelease.terminal || null}
          onRetry={retryPartnerReleaseConfirmation}
        />
      </AppShell>
    );
  }

  if (partnerRecovery?.kind === "deletion-reconciliation") {
    return (
      <AppShell screen="partner-error" isAuthenticated={Boolean(user)}>
        <PartnerDeletionReconciliation
          reconciliation={partnerRecovery.reconciliation}
        />
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

  if (partnerRecovery?.kind === "claim") {
    return (
      <AppShell screen="partner-error" isAuthenticated={Boolean(user)}>
        <PartnerAccessError
          code="PARTNER_ACCESS_UNCONFIRMED"
          partnerName={partnerRecovery.partner?.name || partner?.name}
          onRetry={retryPartnerClaim}
          retryLabel={partnerRecovery.busy ? "Retrying…" : "Retry"}
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
          partner={sponsoredActive ? partner : null}
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
          onBack={accountDeletionBusy ? undefined : goHome}
          onLogOut={logOut}
          onOpenPaywall={goPaywall}
          onManageSubscription={() =>
            window.open("https://apps.apple.com/account/subscriptions", "_blank")
          }
          onResetPassword={resetPassword}
          onDeleteAccount={deleteAccount}
          textSize={textSize}
          onTextSizeChange={setTextSize}
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
          purchasesAvailable={nativePurchasesAvailable()}
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
      partner={sponsoredActive ? partner : null}
      navigationDisabled={accountDeletionBusy}
      onHome={accountDeletionBusy ? undefined : goHome}
      onCourse={accountDeletionBusy ? undefined : goPath}
      onScamChecker={accountDeletionBusy ? undefined : goScamChecker}
      onBadges={accountDeletionBusy ? undefined : goBadges}
      onSettings={accountDeletionBusy ? undefined : goSettings}
      textSize={textSize}
      onTextSizeChange={setTextSize}
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

export default function App() {
  const [initialPartnerFragment] = useState(capturePartnerFragment);

  if (
    initialPartnerFragment?.kind === "admin" ||
    initialPartnerFragment?.kind === "admin-invalid"
  ) {
    return (
      <PartnerDashboard
        adminToken={
          initialPartnerFragment.kind === "admin"
            ? initialPartnerFragment.token
            : null
        }
      />
    );
  }

  return <LearnerApp initialPartnerFragment={initialPartnerFragment} />;
}
