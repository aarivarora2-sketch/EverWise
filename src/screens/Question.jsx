import LessonTopBar from "../components/LessonTopBar";
import ReadAloud from "../components/ReadAloud";
import { CheckIcon } from "../components/Icons";

// One practice or quiz item at a time.
// Options are 2–4 large full-width buttons. After a tap, the explanation
// appears and a Continue button advances.
export default function Question({
  item,
  kind, // "practice" | "quiz"
  progress,
  progressTotal,
  type,
  selected,
  onSelect,
  onContinue,
  onBack,
}) {
  const answered = selected != null;
  const isCorrect = answered && selected === item.correctIndex;

  return (
    <div className="flex flex-1 flex-col">
      <LessonTopBar
        type={type}
        progress={progress}
        progressTotal={progressTotal}
        label={kind === "practice" ? "Practice" : "Quiz"}
        onBack={onBack}
      />

      <div className="flex flex-1 flex-col px-6 pb-8 pt-8">
        <h1 className="font-serif text-3xl font-semibold leading-tight text-ink">
          {item.question}
        </h1>

        <div className="mt-6">
          <ReadAloud text={item.question} label="Read this aloud" />
        </div>

        {/* 2–4 answer options — large, full-width, stacked */}
        <div className="mt-8 space-y-4">
          {item.options.map((option, i) => {
            let style =
              "border-ink/15 bg-cream-card text-ink hover:border-clay hover:bg-clay/5";
            if (answered) {
              if (i === item.correctIndex) {
                style = "border-sage bg-sage/15 text-sage-dark";
              } else if (i === selected) {
                style = "border-alert bg-alert/12 text-alert";
              } else {
                style = "border-ink/10 bg-cream-card text-ink-faint";
              }
            }
            return (
              <button
                key={i}
                type="button"
                disabled={answered}
                onClick={() => onSelect(i)}
                className={`w-full rounded-2xl border-2 px-6 py-6 text-left text-2xl font-semibold transition-colors ${style}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {answered && (
          <div
            className={`mt-8 animate-pop-in rounded-3xl p-6 ${
              isCorrect ? "bg-sage/15" : "bg-alert/12"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-cream-card ${
                  isCorrect ? "bg-sage" : "bg-alert"
                }`}
              >
                {isCorrect ? (
                  <CheckIcon className="h-8 w-8" />
                ) : (
                  <span className="font-serif text-2xl font-bold">!</span>
                )}
              </div>
              <p
                className={`font-serif text-2xl font-bold ${
                  isCorrect ? "text-sage-dark" : "text-alert"
                }`}
              >
                {isCorrect ? "That's right" : "Good to know"}
              </p>
            </div>
            <p className="mt-3 text-xl leading-relaxed text-ink-soft">
              {item.explanation}
            </p>
            <div className="mt-4">
              <ReadAloud text={item.explanation} />
            </div>
          </div>
        )}

        {answered && (
          <div className="mt-auto pt-10">
            <button className="btn-primary" onClick={onContinue}>
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
