import React from "react";
import { AlertCircle } from "lucide-react";

const SUPPORT_EMAIL = "everwisedigitalliteracy@gmail.com";

function messageFor(code, partnerName) {
  const name = partnerName?.trim() || "the organization that shared this link";
  if (code === "INVALID_INVITE") {
    return "This access link is not available. Ask the volunteer or organization that shared it for a new link.";
  }
  if (code === "PARTNER_FULL") {
    return `All sponsored places are currently in use. Please contact ${name} for help.`;
  }
  if (code === "PARTNER_SUSPENDED") {
    return `Sponsored access from ${name} is temporarily unavailable. Please contact ${name} for help.`;
  }
  if (code === "PARTNER_ACCESS_UNCONFIRMED") {
    return "We cannot confirm your sponsored access right now. Your account and progress are safe. Please try again or log out.";
  }
  if (code === "PARTNER_PROFILE_INCOMPLETE") {
    return "Your free place is confirmed, but we could not finish saving your profile. Retry to continue without claiming another place.";
  }
  if (code === "PARTNER_PROFILE_MISSING") {
    return "Your sponsored access is active, but your personal profile still needs to be completed. You can retake the short assessment without creating another account.";
  }
  if (code === "ACCOUNT_PROFILE_UNAVAILABLE") {
    return "We could not load your account right now. Your progress is safe. Please try again or log out.";
  }
  if (code === "PARTNER_CLEANUP_INCOMPLETE") {
    return "We could not safely finish cleaning up your new account. Do not create another account. Try to log out, then contact support for help.";
  }
  return "Sponsored access is temporarily unavailable. Your answers are still here. Please try again.";
}

export default function PartnerAccessError({
  code,
  partnerName,
  onRetry,
  retryLabel = "Retry",
  onLogOut,
  logOutLabel = "Log out",
  showSupport = false,
}) {
  const canRetry =
    (code === "PARTNER_UNAVAILABLE" ||
      code === "PARTNER_ACCESS_UNCONFIRMED" ||
      code === "PARTNER_PROFILE_INCOMPLETE" ||
      code === "PARTNER_PROFILE_MISSING" ||
      code === "ACCOUNT_PROFILE_UNAVAILABLE") &&
    typeof onRetry === "function";
  const heading =
    code === "PARTNER_CLEANUP_INCOMPLETE" ? "Account setup" : "Sponsored access";

  return (
    <div className="onboarding-focus flex min-h-0 flex-1 flex-col overflow-y-auto px-7 pb-7 pt-8">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center text-center">
        <AlertCircle
          className="mx-auto h-16 w-16 text-clay"
          strokeWidth={2}
          aria-hidden="true"
        />
        <h1 className="page-title mt-6">{heading}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft" role="status">
          {messageFor(code, partnerName)}
        </p>
        {canRetry ? (
          <button type="button" className="btn-primary mt-8" onClick={onRetry}>
            {retryLabel}
          </button>
        ) : null}
        {typeof onLogOut === "function" ? (
          <button
            type="button"
            className={`${canRetry ? "btn-secondary mt-4" : "btn-primary mt-8"}`}
            onClick={onLogOut}
          >
            {logOutLabel}
          </button>
        ) : null}
        {showSupport ? (
          <a
            className="btn-secondary mt-4"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            Contact support
          </a>
        ) : null}
      </div>
    </div>
  );
}
