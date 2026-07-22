function Step({ n, name, children }) {
  return (
    <li className="flex items-center gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clay font-serif text-xl font-bold text-cream-card">
        {n}
      </span>
      <p className="text-lg leading-snug text-ink">
        <span className="font-semibold">{name}</span> — {children}
      </p>
    </li>
  );
}

export default function Landing({ onGetStarted, onLogIn }) {
  return (
    <div className="flex flex-1 flex-col px-7 pb-8 pt-9">
      <div className="animate-fade-up">
        <div className="flex items-center gap-3">
          <img
            src="/everwise-icon.svg"
            alt=""
            aria-hidden="true"
            className="h-12 w-12 rounded-xl"
          />
          <p className="font-serif text-4xl font-bold tracking-tight text-clay">
            Everwise
          </p>
        </div>

        <h1 className="mt-8 font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-ink">
          Learn to
          <br />
          spot scams,
          <br />
          one lesson
          <br />
          a day.
        </h1>
        <p className="mt-4 text-xl leading-relaxed text-ink-soft">
          Short, friendly lessons that help you use the internet with
          confidence. One lesson at a time.
        </p>
      </div>

      {/* How it works — three quick steps */}
      <div className="mt-7">
        <p className="text-base font-bold uppercase tracking-wide text-ink-faint">
          How it works
        </p>
        <ol className="mt-3 space-y-3">
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

      <div className="mt-auto space-y-3 pt-7">
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
