import { useState } from "react";
import BlockShell from "../components/blocks/BlockShell";
import { TrophyIcon } from "../components/Icons";

function pickTier(results, score) {
  const sorted = [...(results || [])].sort((a, b) => b.minScore - a.minScore);
  return sorted.find((t) => score >= t.minScore) || null;
}

export default function ExamPlayer({ exam, onBack, onPass, phaseColor }) {
  const [phase, setPhase] = useState("intro"); // intro | quiz | results
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);

  const total = exam.totalQuestions || exam.questions.length;
  const accent = phaseColor || "#4A6FA5";
  const tier = pickTier(exam.results, score);
  const passed = score >= (exam.passingScore ?? 0);

  const restart = () => {
    setPhase("intro");
    setQIndex(0);
    setSelected(null);
    setScore(0);
  };

  if (phase === "intro") {
    return (
      <div className="flex flex-1 flex-col px-7 pb-10 pt-8">
        <button
          type="button"
          onClick={onBack}
          className="-ml-2 self-start rounded-full px-3 py-2 text-lg font-semibold text-ink-soft"
        >
          ← Back
        </button>

        <div
          className="mx-auto mt-4 flex h-24 w-24 items-center justify-center rounded-full text-cream-card"
          style={{ backgroundColor: accent }}
        >
          <TrophyIcon className="h-12 w-12" />
        </div>

        <h1 className="mt-6 text-center font-serif text-4xl font-semibold leading-tight text-ink">
          {exam.title}
        </h1>
        <p className="mt-4 text-center text-xl text-ink-soft">
          Pass with {exam.passingScore} of {total} correct.
        </p>

        <div className="mt-8">
          <p className="text-lg font-bold uppercase tracking-wide text-ink-faint">
            Topics covered
          </p>
          <ul className="mt-3 space-y-3">
            {exam.topics.map((topic) => (
              <li
                key={topic}
                className="flex gap-3 text-xl leading-snug text-ink"
              >
                <span
                  className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: accent }}
                  aria-hidden="true"
                />
                <span>{topic}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto pt-10">
          <button
            className="btn-primary"
            style={{ backgroundColor: accent }}
            onClick={() => setPhase("quiz")}
          >
            Start exam
          </button>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    return (
      <div className="flex flex-1 flex-col px-7 pb-10 pt-8 text-center">
        <div className="mx-auto mt-6 animate-pop-in">
          <div
            className={`flex h-32 w-32 items-center justify-center rounded-full text-cream-card ${
              tier?.trophy ? "" : "bg-sage shadow-node-sage"
            }`}
            style={
              tier?.trophy
                ? {
                    backgroundColor: accent,
                    boxShadow: `0 7px 0 ${accent}99`,
                  }
                : undefined
            }
          >
            <TrophyIcon className="h-16 w-16" />
          </div>
        </div>

        <h1 className="mt-8 font-serif text-5xl font-semibold text-ink">
          {passed ? "Exam complete!" : "Keep practicing"}
        </h1>
        <p className="mt-4 text-2xl text-ink-soft">
          You scored {score} of {total}.
        </p>

        {tier ? (
          <div className="mt-8 rounded-3xl bg-cream-card px-6 py-6 text-left shadow-card">
            <p className="text-lg font-semibold uppercase tracking-wide text-ink-faint">
              {tier.trophy ? "Trophy earned" : "Result"}
            </p>
            <p className="mt-2 font-serif text-3xl font-semibold text-clay">
              {tier.title}
            </p>
            <p className="mt-3 font-serif text-4xl font-bold text-sage">
              +{tier.xp} XP
            </p>
          </div>
        ) : (
          <div className="mt-8 rounded-3xl bg-alert/12 px-6 py-6 text-left">
            <p className="font-serif text-2xl font-semibold text-alert">
              Not quite there yet
            </p>
            <p className="mt-2 text-xl text-ink-soft">
              You need {exam.passingScore} correct to pass. Review the topics
              and try again.
            </p>
          </div>
        )}

        <div className="mt-auto space-y-3 pt-10">
          {passed ? (
            <button
              className="btn-primary"
              onClick={() => onPass({ score, tier })}
            >
              Back to your path
            </button>
          ) : (
            <>
              <button className="btn-primary" onClick={restart}>
                Try again
              </button>
              <button className="btn-secondary" onClick={onBack}>
                Back to path
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Quiz phase — one question at a time, no explanations until the end.
  const q = exam.questions[qIndex];
  const progress = qIndex + 1;

  const choose = (i) => {
    if (selected != null) return;
    setSelected(i);
  };

  const next = () => {
    const correct = selected === q.correctIndex;
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);

    if (qIndex + 1 < exam.questions.length) {
      setQIndex((i) => i + 1);
      setSelected(null);
    } else {
      setPhase("results");
    }
  };

  return (
    <BlockShell
      key={`exam-q-${qIndex}`}
      label="Exam"
      progress={progress}
      progressTotal={total}
      onBack={onBack}
      footer={
        selected != null ? (
          <button className="btn-primary" onClick={next}>
            {qIndex + 1 < exam.questions.length ? "Next" : "See results"}
          </button>
        ) : null
      }
    >
      <p className="text-lg font-semibold text-ink-faint">
        Question {progress} of {total}
      </p>
      <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-ink">
        {q.question}
      </h1>

      <div className="mt-8 space-y-4">
        {q.options.map((option, i) => {
          const active = selected === i;
          return (
            <button
              key={i}
              type="button"
              disabled={selected != null}
              onClick={() => choose(i)}
              className={`w-full rounded-2xl border-2 px-6 py-6 text-left text-2xl font-semibold transition-colors ${
                active
                  ? "border-clay bg-clay/10 text-ink"
                  : "border-ink/15 bg-cream-card text-ink hover:border-clay hover:bg-clay/5"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </BlockShell>
  );
}
