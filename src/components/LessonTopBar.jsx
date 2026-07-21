import { ArrowLeftIcon, ShieldIcon, BookIcon } from "./Icons";

// Top bar for the in-lesson screens: a back button, a type badge, and a
// small step indicator (Learn -> Quiz -> Why). Keeps orientation clear
// without competing with the single main action below.
export default function LessonTopBar({ type, step, onBack }) {
  const isProtection = type === "protection";
  const steps = ["Learn", "Quiz", "Why"];

  return (
    <div className="px-6 pt-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="-ml-2 flex items-center gap-1 rounded-full p-2 text-ink-soft transition-colors hover:bg-cream-deep"
        >
          <ArrowLeftIcon className="h-7 w-7" />
        </button>

        <span
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-base font-bold ${
            isProtection
              ? "bg-clay/12 text-clay"
              : "bg-sage/15 text-sage-dark"
          }`}
        >
          {isProtection ? (
            <ShieldIcon className="h-5 w-5" />
          ) : (
            <BookIcon className="h-5 w-5" />
          )}
          {isProtection ? "Spot the scam" : "Everyday skill"}
        </span>
      </div>

      {step != null && (
        <div className="mt-5 flex items-center gap-2" aria-hidden="true">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-2.5 flex-1 rounded-full ${
                i <= step ? "bg-clay" : "bg-ink/10"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
