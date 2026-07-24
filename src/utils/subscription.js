export const TRIAL_DAYS = 3;
const TRIAL_MS = TRIAL_DAYS * 24 * 60 * 60 * 1000;

/** Convert Firestore Timestamp / Date / string / number → Date, or null. */
export function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isTrialExpired(trialStartedAt, now = new Date()) {
  const start = toDate(trialStartedAt);
  if (!start) return false;
  return now.getTime() - start.getTime() > TRIAL_MS;
}

/** Whole days remaining in the trial (0 when expired or missing). */
export function trialDaysLeft(trialStartedAt, now = new Date()) {
  const start = toDate(trialStartedAt);
  if (!start) return 0;
  const remaining = start.getTime() + TRIAL_MS - now.getTime();
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / (24 * 60 * 60 * 1000));
}

export function hasFullAccess(subscriptionStatus) {
  return subscriptionStatus === "trial" || subscriptionStatus === "active";
}

export function statusLabel(subscriptionStatus) {
  switch (subscriptionStatus) {
    case "trial":
      return "Free trial";
    case "active":
      return "Active";
    case "expired":
      return "Expired";
    default:
      return "Unknown";
  }
}
