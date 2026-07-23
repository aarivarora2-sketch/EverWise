import LessonTopBar from "../components/LessonTopBar";
import ReadAloud from "../components/ReadAloud";

export default function Learn({ lesson, progress, progressTotal, onContinue, onBack }) {
  return (
    <div className="flex flex-1 flex-col">
      <LessonTopBar
        type={lesson.type}
        label="Learn"
        progress={progress}
        progressTotal={progressTotal}
        onBack={onBack}
      />

      <div className="flex flex-1 flex-col px-6 pb-8 pt-8">
        <div className="animate-fade-up">
          <h1 className="font-serif text-4xl font-semibold leading-tight text-ink">
            {lesson.title}
          </h1>

          <p className="mt-6 text-2xl leading-relaxed text-ink-soft">
            {lesson.learnText}
          </p>

          <div className="mt-8">
            <ReadAloud text={`${lesson.title}. ${lesson.learnText}`} />
          </div>
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
