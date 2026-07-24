import { useState } from "react";
import { phases } from "../data/phases";

const TIMELINE = [
  {
    title: "Today",
    body: "Full access to every lesson. You won't be charged.",
    color: phases[0].color,
  },
  {
    title: "Day 2",
    body: "We'll email you a reminder that your trial is ending.",
    color: phases[1].color,
  },
  {
    title: "Day 3",
    body: "Your trial ends. Subscribe only if you want to keep going.",
    color: phases[2].color,
  },
];

function StatCard({ value, label }) {
  return (
    <div className="rounded-2xl bg-cream-card px-5 py-5 shadow-card">
      <p className="font-serif text-5xl font-bold text-clay">{value}</p>
      <p className="mt-2 text-xl text-ink-soft">{label}</p>
    </div>
  );
}

function ProgressScreen({
  lessonsCompleted,
  streak,
  badgesEarned,
  onSeeOptions,
  onMaybeLater,
}) {
  const hasProgress =
    lessonsCompleted > 0 || streak > 0 || badgesEarned > 0;

  return (
    <div className="flex flex-1 flex-col px-7 pb-10 pt-8">
      <h1 className="font-serif text-5xl font-semibold leading-tight tracking-tight text-ink">
        Look how far you've come.
      </h1>

      {hasProgress ? (
        <div className="mt-8 space-y-4">
          <StatCard value={lessonsCompleted} label="lessons completed" />
          <StatCard value={streak} label="day streak" />
          <StatCard value={badgesEarned} label="badges earned" />
        </div>
      ) : (
        <ul className="mt-8 space-y-5">
          {[
            "Every lesson in both tracks",
            "Read-aloud on every screen",
            "Progress saved across devices",
          ].map((item) => (
            <li key={item} className="flex gap-4 text-xl leading-snug text-ink">
              <span
                className="mt-2 h-3 w-3 shrink-0 rounded-full bg-clay"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-xl leading-relaxed text-ink-soft">
        Keep going and you'll learn to spot every common scam before it reaches
        you.
      </p>

      <div className="mt-auto space-y-3 pt-10">
        <button type="button" className="btn-primary" onClick={onSeeOptions}>
          See my options
        </button>
        <button
          type="button"
          onClick={onMaybeLater}
          className="w-full py-3 text-center text-lg font-semibold text-ink-soft underline decoration-ink/30 underline-offset-4 transition-colors hover:text-ink"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

function TimelineSteps() {
  return (
    <ol className="mt-8">
      {TIMELINE.map((step, i) => {
        const isLast = i === TIMELINE.length - 1;
        return (
          <li key={step.title} className="relative flex gap-4">
            <div className="relative flex w-5 shrink-0 flex-col items-center">
              <span
                className="relative z-10 mt-1.5 h-4 w-4 rounded-full"
                style={{ backgroundColor: step.color }}
                aria-hidden="true"
              />
              {!isLast ? (
                <span
                  className="mt-1 w-1 flex-1 rounded-full"
                  style={{
                    backgroundColor: `${step.color}66`,
                    minHeight: "2.5rem",
                  }}
                  aria-hidden="true"
                />
              ) : null}
            </div>
            <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-7"}`}>
              <p className="text-xl font-bold" style={{ color: step.color }}>
                {step.title}
              </p>
              <p className="mt-1 text-xl leading-snug text-ink">{step.body}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function PlanCard() {
  return (
    <div className="mt-8 rounded-3xl bg-cream-card px-6 py-7 shadow-card">
      <p className="font-serif text-4xl font-semibold text-ink">
        $4.99 per month
      </p>
      <p className="mt-4 text-xl leading-relaxed text-ink">
        Introductory price for your first 12 months. Renews at $9.99 per month
        after that.
      </p>
      <p className="mt-4 text-lg text-ink-soft">That's about 16 cents a day.</p>
    </div>
  );
}

/** Post-signup intro: timeline + price, one "Start learning" action. */
function IntroTimelineScreen({ onStartLearning }) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-7 pb-10 pt-8">
      <h1 className="font-serif text-5xl font-semibold leading-tight tracking-tight text-ink">
        Your 3 free days start now.
      </h1>
      <p className="mt-4 text-xl leading-relaxed text-ink-soft">
        Here's exactly what to expect, so nothing surprises you.
      </p>

      <TimelineSteps />
      <PlanCard />

      <div className="mt-auto space-y-3 pt-10">
        <button type="button" className="btn-primary" onClick={onStartLearning}>
          Start learning
        </button>
        <p className="text-center text-lg leading-snug text-ink-soft">
          Cancel anytime. No charge during your trial.
        </p>
      </div>
    </div>
  );
}

/** Expired-trial options: subscribe CTA + Maybe later. */
function SubscribeTimelineScreen({ onStartTrial, onMaybeLater }) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-7 pb-10 pt-8">
      <h1 className="font-serif text-5xl font-semibold leading-tight tracking-tight text-ink">
        Try Everwise free for 3 days.
      </h1>

      <TimelineSteps />
      <PlanCard />

      <div className="mt-auto space-y-3 pt-10">
        <button type="button" className="btn-primary" onClick={onStartTrial}>
          Start my free trial
        </button>
        <p className="text-center text-lg leading-snug text-ink-soft">
          Cancel anytime. No charge during your trial.
        </p>
        <button
          type="button"
          onClick={onMaybeLater}
          className="w-full py-3 text-center text-lg font-semibold text-ink-soft underline decoration-ink/30 underline-offset-4 transition-colors hover:text-ink"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

function ExitSheet({ onDismiss }) {
  return (
    <div
      className="absolute inset-0 z-50 flex flex-col justify-end bg-ink/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-exit-title"
    >
      <div className="rounded-t-3xl bg-cream px-7 pb-10 pt-8 shadow-[0_-8px_40px_rgba(34,32,28,0.18)] animate-fade-up">
        <h2
          id="paywall-exit-title"
          className="font-serif text-3xl font-semibold leading-tight text-ink"
        >
          Not ready yet?
        </h2>
        <p className="mt-4 text-xl leading-relaxed text-ink-soft">
          Your progress is saved. You can start your trial any time from
          Settings.
        </p>
        <button type="button" className="btn-primary mt-8" onClick={onDismiss}>
          Got it
        </button>
      </div>
    </div>
  );
}

/**
 * variant:
 * - "intro" — after signup; timeline only; Start learning → Home (no charge)
 * - "subscribe" — after trial expires; full two-screen paywall
 */
export default function Paywall({
  variant = "subscribe",
  lessonsCompleted = 0,
  streak = 0,
  badgesEarned = 0,
  onStartTrial,
  onMaybeLater,
  onStartLearning,
}) {
  const isIntro = variant === "intro";
  const [step, setStep] = useState(isIntro ? "options" : "progress");
  const [showExitSheet, setShowExitSheet] = useState(false);

  if (isIntro) {
    return (
      <div className="relative flex flex-1 flex-col">
        <IntroTimelineScreen onStartLearning={onStartLearning || onMaybeLater} />
      </div>
    );
  }

  const leaveFromScreen1 = () => onMaybeLater();
  const leaveFromScreen2 = () => setShowExitSheet(true);
  const dismissExitSheet = () => {
    setShowExitSheet(false);
    onMaybeLater();
  };

  return (
    <div className="relative flex flex-1 flex-col">
      {step === "progress" ? (
        <ProgressScreen
          lessonsCompleted={lessonsCompleted}
          streak={streak}
          badgesEarned={badgesEarned}
          onSeeOptions={() => setStep("options")}
          onMaybeLater={leaveFromScreen1}
        />
      ) : (
        <SubscribeTimelineScreen
          onStartTrial={onStartTrial}
          onMaybeLater={leaveFromScreen2}
        />
      )}

      {showExitSheet ? <ExitSheet onDismiss={dismissExitSheet} /> : null}
    </div>
  );
}
