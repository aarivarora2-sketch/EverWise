import { hasFullAccess } from "./subscription.js";

const PUBLIC_FREE_LESSON_IDS = new Set(["welcome", "internet"]);

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

export function canOpenLesson({ lessonId, completed, fullAccess }) {
  return Boolean(
    fullAccess || completed || PUBLIC_FREE_LESSON_IDS.has(lessonId),
  );
}

export function shouldExitProtectedContent({
  screen,
  itemId,
  completedIds,
  fullAccess,
}) {
  if (!itemId) return false;
  const completed = completedIds.includes(itemId);
  if (screen === "lesson") {
    return !canOpenLesson({ lessonId: itemId, completed, fullAccess });
  }
  if (screen === "challenge" || screen === "exam") {
    return !completed && !fullAccess;
  }
  return false;
}
