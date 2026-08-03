import { hasFullAccess } from "./subscription.js";

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
