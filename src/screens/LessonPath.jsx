import {
  lessonsByOrder as lessons,
  examsByOrder,
  challengesByOrder,
} from "../data/lessons";
import { getPhase } from "../data/phases";
import BiomeScenery from "../components/BiomeScenery";
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
const NODE_SLOT = 380;
// Generous space around the lighter phase headers (no filled block).
const PHASE_TOP = 32; // used between later phases only
const PHASE_TOP_FIRST = 8; // no dead space above Phase 1
const PHASE_BAND = 88;
const PHASE_BOTTOM = 32;
// Full interactive block: current circle (h-28 ≈ 126px at 18px root) + label stack.
const NODE_BOX_H = 182;
const CLAY = "#B5502E";
const CREAM = "#EFE9DC";
const DOT_LOCKED = "rgba(34, 32, 28, 0.13)";

// Continuous sine wave instead of a fixed repeating cycle — never lands on
// the exact same shape twice, so the path reads as a real winding road
// instead of a mechanical zig-zag.
function snakeOffset(indexInPhase, phaseNumber) {
  // The first lesson of every phase always sits dead center under the
  // "Foundations"-style title; the wave only kicks in after that.
  if (indexInPhase === 0) return 0;
  const seed = (phaseNumber ?? 1) * 0.83;
  const wave = Math.sin(indexInPhase * 1.35 + seed) * 60;
  return Math.round(wave);
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
  const positioned = items.map((item, idx) => {
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
      item.kind === "reward" ? 0 : snakeOffset(indexInPhase, item.phase);
    if (item.kind !== "reward") indexInPhase += 1;
    const pos = { ...item, top: y, offsetX };
    // Only gaps that actually get connector dots need the tall slot. A gap
    // into a phase header or into the final reward has none, so it can be
    // compact; the very last node needs nothing below it at all.
    const next = items[idx + 1];
    const isLast = !next;
    const nextHasDots = next && next.phase != null && next.phase === item.phase;
    y += isLast ? NODE_BOX_H : nextHasDots ? NODE_SLOT : NODE_BOX_H + 44;
    return pos;
  });
  const containerHeight = y + 16;

  const pathNodes = positioned.filter(
    (n) =>
      n.kind === "lesson" ||
      n.kind === "challenge" ||
      n.kind === "exam" ||
      n.kind === "reward"
  );

  // Two evenly spaced stepping-stone dots in every same-phase gap. They sit
  // on the straight line between the two nodes, so consecutive gaps read as
  // one continuous winding path rather than isolated pairs.
  const dots = [];
  for (let i = 0; i < pathNodes.length - 1; i++) {
    const a = pathNodes[i];
    const b = pathNodes[i + 1];
    if (a.phase == null || b.phase == null || a.phase !== b.phase) continue;

    const ax = a.offsetX ?? 0;
    const bx = b.offsetX ?? 0;
    const ay = a.top + NODE_BOX_H;
    const by = b.top;
    if (by <= ay) continue;

    // Lights up once the lesson before the dots is complete.
    const color = doneSet.has(a.id) ? getPhase(a.phase).color : DOT_LOCKED;

    [0.26, 0.74].forEach((t, k) => {
      dots.push({
        key: `${a.id}-${b.id}-${k}`,
        x: ax + (bx - ax) * t,
        y: ay + (by - ay) * t,
        color,
      });
    });
  }

  const allPlayablesDone = playables.every((p) => doneSet.has(p.id));

  const phaseBands = positioned.filter((n) => n.kind === "phase");
  const lastPhaseColor =
    phaseBands[phaseBands.length - 1]?.phase.color ?? activePhase.color;

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
        className="hide-scrollbar flex-1 overflow-y-auto"
        style={{
          // Solid color only. A gradient here has to be re-rasterized on every
          // scroll frame, which showed up as a stutter partway down the path.
          backgroundColor: `${lastPhaseColor}10`,
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
              const isLastBand = !next;
              return (
                <div
                  key={`tint-${band.phase.number}`}
                  aria-hidden="true"
                  className="absolute inset-x-0 overflow-hidden rounded-3xl"
                  style={{
                    top: band.top,
                    // The final band stretches to the true bottom so no bare
                    // cream strip can appear under the last node.
                    ...(isLastBand
                      ? { bottom: 0 }
                      : { height: Math.max(0, next.top - band.top) }),
                    backgroundColor: `${band.phase.color}10`,
                  }}
                >
                  <BiomeScenery
                    biome={band.phase.biome}
                    color={band.phase.color}
                    className="bottom-0 h-[220px]"
                  />
                </div>
              );
            })}

          {dots.map((d) => (
            <span
              key={d.key}
              aria-hidden="true"
              className="absolute h-5 w-5 rounded-full"
              style={{
                left: `calc(50% + ${d.x}px)`,
                top: d.y,
                transform: "translate(-50%, -50%)",
                backgroundColor: d.color,
                transition: "background-color 0.4s ease",
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
                    className="mt-3 text-[18px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: node.phase.color }}
                  >
                    Phase {node.phase.number} · {node.phase.biome}
                  </p>
                  <p className="mt-1 font-serif text-[34px] font-bold leading-tight text-ink">
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

  // Current / active node uses the phase/biome color.
  if (state === "current") {
    return (
      <div className="relative shrink-0">
        <span
          className={`absolute inset-0 rounded-full animate-pulse-ring ${
            isChallenge ? "ring-4 ring-inset ring-cream-card/35" : ""
          }`}
          style={{ backgroundColor: `${fill}66` }}
        />
        <button
          type="button"
          onClick={onClick}
          aria-label={ariaStart}
          className={`relative flex ${nodeSizeCurrent} items-center justify-center rounded-full font-serif text-xl font-bold text-cream-card transition-transform active:translate-y-1 ${
            isChallenge ? "ring-[3px] ring-inset ring-cream-card/40" : ""
          }`}
          style={{
            backgroundColor: fill,
            boxShadow: `0 7px 0 ${shade(fill, -25)}`,
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
            ? { color: fill }
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
          style={{ color: fill, opacity: 0.8 }}
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
