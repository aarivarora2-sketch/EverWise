import { useState } from "react";
import ReadAloud from "../ReadAloud";
import BlockShell from "./BlockShell";
import { TrophyIcon } from "../Icons";

// One realistic scenario, one decision, no hints beforehand. The lesson
// still completes if they choose poorly — they just get a recommendation
// to review before moving on.
export default function FinalBossBlock({
  block,
  progress,
  progressTotal,
  onContinue,
  onBack,
}) {
  const [selected, setSelected] = useState(null);
  const answered = selected != null;
  const chosen = answered ? block.options[selected] : null;

  const messages = block.messages || [];
  const speakText = [
    block.setup,
    ...messages.map((m) => `${m.from}. ${m.body}`),
    block.question,
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <BlockShell
      label="Final challenge"
      progress={progress}
      progressTotal={progressTotal}
      onBack={onBack}
      footer={
        answered ? (
          <button className="btn-primary" onClick={onContinue}>
            Continue
          </button>
        ) : null
      }
    >
      <div className="animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-clay text-cream-card">
            <TrophyIcon className="h-7 w-7" />
          </div>
          <h1 className="page-title">
            {block.title || "Final challenge"}
          </h1>
        </div>

        {block.setup && (
          <p className="mt-5 text-xl leading-relaxed text-ink-soft">
            {block.setup}
          </p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className="mt-5 rounded-3xl border-2 border-ink/10 bg-cream-card px-6 py-5 shadow-card"
          >
            <p className="text-base font-bold uppercase tracking-wide text-ink-faint">
              {m.from}
            </p>
            <p className="mt-2 text-xl leading-relaxed text-ink">{m.body}</p>
            {m.fakeButton && (
              <span
                className="mt-4 inline-block rounded-xl bg-ink/10 px-5 py-3 text-lg font-bold text-ink-faint"
                aria-label={`${m.fakeButton} (not a real button)`}
              >
                {m.fakeButton}
              </span>
            )}
          </div>
        ))}

        <h2 className="mt-7 font-sans text-2xl font-semibold leading-snug text-ink">
          {block.question}
        </h2>

        <div className="mt-4">
          <ReadAloud text={speakText} label="Read this aloud" />
        </div>

        <div className="mt-6 space-y-4">
          {block.options.map((option, i) => {
            let style =
              "border-ink/15 bg-cream-card text-ink hover:border-clay hover:bg-clay/5";
            if (answered) {
              if (option.tier === "best")
                style = "border-sage bg-sage/15 text-sage-dark";
              else if (option.tier === "safe")
                style = "border-sage/50 bg-sage/8 text-sage-dark";
              else if (i === selected)
                style = "border-alert bg-alert/12 text-alert";
              else style = "border-ink/10 bg-cream-card text-ink-faint";
            }
            return (
              <button
                key={i}
                type="button"
                disabled={answered}
                onClick={() => setSelected(i)}
                className={`w-full rounded-2xl border-2 px-6 py-5 text-left text-xl font-semibold leading-snug transition-colors ${style}`}
              >
                {option.text}
              </button>
            );
          })}
        </div>

        {answered && (
          <div
            className={`mt-8 animate-pop-in rounded-3xl p-6 ${
              chosen.tier === "unsafe" ? "bg-alert/12" : "bg-sage/15"
            }`}
          >
            <p
              className={`font-sans text-2xl font-bold ${
                chosen.tier === "unsafe" ? "text-alert" : "text-sage-dark"
              }`}
            >
              {chosen.tier === "best"
                ? "Excellent!"
                : chosen.tier === "safe"
                ? "That's a safe choice"
                : "Let's review this one"}
            </p>
            <p className="mt-3 text-xl leading-relaxed text-ink-soft">
              {chosen.feedback}
            </p>

            {chosen.tier === "unsafe" && (
              <p className="mt-4 text-xl leading-relaxed text-ink-soft">
                It's worth replaying this lesson or reviewing the flashcards
                before moving on. Nothing is lost — you still finished.
              </p>
            )}

            {block.spotted?.length > 0 && chosen.tier !== "unsafe" && (
              <div className="mt-5">
                <p className="text-base font-bold uppercase tracking-wide text-ink-faint">
                  Warning signs you spotted
                </p>
                <ul className="mt-2 space-y-1.5">
                  {block.spotted.map((s) => (
                    <li key={s} className="text-lg text-ink">
                      ✅ {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </BlockShell>
  );
}
