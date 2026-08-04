import { useState } from "react";
import { ArrowLeftIcon } from "../components/Icons";
import { openLegalPage } from "../config/legalLinks";
import TextSizeControl from "../components/TextSizeControl";

const SUPPORT_EMAIL = "everwisedigitalliteracy@gmail.com";

function Row({ label, value, onClick, hint, disabled = false }) {
  const interactive = typeof onClick === "function";
  const Comp = interactive ? "button" : "div";
  return (
    <Comp
      type={interactive ? "button" : undefined}
      onClick={onClick}
      disabled={interactive ? disabled : undefined}
      aria-label={interactive ? label : undefined}
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

const WEB_STATUSES = new Set([
  "active",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "past_due",
  "paused",
  "trialing",
  "unpaid",
]);

const unavailableBilling = (busy = false) => ({
  provider: "unavailable",
  status: "unavailable",
  plan: null,
  trialEndsAt: null,
  currentPeriodEndsAt: null,
  cancelAtPeriodEnd: false,
  canManage: false,
  busy,
});

function canonicalDate(value) {
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) return undefined;
  const date = new Date(milliseconds);
  if (date.toISOString() !== value) return undefined;
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}

function normalizeBillingViewModel(billing, legacy) {
  if (billing === undefined) {
    if (legacy.sponsored) {
      return {
        provider: "sponsor",
        status: "active",
        partnerName: legacy.partner?.name || "your community partner",
        busy: false,
      };
    }
    if (legacy.subscriptionStatus === "active") {
      return {
        provider: "apple",
        status: "active",
        plan: legacy.plan === "monthly" ? "monthly" : "annual",
        trialEndsAt: null,
        currentPeriodEndsAt: null,
        cancelAtPeriodEnd: false,
        canManage: true,
        busy: false,
      };
    }
    return {
      provider: "none",
      status: "none",
      plan: null,
      trialEndsAt: null,
      currentPeriodEndsAt: null,
      cancelAtPeriodEnd: false,
      canManage: false,
      busy: false,
    };
  }

  if (!billing || typeof billing !== "object" || Array.isArray(billing)) {
    return unavailableBilling();
  }
  if (billing.provider === "unavailable" && billing.status === "unavailable") {
    return unavailableBilling(billing.busy === true);
  }
  if (billing.provider === "sponsor" && billing.status === "active") {
    return {
      provider: "sponsor",
      status: "active",
      partnerName:
        typeof billing.partnerName === "string" && billing.partnerName.trim()
          ? billing.partnerName.trim()
          : "your community partner",
      busy: billing.busy === true,
    };
  }
  if (billing.provider === "none" && billing.status === "none") {
    return {
      provider: "none",
      status: "none",
      plan: null,
      trialEndsAt: null,
      currentPeriodEndsAt: null,
      cancelAtPeriodEnd: false,
      canManage: false,
      busy: billing.busy === true,
    };
  }
  if (
    billing.provider !== "stripe" &&
    billing.provider !== "apple"
  ) {
    return unavailableBilling(billing.busy === true);
  }
  if (
    !WEB_STATUSES.has(billing.status) ||
    (billing.plan !== "monthly" && billing.plan !== "annual") ||
    typeof billing.cancelAtPeriodEnd !== "boolean" ||
    typeof billing.canManage !== "boolean"
  ) {
    return unavailableBilling(billing.busy === true);
  }
  const trialEndsAt = canonicalDate(billing.trialEndsAt);
  const currentPeriodEndsAt = canonicalDate(billing.currentPeriodEndsAt);
  if (
    trialEndsAt === undefined ||
    currentPeriodEndsAt === undefined ||
    (billing.provider === "stripe" &&
      billing.status === "active" &&
      currentPeriodEndsAt === null) ||
    (billing.provider === "stripe" &&
      billing.status === "trialing" &&
      trialEndsAt === null) ||
    (billing.cancelAtPeriodEnd && currentPeriodEndsAt === null)
  ) {
    return unavailableBilling(billing.busy === true);
  }
  return {
    provider: billing.provider,
    status: billing.status,
    plan: billing.plan,
    trialEndsAt,
    currentPeriodEndsAt,
    cancelAtPeriodEnd: billing.cancelAtPeriodEnd,
    canManage: billing.canManage,
    busy: billing.busy === true,
  };
}

function billingStatusLabel(status) {
  const labels = {
    active: "Active",
    canceled: "Canceled",
    incomplete: "Incomplete",
    incomplete_expired: "Expired",
    past_due: "Past due",
    paused: "Paused",
    trialing: "Trial",
    unpaid: "Unpaid",
  };
  return labels[status] || "Unavailable";
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
  if (terminal === "deletion-status") {
    return "We could not confirm whether Firebase deleted your account. The sponsored-place release is paused; please contact support before trying again.";
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
  billing,
  sponsored = false,
  partner = null,
  subscriptionStatus,
  plan,
  onBack,
  onLogOut,
  onOpenPaywall,
  onManageSubscription,
  onRetryBilling,
  onResetPassword,
  onDeleteAccount,
  textSize,
  onTextSizeChange,
}) {
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [billingActionBusy, setBillingActionBusy] = useState(false);
  const [billingActionError, setBillingActionError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");

  const billingView = normalizeBillingViewModel(billing, {
    partner,
    plan,
    sponsored,
    subscriptionStatus,
  });
  const billingBusy = billingView.busy || billingActionBusy;

  const runBillingAction = async (action) => {
    if (typeof action !== "function" || billingBusy) return;
    setBillingActionBusy(true);
    setBillingActionError("");
    try {
      await action();
    } catch {
      setBillingActionError("Billing management is temporarily unavailable.");
    } finally {
      setBillingActionBusy(false);
    }
  };

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
      await onDeleteAccount?.(password);
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
        <section className="settings-section settings-display mt-8 space-y-3">
          <p className="text-base font-bold uppercase tracking-wide text-ink-faint">
            Display
          </p>
          <div className="responsive-split flex w-full items-center justify-between gap-4 rounded-2xl bg-cream-card px-5 py-5 shadow-card">
            <div className="min-w-0">
              <p className="text-xl font-semibold text-ink">Text size</p>
              <p className="mt-1 text-lg text-ink-soft">
                Applies everywhere in the app
              </p>
            </div>
            {onTextSizeChange ? (
              <TextSizeControl
                textSize={textSize}
                onTextSizeChange={onTextSizeChange}
                buttonClassName="h-12 w-12"
              />
            ) : null}
          </div>
        </section>

        {billingView.provider === "sponsor" ? (
          <section className="settings-section settings-subscription mt-8 space-y-3">
            <p className="text-base font-bold uppercase tracking-wide text-ink-faint">
              Access
            </p>
            <div className="rounded-2xl bg-cream-card px-5 py-5 shadow-card">
              <p className="text-xl font-semibold text-ink">
                Full access provided by {billingView.partnerName}
              </p>
              <p className="mt-1 text-lg text-ink-soft">
                No subscription or payment is required.
              </p>
            </div>
          </section>
        ) : billingView.provider === "unavailable" ? (
          <section className="settings-section settings-subscription mt-8 space-y-3">
            <p className="text-base font-bold uppercase tracking-wide text-ink-faint">
              Subscription
            </p>
            <p
              className="rounded-2xl bg-alert/10 px-5 py-5 text-lg font-semibold text-alert shadow-card"
              role="alert"
            >
              Billing is temporarily unavailable.
            </p>
            <Row
              label="Retry"
              hint="Check subscription status again"
              onClick={() => runBillingAction(onRetryBilling)}
              disabled={billingBusy}
            />
          </section>
        ) : billingView.provider === "none" ? (
          <section className="settings-section settings-subscription mt-8 space-y-3">
            <p className="text-base font-bold uppercase tracking-wide text-ink-faint">
              Subscription
            </p>
            <Row label="Status" value="No subscription" />
            <Row
              label="View plans"
              onClick={onOpenPaywall}
              hint="Start free trial"
              disabled={billingBusy}
            />
          </section>
        ) : (
          <section className="settings-section settings-subscription mt-8 space-y-3">
            <p className="text-base font-bold uppercase tracking-wide text-ink-faint">
              Subscription
            </p>
            <div className="rounded-2xl bg-cream-card px-5 py-5 shadow-card">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="text-xl font-semibold text-ink">Status</p>
                <p className="text-xl font-semibold text-clay">
                  {billingStatusLabel(billingView.status)}
                </p>
              </div>
              <p className="mt-2 text-lg font-semibold text-ink">
                {billingView.plan === "monthly" ? "Monthly plan" : "Annual plan"}
              </p>
              {billingView.cancelAtPeriodEnd ? (
                <p className="mt-1 text-lg text-ink-soft">
                  Canceled — access continues through {billingView.currentPeriodEndsAt}.
                </p>
              ) : billingView.status === "trialing" ? (
                <p className="mt-1 text-lg text-ink-soft">
                  Trial ends {billingView.trialEndsAt}.
                </p>
              ) : billingView.status === "active" && billingView.currentPeriodEndsAt ? (
                <p className="mt-1 text-lg text-ink-soft">
                  Renews {billingView.currentPeriodEndsAt}.
                </p>
              ) : null}
            </div>
            {billingView.canManage ? (
              <Row
                label="Manage subscription"
                onClick={() => runBillingAction(onManageSubscription)}
                disabled={billingBusy}
                hint={
                  billingView.provider === "apple"
                    ? "Manage your subscription in Apple subscription settings."
                    : "Open the secure billing portal"
                }
              />
            ) : (
              <Row
                label="View plans"
                onClick={onOpenPaywall}
                hint="Start free trial"
                disabled={billingBusy}
              />
            )}
          </section>
        )}

        <section className="settings-section settings-account mt-8 space-y-3">
        <p className="text-base font-bold uppercase tracking-wide text-ink-faint">
          Account
        </p>
        <Row label="Log out" onClick={onLogOut} disabled={busy} />
        {typeof onResetPassword === "function" ? (
          <Row
            label="Reset password"
            hint="Send a secure reset link to your email"
            onClick={busy ? undefined : resetPassword}
          />
        ) : null}
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
                disabled={busy || !currentPassword}
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
      {billingActionError ? (
        <p className="mt-6 rounded-2xl bg-alert/10 px-5 py-4 text-lg font-semibold text-alert" role="alert">
          {billingActionError}
        </p>
      ) : null}
    </div>
  );
}
