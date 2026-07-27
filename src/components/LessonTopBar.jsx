import { ArrowLeftIcon, BookIcon } from "./Icons";

// Top bar for in-lesson screens: back, a label badge, and a continuous
// progress bar showing how far through the lesson the learner is.
export default function LessonTopBar({
  label = "Lesson",
  progress = 0,
  progressTotal = 1,
  onBack,
  onSkip,
}) {
  const fraction =
    progressTotal > 0 ? Math.min(1, Math.max(0, progress / progressTotal)) : 0;

  return (
    <div className="px-6 pt-6">
      <div className="grid grid-cols-[44px_minmax(0,1fr)_56px] items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="-ml-2 flex items-center gap-1 rounded-full p-2 text-ink-soft transition-colors hover:bg-cream-deep"
        >
          <ArrowLeftIcon className="h-7 w-7" />
        </button>

        <span className="inline-flex min-w-0 items-center justify-center gap-2 justify-self-center rounded-full bg-sage/15 px-4 py-1.5 text-base font-bold text-sage-dark">
          <BookIcon className="h-5 w-5" />
          <span className="truncate">{label}</span>
        </span>

        {onSkip ? (
          <button
            type="button"
            onClick={onSkip}
            aria-label="Skip this step"
            className="justify-self-end rounded-full px-2 py-2 text-base font-bold text-ink-soft transition-colors hover:bg-cream-deep hover:text-ink"
          >
            Skip
          </button>
        ) : (
          <span aria-hidden="true" />
        )}
      </div>

      <div
        className="mt-5 h-3 w-full overflow-hidden rounded-full bg-ink/10"
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
