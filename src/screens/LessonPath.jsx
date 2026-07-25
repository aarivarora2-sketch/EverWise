import {
  lessonsByOrder as lessons,
  examsByOrder,
  challengesByOrder,
} from "../data/lessons";
import { getPhase } from "../data/phases";
import {
  CheckIcon,
  LockIcon,
  FlameIcon,
  StarIcon,
  TrophyIcon,
  BookIcon,
  ArrowLeftIcon,
} from "../components/Icons";

const TOP_PAD = 12; // first phase sits near the top of the scroll area
// Tall enough for circle + 20px two-line label + trail clearance to the next node.
const NODE_SLOT = 288;
// Generous space around the lighter phase headers (no filled block).
const PHASE_TOP = 72; // used between later phases only
const PHASE_TOP_FIRST = 8; // no dead space above Phase 1
const PHASE_BAND = 72;
const PHASE_BOTTOM = 72;
// Full interactive block: current circle (h-28 ≈ 126px at 18px root) + label stack.
const NODE_BOX_H = 214;
const BOX_CLEARANCE = 16; // first/last dot ≥ 16px past the box edge
// Snake wind within the column — clamped so 10.5rem nodes stay on-screen.
const SNAKE_OFFSETS = [-56, 0, 56, 0];
const CLAY = "#B5502E";
const CREAM = "#EFE9DC";
const DOT_LOCKED = "rgba(34, 32, 28, 0.10)"; // bg-ink/10
const DOT_FILLED = "rgba(34, 32, 28, 0.38)";

function snakeOffset(indexInPhase) {
  return SNAKE_OFFSETS[indexInPhase % SNAKE_OFFSETS.length];
}

/** Point on a cubic Bézier (S-curve between two snake offsets). */
function cubicPoint(t, p0, p1, p2, p3) {
  const u = 1 - t;
  const uu = u * u;
  const tt = t * t;
  return {
    x: uu * u * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + tt * t * p3.x,
    y: uu * u * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + tt * t * p3.y,
  };
}

/** Always two dots at 1/3 and 2/3 along the cubic, by measured arc length. */
function snakeCurveDots(x1, y1, x2, y2) {
  const dy = y2 - y1;
  const p0 = { x: x1, y: y1 };
  const p3 = { x: x2, y: y2 };
  const p1 = { x: x1, y: y1 + dy * 0.45 };
  const p2 = { x: x2, y: y2 - dy * 0.45 };

  const SAMPLES = 48;
  const samples = [];
  let totalLen = 0;
  let prev = cubicPoint(0, p0, p1, p2, p3);
  samples.push({ t: 0, len: 0, ...prev });
  for (let i = 1; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const pt = cubicPoint(t, p0, p1, p2, p3);
    totalLen += Math.hypot(pt.x - prev.x, pt.y - prev.y);
    samples.push({ t, len: totalLen, ...pt });
    prev = pt;
  }

  const pointAtFraction = (frac) => {
    const target = totalLen * frac;
    for (let i = 1; i < samples.length; i++) {
      if (samples[i].len >= target) {
        const a = samples[i - 1];
        const b = samples[i];
        const span = b.len - a.len || 1;
        const u = (target - a.len) / span;
        return {
          x: a.x + (b.x - a.x) * u,
          y: a.y + (b.y - a.y) * u,
        };
      }
    }
    return { x: p3.x, y: p3.y };
  };

  return [pointAtFraction(1 / 3), pointAtFraction(2 / 3)];
}

function phaseLessonsDone(phase, doneSet) {
  return lessons
    .filter((l) => l.phase === phase)
    .every((l) => doneSet.has(l.id));
}

function challengeUnlocked(challenge, doneSet) {
  return phaseLessonsDone(challenge.phase, doneSet);
}

function examUnlocked(exam, doneSet) {
  if (!phaseLessonsDone(exam.phase, doneSet)) return false;
  const challenge = challengesByOrder.find((c) => c.phase === exam.phase);
  if (challenge && !doneSet.has(challenge.id)) return false;
  return true;
}

export default function LessonPath({
  completedLessons = [],
  streak,
  scamsCaught,
  onSelectLesson,
  onSelectExam,
  onSelectChallenge,
  onBack,
}) {
  const doneSet = new Set(completedLessons);

  // Lessons + challenges + exams in curriculum order for progress / path nodes.
  const playables = [
    ...lessons.map((l, i) => ({
      kind: "lesson",
      id: l.id,
      order: l.order,
      phase: l.phase,
      title: l.pathTitle || l.title,
      fullTitle: l.title,
      lessonIndex: i,
      phaseColor: getPhase(l.phase).color,
      biomeColor: getPhase(l.phase).color,
    })),
    ...challengesByOrder.map((c) => ({
      kind: "challenge",
      id: c.id,
      order: c.order,
      phase: c.phase,
      title: "Final Challenge",
      fullTitle: c.title,
      challenge: c,
      phaseColor: getPhase(c.phase).color,
      biomeColor: getPhase(c.phase).color,
    })),
    ...examsByOrder
      .filter((e) => e && e.id && Array.isArray(e.questions))
      .map((e) => ({
        kind: "exam",
        id: e.id,
        order: e.order,
        phase: e.phase,
        title: "Phase Exam",
        fullTitle: e.title,
        exam: e,
        phaseColor: getPhase(e.phase).color,
        biomeColor: getPhase(e.phase).color,
      })),
  ].sort((a, b) => a.order - b.order);

  // First incomplete playable item that is unlocked.
  let currentId = null;
  for (const p of playables) {
    if (doneSet.has(p.id)) continue;
    if (p.kind === "challenge" && !challengeUnlocked(p.challenge, doneSet)) {
      break;
    }
    if (p.kind === "exam" && !examUnlocked(p.exam, doneSet)) break;
    currentId = p.id;
    break;
  }

  const activePhaseNumber =
    playables.find((p) => p.id === currentId)?.phase ??
    playables[playables.length - 1]?.phase ??
    1;
  const activePhase = getPhase(activePhaseNumber);

  const items = [];
  let lastPhase = null;
  playables.forEach((p) => {
    if (p.phase !== lastPhase) {
      items.push({ kind: "phase", phase: getPhase(p.phase) });
      lastPhase = p.phase;
    }
    items.push(p);
  });
  items.push({
    kind: "reward",
    id: "path-reward",
    title: "All done",
    fullTitle: "All done",
  });

  let y = TOP_PAD;
  let phaseCount = 0;
  let indexInPhase = 0;
  const positioned = items.map((item) => {
    if (item.kind === "phase") {
      const isFirst = phaseCount === 0;
      phaseCount += 1;
      indexInPhase = 0;
      const topPad = isFirst ? PHASE_TOP_FIRST : PHASE_TOP;
      const pos = { ...item, top: y, bandTop: y + topPad, isFirst };
      y += topPad + PHASE_BAND + PHASE_BOTTOM;
      return pos;
    }
    const offsetX =
      item.kind === "reward" ? 0 : snakeOffset(indexInPhase);
    if (item.kind !== "reward") indexInPhase += 1;
    const pos = { ...item, top: y, offsetX };
    y += NODE_SLOT;
    return pos;
  });
  const containerHeight = y + 48;

  const trailNodes = positioned.filter(
    (n) =>
      n.kind === "lesson" ||
      n.kind === "challenge" ||
      n.kind === "exam" ||
      n.kind === "reward"
  );

  // Curved trails per same-phase segment — never through a phase header.
  const dots = [];
  for (let i = 0; i < trailNodes.length - 1; i++) {
    const a = trailNodes[i];
    const b = trailNodes[i + 1];
    if (a.phase == null || b.phase == null || a.phase !== b.phase) continue;

    const x1 = a.offsetX ?? 0;
    const x2 = b.offsetX ?? 0;
    const y1 = a.top + NODE_BOX_H + BOX_CLEARANCE;
    const y2 = b.top - BOX_CLEARANCE;
    if (y2 <= y1) continue;

    const filled = doneSet.has(b.id);
    const pts = snakeCurveDots(x1, y1, x2, y2);
    pts.forEach((pt, k) => {
      dots.push({
        key: `${a.id}-${b.id}-${k}`,
        x: pt.x,
        y: pt.y,
        filled,
      });
    });
  }

  const allPlayablesDone = playables.every((p) => doneSet.has(p.id));

  return (
    <div className="flex flex-1 flex-col">
      {/* Fixed neutral chrome — biome color only appears on phase bands/nodes */}
      <header className="flex items-center justify-between rounded-t-none bg-[#B5502E] px-5 py-4 text-cream-card sm:rounded-t-[40px]">
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
            <p className="text-sm font-semibold text-cream-card/75">
              Phase {activePhase.number} · {activePhase.biome}
              <span className="text-cream-card/50"> · {activePhase.title}</span>
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

      <div
        className="flex-1 overflow-y-auto pb-8"
        style={{
          background: `linear-gradient(180deg, ${activePhase.color}14 0%, transparent 220px)`,
        }}
      >
        <div
          className="relative mx-auto w-full max-w-none px-2"
          style={{ height: containerHeight }}
        >
          {positioned
            .filter((n) => n.kind === "phase")
            .map((band, i, bands) => {
              const next = bands[i + 1];
              const end = next ? next.top : containerHeight;
              return (
                <div
                  key={`tint-${band.phase.number}`}
                  aria-hidden="true"
                  className="absolute inset-x-0 rounded-3xl"
                  style={{
                    top: band.top,
                    height: Math.max(0, end - band.top),
                    backgroundColor: `${band.phase.color}10`,
                  }}
                />
              );
            })}

          {dots.map((d) => (
            <span
              key={d.key}
              aria-hidden="true"
              className="absolute h-3.5 w-4 rounded-full"
              style={{
                left: `calc(50% + ${d.x}px)`,
                top: d.y,
                transform: "translate(-50%, -50%)",
                backgroundColor: d.filled ? DOT_FILLED : DOT_LOCKED,
              }}
            />
          ))}

          {positioned.map((node, i) => {
            if (node.kind === "phase") {
              return (
                <div
                  key={`phase-${node.phase.number}`}
                  className="absolute left-1/2 z-10 w-[92%] max-w-[380px] -translate-x-1/2"
                  style={{ top: node.bandTop }}
                >
                  <div
                    className="h-px w-full"
                    style={{ backgroundColor: node.phase.color }}
                    aria-hidden="true"
                  />
                  <p
                    className="mt-3 text-[14px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: node.phase.color }}
                  >
                    Phase {node.phase.number} · {node.phase.biome}
                  </p>
                  <p className="mt-1 font-serif text-[30px] font-bold leading-tight text-ink">
                    {node.phase.title}
                  </p>
                </div>
              );
            }

            let state;
            if (node.kind === "reward") {
              state = allPlayablesDone ? "reward-done" : "locked";
            } else if (doneSet.has(node.id)) {
              state = "done";
            } else if (node.id === currentId) {
              state = "current";
            } else if (
              node.kind === "challenge" &&
              !challengeUnlocked(node.challenge, doneSet)
            ) {
              state = "locked";
            } else if (
              node.kind === "exam" &&
              !examUnlocked(node.exam, doneSet)
            ) {
              state = "locked";
            } else {
              state = "locked";
            }

            const phaseColor =
              node.kind === "reward"
                ? activePhase.color
                : getPhase(Number(node.phase)).color;

            const onClick =
              state === "current" || state === "done"
                ? node.kind === "exam"
                  ? () => onSelectExam?.(node.exam)
                  : node.kind === "challenge"
                  ? () => onSelectChallenge?.(node.challenge)
                  : node.kind === "lesson"
                  ? () => onSelectLesson(node.lessonIndex)
                  : undefined
                : undefined;

            return (
              <div
                key={node.id || i}
                className="absolute z-10 flex flex-col items-center"
                style={{
                  left: `calc(50% + ${node.offsetX ?? 0}px)`,
                  top: node.top,
                  width: "10.5rem",
                  height: NODE_SLOT,
                  transform: "translateX(-50%)",
                }}
              >
                <PathNode
                  state={state}
                  kind={node.kind}
                  phaseColor={phaseColor}
                  onClick={onClick}
                  title={node.fullTitle || node.title}
                />
                <Label
                  state={state}
                  title={node.title}
                  phaseColor={phaseColor}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PathNode({ state, kind, onClick, title, phaseColor }) {
  const isExam = kind === "exam";
  const isChallenge = kind === "challenge";
  const fill = phaseColor || CLAY;
  // Challenge sits visually between lesson (START/check) and exam (trophy).
  const nodeSizeCurrent = isChallenge ? "h-[6.5rem] w-[6.5rem]" : "h-28 w-28";
  const nodeSizeDone = isChallenge ? "h-[5.5rem] w-[5.5rem]" : "h-24 w-24";

  const ariaStart = isExam
    ? `Start exam: ${title}`
    : isChallenge
    ? `Start challenge: ${title}`
    : `Start lesson: ${title}`;
  const ariaRedo = isExam
    ? `Redo exam: ${title}`
    : isChallenge
    ? `Redo challenge: ${title}`
    : `Redo completed lesson: ${title}`;

  // Current / active node keeps the clay START treatment.
  if (state === "current") {
    return (
      <div className="relative shrink-0">
        <span
          className={`absolute inset-0 rounded-full animate-pulse-ring ${
            isChallenge ? "ring-4 ring-inset ring-cream-card/35" : ""
          }`}
          style={{ backgroundColor: `${CLAY}66` }}
        />
        <button
          type="button"
          onClick={onClick}
          aria-label={ariaStart}
          className={`relative flex ${nodeSizeCurrent} items-center justify-center rounded-full font-serif text-xl font-bold text-cream-card transition-transform active:translate-y-1 ${
            isChallenge ? "ring-[3px] ring-inset ring-cream-card/40" : ""
          }`}
          style={{
            backgroundColor: CLAY,
            boxShadow: `0 7px 0 ${shade(CLAY, -25)}`,
          }}
        >
          {isExam ? (
            <TrophyIcon className="h-12 w-12" />
          ) : isChallenge ? (
            <BookIcon className="h-11 w-11" />
          ) : (
            "START"
          )}
        </button>
      </div>
    );
  }

  // Completed: solid phase/biome color (never clay) + white check/icon.
  if (state === "done") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaRedo}
        className={`flex ${nodeSizeDone} shrink-0 items-center justify-center rounded-full text-white transition-transform active:translate-y-1 active:shadow-none ${
          isChallenge ? "ring-[3px] ring-inset ring-white/35" : ""
        }`}
        style={{
          backgroundColor: fill,
          boxShadow: `0 5px 0 ${shade(fill, -25)}`,
        }}
      >
        {isExam ? (
          <TrophyIcon className="h-11 w-11" />
        ) : isChallenge ? (
          <BookIcon className="h-10 w-10" />
        ) : (
          <CheckIcon className="h-11 w-11" />
        )}
      </button>
    );
  }

  if (state === "reward-done") {
    return (
      <div
        className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-white"
        style={{
          backgroundColor: fill,
          boxShadow: `0 5px 0 ${shade(fill, -25)}`,
        }}
        aria-label="Reward unlocked"
      >
        <TrophyIcon className="h-12 w-12" />
      </div>
    );
  }

  // Locked: phase color ~35% over cream — biome-readable, clearly inactive.
  const lockedFill = mixHex(fill, CREAM, 0.35);
  const lockedShadow = shade(lockedFill, -22);
  const lockedIcon = mixHex(fill, "#4A463F", 0.4);

  return (
    <div
      className={`flex ${nodeSizeDone} shrink-0 items-center justify-center rounded-full ${
        isChallenge ? "ring-[3px] ring-inset ring-ink/10" : ""
      }`}
      style={{
        backgroundColor: lockedFill,
        boxShadow: `0 5px 0 ${lockedShadow}`,
        color: lockedIcon,
      }}
      aria-label={`Locked: ${title}`}
    >
      {isExam ? (
        <TrophyIcon className="h-10 w-10" />
      ) : isChallenge ? (
        <BookIcon className="h-9 w-9" />
      ) : (
        <LockIcon className="h-10 w-10" />
      )}
    </div>
  );
}

function Label({ state, title, phaseColor }) {
  const fill = phaseColor || CLAY;
  const lockedText = mixHex(fill, "#4A463F", 0.45);

  return (
    <div className="mt-3 w-full px-1 text-center">
      <p
        className="mx-auto line-clamp-2 max-w-[10rem] text-center text-[20px] font-semibold leading-snug"
        style={
          state === "current"
            ? { color: CLAY }
            : state === "done" || state === "reward-done"
            ? { color: fill }
            : state === "locked"
            ? { color: lockedText }
            : undefined
        }
        title={title}
      >
        {title}
      </p>
      {state === "current" && (
        <span
          className="mt-1 block text-[13px] font-bold uppercase tracking-wide"
          style={{ color: CLAY, opacity: 0.8 }}
        >
          Today
        </span>
      )}
    </div>
  );
}

function shade(hex, amount) {
  const h = hex.replace("#", "");
  const num = parseInt(h, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// Mix color A into color B by weight (0–1 = how much of A).
function mixHex(a, b, weightA) {
  const parse = (hex) => {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const w = Math.min(1, Math.max(0, weightA));
  const r = Math.round(ar * w + br * (1 - w));
  const g = Math.round(ag * w + bg * (1 - w));
  const bl = Math.round(ab * w + bb * (1 - w));
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, "0")}`;
}
