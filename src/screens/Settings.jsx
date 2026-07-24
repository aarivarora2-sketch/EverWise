import { statusLabel, trialDaysLeft } from "../utils/subscription";
import { ArrowLeftIcon } from "../components/Icons";

function Row({ label, value, onClick, hint }) {
  const interactive = typeof onClick === "function";
  const Comp = interactive ? "button" : "div";
  return (
    <Comp
      type={interactive ? "button" : undefined}
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-4 rounded-2xl bg-cream-card px-5 py-5 text-left shadow-card ${
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
  onDevResetTrial,
  onDevSetActive,
  onDevSetExpired,
}) {
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

  return (
    <div className="flex flex-1 flex-col px-7 pb-10 pt-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to home"
          className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-cream-deep"
        >
          <ArrowLeftIcon className="h-7 w-7" />
        </button>
        <h1 className="font-serif text-3xl font-semibold text-ink">Settings</h1>
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
            hint="Coming soon"
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
      </div>

      <div className="mt-auto space-y-3 pt-12">
        <p className="text-base font-bold uppercase tracking-wide text-alert">
          Developer tools
        </p>
        <p className="text-lg text-ink-soft">
          For testing only. Remove before launch.
        </p>
        <Row label="Reset trial (dev)" onClick={onDevResetTrial} />
        <Row label="Set active (dev)" onClick={onDevSetActive} />
        <Row label="Set expired (dev)" onClick={onDevSetExpired} />
      </div>
    </div>
  );
}
