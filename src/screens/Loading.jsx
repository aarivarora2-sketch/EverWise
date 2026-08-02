export default function Loading() {
  return (
    <div className="onboarding-focus flex flex-1 flex-col items-center justify-center px-7 text-center">
      <div className="launch-logo flex h-24 w-24 items-center justify-center rounded-full bg-cream-card shadow-card">
        <img
          src="/everwise-logo-192.png"
          alt=""
          aria-hidden="true"
          className="h-16 w-16 object-contain"
        />
      </div>
      <div className="launch-copy">
        <p className="mt-6 font-sans text-3xl font-semibold text-ink">
          Everwise
        </p>
        <p className="mt-2 text-lg text-ink-soft" role="status">
          Learn with confidence.
        </p>
        <div
          className="mx-auto mt-6 h-3 w-48 overflow-hidden rounded-full bg-ink/10"
          role="progressbar"
          aria-label="Starting Everwise"
        >
          <div className="launch-progress-bar h-full w-full rounded-full bg-clay" />
        </div>
      </div>
    </div>
  );
}
