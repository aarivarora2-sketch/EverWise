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
  courseStanding,
  isCourseComplete,
  requiredCourseIds,
} from "./utils/courseProgress.js";
import {
  isTrialExpired,
} from "./utils/subscription";
import {
  canOpenLesson,
  resolveFullAccess,
  shouldExitProtectedContent,
} from "./utils/access.js";
import { consumePartnerFragment } from "./utils/partnerLinks.js";
import {
  clearPartnerClaimRecovery,
  readPartnerClaimRecovery,
  storePartnerClaimRecovery,
} from "./utils/partnerClaimRecovery.js";
import {
  beginPartnerRelease,
  cancelPartnerRelease,
  claimPartnerSeat,
  confirmPartnerRelease,
  fetchPartnerAccess,
  previewInvite,
  resolveProvisionedLogin,
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
  authEmailToUsername,
  isReservedSponsoredUsername,
  loginIdentifierToAuthEmail,
  normalizeUsername,
  usernameToAuthEmail,
} from "./utils/validation.js";
import {
  getCurrentEntitlement,
  getSubscriptionProducts,
  planForProduct,
  purchaseSubscription,
  restoreSubscriptions,
} from "./services/purchases";
import {
  cancelBillingSubscription,
  createBillingCheckout,
  createBillingPortal,
  fetchBillingAccess,
  fetchBillingPlans,
} from "./services/billingAccess.js";
import BillingConfirmation from "./screens/BillingConfirmation.jsx";
import BillingAccessError from "./screens/BillingAccessError.jsx";

const TEXT_SIZE_STORAGE_KEY = "everwise-text-size";
const PARTNER_RELEASE_RECEIPT_STORAGE_KEY =
  "everwise-partner-release-receipt";
const PARTNER_RELEASE_CONFIRMABLE_STORAGE_KEY =
  "everwise-partner-release-confirmable";
const PARTNER_ACCESS_REFRESH_INTERVAL_MS = 60_000;
const BILLING_CONFIRMATION_OFFSETS_MS = [0, 1_000, 2_000, 3_000, 5_000, 8_000];
const BILLING_CONFIRMATION_DEADLINE_MS = 20_000;
const BILLING_RETURN_INTENT_STORAGE_KEY = "everwise.billing-return-intent.v1";
const BILLING_RETURN_INTENT_TTL_MS = 10 * 60 * 1000;
const BILLING_RETURN_INTENT_MAX_BYTES = 1_024;
const BILLING_RETURN_INTENT_KEYS = [
  "createdAt",
  "expiresAt",
  "itemId",
  "nonce",
  "screen",
  "uid",
  "version",
];
const BILLING_RETURN_NONCE_PATTERN = /^[a-f0-9]{32}$/;
const BILLING_RETURN_SCREENS = new Set(["lesson", "challenge", "exam"]);
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

function encodedByteLength(value) {
  try {
    return new TextEncoder().encode(value).byteLength;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

function captureMonotonicNow() {
  try {
    const owner = globalThis.performance;
    const method = owner?.now;
    if (typeof method !== "function") return null;
    return () => {
      try {
        const value = Reflect.apply(method, owner, []);
        return Number.isFinite(value) ? value : null;
      } catch {
        return null;
      }
    };
  } catch {
    return null;
  }
}

function getSavedTextSize() {
  try {
    const saved = window.localStorage.getItem(TEXT_SIZE_STORAGE_KEY);
    if (TEXT_SIZE_OPTIONS.has(saved)) return saved;
    return LEGACY_TEXT_SIZES[saved] || "size-2";
  } catch {
    return "size-2";
  }
}

function consumeBillingReturnMarker() {
  try {
    const currentUrl = new URL(
      `${globalThis.location.pathname}${globalThis.location.search}${globalThis.location.hash}`,
      globalThis.location.origin,
    );
    const values = currentUrl.searchParams.getAll("billing");
    const sessionIds = currentUrl.searchParams.getAll("session_id");
    if (values.length === 0 && sessionIds.length === 0) return null;
    currentUrl.searchParams.delete("billing");
    currentUrl.searchParams.delete("session_id");
    const nextUrl = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
    globalThis.history.replaceState(globalThis.history.state, "", nextUrl);
    return values.length === 1 && (values[0] === "success" || values[0] === "cancel")
      ? values[0]
      : null;
  } catch {
    return null;
  }
}

function clearStoredBillingReturnIntent() {
  try {
    window.sessionStorage.removeItem(BILLING_RETURN_INTENT_STORAGE_KEY);
  } catch {
    // A blocked session store must never keep the app from failing closed.
  }
}

function createBillingReturnNonce() {
  try {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  } catch {
    return null;
  }
}

function storeBillingReturnIntent({ uid, screen, itemId, createdAt = Date.now() }) {
  clearStoredBillingReturnIntent();
  const nonce = createBillingReturnNonce();
  if (!nonce) return false;
  const serialized = JSON.stringify({
    version: 1,
    nonce,
    uid,
    screen,
    itemId,
    createdAt,
    expiresAt: createdAt + BILLING_RETURN_INTENT_TTL_MS,
  });
  if (encodedByteLength(serialized) > BILLING_RETURN_INTENT_MAX_BYTES) {
    return false;
  }
  try {
    window.sessionStorage.setItem(BILLING_RETURN_INTENT_STORAGE_KEY, serialized);
    return (
      window.sessionStorage.getItem(BILLING_RETURN_INTENT_STORAGE_KEY) ===
      serialized
    );
  } catch {
    clearStoredBillingReturnIntent();
    return false;
  }
}

function readBillingReturnIntent(expectedUid) {
  let serialized;
  try {
    serialized = window.sessionStorage.getItem(BILLING_RETURN_INTENT_STORAGE_KEY);
  } catch {
    return null;
  }
  if (serialized === null) return null;
  const reject = () => {
    clearStoredBillingReturnIntent();
    return null;
  };
  if (
    typeof serialized !== "string" ||
    serialized.length === 0 ||
    encodedByteLength(serialized) > BILLING_RETURN_INTENT_MAX_BYTES
  ) {
    return reject();
  }
  let intent;
  try {
    intent = JSON.parse(serialized);
  } catch {
    return reject();
  }
  if (
    !intent ||
    Object.getPrototypeOf(intent) !== Object.prototype ||
    Object.keys(intent).sort().join("\u0000") !==
      BILLING_RETURN_INTENT_KEYS.join("\u0000") ||
    intent.version !== 1 ||
    typeof intent.uid !== "string" ||
    intent.uid !== expectedUid ||
    typeof intent.screen !== "string" ||
    !BILLING_RETURN_SCREENS.has(intent.screen) ||
    typeof intent.itemId !== "string" ||
    intent.itemId.length === 0 ||
    intent.itemId.length > 128 ||
    typeof intent.nonce !== "string" ||
    !BILLING_RETURN_NONCE_PATTERN.test(intent.nonce) ||
    !Number.isSafeInteger(intent.createdAt) ||
    !Number.isSafeInteger(intent.expiresAt) ||
    intent.expiresAt !== intent.createdAt + BILLING_RETURN_INTENT_TTL_MS
  ) {
    return reject();
  }
  const now = Date.now();
  if (
    intent.createdAt > now ||
    intent.createdAt < now - BILLING_RETURN_INTENT_TTL_MS ||
    intent.expiresAt <= now
  ) {
    return reject();
  }
  return intent;
}

function resolveBillingReturnDestination(intent) {
  if (!intent) return null;
  if (intent.screen === "lesson") {
    const index = lessonsByOrder.findIndex((lesson) => lesson.id === intent.itemId);
    if (index < 0) return null;
    return { screen: "lesson", itemId: intent.itemId, index };
  }
  if (intent.screen === "challenge") {
    const item = challengesByOrder.find((challenge) => challenge.id === intent.itemId);
    return item ? { screen: "challenge", itemId: intent.itemId, item } : null;
  }
  if (intent.screen === "exam") {
    const item = examsByOrder.find((exam) => exam.id === intent.itemId);
    return item ? { screen: "exam", itemId: intent.itemId, item } : null;
  }
  return null;
}

function isValidatedHostedUrl(value, hostname) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === hostname &&
      !url.port &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
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

// Deletion stopped before destroying anything because the subscription could
// not be cancelled. Carries its own learner-facing message past the generic
// deletion catch so the learner is told to cancel from Manage subscription.
class SubscriptionCancellationFailedError extends Error {
  constructor() {
    super(
      "We could not cancel your subscription, so your account was not deleted. Please try again, or cancel from Manage subscription first.",
    );
    this.name = "SubscriptionCancellationFailedError";
  }
}

async function fetchAuthoritativePartnerAccess(firebaseUser) {
  // No forced refresh here: this runs on every bootstrap, retry, and
  // protected-content open, and the server only uses the token's uid (not
  // any claim whose freshness matters), so a cached token is safe. Forcing
  // a refresh on every call was firing extra token/auth-state churn that
  // left the billing-fetch effect's authSettledRef never staying settled
  // long enough for a Retry click to land in a working window.
  const idToken = await firebaseUser.getIdToken();
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
  const [platform] = useState(() =>
    Capacitor.isNativePlatform() ? "native" : "web",
  );
  const [billingReturn, setBillingReturn] = useState(consumeBillingReturnMarker);
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
  // Increments every time authSettledRef.current flips to true, even when
  // authChecked was already true (a same-value setAuthChecked(true) would
  // otherwise not re-trigger effects that gate on authSettledRef, since
  // refs aren't part of React's dependency tracking).
  const [authSettledVersion, setAuthSettledVersion] = useState(0);
  const [authBootstrapAttempt, setAuthBootstrapAttempt] = useState(0);
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
  const [billingOwnerUid, setBillingOwnerUid] = useState(null);
  const [billingStatus, setBillingStatus] = useState("unavailable");
  const [billingAccess, setBillingAccess] = useState(null);
  const [billingPlans, setBillingPlans] = useState([]);
  const [billingBusy, setBillingBusy] = useState(false);
  const [billingRecovery, setBillingRecovery] = useState(null);
  const [billingRefreshAttempt, setBillingRefreshAttempt] = useState(0);
  const [billingPollAttempt, setBillingPollAttempt] = useState(0);
  const [nativeEntitlement, setNativeEntitlement] = useState({
    uid: null,
    subscriptionStatus: "expired",
  });
  const authGenerationRef = useRef(0);
  const authSettledRef = useRef(false);
  // authSettledRef is a ref, so flipping it doesn't by itself re-run effects
  // that gate on it. Route every transition to true through here so
  // authSettledVersion (a real dependency) changes too, even when
  // authChecked was already true and setAuthChecked(true) is a no-op.
  const markAuthSettled = () => {
    authSettledRef.current = true;
    setAuthSettledVersion((v) => v + 1);
  };
  const currentAuthUidRef = useRef(null);
  const operationIdRef = useRef(0);
  const activeOperationRef = useRef(null);
  const accountDeletionBusyRef = useRef(false);
  const releaseConfirmationOperationIdRef = useRef(0);
  const activeReleaseConfirmationRef = useRef(null);
  const partnerFragmentRef = useRef(partnerFragment);
  const partnerRecoveryRef = useRef(null);
  const refreshAuthoritativePartnerAccessRef = useRef(null);
  const authoritativeAccessVersionRef = useRef(0);
  const authoritativeAccessRefreshInFlightRef = useRef(null);
  const backgroundAccessRefreshRef = useRef(null);
  const appMountedRef = useRef(true);
  const billingPollIdRef = useRef(0);
  const billingReturnOwnerUidRef = useRef(null);
  const billingHadFullAccessRef = useRef(false);
  const pendingProtectedNavigationRef = useRef(null);
  const protectedContentStateRef = useRef({
    screen: "landing",
    itemId: null,
    completedIds: [],
  });

  useEffect(() => {
    appMountedRef.current = true;
    return () => {
      appMountedRef.current = false;
      authoritativeAccessVersionRef.current += 1;
      billingPollIdRef.current += 1;
      backgroundAccessRefreshRef.current = null;
    };
  }, []);

  useEffect(() => {
    const handleBillingReturn = () => {
      const marker = consumeBillingReturnMarker();
      if (marker) setBillingReturn(marker);
    };
    window.addEventListener("popstate", handleBillingReturn);
    return () => window.removeEventListener("popstate", handleBillingReturn);
  }, []);

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

    if (platform === "native") {
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
  }, [platform]);

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
    if (!user?.uid || platform !== "native") return undefined;

    let cancelled = false;
    const uid = user.uid;
    const generation = authGenerationRef.current;
    setNativeEntitlement({ uid, subscriptionStatus: "expired" });
    getCurrentEntitlement()
      .then(async (entitlement) => {
        if (
          cancelled ||
          !appMountedRef.current ||
          generation !== authGenerationRef.current ||
          currentAuthUidRef.current !== uid
        ) {
          return;
        }
        setNativeEntitlement({
          uid,
          subscriptionStatus: entitlement.active ? "active" : "expired",
        });
        if (!entitlement.active) return;
        const updates = {
          subscriptionStatus: "active",
          plan: planForProduct(entitlement.productId),
        };
        setProfile((current) => (current ? { ...current, ...updates } : current));
        await updateDoc(doc(db, "users", uid), updates);
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
  }, [platform, user]);

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
      const previousAuthUid = currentAuthUidRef.current;
      const generation = authGenerationRef.current + 1;
      authGenerationRef.current = generation;
      authSettledRef.current = false;
      currentAuthUidRef.current = u?.uid || null;
      if (previousAuthUid && previousAuthUid !== (u?.uid || null)) {
        pendingProtectedNavigationRef.current = null;
        clearStoredBillingReturnIntent();
      } else if (u?.uid) {
        readBillingReturnIntent(u.uid);
      }
      if (
        billingReturnOwnerUidRef.current &&
        billingReturnOwnerUidRef.current !== (u?.uid || null)
      ) {
        billingReturnOwnerUidRef.current = null;
        setBillingReturn(null);
      }
      authoritativeAccessVersionRef.current += 1;
      backgroundAccessRefreshRef.current = null;
      billingPollIdRef.current += 1;
      setUser(u);
      setAuthChecked(false);
      setBillingOwnerUid(u?.uid || null);
      billingHadFullAccessRef.current = false;
      setBillingStatus("unavailable");
      setBillingAccess(null);
      setBillingPlans([]);
      setBillingBusy(false);
      setBillingRecovery(null);
      setNativeEntitlement({
        uid: u?.uid || null,
        subscriptionStatus: "expired",
      });

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
        markAuthSettled();
        setAuthChecked(true);
        return;
      }

      if (belongsToActiveSignup) {
        markAuthSettled();
        setAuthChecked(true);
        return;
      }

      setPartnerOwnerUid(null);
      setPartner(null);
      setPartnerStatus("idle");
      updatePartnerRecovery(null);
      setSignupRetry(null);
      setProfileCompletion(null);

      const storedClaimRecovery = readPartnerClaimRecovery({
        storage: window.sessionStorage,
        now: Date.now(),
        uid: u.uid,
      });
      if (storedClaimRecovery) {
        if (
          generation !== authGenerationRef.current ||
          currentAuthUidRef.current !== u.uid
        ) {
          return;
        }
        setPartner(storedClaimRecovery.partner);
        setPartnerStatus("unavailable");
        updatePartnerRecovery({
          kind: "claim",
          user: u,
          profileBase: storedClaimRecovery.profileBase,
          partner: storedClaimRecovery.partner,
          inviteToken: storedClaimRecovery.inviteToken,
          researchConsent: storedClaimRecovery.research !== null,
          researchSnapshot: storedClaimRecovery.research,
          busy: false,
        });
        setScreen("partner-error");
        markAuthSettled();
        setAuthChecked(true);
        return;
      }

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
              setProfileCompletion({
                user: u,
                entitlement: authoritativeAccess,
              });
              updatePartnerRecovery(null);
              setScreen("interview");
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
              setPartnerStatus("unavailable");
              updatePartnerRecovery({
                kind: "authenticated-bootstrap",
                user: u,
                phase: "access",
                busy: false,
              });
              setScreen("partner-error");
            }
          }
          markAuthSettled();
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
            markAuthSettled();
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
          setProfile(null);
          setPartnerStatus("unavailable");
          updatePartnerRecovery({
            kind: "authenticated-bootstrap",
            user: u,
            phase: "profile",
            busy: false,
          });
          setScreen("partner-error");
        }
      } finally {
        if (
          generation === authGenerationRef.current &&
          currentAuthUidRef.current === u.uid
        ) {
          markAuthSettled();
          setAuthChecked(true);
        }
      }
    });
    return () => {
      window.clearTimeout(startupFallback);
      unsub();
    };
  }, [authBootstrapAttempt]);

  const activeLesson = lessonsByOrder[activeIndex];
  const completedLessons = profile?.completedLessons ?? [];
  protectedContentStateRef.current = {
    screen,
    itemId:
      screen === "lesson"
        ? activeLesson?.id
        : screen === "challenge"
          ? activeChallenge?.id
          : screen === "exam"
            ? activeExam?.id
            : null,
    completedIds: completedLessons,
  };
  const allDone = isCourseComplete(completedLessons, requiredLearningIds);
  const nativeSubscriptionStatus =
    user?.uid && nativeEntitlement.uid === user.uid
      ? nativeEntitlement.subscriptionStatus
      : "expired";
  const sponsoredActive = Boolean(
    user?.uid &&
      partnerStatus === "active" &&
      partnerOwnerUid === user.uid,
  );
  const ownedBillingStatus =
    user?.uid && billingOwnerUid === user.uid ? billingStatus : "unavailable";
  const access = resolveFullAccess({
    sponsoredStatus: sponsoredActive ? "active" : "none",
    billingStatus: ownedBillingStatus,
    nativeSubscriptionStatus,
    platform,
    developmentBypass: subscriptionBypassEnabled,
  });
  const ownedBillingAccess =
    user?.uid && billingOwnerUid === user.uid ? billingAccess : null;
  const settingsBilling = sponsoredActive
    ? {
        provider: "sponsor",
        status: "active",
        partnerName: partner?.name || "your community partner",
        plan: null,
        trialEndsAt: null,
        currentPeriodEndsAt: null,
        cancelAtPeriodEnd: false,
        canManage: false,
        busy: false,
        error: null,
      }
    : platform === "web"
      ? ownedBillingStatus === "unavailable" || !ownedBillingAccess
        ? {
            provider: "unavailable",
            status: "unavailable",
            plan: null,
            trialEndsAt: null,
            currentPeriodEndsAt: null,
            cancelAtPeriodEnd: false,
            canManage: false,
            busy: billingBusy,
            error: "Billing is temporarily unavailable.",
          }
        : ownedBillingAccess.status === "none"
          ? {
              provider: "none",
              status: "none",
              plan: null,
              trialEndsAt: null,
              currentPeriodEndsAt: null,
              cancelAtPeriodEnd: false,
              canManage: false,
              busy: billingBusy,
              error: null,
            }
          : {
              provider: "stripe",
              status: ownedBillingAccess.status,
              plan: ownedBillingAccess.plan,
              trialEndsAt: ownedBillingAccess.trialEndsAt,
              currentPeriodEndsAt: ownedBillingAccess.currentPeriodEndsAt,
              cancelAtPeriodEnd: ownedBillingAccess.cancelAtPeriodEnd,
              canManage: ownedBillingAccess.canManage,
              busy: billingBusy,
              error: null,
            }
      : nativeSubscriptionStatus === "active"
        ? {
            provider: "apple",
            status: "active",
            plan: profile?.plan === "monthly" ? "monthly" : "annual",
            trialEndsAt: null,
            currentPeriodEndsAt: null,
            cancelAtPeriodEnd: false,
            canManage: true,
            busy: false,
            error: null,
          }
        : {
            provider: "none",
            status: "none",
            plan: null,
            trialEndsAt: null,
            currentPeriodEndsAt: null,
            cancelAtPeriodEnd: false,
            canManage: false,
            busy: false,
            error: null,
          };

  useEffect(() => {
    if (
      access &&
      user?.uid &&
      partnerStatus === "suspended" &&
      partnerOwnerUid === user.uid &&
      screen === "partner-error"
    ) {
      setScreen("home");
    }
  }, [access, partnerOwnerUid, partnerStatus, screen, user?.uid]);

  useEffect(() => {
    if (
      platform !== "web" ||
      !authChecked ||
      !authSettledRef.current ||
      !user?.uid
    ) {
      return undefined;
    }
    if (
      authoritativeAccessRefreshInFlightRef.current ===
      authoritativeAccessVersionRef.current
    ) {
      return undefined;
    }
    if (sponsoredActive) {
      authoritativeAccessVersionRef.current += 1;
      setBillingOwnerUid(user.uid);
      setBillingStatus("unavailable");
      setBillingAccess(null);
      setBillingPlans([]);
      setBillingBusy(false);
      return undefined;
    }

    const uid = user.uid;
    const generation = authGenerationRef.current;
    const accessVersion = authoritativeAccessVersionRef.current + 1;
    authoritativeAccessVersionRef.current = accessVersion;
    let cancelled = false;
    const isCurrent = () =>
      !cancelled &&
      appMountedRef.current &&
      accessVersion === authoritativeAccessVersionRef.current &&
      generation === authGenerationRef.current &&
      currentAuthUidRef.current === uid;
    setBillingOwnerUid(uid);
    setBillingBusy(true);
    Promise.all([fetchBillingPlans(user), fetchBillingAccess(user)])
      .then(([plansResult, accessResult]) => {
        if (!isCurrent()) return;
        setBillingPlans(plansResult.plans);
        setBillingAccess(accessResult);
        setBillingStatus(accessResult.status);
        if (accessResult.access === "full") billingHadFullAccessRef.current = true;
        setBillingRecovery((current) =>
          current?.kind === "temporary" ? null : current,
        );
      })
      .catch(() => {
        if (!isCurrent()) return;
        setBillingPlans([]);
        setBillingAccess(null);
        setBillingStatus("unavailable");
        setBillingRecovery({ kind: "temporary" });
      })
      .finally(() => {
        // Always clear the busy flag, even when superseded: leaving it true
        // when isCurrent() is false permanently deadlocks the Retry button,
        // since the retry handler refuses to fire while billingBusy is true.
        if (appMountedRef.current) setBillingBusy(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    authChecked,
    authSettledVersion,
    billingRefreshAttempt,
    platform,
    sponsoredActive,
    user,
  ]);
  const lessonIdSet = new Set(lessonsByOrder.map((l) => l.id));
  const lessonsCompletedCount = completedLessons.filter((id) =>
    lessonIdSet.has(id)
  ).length;
  const badgesEarnedCount = (profile?.badges ?? []).length;

  const standing = courseStanding(completedLessons, requiredLearningIds, {
    lessons: lessonsByOrder,
    challenges: challengesByOrder,
    exams: examsByOrder,
  });
  const standingPhase = standing.currentPhase
    ? getPhase(standing.currentPhase)
    : null;
  // Only meaningful once someone is signed in and has a profile to measure.
  const courseProgress = user
    ? {
        percent: standing.percent,
        phaseNumber: standing.currentPhase,
        phaseTitle: standingPhase?.title,
        phaseBiome: standingPhase?.biome,
        phaseColor: standingPhase?.color,
        phaseCount: standing.phaseCount,
        isComplete: standing.isComplete,
      }
    : null;

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
      username,
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
    const normalizedUsername = sponsoredSignup
      ? null
      : normalizeUsername(username);
    if (!sponsoredSignup && isReservedSponsoredUsername(normalizedUsername)) {
      const error = new Error("This username is reserved.");
      error.code = "auth/invalid-credential";
      throw error;
    }
    const authEmail = sponsoredSignup
      ? email
      : usernameToAuthEmail(normalizedUsername);
    const profileBase = {
      name,
      ...(sponsoredSignup ? { email } : { username: normalizedUsername }),
      profileInterview,
      onboardingCompleted: true,
      scamsCaught: 0,
      badges: [],
      completedLessons: [],
      trialStartedAt: null,
      subscriptionStatus: "expired",
      plan: null,
    };
    const operation = beginPartnerOperation(authEmail);
    let sponsoredAccountCreated = false;
    let failureHandled = false;
    try {
      if (sponsoredSignup) setPartnerStatus("claiming");
      const cred = await createUserWithEmailAndPassword(
        auth,
        authEmail,
        password,
      );
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
            storePartnerClaimRecovery({
              storage: window.sessionStorage,
              now: Date.now(),
              uid: cred.user.uid,
              inviteToken,
              partner: {
                name: signupPartner.name,
                ...(signupPartner.logoPath
                  ? { logoPath: signupPartner.logoPath }
                  : {}),
              },
              profileBase,
              research: researchSnapshot,
            });
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

      clearPartnerClaimRecovery({
        storage: window.sessionStorage,
        expectedUid,
      });

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
      if (!strictPartnerOperationIsCurrent(operation)) {
        finishPartnerOperation(operation);
        return;
      }
      if (!isDefinitivePartnerClaimRejection(error)) {
        updatePartnerRecovery({ ...recovery, busy: false });
        finishPartnerOperation(operation);
        return;
      }

      const nextStatus = statusForPartnerError(error);
      clearPartnerClaimRecovery({
        storage: window.sessionStorage,
        expectedUid,
      });
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

  const retryAuthenticatedBootstrap = () => {
    const recovery = partnerRecoveryRef.current;
    if (recovery?.kind !== "authenticated-bootstrap" || recovery.busy) return;
    updatePartnerRecovery({ ...recovery, busy: true });
    setAuthChecked(false);
    setAuthBootstrapAttempt((current) => current + 1);
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
      const authoritativeAccess = await fetchAuthoritativePartnerAccess(
        recovery.user,
      );
      if (!strictPartnerOperationIsCurrent(operation)) {
        finishPartnerOperation(operation);
        return;
      }
      await setDoc(doc(db, "users", expectedUid), recovery.profile);
      if (!strictPartnerOperationIsCurrent(operation)) {
        finishPartnerOperation(operation);
        return;
      }
      finishPartnerOperation(operation);
      setUser(recovery.user);
      setProfile(recovery.profile);
      updatePartnerRecovery(null);
      if (
        authoritativeAccess.status === "active" ||
        authoritativeAccess.status === "suspended"
      ) {
        setPartnerOwnerUid(expectedUid);
        setPartner(
          authoritativeAccess.branding || { name: authoritativeAccess.name },
        );
        setPartnerStatus(authoritativeAccess.status);
        setScreen(
          authoritativeAccess.status === "active"
            ? "personal-plan"
            : "partner-error",
        );
      } else {
        clearAuthoritativePartner();
        setScreen("home");
      }
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
    const authEmail = completion.user.email || "";
    const authoritativeUsername = completion.entitlement.username;
    const username = authoritativeUsername || authEmailToUsername(authEmail);
    const usesUsername = Boolean(authoritativeUsername) || username !== authEmail;
    const initial = {
      name,
      ...(usesUsername
        ? { username }
        : { email: authEmail || interview.email || "" }),
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

  const logIn = async (identifier, password) => {
    try {
      const authEmail = isReservedSponsoredUsername(identifier)
        ? (await resolveProvisionedLogin({ username: identifier })).authEmail
        : loginIdentifierToAuthEmail(identifier);
      await signInWithEmailAndPassword(auth, authEmail, password);
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
      authoritativeAccessVersionRef.current += 1;
      backgroundAccessRefreshRef.current = null;
      billingPollIdRef.current += 1;
      currentAuthUidRef.current = null;
      pendingProtectedNavigationRef.current = null;
      clearStoredBillingReturnIntent();
      setUser(null);
      setProfile(null);
      setBillingOwnerUid(null);
      setBillingStatus("unavailable");
      setBillingAccess(null);
      setBillingPlans([]);
      setBillingBusy(false);
      setBillingRecovery(null);
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

  const refreshAuthoritativePartnerAccess = async ({
    routeCurrent = true,
    acceptResult = null,
    coalesceBackground = false,
  } = {}) => {
    const refreshUser = user;
    if (!refreshUser?.uid) return null;
    const generation = authGenerationRef.current;
    if (coalesceBackground) {
      const key = `${generation}:${refreshUser.uid}`;
      const existing = backgroundAccessRefreshRef.current;
      if (existing?.key === key) return existing.promise;
      const promise = refreshAuthoritativePartnerAccess({
        routeCurrent,
        acceptResult,
      });
      const accessVersion = authoritativeAccessVersionRef.current;
      backgroundAccessRefreshRef.current = { key, promise, accessVersion };
      void promise.finally(() => {
        if (backgroundAccessRefreshRef.current?.promise === promise) {
          backgroundAccessRefreshRef.current = null;
        }
      });
      return promise;
    }
    const accessVersion = authoritativeAccessVersionRef.current + 1;
    authoritativeAccessVersionRef.current = accessVersion;
    authoritativeAccessRefreshInFlightRef.current = accessVersion;
    const isIdentityCurrent = () => {
      if (
        !appMountedRef.current ||
        accessVersion !== authoritativeAccessVersionRef.current ||
        generation !== authGenerationRef.current ||
        currentAuthUidRef.current !== refreshUser.uid
      ) {
        return false;
      }
      return true;
    };
    const isCurrent = () => {
      if (!isIdentityCurrent()) return false;
      if (acceptResult === null) return true;
      try {
        return acceptResult() === true;
      } catch {
        return false;
      }
    };
    try {
    let authoritativeAccess;
    try {
      authoritativeAccess = await fetchAuthoritativePartnerAccess(refreshUser);
    } catch {
      if (!isCurrent()) return null;
      const mirroredPartner =
        partnerOwnerUid === refreshUser.uid &&
        (partnerStatus === "active" ||
          profile?.accessSource === "partner" ||
          typeof profile?.partnerId === "string");
      if (mirroredPartner) {
        setPartnerStatus("unavailable");
        updatePartnerRecovery({
          kind: "returning-access",
          user: refreshUser,
          profile,
          busy: false,
        });
        setScreen("partner-error");
        return null;
      }
      authoritativeAccess = { status: "none" };
    }
    if (!isCurrent()) return null;
    if (!authoritativeAccess || typeof authoritativeAccess.status !== "string") {
      authoritativeAccess = { status: "none" };
    }

    let nextBillingStatus = "unavailable";
    let nextBillingAccess = null;
    let billingUnavailable = false;
    const billingWasPreviouslyFull = billingHadFullAccessRef.current;

    if (authoritativeAccess.status === "active") {
      if (!isCurrent()) return null;
      setPartnerOwnerUid(refreshUser.uid);
      setPartner(
        authoritativeAccess.branding || { name: authoritativeAccess.name },
      );
      setPartnerStatus("active");
      updatePartnerRecovery(null);
    } else {
      if (!isCurrent()) return null;
      if (authoritativeAccess.status === "suspended") {
        setPartnerOwnerUid(refreshUser.uid);
        setPartner(
          authoritativeAccess.branding || { name: authoritativeAccess.name },
        );
        setPartnerStatus("suspended");
      } else {
        clearAuthoritativePartner();
      }
      updatePartnerRecovery(null);
      if (platform === "web") {
        if (!isCurrent()) return null;
        setBillingBusy(true);
        try {
          const [plansResult, accessResult] = await Promise.all([
            fetchBillingPlans(refreshUser),
            fetchBillingAccess(refreshUser),
          ]);
          nextBillingAccess = accessResult;
          nextBillingStatus = nextBillingAccess.status;
          const currentPlans = nextBillingStatus === "unavailable"
            ? []
            : plansResult.plans;
          if (!isIdentityCurrent()) return null;
          if (!isCurrent()) {
            if (nextBillingAccess.access !== "full") {
              setBillingOwnerUid(refreshUser.uid);
              setBillingAccess(nextBillingAccess);
              setBillingStatus(nextBillingStatus);
              setBillingPlans(currentPlans);
            }
            return null;
          }
          setBillingOwnerUid(refreshUser.uid);
          setBillingAccess(nextBillingAccess);
          setBillingStatus(nextBillingStatus);
          setBillingPlans(currentPlans);
          if (nextBillingAccess.access === "full") {
            billingHadFullAccessRef.current = true;
          }
          if (nextBillingStatus === "unavailable") {
            billingUnavailable = true;
            setBillingRecovery({ kind: "temporary" });
          } else {
            setBillingRecovery(null);
          }
        } catch {
          if (!isCurrent()) return null;
          billingUnavailable = true;
          if (!isCurrent()) return null;
          setBillingOwnerUid(refreshUser.uid);
          setBillingAccess(null);
          setBillingStatus("unavailable");
          setBillingPlans([]);
          setBillingRecovery({ kind: "temporary" });
        } finally {
          // Always clear the busy flag, even when superseded: leaving it
          // true when isCurrent() is false permanently deadlocks the Retry
          // button, since the retry handler refuses to fire while busy.
          if (appMountedRef.current) setBillingBusy(false);
        }
      }
    }

    if (!isCurrent()) return null;
    const currentAccess = resolveFullAccess({
      sponsoredStatus:
        authoritativeAccess.status === "active" ? "active" : "none",
      billingStatus: nextBillingStatus,
      nativeSubscriptionStatus,
      platform,
      developmentBypass: subscriptionBypassEnabled,
    });
    const currentProtectedContent = protectedContentStateRef.current;
    const exitProtectedContent = shouldExitProtectedContent({
      screen: currentProtectedContent.screen,
      itemId: currentProtectedContent.itemId,
      fullAccess: currentAccess,
    });
    if (!isCurrent()) return null;
    if (routeCurrent && exitProtectedContent) {
      if (billingUnavailable && billingWasPreviouslyFull) {
        setScreen("billing-error");
      } else if (authoritativeAccess.status === "suspended") {
        setScreen("partner-error");
      } else {
        setPaywallVariant("subscribe");
        setScreen("paywall");
      }
    }
    return {
      partnerStatus: authoritativeAccess.status,
      billingStatus: nextBillingStatus,
      billingAccess: nextBillingAccess,
      billingUnavailable,
      billingWasPreviouslyFull,
      fullAccess: currentAccess,
    };
    } finally {
      if (authoritativeAccessRefreshInFlightRef.current === accessVersion) {
        authoritativeAccessRefreshInFlightRef.current = null;
      }
    }
  };
  refreshAuthoritativePartnerAccessRef.current =
    refreshAuthoritativePartnerAccess;

  useEffect(() => {
    if (!authChecked || !user?.uid || !profile) return undefined;
    const refreshKey = `${authGenerationRef.current}:${user.uid}`;
    const refresh = () => {
      void refreshAuthoritativePartnerAccessRef.current?.({
        coalesceBackground: true,
      });
    };
    const resume = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", resume);
    const intervalId = window.setInterval(
      refresh,
      PARTNER_ACCESS_REFRESH_INTERVAL_MS,
    );
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", resume);
      window.clearInterval(intervalId);
      const pendingRefresh = backgroundAccessRefreshRef.current;
      if (pendingRefresh?.key === refreshKey) {
        if (
          pendingRefresh.accessVersion === authoritativeAccessVersionRef.current
        ) {
          authoritativeAccessVersionRef.current += 1;
        }
        backgroundAccessRefreshRef.current = null;
      }
    };
  }, [authChecked, platform, profile, sponsoredActive, user?.uid]);

  const clearPendingProtectedNavigation = () => {
    pendingProtectedNavigationRef.current = null;
    clearStoredBillingReturnIntent();
  };

  const revalidatePendingProtectedNavigationForRetry = () => {
    const uid = user?.uid;
    const generation = authGenerationRef.current;
    const now = Date.now();
    const pending = pendingProtectedNavigationRef.current;
    let storedSerialized = null;
    let storageReadable = true;
    try {
      storedSerialized = window.sessionStorage.getItem(
        BILLING_RETURN_INTENT_STORAGE_KEY,
      );
    } catch {
      storageReadable = false;
    }
    const storedIntent = uid ? readBillingReturnIntent(uid) : null;
    const storedDestination = resolveBillingReturnDestination(storedIntent);
    const pendingDestination = resolveBillingReturnDestination(pending);
    const pendingIsValid =
      !pending ||
      (Boolean(uid) &&
        pending.uid === uid &&
        pending.generation === generation &&
        Number.isSafeInteger(pending.createdAt) &&
        Number.isSafeInteger(pending.expiresAt) &&
        pending.expiresAt ===
          pending.createdAt + BILLING_RETURN_INTENT_TTL_MS &&
        pending.createdAt <= now &&
        pending.createdAt >= now - BILLING_RETURN_INTENT_TTL_MS &&
        pending.expiresAt > now &&
        Boolean(pendingDestination) &&
        (pending.screen === "lesson"
          ? pending.index === pendingDestination.index
          : pending.item?.id === pendingDestination.item?.id));
    const storedIsValid =
      storageReadable &&
      (storedSerialized === null ||
        (Boolean(storedIntent) && Boolean(storedDestination)));
    const sourcesAgree =
      !pending ||
      !storedIntent ||
      (pending.uid === storedIntent.uid &&
        pending.screen === storedIntent.screen &&
        pending.itemId === storedIntent.itemId &&
        pending.createdAt === storedIntent.createdAt &&
        pending.expiresAt === storedIntent.expiresAt);
    if (!uid || !pendingIsValid || !storedIsValid || !sourcesAgree) {
      clearPendingProtectedNavigation();
    }
  };

  useEffect(() => {
    if (!billingReturn || !authChecked || !authSettledRef.current) {
      return undefined;
    }
    if (!user?.uid || !profile) return undefined;

    if (billingReturn === "cancel") {
      clearPendingProtectedNavigation();
      setBillingRecovery({
        kind: "cancel",
        message: "Checkout was canceled. Your access has not changed.",
      });
      setPaywallVariant("subscribe");
      setScreen("paywall");
      setBillingReturn(null);
      return undefined;
    }

    if (sponsoredActive) {
      clearPendingProtectedNavigation();
      setBillingRecovery(null);
      setBillingReturn(null);
      setScreen("home");
      return undefined;
    }
    if (platform !== "web") {
      clearPendingProtectedNavigation();
      setBillingRecovery({ kind: "temporary" });
      setScreen("billing-error");
      setBillingReturn(null);
      return undefined;
    }

    const uid = user.uid;
    const generation = authGenerationRef.current;
    const pollId = billingPollIdRef.current + 1;
    billingPollIdRef.current = pollId;
    billingReturnOwnerUidRef.current = uid;
    const monotonicNow = captureMonotonicNow();
    const startedAt = monotonicNow?.() ?? null;
    const deadlineAt = Number.isFinite(startedAt)
      ? startedAt + BILLING_CONFIRMATION_DEADLINE_MS
      : null;
    let lastObservedAt = startedAt;
    let monotonicInvalid = !Number.isFinite(startedAt);
    let cancelled = false;
    let timedOut = false;
    let deadlineTimerId = null;
    const delayTimerIds = new Set();
    const pollIdentityCurrent = () =>
      !cancelled &&
      !timedOut &&
      pollId === billingPollIdRef.current &&
      generation === authGenerationRef.current &&
      currentAuthUidRef.current === uid;
    const readMonotonicNow = () => {
      if (monotonicInvalid) return null;
      const value = monotonicNow?.() ?? null;
      if (
        !Number.isFinite(value) ||
        !Number.isFinite(lastObservedAt) ||
        value < lastObservedAt
      ) {
        monotonicInvalid = true;
        return null;
      }
      lastObservedAt = value;
      return value;
    };
    const pollAcceptsResult = () => {
      if (!pollIdentityCurrent() || !Number.isFinite(deadlineAt)) return false;
      const value = readMonotonicNow();
      return value !== null && value < deadlineAt;
    };
    const deadlineReached = Symbol("billing-confirmation-deadline");
    const deadlinePromise = new Promise((resolve) => {
      deadlineTimerId = window.setTimeout(
        () => resolve(deadlineReached),
        Number.isFinite(deadlineAt) ? BILLING_CONFIRMATION_DEADLINE_MS : 0,
      );
    });
    const raceDeadline = (promise) =>
      Promise.race([
        Promise.resolve(promise).then(
          (value) => ({ settled: true, value }),
          () => ({ settled: false, value: null }),
        ),
        deadlinePromise,
      ]);
    const wait = (delay) => {
      let timerId = null;
      const promise = new Promise((resolve) => {
        timerId = window.setTimeout(() => {
          delayTimerIds.delete(timerId);
          resolve();
        }, delay);
        delayTimerIds.add(timerId);
      });
      return raceDeadline(promise).finally(() => {
        if (timerId !== null && delayTimerIds.delete(timerId)) {
          window.clearTimeout(timerId);
        }
      });
    };
    const clearPollTimers = () => {
      if (deadlineTimerId !== null) window.clearTimeout(deadlineTimerId);
      deadlineTimerId = null;
      for (const timerId of delayTimerIds) window.clearTimeout(timerId);
      delayTimerIds.clear();
    };
    const transitionToTimeout = (latestAccess) => {
      if (!pollIdentityCurrent()) return;
      billingPollIdRef.current += 1;
      timedOut = true;
      clearPollTimers();
      authoritativeAccessVersionRef.current += 1;
      setBillingBusy(false);
      setBillingRecovery({
        kind: "confirmation",
        phase: "timeout",
        canManage: latestAccess?.canManage === true,
      });
    };
    const openPendingOrHome = (latestAccess) => {
      if (!pollAcceptsResult()) {
        transitionToTimeout(latestAccess);
        return false;
      }
      let pending = pendingProtectedNavigationRef.current;
      if (pending) {
        const now = Date.now();
        const validPendingIntent =
          pending.uid === uid &&
          pending.generation === generation &&
          Number.isSafeInteger(pending.createdAt) &&
          Number.isSafeInteger(pending.expiresAt) &&
          pending.expiresAt ===
            pending.createdAt + BILLING_RETURN_INTENT_TTL_MS &&
          pending.createdAt <= now &&
          pending.createdAt >= now - BILLING_RETURN_INTENT_TTL_MS &&
          pending.expiresAt > now;
        if (!validPendingIntent) {
          clearPendingProtectedNavigation();
          pending = null;
        }
      }
      if (!pending) {
        const storedIntent = readBillingReturnIntent(uid);
        pending = resolveBillingReturnDestination(storedIntent);
        if (storedIntent && !pending) clearStoredBillingReturnIntent();
      }
      if (pending && (pending.uid || pending.generation)) {
        if (pending.uid !== uid || pending.generation !== generation) {
          clearPendingProtectedNavigation();
          setScreen("home");
          return true;
        }
      }
      if (!pending) {
        clearStoredBillingReturnIntent();
        setScreen("home");
        return true;
      }
      clearPendingProtectedNavigation();
      if (pending.screen === "lesson") {
        setActiveExam(null);
        setActiveChallenge(null);
        setActiveIndex(pending.index);
      } else if (pending.screen === "challenge") {
        setActiveExam(null);
        setActiveChallenge(pending.item);
      } else if (pending.screen === "exam") {
        setActiveChallenge(null);
        setActiveExam(pending.item);
      }
      setScreen(pending.screen);
      return true;
    };

    setBillingRecovery({ kind: "confirmation", phase: "checking" });
    setScreen("billing-confirmation");
    void (async () => {
      let latestAccess = null;
      for (const offset of BILLING_CONFIRMATION_OFFSETS_MS) {
        if (!pollIdentityCurrent() || !Number.isFinite(deadlineAt)) {
          transitionToTimeout(latestAccess);
          return;
        }
        const beforeTarget = readMonotonicNow();
        if (beforeTarget === null || beforeTarget >= deadlineAt) {
          transitionToTimeout(latestAccess);
          return;
        }
        const remaining = Math.max(0, startedAt + offset - beforeTarget);
        if (remaining > 0) {
          const delayed = await wait(remaining);
          if (delayed === deadlineReached || !pollAcceptsResult()) {
            transitionToTimeout(latestAccess);
            return;
          }
        }
        if (!pollAcceptsResult()) {
          transitionToTimeout(latestAccess);
          return;
        }
        const outcome = await raceDeadline(
          refreshAuthoritativePartnerAccessRef.current?.({
            routeCurrent: false,
            acceptResult: pollAcceptsResult,
          }),
        );
        if (outcome === deadlineReached || !pollAcceptsResult()) {
          transitionToTimeout(latestAccess);
          return;
        }
        const refreshed = outcome.settled ? outcome.value : null;
        latestAccess = refreshed?.billingAccess || latestAccess;
        if (refreshed?.fullAccess) {
          if (!pollAcceptsResult()) {
            transitionToTimeout(latestAccess);
            return;
          }
          if (!openPendingOrHome(latestAccess)) return;
          clearPollTimers();
          setBillingRecovery(null);
          setBillingReturn(null);
          billingReturnOwnerUidRef.current = null;
          return;
        }
      }
      const deadline = await deadlinePromise;
      if (deadline === deadlineReached) transitionToTimeout(latestAccess);
    })();

    return () => {
      cancelled = true;
      clearPollTimers();
    };
  }, [
    authChecked,
    authSettledVersion,
    billingPollAttempt,
    billingReturn,
    platform,
    profile,
    sponsoredActive,
    user?.uid,
  ]);

  const rememberPendingProtectedNavigation = (pending) => {
    if (!user?.uid) return;
    const createdAt = Date.now();
    storeBillingReturnIntent({
      uid: user.uid,
      screen: pending.screen,
      itemId: pending.itemId,
      createdAt,
    });
    pendingProtectedNavigationRef.current = {
      ...pending,
      uid: user.uid,
      generation: authGenerationRef.current,
      createdAt,
      expiresAt: createdAt + BILLING_RETURN_INTENT_TTL_MS,
    };
  };

  const routeDeniedProtectedEntry = (pending, refreshed) => {
    rememberPendingProtectedNavigation(pending);
    if (refreshed?.partnerStatus === "suspended") {
      setScreen("partner-error");
    } else if (
      refreshed?.billingUnavailable &&
      refreshed?.billingWasPreviouslyFull
    ) {
      setScreen("billing-error");
    } else {
      setPaywallVariant("subscribe");
      setScreen("paywall");
    }
  };

  const startLesson = async (index) => {
    const lesson = lessonsByOrder[index];
    let currentAccess = access;
    const requiresFullAccess = !canOpenLesson({
      lessonId: lesson?.id,
      fullAccess: false,
    });
    if ((requiresFullAccess || sponsoredActive) && user?.uid) {
      const refreshed = await refreshAuthoritativePartnerAccess({
        routeCurrent: false,
      });
      if (!refreshed) return;
      currentAccess = refreshed.fullAccess;
      if (!currentAccess && requiresFullAccess) {
        routeDeniedProtectedEntry({
          screen: "lesson",
          itemId: lesson?.id,
          index,
        }, refreshed);
        return;
      }
    }
    if (
      !canOpenLesson({
        lessonId: lesson?.id,
        fullAccess: currentAccess,
      })
    ) {
      routeDeniedProtectedEntry(
        { screen: "lesson", itemId: lesson?.id, index },
        {
          partnerStatus,
          billingUnavailable: ownedBillingStatus === "unavailable",
        });
      return;
    }
    setActiveExam(null);
    setActiveChallenge(null);
    setActiveIndex(index);
    setScreen("lesson");
  };

  const startChallenge = async (challenge) => {
    let currentAccess = access;
    if (user?.uid) {
      const refreshed = await refreshAuthoritativePartnerAccess({
        routeCurrent: false,
      });
      if (!refreshed) return;
      currentAccess = refreshed.fullAccess;
      if (!currentAccess) {
        routeDeniedProtectedEntry(
          { screen: "challenge", itemId: challenge.id, item: challenge },
          refreshed,
        );
        return;
      }
    }
    if (!currentAccess) {
      routeDeniedProtectedEntry(
        { screen: "challenge", itemId: challenge.id, item: challenge },
        { partnerStatus, billingUnavailable: ownedBillingStatus === "unavailable" },
      );
      return;
    }
    setActiveExam(null);
    setActiveChallenge(challenge);
    setScreen("challenge");
  };

  const startExam = async (exam) => {
    let currentAccess = access;
    if (user?.uid) {
      const refreshed = await refreshAuthoritativePartnerAccess({
        routeCurrent: false,
      });
      if (!refreshed) return;
      currentAccess = refreshed.fullAccess;
      if (!currentAccess) {
        routeDeniedProtectedEntry(
          { screen: "exam", itemId: exam.id, item: exam },
          refreshed,
        );
        return;
      }
    }
    if (!currentAccess) {
      routeDeniedProtectedEntry(
        { screen: "exam", itemId: exam.id, item: exam },
        { partnerStatus, billingUnavailable: ownedBillingStatus === "unavailable" },
      );
      return;
    }
    setActiveChallenge(null);
    setActiveExam(exam);
    setScreen("exam");
  };

  const startFreeTrial = async (plan = "annual") => {
    if (platform === "web") {
      if (!user?.uid || currentAuthUidRef.current !== user.uid) {
        throw new Error("Please sign in again to continue.");
      }
      if (
        billingOwnerUid !== user.uid ||
        ownedBillingStatus === "unavailable" ||
        !ownedBillingAccess ||
        billingBusy ||
        billingPlans.length === 0 ||
        billingRecovery?.kind === "temporary"
      ) {
        throw new Error("Checkout is not available right now.");
      }
      const uid = user.uid;
      const generation = authGenerationRef.current;
      // A leftover "Checkout was canceled" notice from a previous attempt
      // should not sit above the paywall while a new checkout is starting.
      setBillingRecovery((current) =>
        current?.kind === "cancel" ? null : current,
      );
      setBillingBusy(true);
      try {
        const checkout = await createBillingCheckout(user, plan);
        if (
          generation !== authGenerationRef.current ||
          currentAuthUidRef.current !== uid ||
          !isValidatedHostedUrl(checkout?.url, "checkout.stripe.com")
        ) {
          throw new Error("Checkout is not available right now.");
        }
        globalThis.location.assign(checkout.url);
      } finally {
        if (
          generation === authGenerationRef.current &&
          currentAuthUidRef.current === uid
        ) {
          setBillingBusy(false);
        }
      }
      return;
    }
    const entitlement = await purchaseSubscription(plan);
    if (!entitlement.active) {
      throw new Error("The subscription is not active yet.");
    }
    if (user?.uid && currentAuthUidRef.current === user.uid) {
      setNativeEntitlement({
        uid: user.uid,
        subscriptionStatus: "active",
      });
    }
    await updateSubscription({
      subscriptionStatus: "active",
      trialStartedAt: null,
      plan: planForProduct(entitlement.productId) || plan,
    });
    goHome();
  };

  const manageBilling = async () => {
    if (platform !== "web") {
      window.open("https://apps.apple.com/account/subscriptions", "_blank");
      return;
    }
    if (!user?.uid || currentAuthUidRef.current !== user.uid) {
      throw new Error("Please sign in again to continue.");
    }
    const uid = user.uid;
    const generation = authGenerationRef.current;
    setBillingBusy(true);
    try {
      const portal = await createBillingPortal(user);
      if (
        generation !== authGenerationRef.current ||
        currentAuthUidRef.current !== uid ||
        !isValidatedHostedUrl(portal?.url, "billing.stripe.com")
      ) {
        throw new Error("Billing management is not available right now.");
      }
      globalThis.location.assign(portal.url);
    } finally {
      if (
        generation === authGenerationRef.current &&
        currentAuthUidRef.current === uid
      ) {
        setBillingBusy(false);
      }
    }
  };

  const restorePurchase = async () => {
    const entitlement = await restoreSubscriptions();
    if (!entitlement.active) {
      throw new Error("No active subscription was found for this Apple Account.");
    }
    if (user?.uid && currentAuthUidRef.current === user.uid) {
      setNativeEntitlement({
        uid: user.uid,
        subscriptionStatus: "active",
      });
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
    authoritativeAccessVersionRef.current += 1;
    backgroundAccessRefreshRef.current = null;
    billingPollIdRef.current += 1;
    markAuthSettled();
    currentAuthUidRef.current = null;
    pendingProtectedNavigationRef.current = null;
    clearStoredBillingReturnIntent();
    setUser(null);
    setProfile(null);
    setBillingOwnerUid(null);
    setBillingStatus("unavailable");
    setBillingAccess(null);
    setBillingPlans([]);
    setBillingBusy(false);
    setBillingRecovery(null);
    setNativeEntitlement({ uid: null, subscriptionStatus: "expired" });
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
        // Stop billing BEFORE anything is destroyed. Deleting the Firebase
        // user first would leave a live Stripe subscription charging a card
        // whose owner no longer has an account to cancel from, and the call
        // needs a valid token anyway. If this fails, abort the deletion
        // rather than risk silently charging someone forever.
        if (platform === "web") {
          try {
            await cancelBillingSubscription(expectedUser);
          } catch {
            throw new SubscriptionCancellationFailedError();
          }
          requireCurrentAccountDeletion(operation);
        }
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
        if (err instanceof SubscriptionCancellationFailedError) throw err;
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
      clearPartnerClaimRecovery({
        storage: window.sessionStorage,
        expectedUid,
      });
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
    clearPartnerClaimRecovery({
      storage: window.sessionStorage,
      expectedUid,
    });
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

  if (partnerRecovery?.kind === "authenticated-bootstrap") {
    return (
      <AppShell screen="partner-error" isAuthenticated={Boolean(user)}>
        <PartnerAccessError
          code={
            partnerRecovery.phase === "profile"
              ? "ACCOUNT_PROFILE_UNAVAILABLE"
              : "PARTNER_ACCESS_UNCONFIRMED"
          }
          onRetry={retryAuthenticatedBootstrap}
          retryLabel={partnerRecovery.busy ? "Retrying…" : "Retry"}
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
          onLogOut={logOut}
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

  const authenticatedSuspension = Boolean(
    partnerStatus === "suspended" &&
      user?.uid &&
      partnerOwnerUid === user.uid,
  );
  if (
    ["invalid", "full", "unavailable"].includes(partnerStatus) ||
    (partnerStatus === "suspended" &&
      (!authenticatedSuspension || (screen === "partner-error" && !access)))
  ) {
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
          existingAccount={Boolean(profileCompletion)}
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
          billing={settingsBilling}
          onBack={accountDeletionBusy ? undefined : goHome}
          onLogOut={logOut}
          onOpenPaywall={goPaywall}
          onManageSubscription={manageBilling}
          onRetryBilling={() => {
            setBillingRecovery(null);
            setBillingRefreshAttempt((attempt) => attempt + 1);
          }}
          onResetPassword={profile?.email ? resetPassword : undefined}
          onDeleteAccount={deleteAccount}
          textSize={textSize}
          onTextSizeChange={setTextSize}
        />
      );
      break;
    case "paywall":
      content = (
        <>
          {billingRecovery?.kind === "cancel" ? (
            <p
              role="status"
              className="mx-auto w-full max-w-3xl px-6 pt-4 text-center text-sm text-slate-700"
            >
              {billingRecovery.message}
            </p>
          ) : null}
          <Paywall
            key={`paywall-${paywallVariant}`}
            variant={paywallVariant}
            textSize={textSize}
            lessonsCompleted={lessonsCompletedCount}
            badgesEarned={badgesEarnedCount}
            onStartTrial={startFreeTrial}
            onRestore={restorePurchase}
            storeProducts={storeProducts}
            purchasesAvailable={platform === "native"}
            platform={platform}
            sponsored={sponsoredActive}
            billingAvailable={
              platform === "web" &&
              ownedBillingStatus !== "unavailable" &&
              Boolean(ownedBillingAccess) &&
              // Deliberately not gated on billingBusy: work in progress is not
              // the same as unavailable. Including it meant that pressing
              // "Start free trial" — which sets billingBusy while the Checkout
              // Session is created — replaced the whole paywall with the
              // "Subscription options are temporarily unavailable" screen for
              // the moment before Stripe loaded. Paywall already receives
              // billingBusy separately to disable controls and show progress.
              billingPlans.length > 0 &&
              billingRecovery?.kind !== "temporary"
            }
            billingPlans={billingPlans}
            billingStatus={ownedBillingStatus}
            billingAccess={billingAccess}
            billingBusy={billingBusy}
            billingMessage={billingRecovery?.message || ""}
            onRetry={() => {
              setBillingRecovery(null);
              setBillingRefreshAttempt((attempt) => attempt + 1);
            }}
            onStartLearning={() => {
              clearPendingProtectedNavigation();
              setBillingRecovery(null);
              goHome();
            }}
            onMaybeLater={() => {
              clearPendingProtectedNavigation();
              setBillingRecovery(null);
              goHome();
            }}
          />
        </>
      );
      break;
    case "billing-confirmation":
      content = (
        <BillingConfirmation
          phase={billingRecovery?.phase || "checking"}
          onRetry={billingRecovery?.phase === "timeout"
            ? () => {
                revalidatePendingProtectedNavigationForRetry();
                setBillingPollAttempt((attempt) => attempt + 1);
              }
            : undefined}
          onManageBilling={
            billingRecovery?.phase === "timeout" &&
            (billingRecovery.canManage || billingAccess?.canManage)
              ? () => {
                  void manageBilling().catch(() => {
                    setBillingRecovery((current) => ({
                      ...current,
                      kind: "confirmation",
                      phase: "timeout",
                    }));
                  });
                }
              : undefined
          }
          onBack={() => {
            billingPollIdRef.current += 1;
            clearPendingProtectedNavigation();
            setBillingReturn(null);
            setBillingRecovery(null);
            goHome();
          }}
        />
      );
      break;
    case "billing-error":
      content = (
        <BillingAccessError
          kind={ownedBillingStatus === "unavailable" ? "temporary" : "inactive"}
          onRetry={() => {
            setBillingReturn("success");
            setBillingPollAttempt((attempt) => attempt + 1);
          }}
          onBack={() => {
            clearPendingProtectedNavigation();
            setBillingRecovery(null);
            goHome();
          }}
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
      courseProgress={courseProgress}
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
