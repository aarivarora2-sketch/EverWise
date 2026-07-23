import { useMemo, useState } from "react";
import { shuffle } from "../../utils/shuffle";
import BlockShell from "./BlockShell";

export default function SortBlock({
  block,
  progress,
  progressTotal,
  onContinue,
  onBack,
}) {
  const categories = block.categories || [];
  const allItems = useMemo(
    () =>
      shuffle(
        categories.flatMap((cat) =>
          cat.items.map((item) => ({ item, correctLabel: cat.label }))
        )
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [block]
  );

  const [selectedItem, setSelectedItem] = useState(null);
  // item text -> category label placed into
  const [placements, setPlacements] = useState({});

  const remaining = allItems.filter((x) => !placements[x.item]);
  const allPlaced = remaining.length === 0;

  const placeInto = (label) => {
    if (!selectedItem) return;
    setPlacements((prev) => ({ ...prev, [selectedItem]: label }));
    setSelectedItem(null);
  };

  const isCorrect = (item, label) => {
    const meta = allItems.find((x) => x.item === item);
    return meta?.correctLabel === label;
  };

  return (
    <BlockShell
      label={block.title || "Sort"}
      progress={progress}
      progressTotal={progressTotal}
      onBack={onBack}
      footer={
        allPlaced ? (
          <button className="btn-primary" onClick={onContinue}>
            Continue
          </button>
        ) : (
          <p className="text-center text-lg text-ink-soft">
            {block.prompt ||
              "Tap an item, then tap the category it belongs in."}
          </p>
        )
      }
    >
      <h1 className="font-serif text-3xl font-semibold leading-tight text-ink">
        {block.title || "Sort"}
      </h1>
      {block.prompt && (
        <p className="mt-3 text-xl text-ink-soft">{block.prompt}</p>
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
            <button
              key={cat.label}
              type="button"
              onClick={() => placeInto(cat.label)}
              disabled={!selectedItem}
              className="w-full rounded-3xl border-2 border-dashed border-ink/20 bg-cream-card p-5 text-left disabled:opacity-70"
            >
              <p className="font-serif text-2xl font-semibold text-ink">
                {cat.label}
              </p>
              <div className="mt-3 flex min-h-[2.5rem] flex-wrap gap-2">
                {placed.length === 0 ? (
                  <p className="text-lg text-ink-faint">
                    {selectedItem ? "Tap to place here" : "Empty"}
                  </p>
                ) : (
                  placed.map((item) => (
                    <span
                      key={item}
                      className={`rounded-xl px-3 py-2 text-base font-semibold ${
                        isCorrect(item, cat.label)
                          ? "bg-sage/20 text-sage-dark"
                          : "bg-alert/15 text-alert"
                      }`}
                    >
                      {item}
                    </span>
                  ))
                )}
              </div>
            </button>
          );
        })}
      </div>
    </BlockShell>
  );
}
