import { useEffect, useRef } from "react";

export default function BillingConfirmation({
  phase = "checking",
  onRetry,
  onManageBilling,
  onBack,
}) {
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [phase]);

  const timedOut = phase === "timeout";

  return (
    <main className="mx-auto flex h-full w-full max-w-2xl flex-col justify-center px-6 py-10 text-center">
      <section
        className="rounded-3xl bg-cream-card px-6 py-8 shadow-card sm:px-10"
        role="region"
        aria-label="Subscription confirmation status"
        aria-live="polite"
      >
        <h1
          ref={headingRef}
          className="font-serif text-4xl font-bold text-ink"
          tabIndex={-1}
        >
          {timedOut ? "Access is still being confirmed" : "Confirming your access"}
        </h1>
        <p className="mt-5 text-xl leading-relaxed text-ink-soft">
          {timedOut
            ? "We still could not confirm your access. You can retry, manage billing, or return to the free lessons."
            : "Checking your access now. This can take a few moments."}
        </p>
        {!timedOut ? (
          <p className="mt-4 font-semibold text-sage-dark">Verification in progress…</p>
        ) : null}
        <div className="mt-7 flex flex-col gap-3">
          {timedOut && onRetry ? (
            <button type="button" className="btn-primary" onClick={onRetry}>
              Retry
            </button>
          ) : null}
          {timedOut && onManageBilling ? (
            <button type="button" className="btn-secondary" onClick={onManageBilling}>
              Manage billing
            </button>
          ) : null}
          {onBack ? (
            <button type="button" className="btn-secondary" onClick={onBack}>
              Back to free lessons
            </button>
          ) : null}
        </div>
      </section>
    </main>
  );
}
