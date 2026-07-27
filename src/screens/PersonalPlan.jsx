import { useEffect, useMemo, useState } from "react";
import { Check, ShieldCheck, Sparkles } from "lucide-react";

function getPlan(profile) {
  const interview = profile?.profileInterview ?? {};
  const concerns = interview.concerns ?? [];
  const safeBankChoice =
    interview.scamScenario === "Call the bank using its official number";

  let strength =
    "You took time to build a safer and more comfortable online routine.";
  if (safeBankChoice) {
    strength =
      "You already know to verify urgent bank messages using an official phone number.";
  } else if (
    interview.confidence === "Confident" ||
    interview.confidence === "Sometimes I need help"
  ) {
    strength = "You already have online experience to build on.";
  }

  const firstConcern = concerns[0] ?? "Scam calls and messages";
  const concernLesson = {
    "Scam calls and messages": "Recognize scam calls and urgent messages",
    "Money or bank-card theft": "Protect cards, banking apps, and payments",
    "Suspicious links": "Check links before opening them",
    "Account hacking": "Strengthen passwords and account security",
    "Fake news": "Check whether online information is trustworthy",
    "Knowing what to trust": "Verify online claims using trusted sources",
  }[firstConcern];

  const safetyLesson =
    interview.scamFrequency === "never"
      ? "Keep your personal information protected"
      : "Know what to do after a suspected scam";
  const aiLesson =
    interview.aiExperience === "I don’t know what it is yet"
      ? "Understand what AI can and cannot do"
      : "Ask AI useful questions and check its answers";

  return {
    firstConcern,
    strength,
    recommendations: [
      concernLesson ?? "Recognize suspicious messages",
      safetyLesson,
      aiLesson,
    ],
  };
}

export default function PersonalPlan({ profile, onContinue }) {
  const [ready, setReady] = useState(false);
  const plan = useMemo(() => getPlan(profile), [profile]);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!ready) {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 text-center"
        aria-live="polite"
      >
        <img
          src="/everwise-logo-192.png"
          alt=""
          className="h-24 w-24 object-contain animate-pop-in"
        />
        <h1 className="page-title mt-7">Building your personal plan…</h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">
          We’re using your answers to choose three useful starting topics.
        </p>
        <div
          className="mt-8 h-4 w-full max-w-[300px] overflow-hidden rounded-full bg-ink/10"
          role="progressbar"
          aria-label="Building your plan"
        >
          <div className="plan-progress-bar h-full rounded-full bg-clay" />
        </div>
        <p className="mt-4 text-base font-semibold text-ink-soft">
          Finding your strongest first lessons
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-7 pb-7 pt-8">
      <div className="animate-fade-up">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage text-cream-card shadow-node-sage">
          <Check className="h-9 w-9" strokeWidth={3} aria-hidden="true" />
        </div>
        <p className="mt-7 text-base font-bold uppercase tracking-wide text-sage-dark">
          Your plan is ready
        </p>
        <h1 className="page-title mt-2">
          Your personal learning plan
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          We recommend starting with these three topics:
        </p>
      </div>

      <ol className="mt-6 space-y-3">
        {plan.recommendations.map((recommendation, index) => (
          <li
            key={recommendation}
            className="flex items-center gap-4 rounded-2xl bg-cream-card p-4 text-lg font-semibold leading-snug text-ink shadow-card"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay font-bold text-cream-card">
              {index + 1}
            </span>
            <span>{recommendation}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-3xl bg-sage/10 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="mt-1 h-8 w-8 shrink-0 text-sage-dark"
            aria-hidden="true"
          />
          <div>
            <h2 className="text-xl font-bold text-ink">A strength to build on</h2>
            <p className="mt-2 text-lg leading-relaxed text-ink-soft">
              {plan.strength}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-5 flex items-start gap-3 rounded-2xl bg-clay/10 px-5 py-4 text-lg font-semibold leading-relaxed text-ink">
        <Sparkles className="mt-1 h-6 w-6 shrink-0 text-clay" aria-hidden="true" />
        Your answers are saved. You can change accessibility preferences later.
      </p>

      <div className="mt-auto pt-7">
        <button type="button" className="btn-primary" onClick={onContinue}>
          See my plan options
        </button>
      </div>
    </div>
  );
}
