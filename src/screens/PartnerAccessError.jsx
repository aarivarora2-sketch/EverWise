import React from "react";
import { AlertCircle } from "lucide-react";

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
  return "Sponsored access is temporarily unavailable. Your answers are still here. Please try again.";
}

export default function PartnerAccessError({ code, partnerName, onRetry }) {
  const canRetry = code === "PARTNER_UNAVAILABLE" && typeof onRetry === "function";

  return (
    <div className="onboarding-focus flex min-h-0 flex-1 flex-col overflow-y-auto px-7 pb-7 pt-8">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center text-center">
        <AlertCircle
          className="mx-auto h-16 w-16 text-clay"
          strokeWidth={2}
          aria-hidden="true"
        />
        <h1 className="page-title mt-6">Sponsored access</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft" role="status">
          {messageFor(code, partnerName)}
        </p>
        {canRetry ? (
          <button type="button" className="btn-primary mt-8" onClick={onRetry}>
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}
