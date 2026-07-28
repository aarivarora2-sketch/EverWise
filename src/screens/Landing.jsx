function Step({ n, name, children }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay font-sans text-lg font-bold text-cream-card">
        {n}
      </span>
      <p className="text-base leading-snug text-ink">
        <span className="font-semibold">{name}</span> — {children}
      </p>
    </li>
  );
}

export default function Landing({ onGetStarted, onLogIn }) {
  return (
    <div className="landing-screen flex h-full min-h-0 flex-1 flex-col overflow-y-auto px-7 pb-0 pt-5">
      <div className="animate-fade-up">
        <div className="flex items-center gap-3">
          <img
            src="/everwise-logo-192.png"
            alt=""
            aria-hidden="true"
            className="h-10 w-10 object-contain"
          />
          <p className="font-sans text-3xl font-bold tracking-tight text-ink">
            Everwise
          </p>
        </div>

        <h1 className="page-title mt-4">
          Learn to spot scams, one lesson a day.
        </h1>
        <p className="mt-3 text-lg leading-snug text-ink-soft">
          Short, friendly lessons that help you use the internet with
          confidence. One lesson at a time.
        </p>
      </div>

      {/* How it works — three quick steps */}
      <div className="mt-5">
        <p className="text-sm font-bold uppercase tracking-wide text-ink-faint">
          How it works
        </p>
        <ol className="mt-2 space-y-2">
          <Step n="1" name="Learn">
            One quick lesson, in plain language.
          </Step>
          <Step n="2" name="Practice">
            Spot a real scam example. One tap.
          </Step>
          <Step n="3" name="Remember">
            Build the habit so you catch it for real.
          </Step>
        </ol>
      </div>

      <div className="landing-actions mt-auto space-y-2 pt-3">
        <button className="btn-primary" onClick={onGetStarted}>
          Get Started
        </button>
        <button className="btn-secondary" onClick={onLogIn}>
          Log In
        </button>
      </div>
    </div>
  );
}
