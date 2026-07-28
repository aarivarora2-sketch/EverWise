import { useEffect, useRef } from "react";
import {
  lessonsByOrder as lessons,
  examsByOrder,
  challengesByOrder,
  finalExam,
  pathOrderForPhase,
} from "../data/lessons";
import { getPhase, phaseLabel } from "../data/phases";
import {
  CheckIcon,
  LockIcon,
  TrophyIcon,
  BookIcon,
  ArrowLeftIcon,
} from "../components/Icons";
import { pathLayoutForTextSize } from "../utils/pathLayout";

const TOP_PAD = 0; // phase color starts directly below the orange header
const CLAY = "#B5502E";
const CREAM = "#EFE9DC";
const DOT_LOCKED = "rgba(34, 32, 28, 0.13)";

// Continuous wave rather than a fixed repeating cycle, so the path never
// lands on exactly the same bend twice. The first lesson of each phase stays
// centered under its title.
function snakeOffset(indexInPhase, phaseNumber, amplitude) {
  if (indexInPhase === 0) return 0;
  const seed = (phaseNumber ?? 1) * 0.83;
  return Math.round(Math.sin(indexInPhase * 1.35 + seed) * amplitude);
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
  textSize = "size-2",
  onSelectLesson,
  onSelectExam,
  onSelectChallenge,
  onBack,
}) {
  const layout = pathLayoutForTextSize(textSize);
  const usesStackedHeader = layout.scale >= 1.38;
  const doneSet = new Set(completedLessons);
  const pathScrollRef = useRef(null);
  const activePhaseRef = useRef(null);
  const currentNodeRef = useRef(null);

  // Lessons + challenges + exams in curriculum order for progress / path nodes.
  const playables = [
    ...lessons.map((l, i) => ({
      kind: "lesson",
      id: l.id,
      order: l.pathOrder ?? l.order,
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
      // Slot just after the last lesson of its phase on the path.
      order: pathOrderForPhase(c.phase) + 0.4,
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
        order: pathOrderForPhase(e.phase) + 0.5,
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
  // The capstone sits on the last node. It carries the final phase's number so
  // it picks up the Summit color and joins the trail of dots above it.
  items.push({
    kind: "final",
    id: finalExam.id,
    phase: finalExam.phase,
    title: "Final Test",
    fullTitle: finalExam.title,
    exam: finalExam,
  });

  let y = TOP_PAD;
  let phaseCount = 0;
  let indexInPhase = 0;
  const positioned = items.map((item, idx) => {
    if (item.kind === "phase") {
      const isFirst = phaseCount === 0;
      phaseCount += 1;
      indexInPhase = 0;
      const topPad = isFirst ? layout.phaseTopFirst : layout.phaseTop;
      const pos = { ...item, top: y, bandTop: y + topPad, isFirst };
      y += topPad + layout.phaseBand + layout.phaseBottom;
      return pos;
    }
    // The capstone stays centered rather than joining the snake's swing.
    const offsetX =
      item.kind === "final"
        ? 0
        : snakeOffset(indexInPhase, item.phase, layout.offsetAmplitude);
    if (item.kind !== "final") indexInPhase += 1;
    const pos = { ...item, top: y, offsetX };
    // Only gaps that actually get dots need the tall slot; the last node
    // needs no clearance below it at all.
    const next = items[idx + 1];
    const nextHasDots = next && next.phase != null && next.phase === item.phase;
    y += !next
      ? layout.nodeBoxHeight
      : nextHasDots
        ? layout.nodeSlot
        : layout.nodeBoxHeight + Math.round(44 * layout.scale);
    return pos;
  });
  const containerHeight = y + layout.pathBottomClearance;

  const trailNodes = positioned.filter(
    (n) =>
      n.kind === "lesson" ||
      n.kind === "challenge" ||
      n.kind === "exam" ||
      n.kind === "final"
  );

  // Curved trails per same-phase segment — never through a phase header.
  const dots = [];
  for (let i = 0; i < trailNodes.length - 1; i++) {
    const a = trailNodes[i];
    const b = trailNodes[i + 1];
    if (a.phase == null || b.phase == null || a.phase !== b.phase) continue;

    const ax = a.offsetX ?? 0;
    const bx = b.offsetX ?? 0;
    const ay = a.top + layout.nodeBoxHeight;
    const by = b.top;
    if (by <= ay) continue;

    // Lights up once the lesson BEFORE the dots is complete.
    const color = doneSet.has(a.id) ? getPhase(a.phase).color : DOT_LOCKED;

    [0.26, 0.74].forEach((t, k) => {
      const dotY = ay + (by - ay) * t;
      dots.push({
        key: `${a.id}-${b.id}-${k}`,
        x: ax + (bx - ax) * t,
        y: dotY,
        color,
      });
    });
  }

  const allPlayablesDone = playables.every((p) => doneSet.has(p.id));
  const activePhaseBackground = mixHex(activePhase.color, CREAM, 0.1);

  // The path ripple. Every node and every trail dot animates as its own
  // element, on its own delay, so the path assembles piece by piece instead
  // of fading in as one block.
  //
  // The wave spreads OUTWARD from the lesson the learner is on rather than
  // running from the top of the path. With 100+ nodes, a top-down wipe would
  // put everything on screen at the same capped delay — radiating from the
  // scroll target keeps the motion where the learner is actually looking.
  const rippleCenterY =
    positioned.find((n) => n.id === currentId)?.top ??
    positioned.find(
      (n) => n.kind === "phase" && n.phase.number === activePhaseNumber,
    )?.top ??
    0;

  function rippleDelay(y) {
    return Math.min(Math.abs(y - rippleCenterY) / 3.2, 620);
  }

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--everwise-safe-top", CLAY);
    root.style.setProperty("--everwise-safe-bottom", activePhaseBackground);
    root.style.setProperty("--everwise-screen-background", activePhaseBackground);

    return () => {
      root.style.setProperty("--everwise-safe-top", CREAM);
      root.style.setProperty("--everwise-safe-bottom", CREAM);
      root.style.setProperty("--everwise-screen-background", CREAM);
    };
  }, [activePhaseBackground]);

  useEffect(() => {
    if (
      !currentId ||
      !activePhaseRef.current ||
      !currentNodeRef.current
    ) {
      return undefined;
    }

    let scrollTimer;
    const frame = window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const scrollCurrentIntoComfortableView = (behavior) => {
        const scroller = pathScrollRef.current;
        const currentNode = currentNodeRef.current;
        if (!scroller || !currentNode) return;

        // Keep the current lesson in the upper third so the following lesson
        // is visible without being sliced by the bottom safe area.
        const targetTop = Math.max(
          0,
          currentNode.offsetTop - scroller.clientHeight * 0.34,
        );
        scroller.scrollTo({ top: targetTop, behavior });
      };

      activePhaseRef.current?.scrollIntoView({
        behavior: "auto",
        block: "start",
        inline: "nearest",
      });

      if (reduceMotion) {
        scrollCurrentIntoComfortableView("auto");
        return;
      }

      // Give the learner a moment to see the phase name, then trace the path
      // down to the lesson that is ready for them now.
      scrollTimer = window.setTimeout(() => {
        scrollCurrentIntoComfortableView("smooth");
      }, 650);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(scrollTimer);
    };
  }, [activePhaseNumber, currentId]);

  return (
    // The header stays outside the scrolling path so Home is always one tap
    // away, even when the learner is deep inside a phase.
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ backgroundColor: activePhaseBackground }}
    >
      {/* Neutral chrome — biome color only appears on phase bands/nodes */}
      <header className="path-header flex shrink-0 items-center rounded-t-none bg-[#B5502E] px-4 py-1 text-cream-card sm:rounded-t-[40px]">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to home"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-cream-card/90 transition-colors hover:bg-white/15"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div
            className={`flex min-w-0 flex-1 ${
              usesStackedHeader
                ? "flex-col items-start gap-0"
                : "items-baseline gap-2"
            }`}
          >
            <h1 className="shrink-0 font-sans text-xl font-semibold leading-tight">
              Your path
            </h1>
            <p
              className={`min-w-0 text-sm font-semibold leading-snug text-cream-card/85 ${
                usesStackedHeader ? "whitespace-normal" : "truncate"
              }`}
            >
              Phase {phaseLabel(activePhase)} · {activePhase.biome}
            </p>
          </div>
        </div>
      </header>

      <div
        ref={pathScrollRef}
        className="path-scroll min-h-0 flex-1 overflow-y-auto"
      >
        <div className="pb-12">
          <div
            className="relative mx-auto w-full max-w-none px-2"
            style={{ height: containerHeight }}
          >
            {positioned
              .filter((node) => node.kind === "phase")
              .map((band, index, bands) => {
                const nextBand = bands[index + 1];
                const end = nextBand ? nextBand.top : containerHeight;
                return (
                  <div
                    key={`phase-background-${band.phase.number}`}
                    aria-hidden="true"
                    className="absolute inset-x-0"
                    style={{
                      top: band.top,
                      height: Math.max(0, end - band.top),
                      backgroundColor: mixHex(
                        band.phase.color,
                        CREAM,
                        0.1,
                      ),
                    }}
                  />
                );
              })}

            {dots.map((d) => (
              <span
                key={d.key}
                aria-hidden="true"
                className="absolute block h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ left: `calc(50% + ${d.x}px)`, top: d.y }}
              >
                <span
                  className="block h-full w-full animate-ripple-in rounded-full"
                  style={{
                    backgroundColor: d.color,
                    animationDelay: `${rippleDelay(d.y)}ms`,
                  }}
                />
              </span>
            ))}

            {positioned.map((node, i) => {
              if (node.kind === "phase") {
                return (
                  <div
                    key={`phase-${node.phase.number}`}
                    ref={
                      node.phase.number === activePhaseNumber
                        ? activePhaseRef
                        : null
                    }
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
                      Phase {phaseLabel(node.phase)} · {node.phase.biome}
                    </p>
                    <p className="mt-1 font-sans text-[30px] font-bold leading-tight text-ink">
                      {node.phase.title}
                    </p>
                  </div>
                );
              }

              let state;
              if (node.kind === "final") {
                // Opens only after every lesson, challenge, and phase exam.
                state = doneSet.has(node.id)
                  ? "done"
                  : allPlayablesDone
                    ? "current"
                    : "locked";
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

              const phaseColor = getPhase(Number(node.phase)).color;

              const onClick =
                state === "current" || state === "done"
                  ? node.kind === "exam" || node.kind === "final"
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
                  ref={node.id === currentId ? currentNodeRef : null}
                  className="absolute z-10 flex flex-col items-center"
                  style={{
                    left: `calc(50% + ${node.offsetX ?? 0}px)`,
                    top: node.top,
                    width: `${10.5 * layout.nodeScale}rem`,
                    maxWidth: "calc(100vw - 2rem)",
                    height: layout.nodeBoxHeight,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div
                    className="flex animate-ripple-in flex-col items-center"
                    style={{ animationDelay: `${rippleDelay(node.top)}ms` }}
                  >
                    <PathNode
                      state={state}
                      kind={node.kind}
                      phaseColor={phaseColor}
                      onClick={onClick}
                      title={node.fullTitle || node.title}
                      scale={layout.nodeScale}
                    />
                    <Label
                      state={state}
                      title={node.title}
                      phaseColor={phaseColor}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function PathNode({ state, kind, onClick, title, phaseColor, scale = 1 }) {
  const isFinal = kind === "final";
  // The capstone wears the same trophy as a phase exam, one size larger.
  const isExam = kind === "exam" || isFinal;
  const isChallenge = kind === "challenge";
  const fill = phaseColor || CLAY;
  // Challenge sits visually between lesson (START/check) and exam (trophy).
  const currentBase = isFinal ? 128 : isChallenge ? 104 : 112;
  const doneBase = isFinal ? 112 : isChallenge ? 88 : 96;
  const currentSize = Math.round(currentBase * scale);
  const doneSize = Math.round(doneBase * scale);

  const ariaStart = isFinal
    ? `Start the final test: ${title}`
    : isExam
    ? `Start exam: ${title}`
    : isChallenge
    ? `Start challenge: ${title}`
    : `Start lesson: ${title}`;
  const ariaRedo = isFinal
    ? `Retake the final test: ${title}`
    : isExam
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
          style={{ backgroundColor: `${fill}66` }}
        />
        <button
          type="button"
          onClick={onClick}
          aria-label={ariaStart}
          className={`relative flex items-center justify-center rounded-full font-sans text-xl font-bold text-cream-card transition-transform active:translate-y-1 ${
            isChallenge ? "ring-[3px] ring-inset ring-cream-card/40" : ""
          }`}
          style={{
            width: currentSize,
            height: currentSize,
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
        className={`flex shrink-0 items-center justify-center rounded-full text-white transition-transform active:translate-y-1 active:shadow-none ${
          isChallenge ? "ring-[3px] ring-inset ring-white/35" : ""
        }`}
        style={{
          width: doneSize,
          height: doneSize,
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

  // Locked: phase color ~35% over cream — biome-readable, clearly inactive.
  const lockedFill = mixHex(fill, CREAM, 0.35);
  const lockedShadow = shade(lockedFill, -22);
  const lockedIcon = mixHex(fill, "#4A463F", 0.4);

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full ${
        isChallenge ? "ring-[3px] ring-inset ring-ink/10" : ""
      }`}
      style={{
        width: doneSize,
        height: doneSize,
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
        className="mx-auto max-w-full text-center text-[20px] font-semibold leading-snug"
        style={
          state === "current"
            ? { color: fill }
            : state === "done"
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
