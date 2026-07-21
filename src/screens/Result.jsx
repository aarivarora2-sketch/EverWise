import LessonTopBar from "../components/LessonTopBar";
import ReadAloud from "../components/ReadAloud";
import { CheckIcon } from "../components/Icons";

export default function Result({ lesson, selected, onContinue, onBack }) {
  const isCorrect = selected === lesson.correct;

  return (
    <div className="flex flex-1 flex-col">
      <LessonTopBar type={lesson.type} step={2} onBack={onBack} />

      <div className="flex flex-1 flex-col px-6 pb-8 pt-8">
        {/* Result banner — color is always paired with words + icon */}
        <div
          className={`animate-pop-in flex items-center gap-4 rounded-3xl p-6 ${
            isCorrect ? "bg-sage/15" : "bg-alert/12"
          }`}
        >
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-cream-card ${
              isCorrect ? "bg-sage" : "bg-alert"
            }`}
          >
            {isCorrect ? (
              <CheckIcon className="h-9 w-9" />
            ) : (
              <span className="font-serif text-3xl font-bold">!</span>
            )}
          </div>
          <div>
            <p
              className={`font-serif text-3xl font-bold ${
                isCorrect ? "text-sage-dark" : "text-alert"
              }`}
            >
              {isCorrect ? "That's right" : "Good to know"}
            </p>
            <p className="text-lg text-ink-soft">
              You answered: “{lesson.options[selected]}”
            </p>
          </div>
        </div>

        <h2 className="mt-8 font-serif text-2xl font-semibold text-ink">
          Here's why
        </h2>
        <p className="mt-3 text-2xl leading-relaxed text-ink-soft">
          {lesson.explanation}
        </p>

        <div className="mt-6">
          <ReadAloud text={lesson.explanation} />
        </div>

        <div className="mt-auto pt-10">
          <button className="btn-primary" onClick={onContinue}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
