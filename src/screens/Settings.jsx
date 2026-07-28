import { useState } from "react";
import { statusLabel, trialDaysLeft } from "../utils/subscription";
import { ArrowLeftIcon } from "../components/Icons";

function Row({ label, value, onClick, hint }) {
  const interactive = typeof onClick === "function";
  const Comp = interactive ? "button" : "div";
  return (
    <Comp
      type={interactive ? "button" : undefined}
      onClick={onClick}
      className={`responsive-split flex w-full items-center justify-between gap-4 rounded-2xl bg-cream-card px-5 py-5 text-left shadow-card ${
        interactive
          ? "transition-colors hover:bg-cream-deep active:bg-cream-deep"
          : ""
      }`}
    >
      <div className="min-w-0">
        <p className="text-xl font-semibold text-ink">{label}</p>
        {hint ? (
          <p className="mt-1 text-lg text-ink-soft">{hint}</p>
        ) : null}
      </div>
      {value != null ? (
        <p className="shrink-0 text-right text-xl font-semibold text-clay">
          {value}
        </p>
      ) : interactive ? (
        <span className="shrink-0 text-2xl text-ink-faint" aria-hidden="true">
          →
        </span>
      ) : null}
    </Comp>
  );
}

export default function Settings({
  subscriptionStatus,
  trialStartedAt,
  plan,
  onBack,
  onLogOut,
  onOpenPaywall,
  onManageSubscription,
  onResetPassword,
  onDeleteAccount,
}) {
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const daysLeft = trialDaysLeft(trialStartedAt);
  const statusText = statusLabel(subscriptionStatus);
  const statusDetail =
    subscriptionStatus === "trial"
      ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
      : subscriptionStatus === "active" && plan
      ? plan === "monthly"
        ? "Monthly plan"
        : plan
      : null;

  const resetPassword = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await onResetPassword();
      setNotice("Password reset email sent.");
    } catch {
      setError("We could not send the reset email. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      "Delete your Everwise account and saved progress? This cannot be undone.",
    );
    if (!confirmed) return;

    setBusy(true);
    setError("");
    setNotice("");
    try {
      await onDeleteAccount();
    } catch {
      setError(
        "Your account could not be deleted. Log out, log back in, and try again.",
      );
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-7 pb-10 pt-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to home"
          className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-cream-deep"
        >
          <ArrowLeftIcon className="h-7 w-7" />
        </button>
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="mt-8 space-y-3">
        <p className="text-base font-bold uppercase tracking-wide text-ink-faint">
          Subscription
        </p>
        <Row
          label="Status"
          value={statusText}
          hint={statusDetail}
        />
        {subscriptionStatus === "active" ? (
          <Row
            label="Manage subscription"
            onClick={onManageSubscription}
            hint="Open Apple subscription settings"
          />
        ) : (
          <Row
            label="Start free trial"
            onClick={onOpenPaywall}
            hint="See your options"
          />
        )}
      </div>

      <div className="mt-8 space-y-3">
        <p className="text-base font-bold uppercase tracking-wide text-ink-faint">
          Account
        </p>
        <Row label="Log out" onClick={onLogOut} />
        <Row
          label="Reset password"
          hint="Send a secure reset link to your email"
          onClick={busy ? undefined : resetPassword}
        />
        <Row
          label="Delete account"
          hint="Permanently remove your account and saved progress"
          onClick={busy ? undefined : deleteAccount}
        />
      </div>

      {notice ? (
        <p className="mt-6 rounded-2xl bg-sage/10 px-5 py-4 text-lg font-semibold text-sage-dark" role="status">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="mt-6 rounded-2xl bg-alert/10 px-5 py-4 text-lg font-semibold text-alert" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
