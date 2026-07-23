import { lessonsByOrder as lessons } from "../data/lessons";
import { getPhase } from "../data/phases";
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
const GAP = 158;
const PHASE_GAP = 120; // vertical space for a phase header band
const NODE_HALF = 56;
const AMP = 17;

function xPercent(i) {
  return 50 + (i % 2 === 0 ? AMP : -AMP);
}

export default function LessonPath({
  completedLessons = [],
  streak,
  scamsCaught,
  onSelectLesson,
  onBack,
}) {
  const doneSet = new Set(completedLessons);
  const currentIndex = lessons.findIndex((l) => !doneSet.has(l.id));
  const activePhaseNumber =
    currentIndex === -1
      ? lessons[lessons.length - 1]?.phase ?? 1
      : lessons[currentIndex].phase;
  const activePhase = getPhase(activePhaseNumber);

  // Build a flat list of path items: phase headers + lesson nodes + reward.
  const items = [];
  let lastPhase = null;
  lessons.forEach((lesson, i) => {
    if (lesson.phase !== lastPhase) {
      items.push({ kind: "phase", phase: getPhase(lesson.phase) });
      lastPhase = lesson.phase;
    }
    items.push({
      kind: "lesson",
      title: lesson.title,
      index: i,
      phase: lesson.phase,
      phaseColor: getPhase(lesson.phase).accent || getPhase(lesson.phase).color,
    });
  });
  items.push({ kind: "reward", title: "All done", index: lessons.length });

  // Assign vertical positions, giving phase headers their own band height.
  let y = TOP_PAD;
  const positioned = items.map((item) => {
    if (item.kind === "phase") {
      const pos = { ...item, top: y, height: PHASE_GAP };
      y += PHASE_GAP;
      return pos;
    }
    const pos = { ...item, top: y };
    y += GAP;
    return pos;
  });
  const containerHeight = y + 40;

  // Dotted trail only between consecutive lesson/reward nodes.
  const trailNodes = positioned.filter(
    (n) => n.kind === "lesson" || n.kind === "reward"
  );
  const dots = [];
  for (let i = 0; i < trailNodes.length - 1; i++) {
    const a = trailNodes[i];
    const b = trailNodes[i + 1];
    // Use sequential swing index based on lesson index for x.
    const ai = a.kind === "lesson" ? a.index : lessons.length;
    const bi = b.kind === "lesson" ? b.index : lessons.length;
    const x1 = xPercent(ai);
    const y1 = a.top + NODE_HALF;
    const x2 = xPercent(bi);
    const y2 = b.top + NODE_HALF;
    for (const t of [0.22, 0.4, 0.58, 0.76]) {
      dots.push({
        key: `${ai}-${bi}-${t}`,
        x: x1 + (x2 - x1) * t,
        y: y1 + (y2 - y1) * t,
      });
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header banner — tinted with the active phase color */}
      <header
        className="flex items-center justify-between rounded-t-none px-5 py-4 text-cream-card sm:rounded-t-[40px]"
        style={{ backgroundColor: activePhase.color }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to home"
            className="rounded-full p-1.5 text-cream-card/90 transition-colors hover:bg-white/15"
          >
            <ArrowLeftIcon className="h-7 w-7" />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-semibold">Your path</h1>
            <p className="text-sm font-semibold text-cream-card/85">
              Phase {activePhase.number} · {activePhase.biome}
            </p>
          </div>
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
      <div
        className="flex-1 overflow-y-auto px-4 pb-6"
        style={{
          background: `linear-gradient(180deg, ${activePhase.color}14 0%, transparent 220px)`,
        }}
      >
        <div className="relative mx-auto w-full" style={{ height: containerHeight }}>
          {/* Phase section background tints */}
          {positioned
            .filter((n) => n.kind === "phase")
            .map((band, i, bands) => {
              const next = bands[i + 1];
              const end = next ? next.top : containerHeight;
              return (
                <div
                  key={`tint-${band.phase.number}`}
                  aria-hidden="true"
                  className="absolute left-0 right-0 rounded-3xl"
                  style={{
                    top: band.top,
                    height: end - band.top,
                    backgroundColor: `${band.phase.color}12`,
                  }}
                />
              );
            })}

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

          {positioned.map((node, i) => {
            if (node.kind === "phase") {
              return (
                <div
                  key={`phase-${node.phase.number}`}
                  className="absolute left-1/2 z-10 w-[90%] -translate-x-1/2"
                  style={{ top: node.top + 24 }}
                >
                  <div
                    className="rounded-2xl px-5 py-4 text-cream-card shadow-card"
                    style={{ backgroundColor: node.phase.color }}
                  >
                    <p className="text-sm font-bold uppercase tracking-wide text-cream-card/80">
                      Phase {node.phase.number} · {node.phase.biome}
                    </p>
                    <p className="mt-0.5 font-serif text-2xl font-semibold">
                      {node.phase.title}
                    </p>
                  </div>
                </div>
              );
            }

            const state =
              node.kind === "reward"
                ? currentIndex === -1
                  ? "reward-done"
                  : "locked"
                : doneSet.has(lessons[node.index].id)
                ? "done"
                : node.index === currentIndex
                ? "current"
                : "locked";

            const accent =
              node.kind === "lesson" ? node.phaseColor : activePhase.color;

            return (
              <div
                key={i}
                className="absolute z-10 flex flex-col items-center"
                style={{
                  left: `${xPercent(
                    node.kind === "lesson" ? node.index : lessons.length
                  )}%`,
                  top: node.top,
                  transform: "translateX(-50%)",
                }}
              >
                <PathNode
                  state={state}
                  accent={accent}
                  onClick={
                    state === "current" || state === "done"
                      ? () => onSelectLesson(node.index)
                      : undefined
                  }
                  title={node.title}
                />
                <Label state={state} title={node.title} accent={accent} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PathNode({ state, onClick, title, accent }) {
  if (state === "current") {
    return (
      <div className="relative">
        <span
          className="absolute inset-0 rounded-full animate-pulse-ring"
          style={{ backgroundColor: `${accent}66` }}
        />
        <button
          type="button"
          onClick={onClick}
          aria-label={`Start lesson: ${title}`}
          className="relative flex h-32 w-32 items-center justify-center rounded-full font-serif text-2xl font-bold text-cream-card transition-transform active:translate-y-1"
          style={{
            backgroundColor: accent,
            boxShadow: `0 7px 0 ${shade(accent, -25)}`,
          }}
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

  return (
    <div
      className="flex h-28 w-28 items-center justify-center rounded-full bg-locked text-ink-faint shadow-node-locked"
      aria-label={`Locked: ${title}`}
    >
      <LockIcon className="h-11 w-11" />
    </div>
  );
}

function Label({ state, title, accent }) {
  const style =
    state === "done" || state === "reward-done"
      ? { color: undefined, className: "text-sage" }
      : state === "current"
      ? { color: accent, className: "" }
      : { color: undefined, className: "text-ink-faint" };

  return (
    <p
      className={`mt-3 max-w-[9rem] text-center text-lg font-semibold leading-tight ${style.className}`}
      style={style.color ? { color: style.color } : undefined}
    >
      {title}
      {state === "current" && (
        <span
          className="mt-0.5 block text-sm font-bold uppercase tracking-wide"
          style={{ color: accent, opacity: 0.8 }}
        >
          Today
        </span>
      )}
    </p>
  );
}

// Darken a hex color slightly for the node "press" shadow.
function shade(hex, amount) {
  const h = hex.replace("#", "");
  const num = parseInt(h, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
