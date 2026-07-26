import { useMemo, useState } from "react";
import { shuffle } from "../../utils/shuffle";
import BlockShell from "./BlockShell";
import { TieredChoiceBody } from "./TieredChoiceBlock";

// Asks how confident the learner feels. "I'd like more practice" launches
// extra questions instead of failing them, then asks again. If they still
// want practice, questions reshuffle and repeat — a score is never shown.
export default function ConfidenceBlock({
  block,
  progress,
  progressTotal,
  onContinue,
  onBack,
}) {
  const [mode, setMode] = useState("ask"); // ask | practice
  const [round, setRound] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);

  const pool = block.practice || [];
  // Reshuffle every round so repeats never feel identical.
  const questions = useMemo(
    () => shuffle(pool),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round, block]
  );

  const startPractice = () => {
    if (pool.length === 0) {
      onContinue();
      return;
    }
    setMode("practice");
    setQIndex(0);
    setSelected(null);
  };

  const nextQuestion = () => {
    if (qIndex + 1 < questions.length) {
      setQIndex((i) => i + 1);
      setSelected(null);
    } else {
      // Round finished — ask how they feel again.
      setMode("ask");
      setRound((r) => r + 1);
      setSelected(null);
    }
  };

  if (mode === "practice") {
    const q = questions[qIndex];
    return (
      <BlockShell
        key={`practice-${round}-${qIndex}`}
        label="More practice"
        progress={progress}
        progressTotal={progressTotal}
        onBack={onBack}
        footer={
          selected != null ? (
            <button className="btn-primary" onClick={nextQuestion}>
              {qIndex + 1 < questions.length ? "Next" : "Done practicing"}
            </button>
          ) : null
        }
      >
        <p className="text-lg font-semibold text-ink-faint">
          Practice {qIndex + 1} of {questions.length}
        </p>
        <TieredChoiceBody
          scenario={q.scenario}
          question={q.question}
          options={q.options}
          selected={selected}
          onSelect={setSelected}
        />
      </BlockShell>
    );
  }

  return (
    <BlockShell
      label="Check in"
      progress={progress}
      progressTotal={progressTotal}
      onBack={onBack}
    >
      <div className="animate-fade-up">
        <h1 className="font-serif text-3xl font-semibold leading-tight text-ink">
          {block.question || "How confident do you feel?"}
        </h1>

        {round > 0 && (
          <p className="mt-4 text-xl leading-relaxed text-ink-soft">
            Nice work. There's no score here and no wrong answer — practice as
            much as you'd like.
          </p>
        )}

        <div className="mt-8 space-y-4">
          <button
            type="button"
            onClick={onContinue}
            className="w-full rounded-2xl border-2 border-sage bg-sage/15 px-6 py-6 text-left text-2xl font-semibold text-sage-dark transition-colors hover:bg-sage/25"
          >
            <span className="mr-3" aria-hidden="true">
              😊
            </span>
            Very confident
          </button>

          <button
            type="button"
            onClick={onContinue}
            className="w-full rounded-2xl border-2 border-sage/50 bg-cream-card px-6 py-6 text-left text-2xl font-semibold text-ink transition-colors hover:bg-sage/10"
          >
            <span className="mr-3" aria-hidden="true">
              🙂
            </span>
            Mostly confident
          </button>

          <button
            type="button"
            onClick={startPractice}
            className="w-full rounded-2xl border-2 border-clay/40 bg-cream-card px-6 py-6 text-left text-2xl font-semibold text-clay transition-colors hover:bg-clay/10"
          >
            <span className="mr-3" aria-hidden="true">
              🤔
            </span>
            I'd like more practice
          </button>
        </div>
      </div>
    </BlockShell>
  );
}
