import { useState } from "react";
import { ArrowLeftIcon } from "../Icons";
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
  const [seen, setSeen] = useState(() => new Set([0]));

  const card = cards[index];
  const allSeen = seen.size >= cards.length;

  const go = (next) => {
    setIndex(next);
    setFlipped(false);
    setSeen((prev) => new Set(prev).add(next));
  };

  return (
    <BlockShell
      label={block.title || "Flashcards"}
      progress={progress}
      progressTotal={progressTotal}
      onBack={onBack}
      footer={
        <button
          className="btn-primary"
          onClick={onContinue}
          disabled={!allSeen}
        >
          {allSeen ? "Continue" : `View all cards (${seen.size}/${cards.length})`}
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
