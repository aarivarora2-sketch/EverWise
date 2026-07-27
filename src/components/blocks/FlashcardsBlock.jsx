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
        className="mt-6 flex min-h-[220px] w-full flex-col items-center justify-center rounded-3xl bg-cream-card px-6 py-10 text-center shadow-card transition-transform active:scale-[0.99]"
      >
        <p className="text-base font-bold uppercase tracking-wide text-ink-faint">
          {flipped ? "Back" : "Front"} · tap to flip
        </p>
        <p className="mt-4 font-serif text-3xl font-semibold leading-snug text-ink">
          {flipped ? card.back : card.front}
        </p>
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
