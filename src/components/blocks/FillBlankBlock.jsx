import { useState } from "react";
import ReadAloud from "../ReadAloud";
import { CheckIcon } from "../Icons";
import BlockShell from "./BlockShell";

export default function FillBlankBlock({
  block,
  progress,
  progressTotal,
  onContinue,
  onBack,
}) {
  const questions = block.questions || [];
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const q = questions[qIndex];
  const isCorrect = selected === q.answer;
  const display = q.text.replace("______", selected ? selected : "______");

  const pick = (word) => {
    if (revealed) return;
    setSelected(word);
    setRevealed(true);
  };

  const next = () => {
    if (qIndex + 1 < questions.length) {
      setQIndex((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      onContinue();
    }
  };

  return (
    <BlockShell
      label={block.title || "Fill in the blank"}
      progress={progress}
      progressTotal={progressTotal}
      onBack={onBack}
      footer={
        revealed ? (
          <button className="btn-primary" onClick={next}>
            {qIndex + 1 < questions.length ? "Next" : "Continue"}
          </button>
        ) : null
      }
    >
      <p className="text-lg font-semibold text-ink-faint">
        Question {qIndex + 1} of {questions.length}
      </p>
      <h1 className="mt-3 font-serif text-3xl font-semibold leading-snug text-ink">
        {display}
      </h1>
      <div className="mt-5">
        <ReadAloud text={q.text.replace("______", "blank")} />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {block.wordBank.map((word) => {
          let style =
            "border-ink/15 bg-cream-card text-ink hover:border-clay hover:bg-clay/5";
          if (revealed) {
            if (word === q.answer) style = "border-sage bg-sage/15 text-sage-dark";
            else if (word === selected)
              style = "border-alert bg-alert/12 text-alert";
            else style = "border-ink/10 bg-cream-card text-ink-faint";
          }
          return (
            <button
              key={word}
              type="button"
              disabled={revealed}
              onClick={() => pick(word)}
              className={`rounded-2xl border-2 px-4 py-5 text-center text-xl font-semibold ${style}`}
            >
              {word}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div
          className={`mt-8 flex items-center gap-3 rounded-3xl p-5 ${
            isCorrect ? "bg-sage/15" : "bg-alert/12"
          }`}
        >
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
          <p className="text-xl font-semibold text-ink">
            {isCorrect ? "That's right." : `The answer is “${q.answer}”.`}
          </p>
        </div>
      )}
    </BlockShell>
  );
}
