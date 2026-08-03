import { useState } from "react";
import { statusLabel, trialDaysLeft } from "../utils/subscription";
import { ArrowLeftIcon } from "../components/Icons";
import { openLegalPage } from "../config/legalLinks";

const SUPPORT_EMAIL = "everwisedigitalliteracy@gmail.com";

function Row({ label, value, onClick, hint, disabled = false }) {
  const interactive = typeof onClick === "function";
  const Comp = interactive ? "button" : "div";
  return (
    <Comp
      type={interactive ? "button" : undefined}
      onClick={onClick}
      disabled={interactive ? disabled : undefined}
      className={`responsive-split flex w-full items-center justify-between gap-4 rounded-2xl bg-cream-card px-5 py-5 text-left shadow-card ${
        interactive
          ? "transition-colors hover:bg-cream-deep active:bg-cream-deep disabled:cursor-not-allowed disabled:opacity-60"
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

function terminalReleaseMessage(terminal) {
  if (terminal === "cancellation") {
    return "We could not safely cancel the sponsored-place release. Please contact support so it can be reconciled without affecting your current account.";
  }
  if (terminal === "compensation") {
    return "We could not safely restore your saved profile after account deletion stopped. Please contact support before trying again.";
  }
  if (terminal === "storage-cleanup") {
    return "We could not safely clear the private deletion recovery record. Please contact support so it can be reconciled without exposing your information.";
  }
  return "We cannot safely retry the sponsored-place release. Please contact support so we can reconcile it without risking your information.";
}

export function PartnerReleaseRecovery({ busy = false, terminal = null, onRetry }) {
  return (
    <div className="onboarding-focus flex min-h-0 flex-1 flex-col overflow-y-auto px-7 pb-7 pt-8">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center text-center">
        <h1 className="page-title">Finishing account deletion</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft" role="status">
          {terminal
            ? terminalReleaseMessage(terminal)
            : "Your account has been deleted, but we still need to finish releasing its sponsored place. Please retry so another learner can use it."}
        </p>
        {terminal ? (
          <a className="btn-primary mt-8" href={`mailto:${SUPPORT_EMAIL}`}>
            Contact support
          </a>
        ) : (
          <button
            type="button"
            className="btn-primary mt-8"
            onClick={onRetry}
            disabled={busy}
          >
            {busy ? "Retrying…" : "Retry"}
          </button>
        )}
      </div>
    </div>
  );
}

export function PartnerDeletionReconciliation({ reconciliation = "compensation" }) {
  return (
    <div className="onboarding-focus flex min-h-0 flex-1 flex-col overflow-y-auto px-7 pb-7 pt-8">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center text-center">
        <h1 className="page-title">Account deletion needs help</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft" role="status">
          {terminalReleaseMessage(reconciliation)}
        </p>
        <a className="btn-primary mt-8" href={`mailto:${SUPPORT_EMAIL}`}>
          Contact support
        </a>
      </div>
    </div>
  );
}

export default function Settings({
  sponsored = false,
  partner = null,
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
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");

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

  const handleDeleteAccount = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    const password = currentPassword;
    setCurrentPassword("");
    try {
      if (sponsored) {
        await onDeleteAccount?.(password);
      } else {
        await onDeleteAccount?.();
      }
    } catch (err) {
      setError(
        err.message ||
          "Your account could not be deleted. Log out, log back in, and try again.",
      );
      setBusy(false);
    }
  };

  return (
    <div className="settings-screen mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-y-auto px-7 pb-10 pt-8 lg:px-0 lg:pt-12">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={busy}
          aria-label="Back to home"
          className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-cream-deep lg:hidden"
        >
          <ArrowLeftIcon className="h-7 w-7" />
        </button>
        <h1 className="page-title lg:text-4xl">Settings</h1>
      </div>

      <div className="settings-grid">
        {sponsored ? (
          <section className="settings-section settings-subscription mt-8 space-y-3">
            <p className="text-base font-bold uppercase tracking-wide text-ink-faint">
              Access
            </p>
            <div className="rounded-2xl bg-cream-card px-5 py-5 shadow-card">
              <p className="text-xl font-semibold text-ink">
                Full access provided by {partner?.name || "your community partner"}
              </p>
              <p className="mt-1 text-lg text-ink-soft">
                No subscription or payment is required.
              </p>
            </div>
          </section>
        ) : (
          <section className="settings-section settings-subscription mt-8 space-y-3">
            <p className="text-base font-bold uppercase tracking-wide text-ink-faint">
              Subscription
            </p>
            <Row label="Status" value={statusText} hint={statusDetail} />
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
          </section>
        )}

        <section className="settings-section settings-account mt-8 space-y-3">
        <p className="text-base font-bold uppercase tracking-wide text-ink-faint">
          Account
        </p>
        <Row label="Log out" onClick={onLogOut} disabled={busy} />
        <Row
          label="Reset password"
          hint="Send a secure reset link to your email"
          onClick={busy ? undefined : resetPassword}
        />
        <Row
          label="Contact support"
          hint={SUPPORT_EMAIL}
          onClick={() => {
            window.location.href = `mailto:${SUPPORT_EMAIL}`;
          }}
        />

        {!confirmingDelete ? (
          <Row
            label="Delete account"
            hint="Permanently remove your account and saved progress"
            onClick={
              busy
                ? undefined
                : () => {
                    setError("");
                    setConfirmingDelete(true);
                  }
            }
          />
        ) : (
          <div className="rounded-2xl border-2 border-alert/40 bg-alert/10 px-5 py-5">
            <p className="text-xl font-bold text-ink">Delete your account?</p>
            <p className="mt-2 text-lg leading-snug text-ink-soft">
              This permanently deletes your account, progress, and badges.
              This cannot be undone.
            </p>
            {sponsored ? (
              <div className="mt-4">
                <label
                  htmlFor="delete-current-password"
                  className="block text-xl font-semibold text-ink"
                >
                  Current password
                </label>
                <input
                  id="delete-current-password"
                  name="delete-current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  className="mt-2 w-full rounded-2xl border-2 border-ink/20 bg-cream-card px-5 text-xl text-ink transition-colors focus:border-clay"
                  style={{ minHeight: "62px" }}
                />
                <p className="mt-2 text-base text-ink-soft">
                  Enter your current password to confirm it is you.
                </p>
              </div>
            ) : null}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                className="btn-secondary flex-1"
                onClick={() => {
                  setCurrentPassword("");
                  setConfirmingDelete(false);
                }}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 rounded-2xl bg-alert px-6 py-5 text-center text-lg font-bold text-cream-card shadow-btn transition-all active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleDeleteAccount}
                disabled={busy || (sponsored && !currentPassword)}
              >
                {busy ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        )}
        </section>

        <section className="settings-section settings-legal mt-8 space-y-3">
        <p className="text-base font-bold uppercase tracking-wide text-ink-faint">
          Legal
        </p>
        <Row
          label="Privacy Policy"
          onClick={() => openLegalPage("privacy")}
        />
        <Row
          label="Terms of Service"
          onClick={() => openLegalPage("terms")}
        />
        </section>
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
