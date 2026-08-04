import { useEffect, useRef } from "react";

export default function BillingAccessError({ kind = "temporary", onRetry, onBack }) {
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [kind]);

  const temporary = kind === "temporary";

  return (
    <main className="mx-auto flex h-full w-full max-w-2xl flex-col justify-center px-6 py-10 text-center">
      <section className="rounded-3xl bg-cream-card px-6 py-8 shadow-card sm:px-10" role="alert">
        <h1 ref={headingRef} className="font-serif text-4xl font-bold text-ink" tabIndex={-1}>
          {temporary ? "We could not verify your subscription" : "Your subscription is not active"}
        </h1>
        <p className="mt-5 text-xl leading-relaxed text-ink-soft">
          {temporary
            ? "Access could not be checked right now. Please retry when you are ready."
            : "Choose a plan to continue unfinished lessons, or return to the free lessons."}
        </p>
        <div className="mt-7 flex flex-col gap-3">
          {onRetry ? (
            <button type="button" className="btn-primary" onClick={onRetry}>
              Retry
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
