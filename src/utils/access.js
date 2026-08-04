import { hasFullAccess } from "./subscription.js";

const PUBLIC_FREE_LESSON_IDS = new Set(["welcome", "internet"]);

export function resolveFullAccess({
  sponsoredStatus,
  subscriptionStatus,
  developmentBypass = false,
}) {
  return (
    sponsoredStatus === "active" ||
    developmentBypass ||
    hasFullAccess(subscriptionStatus)
  );
}

export function shouldShowSubscriptionControls({ sponsoredStatus }) {
  return sponsoredStatus !== "active";
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
