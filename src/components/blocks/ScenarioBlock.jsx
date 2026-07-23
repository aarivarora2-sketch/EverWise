import { useState } from "react";
import ReadAloud from "../ReadAloud";
import { CheckIcon } from "../Icons";
import BlockShell from "./BlockShell";

// Shared multiple-choice UI used by scenario, choice, and quiz questions.
export function MultipleChoiceBody({
  title,
  text,
  options,
  correctIndex,
  explanation,
  selected,
  onSelect,
}) {
  const answered = selected != null;
  const isCorrect = answered && selected === correctIndex;

  return (
    <>
      {title && (
        <p className="text-lg font-bold uppercase tracking-wide text-ink-faint">
          {title}
        </p>
      )}
      <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight text-ink">
        {text}
      </h1>
      <div className="mt-5">
        <ReadAloud text={text} label="Read this aloud" />
      </div>

      <div className="mt-8 space-y-4">
        {options.map((option, i) => {
          let style =
            "border-ink/15 bg-cream-card text-ink hover:border-clay hover:bg-clay/5";
          if (answered) {
            if (i === correctIndex) style = "border-sage bg-sage/15 text-sage-dark";
            else if (i === selected) style = "border-alert bg-alert/12 text-alert";
            else style = "border-ink/10 bg-cream-card text-ink-faint";
          }
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => onSelect(i)}
              className={`w-full rounded-2xl border-2 px-6 py-6 text-left text-2xl font-semibold transition-colors ${style}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          className={`mt-8 animate-pop-in rounded-3xl p-6 ${
            isCorrect ? "bg-sage/15" : "bg-alert/12"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-cream-card ${
                isCorrect ? "bg-sage" : "bg-alert"
              }`}
            >
              {isCorrect ? (
                <CheckIcon className="h-8 w-8" />
              ) : (
                <span className="font-serif text-2xl font-bold">!</span>
              )}
            </div>
            <p
              className={`font-serif text-2xl font-bold ${
                isCorrect ? "text-sage-dark" : "text-alert"
              }`}
            >
              {isCorrect ? "That's right" : "Good to know"}
            </p>
          </div>
          {explanation && (
            <p className="mt-3 text-xl leading-relaxed text-ink-soft">
              {explanation}
            </p>
          )}
        </div>
      )}
    </>
  );
}

export default function ScenarioBlock({
  block,
  progress,
  progressTotal,
  onContinue,
  onBack,
}) {
  const [selected, setSelected] = useState(null);

  return (
    <BlockShell
      label={block.title || "Scenario"}
      progress={progress}
      progressTotal={progressTotal}
      onBack={onBack}
      footer={
        selected != null ? (
          <button className="btn-primary" onClick={onContinue}>
            Continue
          </button>
        ) : null
      }
    >
      <MultipleChoiceBody
        title={block.title}
        text={block.text}
        options={block.options}
        correctIndex={block.correctIndex}
        explanation={block.explanation}
        selected={selected}
        onSelect={setSelected}
      />
    </BlockShell>
  );
}
