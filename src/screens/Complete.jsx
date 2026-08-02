import { TrophyIcon } from "../components/Icons";

export default function Complete({ lesson, onDone }) {
  const info = lesson.complete || {};
  const isPhaseBadge = Boolean(lesson.phaseBadge);

  return (
    <div className="complete-screen learning-focus flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-7 pt-5">
      <div className="mx-auto mt-2 animate-pop-in">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-sage text-cream-card shadow-node-sage">
          <TrophyIcon className="h-12 w-12" />
        </div>
      </div>

      <h1 className="page-title mt-5 text-center animate-fade-up">
        {info.title || "Great Job!"}
      </h1>
      {info.subtitle && (
        <p className="mt-3 text-center text-2xl text-ink-soft">{info.subtitle}</p>
      )}

      {/* Scam-protection lessons end with a habit, a warning sign, and the
          skills the learner actually used. */}
      {info.habit && (
        <div className="mt-5 rounded-3xl bg-clay/10 px-6 py-5">
          <p className="text-lg font-bold uppercase tracking-wide text-clay">
            Today's habit
          </p>
          <p className="mt-2 font-sans text-3xl font-semibold leading-snug text-ink">
            {info.habit}
          </p>
        </div>
      )}

      {info.warningSign && (
        <div className="mt-4 rounded-3xl bg-cream-card px-6 py-5 shadow-card">
          <p className="text-lg font-bold uppercase tracking-wide text-ink-faint">
            Today's warning sign
          </p>
          <p className="mt-2 text-2xl font-semibold leading-snug text-alert">
            🚩 {info.warningSign}
          </p>
        </div>
      )}

      {info.skills?.length > 0 && (
        <div className="mt-4 rounded-3xl bg-sage/12 px-6 py-5">
          <p className="text-lg font-bold uppercase tracking-wide text-sage-dark">
            Skills you used
          </p>
          <ul className="mt-3 space-y-2">
            {info.skills.map((skill) => (
              <li
                key={skill}
                className="flex gap-3 text-xl leading-snug text-ink"
              >
                <span aria-hidden="true">✅</span>
                <span>{skill}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {info.learned?.length > 0 && (
        <div className="mt-5">
          <p className="text-lg font-bold uppercase tracking-wide text-ink-faint">
            You learned
          </p>
          <ul className="mt-3 space-y-3">
            {info.learned.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-xl leading-snug text-ink"
              >
                <span
                  className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-sage"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        className={`mt-5 shrink-0 rounded-3xl bg-cream-card shadow-card ${
          isPhaseBadge ? "px-7 py-6" : "px-6 py-5"
        }`}
      >
        <p className="text-lg font-semibold uppercase tracking-wide text-ink-faint">
          {isPhaseBadge ? "Phase achievement" : "Badge earned"}
        </p>
        <p
          className={`mt-2 font-sans font-semibold text-clay ${
            isPhaseBadge ? "text-4xl leading-tight" : "text-3xl"
          }`}
        >
          {lesson.badge}
        </p>
      </div>

      {info.next && (
        <p className="mt-6 text-center text-xl text-ink-soft">
          Next Lesson:{" "}
          <span className="font-semibold text-ink">{info.next}</span>
        </p>
      )}

      <div className="mt-auto w-full pt-6">
        <button className="btn-primary" onClick={onDone}>
          Back to your path
        </button>
      </div>
    </div>
  );
}
