import { useState } from "react";
import BlockRenderer from "../components/blocks/BlockRenderer";
import { BookIcon } from "../components/Icons";

// Ungraded phase review: play each block in order, then a simple complete screen.
export default function ChallengePlayer({ challenge, onBack, onComplete }) {
  const [blockIndex, setBlockIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const blocks = challenge.blocks || [];
  const total = blocks.length;
  const progress = finished ? total : blockIndex + 1;

  const advance = () => {
    if (blockIndex + 1 < blocks.length) {
      setBlockIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    return (
      <div className="flex flex-1 flex-col items-center px-7 pb-10 pt-8 text-center">
        <div className="mt-10 animate-pop-in flex h-28 w-28 items-center justify-center rounded-full bg-clay text-cream-card shadow-btn">
          <BookIcon className="h-14 w-14" />
        </div>
        <h1 className="mt-8 font-serif text-5xl font-semibold text-ink">
          Review complete
        </h1>
        <p className="mt-4 text-2xl text-ink-soft">
          Nice work refreshing Phase {challenge.phase}. You're ready for the
          exam when you are.
        </p>
        <div className="mt-auto w-full pt-10">
          <button className="btn-primary" onClick={onComplete}>
            Back to your path
          </button>
        </div>
      </div>
    );
  }

  return (
    <BlockRenderer
      key={`challenge-block-${blockIndex}`}
      block={blocks[blockIndex]}
      progress={progress}
      progressTotal={total}
      onContinue={advance}
      onBack={onBack}
    />
  );
}
