import { lessonsByOrder as lessons } from "../data/lessons";
import {
  CheckIcon,
  LockIcon,
  FlameIcon,
  StarIcon,
  TrophyIcon,
  ArrowLeftIcon,
} from "../components/Icons";

// Layout constants for the winding trail.
const TOP_PAD = 44;
const GAP = 158; // vertical distance between node centers
const NODE_HALF = 56; // half of a standard 112px node
const AMP = 17; // how far nodes swing left/right of center (%)

// Nodes gently swing side to side to form the calmed-down "snake".
function xPercent(i) {
  return 50 + (i % 2 === 0 ? AMP : -AMP);
}
function centerY(i) {
  return TOP_PAD + i * GAP + NODE_HALF;
}

export default function LessonPath({
  completedLessons = [],
  streak,
  scamsCaught,
  onSelectLesson,
  onBack,
}) {
  const doneSet = new Set(completedLessons);
  // The current lesson is the first one that isn't done yet (-1 = all done).
  const currentIndex = lessons.findIndex((l) => !doneSet.has(l.id));

  // Path nodes: every lesson, plus a final reward node at the end.
  const nodes = [
    ...lessons.map((lesson, i) => ({
      kind: "lesson",
      title: lesson.title,
      index: i,
    })),
    { kind: "reward", title: "All done", index: lessons.length },
  ];

  const containerHeight = TOP_PAD + nodes.length * GAP + 40;

  // Dotted "footprint" trail connecting consecutive nodes.
  const dots = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const x1 = xPercent(i);
    const y1 = centerY(i);
    const x2 = xPercent(i + 1);
    const y2 = centerY(i + 1);
    for (const t of [0.22, 0.4, 0.58, 0.76]) {
      dots.push({
        key: `${i}-${t}`,
        x: x1 + (x2 - x1) * t,
        y: y1 + (y2 - y1) * t,
      });
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header banner */}
      <header className="flex items-center justify-between rounded-t-none bg-sage px-5 py-4 text-cream-card sm:rounded-t-[40px]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to home"
            className="rounded-full p-1.5 text-cream-card/90 transition-colors hover:bg-white/15"
          >
            <ArrowLeftIcon className="h-7 w-7" />
          </button>
          <h1 className="font-serif text-2xl font-semibold">Your path</h1>
        </div>
        <div className="flex items-center gap-4 text-lg font-semibold">
          <span className="flex items-center gap-1.5">
            <FlameIcon className="h-6 w-6" /> {streak}
          </span>
          <span className="flex items-center gap-1.5">
            <StarIcon className="h-6 w-6" /> {scamsCaught}
          </span>
        </div>
      </header>

      {/* Winding trail */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="relative mx-auto w-full" style={{ height: containerHeight }}>
          {/* dotted trail */}
          {dots.map((d) => (
            <span
              key={d.key}
              aria-hidden="true"
              className="absolute h-3.5 w-4 rounded-full bg-ink/10"
              style={{
                left: `${d.x}%`,
                top: d.y,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}

          {/* nodes */}
          {nodes.map((node, i) => {
            const state =
              node.kind === "reward"
                ? currentIndex === -1
                  ? "reward-done"
                  : "locked"
                : doneSet.has(lessons[i].id)
                ? "done"
                : i === currentIndex
                ? "current"
                : "locked";

            return (
              <div
                key={i}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${xPercent(i)}%`,
                  top: TOP_PAD + i * GAP,
                  transform: "translateX(-50%)",
                }}
              >
                <PathNode
                  state={state}
                  onClick={
                    // Current and already-completed lessons are both playable.
                    state === "current" || state === "done"
                      ? () => onSelectLesson(node.index)
                      : undefined
                  }
                  title={node.title}
                />
                <Label state={state} title={node.title} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PathNode({ state, onClick, title }) {
  if (state === "current") {
    return (
      <div className="relative">
        <span className="absolute inset-0 rounded-full bg-clay/40 animate-pulse-ring" />
        <button
          type="button"
          onClick={onClick}
          aria-label={`Start lesson: ${title}`}
          className="relative flex h-32 w-32 items-center justify-center rounded-full bg-clay font-serif text-2xl font-bold text-cream-card shadow-node-clay transition-transform active:translate-y-1 active:shadow-none"
        >
          START
        </button>
      </div>
    );
  }

  if (state === "done") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`Redo completed lesson: ${title}`}
        className="flex h-28 w-28 items-center justify-center rounded-full bg-sage text-cream-card shadow-node-sage transition-transform active:translate-y-1 active:shadow-none"
      >
        <CheckIcon className="h-12 w-12" />
      </button>
    );
  }

  if (state === "reward-done") {
    return (
      <div
        className="flex h-28 w-28 items-center justify-center rounded-full bg-sage text-cream-card shadow-node-sage"
        aria-label="Reward unlocked"
      >
        <TrophyIcon className="h-14 w-14" />
      </div>
    );
  }

  // locked
  return (
    <div
      className="flex h-28 w-28 items-center justify-center rounded-full bg-locked text-ink-faint shadow-node-locked"
      aria-label={`Locked: ${title}`}
    >
      <LockIcon className="h-11 w-11" />
    </div>
  );
}

function Label({ state, title }) {
  const color =
    state === "done" || state === "reward-done"
      ? "text-sage"
      : state === "current"
      ? "text-clay"
      : "text-ink-faint";
  return (
    <p
      className={`mt-3 max-w-[9rem] text-center text-lg font-semibold leading-tight ${color}`}
    >
      {title}
      {state === "current" && (
        <span className="mt-0.5 block text-sm font-bold uppercase tracking-wide text-clay/80">
          Today
        </span>
      )}
    </p>
  );
}
