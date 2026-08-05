import { useState } from "react";
import ReadAloud from "../ReadAloud";
import BlockShell from "./BlockShell";
import { CheckIcon, StarIcon } from "../Icons";

// Quiz where answers are graded rather than simply right/wrong:
//   tier: "best"   ⭐ strongest protection
//   tier: "safe"   ✅ reasonable and cautious
//   tier: "unsafe" ❌ misses the warning signs
// Choosing "safe" is praised, not punished — it just explains why another
// option protects a little better.
export function TieredChoiceBody({
  title,
  scenario,
  question,
  options,
  selected,
  onSelect,
}) {
  const answered = selected != null;
  const chosen = answered ? options[selected] : null;
  const bestIndex = options.findIndex((o) => o.tier === "best");

  const speakText = [
    scenario,
    question,
    "Options:",
    options.map((o) => o.text).join(". "),
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <>
      {title && (
        <p className="text-lg font-bold uppercase tracking-wide text-ink-faint">
          {title}
        </p>
      )}

      {scenario && (
        <div className="mt-3 rounded-3xl bg-cream-card px-6 py-5 shadow-card">
          <p className="text-xl leading-relaxed text-ink">{scenario}</p>
        </div>
      )}

      <h1 className="page-title mt-5">
        {question}
      </h1>

      <div className="mt-4">
        <ReadAloud text={speakText} label="Read this aloud" />
      </div>

      <div className="mt-7 space-y-4">
        {options.map((option, i) => {
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
              onClick={() => onSelect(i)}
              className={`w-full rounded-2xl border-2 px-6 py-5 text-left text-xl font-semibold leading-snug transition-colors ${style}`}
            >
              {answered && option.tier === "best" && (
                <span className="mr-2" aria-hidden="true">
                  ⭐
                </span>
              )}
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
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-cream-card ${
                chosen.tier === "unsafe" ? "bg-alert" : "bg-sage"
              }`}
            >
              {chosen.tier === "unsafe" ? (
                <span className="font-sans text-2xl font-bold">!</span>
              ) : chosen.tier === "best" ? (
                <StarIcon className="h-7 w-7" />
              ) : (
                <CheckIcon className="h-8 w-8" />
              )}
            </div>
            <p
              className={`font-sans text-2xl font-bold ${
                chosen.tier === "unsafe" ? "text-alert" : "text-sage-dark"
              }`}
            >
              {chosen.tier === "best"
                ? "Best choice!"
                : chosen.tier === "safe"
                ? "That's a safe choice"
                : "Let's look again"}
            </p>
          </div>

          <p className="mt-3 text-xl leading-relaxed text-ink-soft">
            {chosen.feedback}
          </p>

          {chosen.tier !== "best" && bestIndex >= 0 && (
            <p className="mt-4 text-xl leading-relaxed text-ink-soft">
              <span className="font-semibold text-ink">
                The strongest first step:
              </span>{" "}
              {options[bestIndex].text}
            </p>
          )}
        </div>
      )}
    </>
  );
}

export default function TieredChoiceBlock({
  block,
  progress,
  progressTotal,
  onContinue,
  onBack,
  onExit,
}) {
  const [selected, setSelected] = useState(null);

  return (
    <BlockShell
      label={block.label || "Practice"}
      progress={progress}
      progressTotal={progressTotal}
      onBack={onBack}
      onExit={onExit}
      footer={
        selected != null ? (
          <button className="btn-primary" onClick={onContinue}>
            Continue
          </button>
        ) : null
      }
    >
      <TieredChoiceBody
        title={block.title}
        scenario={block.scenario}
        question={block.question}
        options={block.options}
        selected={selected}
        onSelect={setSelected}
      />
    </BlockShell>
  );
}
