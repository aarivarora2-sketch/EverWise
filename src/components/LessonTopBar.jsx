import { ArrowLeftIcon, BookIcon } from "./Icons";

// Top bar for in-lesson screens: back, a label badge, and a continuous
// progress bar showing how far through the lesson the learner is.
export default function LessonTopBar({
  label = "Lesson",
  progress = 0,
  progressTotal = 1,
  onBack,
  onSkip,
  onExit,
}) {
  const fraction =
    progressTotal > 0 ? Math.min(1, Math.max(0, progress / progressTotal)) : 0;

  return (
    <div className="lesson-top-bar shrink-0 px-6 pt-3">
      <div className="lesson-top-grid grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="lesson-back -ml-2 flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 text-ink-soft transition-colors hover:bg-cream-deep"
        >
          <ArrowLeftIcon className="h-7 w-7" />
        </button>

        <span className="lesson-top-label inline-flex min-w-0 max-w-full items-center justify-center gap-2 justify-self-center rounded-full bg-sage/15 px-4 py-1 text-center text-base font-bold text-sage-dark">
          <BookIcon className="h-5 w-5 shrink-0" />
          <span className="lesson-top-label-text min-w-0 truncate">
            {label}
          </span>
        </span>

        <span className="lesson-top-actions flex min-w-0 items-center justify-end gap-1 justify-self-end">
          {onSkip ? (
            <button
              type="button"
              onClick={onSkip}
              aria-label="Skip this step"
              className="lesson-skip min-h-11 rounded-xl px-3 py-2 text-center text-base font-bold leading-tight text-ink-soft transition-colors hover:bg-cream-deep hover:text-ink"
            >
              Skip
            </button>
          ) : null}
          {onExit ? (
            <button
              type="button"
              onClick={onExit}
              aria-label="Save and exit this lesson"
              className="lesson-exit min-h-11 rounded-xl px-3 py-2 text-center text-base font-bold leading-tight text-ink-soft transition-colors hover:bg-cream-deep hover:text-ink"
            >
              Exit
            </button>
          ) : null}
          {!onSkip && !onExit ? (
            <span className="lesson-skip-spacer" aria-hidden="true" />
          ) : null}
        </span>
      </div>

      <div
        className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-ink/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={progressTotal}
        aria-valuenow={progress}
        aria-label="Lesson progress"
      >
        <div
          className="h-full rounded-full bg-clay transition-[width] duration-300 ease-out"
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
    </div>
  );
}
