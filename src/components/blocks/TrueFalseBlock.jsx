import { useState } from "react";
import ReadAloud from "../ReadAloud";
import { CheckIcon } from "../Icons";
import BlockShell from "./BlockShell";

export default function TrueFalseBlock({
  block,
  progress,
  progressTotal,
  onContinue,
  onBack,
}) {
  const questions = block.questions || [];
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null); // true | false | null

  const q = questions[qIndex];
  const answered = selected != null;
  const isCorrect = answered && selected === q.answer;

  const choose = (value) => {
    if (answered) return;
    setSelected(value);
  };

  const next = () => {
    if (qIndex + 1 < questions.length) {
      setQIndex((i) => i + 1);
      setSelected(null);
    } else {
      onContinue();
    }
  };

  return (
    <BlockShell
      label={block.title || "True or False"}
      progress={progress}
      progressTotal={progressTotal}
      onBack={onBack}
      footer={
        answered ? (
          <button className="btn-primary" onClick={next}>
            {qIndex + 1 < questions.length ? "Next" : "Continue"}
          </button>
        ) : null
      }
    >
      <p className="text-lg font-semibold text-ink-faint">
        Question {qIndex + 1} of {questions.length}
      </p>
      <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-ink">
        {q.text}
      </h1>
      <div className="mt-5">
        <ReadAloud text={q.text} />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        {[true, false].map((value) => {
          const label = value ? "True" : "False";
          let style =
            "border-ink/15 bg-cream-card text-ink hover:border-clay hover:bg-clay/5";
          if (answered) {
            if (value === q.answer) style = "border-sage bg-sage/15 text-sage-dark";
            else if (value === selected)
              style = "border-alert bg-alert/12 text-alert";
            else style = "border-ink/10 bg-cream-card text-ink-faint";
          }
          return (
            <button
              key={label}
              type="button"
              disabled={answered}
              onClick={() => choose(value)}
              className={`rounded-2xl border-2 px-6 py-8 text-center text-2xl font-bold ${style}`}
            >
              {label}
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
          {q.explanation && (
            <p className="mt-3 text-xl leading-relaxed text-ink-soft">
              {q.explanation}
            </p>
          )}
        </div>
      )}
    </BlockShell>
  );
}
