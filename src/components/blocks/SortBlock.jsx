import { useMemo, useState } from "react";
import { shuffle } from "../../utils/shuffle";
import ReadAloud from "../ReadAloud";
import BlockShell from "./BlockShell";

export default function SortBlock({
  block,
  progress,
  progressTotal,
  onContinue,
  onBack,
}) {
  const categories = block.categories || [];
  // Items may be plain strings or { text, why } so authors can explain the
  // reasoning behind a placement without changing every existing lesson.
  const allItems = useMemo(
    () =>
      shuffle(
        categories.flatMap((cat) =>
          cat.items.map((entry) => ({
            item: typeof entry === "string" ? entry : entry.text,
            why: typeof entry === "string" ? null : entry.why,
            correctLabel: cat.label,
          }))
        )
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [block]
  );

  const [selectedItem, setSelectedItem] = useState(null);
  // item text -> category label placed into
  const [placements, setPlacements] = useState({});
  // The misplaced item currently being explained.
  const [explaining, setExplaining] = useState(null);

  const remaining = allItems.filter((x) => !placements[x.item]);
  const allPlaced = remaining.length === 0;

  const isCorrect = (item, label) => {
    const meta = allItems.find((x) => x.item === item);
    return meta?.correctLabel === label;
  };

  const wrongCount = Object.entries(placements).filter(
    ([item, label]) => !isCorrect(item, label)
  ).length;
  const allCorrect = allPlaced && wrongCount === 0;

  const placeInto = (label) => {
    if (!selectedItem) return;
    setPlacements((prev) => ({ ...prev, [selectedItem]: label }));
    setSelectedItem(null);
    // A wrong drop explains itself right away.
    if (!isCorrect(selectedItem, label)) {
      setExplaining(selectedItem);
    } else {
      setExplaining(null);
    }
  };

  // Tapping a misplaced item sends it back to the pool to try again.
  const takeBack = (item) => {
    setPlacements((prev) => {
      const next = { ...prev };
      delete next[item];
      return next;
    });
    setSelectedItem(item);
    setExplaining(null);
  };

  const explainMeta = explaining
    ? allItems.find((x) => x.item === explaining)
    : null;
  const explainWrongLabel = explaining ? placements[explaining] : null;

  let footer;
  if (allCorrect) {
    footer = (
      <button className="btn-primary" onClick={onContinue}>
        Continue
      </button>
    );
  } else if (allPlaced) {
    footer = (
      <p className="text-center text-lg font-semibold leading-snug text-alert">
        {wrongCount === 1
          ? "1 item is in the wrong box. Tap it to move it."
          : `${wrongCount} items are in the wrong box. Tap one to move it.`}
      </p>
    );
  } else {
    footer = (
      <p className="text-center text-lg text-ink-soft">
        {block.prompt || "Tap an item, then tap the category it belongs in."}
      </p>
    );
  }

  return (
    <BlockShell
      label={block.title || "Sort"}
      progress={progress}
      progressTotal={progressTotal}
      onBack={onBack}
      onSkip={onContinue}
      footer={footer}
    >
      <h1 className="font-serif text-3xl font-semibold leading-tight text-ink">
        {block.title || "Sort"}
      </h1>
      {block.prompt && (
        <p className="mt-3 text-xl text-ink-soft">{block.prompt}</p>
      )}

      <div className="mt-5">
        <ReadAloud
          text={[
            block.prompt || "Tap an item, then tap the category it belongs in.",
            "Items:",
            allItems.map((x) => x.item).join(", "),
            "Categories:",
            categories.map((c) => c.label).join(", "),
          ].join(". ")}
        />
      </div>

      {explainMeta && (
        <div
          className="mt-6 animate-pop-in rounded-3xl bg-alert/12 p-6"
          role="status"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-alert text-cream-card">
              <span className="font-serif text-2xl font-bold">!</span>
            </div>
            <p className="font-serif text-2xl font-bold leading-snug text-alert">
              Not quite
            </p>
          </div>
          <p className="mt-3 text-xl leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">
              &ldquo;{explainMeta.item}&rdquo;
            </span>{" "}
            {explainMeta.why ? (
              <>
                {explainMeta.why} It belongs in{" "}
                <span className="font-semibold text-ink">
                  {explainMeta.correctLabel}
                </span>
                , not{" "}
                <span className="font-semibold text-ink">
                  {explainWrongLabel}
                </span>
                .
              </>
            ) : (
              <>
                belongs in{" "}
                <span className="font-semibold text-ink">
                  {explainMeta.correctLabel}
                </span>
                , not{" "}
                <span className="font-semibold text-ink">
                  {explainWrongLabel}
                </span>
                .
              </>
            )}
          </p>
          <button
            type="button"
            onClick={() => takeBack(explainMeta.item)}
            className="btn-secondary mt-5"
          >
            Try again
          </button>
        </div>
      )}

      {/* Unplaced items */}
      {remaining.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {remaining.map(({ item }) => (
            <button
              key={item}
              type="button"
              onClick={() => setSelectedItem(item)}
              className={`rounded-2xl border-2 px-4 py-3 text-lg font-semibold ${
                selectedItem === item
                  ? "border-clay bg-clay/10 text-ink"
                  : "border-ink/15 bg-cream-card text-ink"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* Categories */}
      <div className="mt-8 space-y-4">
        {categories.map((cat) => {
          const placed = Object.entries(placements)
            .filter(([, label]) => label === cat.label)
            .map(([item]) => item);
          return (
            <div
              key={cat.label}
              className="w-full rounded-3xl border-2 border-dashed border-ink/20 bg-cream-card p-5"
            >
              <button
                type="button"
                onClick={() => placeInto(cat.label)}
                disabled={!selectedItem}
                aria-label={`Place ${selectedItem || "item"} in ${cat.label}`}
                className="w-full text-left disabled:cursor-default"
              >
                <p className="font-serif text-2xl font-semibold text-ink">
                  {cat.label}
                </p>
                {placed.length === 0 && (
                  <p className="mt-3 min-h-[2.5rem] text-lg text-ink-faint">
                    {selectedItem ? "Tap to place here" : "Empty"}
                  </p>
                )}
                {placed.length > 0 && selectedItem && (
                  <p className="mt-3 text-lg font-semibold text-clay">
                    Tap to place here
                  </p>
                )}
              </button>

              {placed.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {placed.map((item) => {
                    const right = isCorrect(item, cat.label);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          right ? takeBack(item) : setExplaining(item)
                        }
                        aria-label={
                          right
                            ? `${item}, correct. Tap to move it.`
                            : `${item}, wrong box. Tap to see why.`
                        }
                        className={`rounded-xl px-3 py-2 text-base font-semibold transition-transform active:translate-y-0.5 ${
                          right
                            ? "bg-sage/20 text-sage-dark"
                            : "border-2 border-alert/40 bg-alert/15 text-alert"
                        }`}
                      >
                        {item}
                        {!right && <span aria-hidden="true"> ✕</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </BlockShell>
  );
}
