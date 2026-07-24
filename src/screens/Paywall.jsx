export default function Paywall({ onSubscribe, onMaybeLater }) {
  return (
    <div className="flex flex-1 flex-col px-7 pb-10 pt-8">
      <h1 className="mt-4 font-serif text-5xl font-semibold leading-tight tracking-tight text-ink">
        Keep learning with Everwise
      </h1>
      <p className="mt-5 text-xl leading-relaxed text-ink-soft">
        Keep all lessons, both tracks, read-aloud, and your saved progress.
      </p>

      <div className="mt-10 rounded-3xl bg-cream-card px-6 py-7 shadow-card">
        <p className="font-serif text-4xl font-semibold text-ink">
          $4.99 / month
        </p>
        <p className="mt-4 text-xl leading-relaxed text-ink">
          Introductory price. Renews at $9.99 per month after your first 12
          months.
        </p>
      </div>

      <div className="mt-auto space-y-4 pt-10">
        <button type="button" className="btn-primary" onClick={onSubscribe}>
          Start subscription
        </button>
        <p className="text-center text-xl text-ink-soft">Cancel anytime.</p>
        <button
          type="button"
          onClick={onMaybeLater}
          className="w-full py-3 text-center text-xl font-semibold text-ink-soft underline decoration-ink/30 underline-offset-4 transition-colors hover:text-ink"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
