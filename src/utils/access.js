import { hasFullAccess } from "./subscription.js";

// Only the very first lesson is free. Everything after it requires an active
// subscription (or sponsored access).
const PUBLIC_FREE_LESSON_IDS = new Set(["welcome"]);

export function resolveFullAccess({
  sponsoredStatus,
  billingStatus,
  nativeSubscriptionStatus,
  platform,
  developmentBypass = false,
}) {
  if (sponsoredStatus === "active" || developmentBypass === true) return true;
  if (platform === "web") {
    return billingStatus === "trialing" || billingStatus === "active";
  }
  if (platform === "native") return hasFullAccess(nativeSubscriptionStatus);
  return false;
}

export function shouldShowSubscriptionControls({ sponsoredStatus, platform }) {
  return platform === "web" && sponsoredStatus !== "active";
}

// `completed` is deliberately NOT an unlock condition for paid content.
// completedLessons lives in the learner's own Firestore document, which the
// security rules let them write, so treating "completed" as an entitlement let
// anyone grant themselves the whole course by adding lesson ids to their
// profile. Paid lessons now always require live entitlement.
export function canOpenLesson({ lessonId, fullAccess }) {
  if (PUBLIC_FREE_LESSON_IDS.has(lessonId)) return true;
  return Boolean(fullAccess);
}

export function shouldExitProtectedContent({
  screen,
  itemId,
  fullAccess,
}) {
  if (!itemId) return false;
  if (screen === "lesson") {
    return !canOpenLesson({ lessonId: itemId, fullAccess });
  }
  // Challenges and exams are always paid content. As with lessons, a
  // self-reported completion must not stand in for live entitlement.
  if (screen === "challenge" || screen === "exam") {
    return !fullAccess;
  }
  return false;
}
