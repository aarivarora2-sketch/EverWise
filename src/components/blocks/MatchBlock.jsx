import { useMemo, useState } from "react";
import { shuffle } from "../../utils/shuffle";
import BlockShell from "./BlockShell";

export default function MatchBlock({
  block,
  progress,
  progressTotal,
  onContinue,
  onBack,
}) {
  const pairs = block.pairs || [];
  const definitions = useMemo(
    () => shuffle(pairs.map((p) => p.match)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [block]
  );

  const [selectedWord, setSelectedWord] = useState(null);
  const [matched, setMatched] = useState(() => new Set()); // matched word strings
  const [wrongDef, setWrongDef] = useState(null);

  const allDone = matched.size === pairs.length;

  const pickWord = (word) => {
    if (matched.has(word)) return;
    setSelectedWord(word);
    setWrongDef(null);
  };

  const pickDef = (def) => {
    if (!selectedWord) return;
    const pair = pairs.find((p) => p.word === selectedWord);
    if (!pair) return;
    if (pair.match === def) {
      setMatched((prev) => new Set(prev).add(selectedWord));
      setSelectedWord(null);
      setWrongDef(null);
    } else {
      setWrongDef(def);
    }
  };

  const isDefMatched = (def) =>
    pairs.some((p) => matched.has(p.word) && p.match === def);

  return (
    <BlockShell
      label={block.title || "Match"}
      progress={progress}
      progressTotal={progressTotal}
      onBack={onBack}
      footer={
        allDone ? (
          <button className="btn-primary" onClick={onContinue}>
            Continue
          </button>
        ) : (
          <p className="text-center text-lg text-ink-soft">
            Tap a word, then tap its matching definition.
          </p>
        )
      }
    >
      <h1 className="font-serif text-3xl font-semibold leading-tight text-ink">
        {block.title || "Match the Word"}
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <p className="text-base font-bold uppercase tracking-wide text-ink-faint">
            Words
          </p>
          {pairs.map((p) => {
            const locked = matched.has(p.word);
            const active = selectedWord === p.word;
            return (
              <button
                key={p.word}
                type="button"
                disabled={locked}
                onClick={() => pickWord(p.word)}
                className={`w-full rounded-2xl border-2 px-3 py-4 text-left text-lg font-semibold ${
                  locked
                    ? "border-sage bg-sage/15 text-sage-dark"
                    : active
                    ? "border-clay bg-clay/10 text-ink"
                    : "border-ink/15 bg-cream-card text-ink"
                }`}
              >
                {p.word}
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <p className="text-base font-bold uppercase tracking-wide text-ink-faint">
            Meanings
          </p>
          {definitions.map((def) => {
            const locked = isDefMatched(def);
            const wrong = wrongDef === def;
            return (
              <button
                key={def}
                type="button"
                disabled={locked || !selectedWord}
                onClick={() => pickDef(def)}
                className={`w-full rounded-2xl border-2 px-3 py-4 text-left text-lg font-semibold leading-snug ${
                  locked
                    ? "border-sage bg-sage/15 text-sage-dark"
                    : wrong
                    ? "border-alert bg-alert/12 text-alert"
                    : "border-ink/15 bg-cream-card text-ink disabled:opacity-50"
                }`}
              >
                {def}
              </button>
            );
          })}
        </div>
      </div>
    </BlockShell>
  );
}
