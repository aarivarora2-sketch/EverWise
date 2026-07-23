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

const TOP_PAD = 28;
const NODE_SLOT = 220;
const PHASE_TOP = 56;
const PHASE_BAND = 88;
const PHASE_BOTTOM = 56;
const PHASE_SLOT = PHASE_TOP + PHASE_BAND + PHASE_BOTTOM;
const NODE_CENTER = 56;
const NODE_RADIUS = 56; // START node is h-28; clear trails past this
const TRAIL_END_PAD = NODE_RADIUS + 12; // no dots under/behind a circle
const PATH_WIDTH_EST = 390; // approx path column width for clearance math
const AMP = 11;
const TRAIL_T = [0.22, 0.4, 0.58, 0.76]; // same spacing as before

function xPercent(i) {
  return 50 + (i % 2 === 0 ? AMP : -AMP);
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
      phaseColor: getPhase(l.phase).accent || getPhase(l.phase).color,
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
      phaseColor: getPhase(c.phase).accent || getPhase(c.phase).color,
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
        phaseColor: getPhase(e.phase).accent || getPhase(e.phase).color,
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
  const positioned = items.map((item) => {
    if (item.kind === "phase") {
      const pos = { ...item, top: y, bandTop: y + PHASE_TOP };
      y += PHASE_SLOT;
      return pos;
    }
    const pos = { ...item, top: y };
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
  const dots = [];
  for (let i = 0; i < trailNodes.length - 1; i++) {
    const a = trailNodes[i];
    const b = trailNodes[i + 1];
    const x1 = xPercent(i);
    const y1 = a.top + NODE_CENTER;
    const x2 = xPercent(i + 1);
    const y2 = b.top + NODE_CENTER;
    // Convert to a rough pixel length so end padding clears both circles.
    const dx = ((x2 - x1) / 100) * PATH_WIDTH_EST;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const tMin = TRAIL_END_PAD / len;
    const tMax = 1 - TRAIL_END_PAD / len;
    if (tMax <= tMin) continue;

    for (const t of TRAIL_T) {
      // Only render dots that sit fully between the padded ends.
      if (t < tMin || t > tMax) continue;
      dots.push({
        key: `${i}-${t}`,
        x: x1 + (x2 - x1) * t,
        y: y1 + (y2 - y1) * t,
      });
    }
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
                  className="absolute left-1/2 z-10 w-[92%] max-w-[380px] -translate-x-1/2"
                  style={{ top: node.bandTop }}
                >
                  <div
                    className="rounded-2xl px-5 py-4 text-cream-card shadow-card"
                    style={{ backgroundColor: node.phase.color }}
                  >
                    <p className="text-sm font-bold uppercase tracking-wide text-cream-card/80">
                      Phase {node.phase.number} · {node.phase.biome}
                    </p>
                    <p className="mt-0.5 font-serif text-2xl font-semibold leading-tight">
                      {node.phase.title}
                    </p>
                  </div>
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

            const accent =
              node.kind === "reward"
                ? activePhase.color
                : node.phaseColor || activePhase.color;
            const biome =
              node.kind === "reward"
                ? activePhase.color
                : node.biomeColor || activePhase.color;
            const swingIndex = trailNodes.findIndex((t) => t === node);

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
                  left: `${xPercent(Math.max(0, swingIndex))}%`,
                  top: node.top,
                  width: "9.5rem",
                  height: NODE_SLOT,
                  transform: "translateX(-50%)",
                }}
              >
                <PathNode
                  state={state}
                  kind={node.kind}
                  accent={accent}
                  biome={biome}
                  onClick={onClick}
                  title={node.fullTitle || node.title}
                />
                <Label
                  state={state}
                  title={node.title}
                  accent={accent}
                  biome={biome}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PathNode({ state, kind, onClick, title, accent, biome }) {
  const isExam = kind === "exam";
  const isChallenge = kind === "challenge";
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

  if (state === "current") {
    return (
      <div className="relative shrink-0">
        <span
          className={`absolute inset-0 rounded-full animate-pulse-ring ${
            isChallenge ? "ring-4 ring-inset ring-cream-card/35" : ""
          }`}
          style={{ backgroundColor: `${accent}66` }}
        />
        <button
          type="button"
          onClick={onClick}
          aria-label={ariaStart}
          className={`relative flex ${nodeSizeCurrent} items-center justify-center rounded-full font-serif text-xl font-bold text-cream-card transition-transform active:translate-y-1 ${
            isChallenge ? "ring-[3px] ring-inset ring-cream-card/40" : ""
          }`}
          style={{
            backgroundColor: accent,
            boxShadow: `0 7px 0 ${shade(accent, -25)}`,
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

  if (state === "done") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaRedo}
        className={`flex ${nodeSizeDone} shrink-0 items-center justify-center rounded-full text-cream-card transition-transform active:translate-y-1 active:shadow-none ${
          isExam || isChallenge ? "" : "bg-sage shadow-node-sage"
        } ${isChallenge ? "ring-[3px] ring-inset ring-cream-card/35" : ""}`}
        style={
          isExam || isChallenge
            ? {
                backgroundColor: isChallenge ? mixHex(accent, "#6B8F71", 0.55) : accent,
                boxShadow: `0 5px 0 ${shade(
                  isChallenge ? mixHex(accent, "#6B8F71", 0.55) : accent,
                  -25
                )}`,
              }
            : undefined
        }
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
        className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-sage text-cream-card shadow-node-sage"
        aria-label="Reward unlocked"
      >
        <TrophyIcon className="h-12 w-12" />
      </div>
    );
  }

  // Locked: desaturated biome tint (25% phase / 75% grey) — not active, but phase-readable
  const lockedFill = mixHex(biome, "#C9C3B6", 0.25);
  const lockedShadow = shade(lockedFill, -28);
  const lockedIcon = mixHex(biome, "#4A463F", 0.45);

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

function Label({ state, title, accent, biome }) {
  const lockedText = mixHex(biome || accent, "#4A463F", 0.4);
  const className =
    state === "done" || state === "reward-done"
      ? "text-sage"
      : state === "current"
      ? ""
      : "";

  return (
    <div className="mt-3 w-full px-1 text-center">
      <p
        className={`mx-auto line-clamp-2 max-w-[8.5rem] text-center text-base font-semibold leading-snug ${className}`}
        style={
          state === "current"
            ? { color: accent }
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
          className="mt-1 block text-xs font-bold uppercase tracking-wide"
          style={{ color: accent, opacity: 0.8 }}
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
