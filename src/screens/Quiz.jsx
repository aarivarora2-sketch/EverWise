import LessonTopBar from "../components/LessonTopBar";
import ReadAloud from "../components/ReadAloud";

export default function Quiz({ lesson, onAnswer, onBack }) {
  return (
    <div className="flex flex-1 flex-col">
      <LessonTopBar type={lesson.type} step={1} onBack={onBack} />

      <div className="flex flex-1 flex-col px-6 pb-8 pt-8">
        <h1 className="font-serif text-3xl font-semibold leading-tight text-ink">
          {lesson.question}
        </h1>

        {/* Scenario card */}
        <div className="mt-6 rounded-3xl border-l-8 border-clay/60 bg-cream-card p-6 shadow-card">
          <p className="text-2xl leading-relaxed text-ink">{lesson.scenario}</p>
        </div>

        <div className="mt-6">
          <ReadAloud
            text={`${lesson.scenario} ${lesson.question}`}
            label="Read this aloud"
          />
        </div>

        {/* Two answer options — the single decision on this screen */}
        <div className="mt-auto space-y-4 pt-10">
          {lesson.options.map((option, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onAnswer(i)}
              className="w-full rounded-2xl border-2 border-ink/15 bg-cream-card px-6 py-6 text-left text-2xl font-semibold text-ink transition-colors hover:border-clay hover:bg-clay/5"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
