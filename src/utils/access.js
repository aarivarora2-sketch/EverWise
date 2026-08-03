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
