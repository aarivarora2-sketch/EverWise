import { TrophyIcon } from "../components/Icons";

export default function Complete({ lesson, onDone }) {
  const info = lesson.complete || {};

  return (
    <div className="flex flex-1 flex-col px-7 pb-10 pt-8">
      <div className="mx-auto mt-6 animate-pop-in">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-sage text-cream-card shadow-node-sage">
          <TrophyIcon className="h-14 w-14" />
        </div>
      </div>

      <h1 className="mt-8 text-center font-serif text-5xl font-semibold leading-tight text-ink animate-fade-up">
        {info.title || "Great Job!"}
      </h1>
      {info.subtitle && (
        <p className="mt-3 text-center text-2xl text-ink-soft">{info.subtitle}</p>
      )}

      {info.learned?.length > 0 && (
        <div className="mt-8">
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

      <div className="mt-8 rounded-3xl bg-cream-card px-6 py-6 shadow-card">
        <p className="text-lg font-semibold uppercase tracking-wide text-ink-faint">
          Badge earned
        </p>
        <p className="mt-2 font-serif text-3xl font-semibold text-clay">
          {lesson.badge}
        </p>
        <p className="mt-3 font-serif text-4xl font-bold text-sage">
          +{lesson.xp ?? 20} XP
        </p>
      </div>

      {info.next && (
        <p className="mt-6 text-center text-xl text-ink-soft">
          Next Lesson:{" "}
          <span className="font-semibold text-ink">{info.next}</span>
        </p>
      )}

      <div className="mt-auto w-full pt-10">
        <button className="btn-primary" onClick={onDone}>
          Back to your path
        </button>
      </div>
    </div>
  );
}
