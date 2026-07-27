import { useState } from "react";
import { ArrowLeftIcon } from "../Icons";
import ReadAloud from "../ReadAloud";
import BlockShell from "./BlockShell";

export default function FlashcardsBlock({
  block,
  progress,
  progressTotal,
  onContinue,
  onBack,
}) {
  const cards = block.cards || [];
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];

  const go = (next) => {
    setIndex(next);
    setFlipped(false);
  };

  const continueFromCard = () => {
    if (index < cards.length - 1) {
      go(index + 1);
    } else {
      onContinue();
    }
  };

  return (
    <BlockShell
      label={block.title || "Flashcards"}
      progress={progress}
      progressTotal={progressTotal}
      onBack={onBack}
      onSkip={onContinue}
      footer={
        <button className="btn-primary" onClick={continueFromCard}>
          Continue
        </button>
      }
    >
      <p className="text-lg font-semibold text-ink-faint">
        Card {index + 1} of {cards.length}
      </p>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Show front of card" : "Show back of card"}
        aria-pressed={flipped}
        className="flashcard-button mt-6 w-full shrink-0 overflow-hidden rounded-3xl bg-cream-card text-center shadow-card"
      >
        <span
          key={index}
          className={`flashcard-stage grid w-full ${
            flipped ? "is-flipped" : ""
          }`}
        >
          <span
            aria-hidden={flipped}
            className="flashcard-face col-start-1 row-start-1 flex min-h-[220px] w-full flex-col items-center justify-center px-6 py-8"
          >
            <span className="text-base font-bold uppercase tracking-wide text-ink-faint">
              Front · tap to flip
            </span>
            <span className="flashcard-copy mt-4 w-full break-words font-sans text-2xl font-semibold leading-snug text-ink">
              {card.front}
            </span>
          </span>

          <span
            aria-hidden={!flipped}
            className="flashcard-face flashcard-back col-start-1 row-start-1 flex min-h-[220px] w-full flex-col items-center justify-center px-6 py-8"
          >
            <span className="text-base font-bold uppercase tracking-wide text-ink-faint">
              Back · tap to flip
            </span>
            <span className="flashcard-copy mt-4 w-full break-words font-sans text-2xl font-semibold leading-snug text-ink">
              {card.back}
            </span>
          </span>
        </span>
      </button>

      <div className="mt-6">
        <ReadAloud text={flipped ? card.back : card.front} />
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label="Previous card"
          className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-ink/15 bg-cream-card text-ink disabled:opacity-40"
        >
          <ArrowLeftIcon className="h-8 w-8" />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={index >= cards.length - 1}
          aria-label="Next card"
          className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-ink/15 bg-cream-card text-ink disabled:opacity-40"
        >
          <ArrowLeftIcon className="h-8 w-8 rotate-180" />
        </button>
      </div>
    </BlockShell>
  );
}
