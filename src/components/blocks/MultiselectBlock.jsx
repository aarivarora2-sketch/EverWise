import { useState } from "react";
import ReadAloud from "../ReadAloud";
import { CheckIcon } from "../Icons";
import BlockShell from "./BlockShell";

export default function MultiselectBlock({
  block,
  progress,
  progressTotal,
  onContinue,
  onBack,
}) {
  const [picked, setPicked] = useState(() => new Set());
  const [checked, setChecked] = useState(false);

  const fullyCorrect =
    checked &&
    block.options.every((opt, i) =>
      opt.correct ? picked.has(i) : !picked.has(i)
    );

  const resultMessage = fullyCorrect
    ? block.feedback
    : block.incorrectFeedback || block.feedback;

  const toggle = (i) => {
    if (checked) return;
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <BlockShell
      label={block.title || "Select"}
      progress={progress}
      progressTotal={progressTotal}
      onBack={onBack}
      footer={
        checked ? (
          <button className="btn-primary" onClick={onContinue}>
            Continue
          </button>
        ) : (
          <button
            className="btn-primary"
            onClick={() => setChecked(true)}
            disabled={picked.size === 0}
          >
            Check
          </button>
        )
      }
    >
      <h1 className="font-serif text-3xl font-semibold leading-tight text-ink">
        {block.prompt || block.title}
      </h1>
      <div className="mt-5">
        <ReadAloud text={block.prompt || block.title} />
      </div>

      <div className="mt-8 space-y-3">
        {block.options.map((opt, i) => {
          let style =
            "border-ink/15 bg-cream-card text-ink hover:border-clay hover:bg-clay/5";
          if (checked) {
            if (opt.correct) style = "border-sage bg-sage/15 text-sage-dark";
            else if (picked.has(i)) style = "border-alert bg-alert/12 text-alert";
            else style = "border-ink/10 bg-cream-card text-ink-faint";
          } else if (picked.has(i)) {
            style = "border-clay bg-clay/10 text-ink";
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              disabled={checked}
              aria-pressed={picked.has(i)}
              className={`flex w-full items-center gap-3 rounded-2xl border-2 px-5 py-5 text-left text-xl font-semibold transition-colors ${style}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 ${
                  picked.has(i) || (checked && opt.correct)
                    ? "border-transparent bg-clay text-cream-card"
                    : "border-ink/25"
                }`}
                aria-hidden="true"
              >
                {(picked.has(i) || (checked && opt.correct)) && (
                  <CheckIcon className="h-5 w-5" />
                )}
              </span>
              {opt.text}
            </button>
          );
        })}
      </div>

      {checked && resultMessage && (
        <p
          className={`mt-8 rounded-3xl px-5 py-5 text-xl leading-relaxed text-ink ${
            fullyCorrect ? "bg-sage/15" : "bg-alert/12"
          }`}
        >
          {resultMessage}
        </p>
      )}
    </BlockShell>
  );
}
