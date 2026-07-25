import { FlameIcon, TrophyIcon } from "../components/Icons";

const MILESTONE_COPY = {
  3: "Three days in a row. The habit is forming.",
  7: "A full week. That's real consistency.",
  14: "Two weeks strong. This is who you are now.",
  30: "A whole month. Remarkable.",
  60: "Two months without missing. Outstanding.",
  100: "One hundred days. Extraordinary.",
  180: "Half a year of showing up.",
  365: "A full year. Incredible dedication.",
};

export default function Complete({ lesson, streakMilestone = null, onDone }) {
  const info = lesson.complete || {};
  const isPhaseBadge = Boolean(lesson.phaseBadge);

  return (
    <div className="flex flex-1 flex-col px-7 pb-10 pt-8">
      {streakMilestone ? (
        <div className="animate-pop-in rounded-3xl bg-clay px-6 py-7 text-center text-cream-card shadow-btn">
          <div className="flex items-center justify-center gap-3">
            <FlameIcon className="h-14 w-14" />
            <span className="font-serif text-7xl font-bold leading-none">
              {streakMilestone}
            </span>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold">Day streak!</p>
          <p className="mt-2 text-xl leading-snug text-cream-card/85">
            {MILESTONE_COPY[streakMilestone] ||
              "Another milestone. Keep going."}
          </p>
        </div>
      ) : null}

      <div className={`mx-auto animate-pop-in ${streakMilestone ? "mt-7" : "mt-6"}`}>
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

      <div
        className={`mt-8 rounded-3xl bg-cream-card shadow-card ${
          isPhaseBadge ? "px-7 py-8" : "px-6 py-6"
        }`}
      >
        <p className="text-lg font-semibold uppercase tracking-wide text-ink-faint">
          {isPhaseBadge ? "Phase achievement" : "Badge earned"}
        </p>
        <p
          className={`mt-2 font-serif font-semibold text-clay ${
            isPhaseBadge ? "text-4xl leading-tight" : "text-3xl"
          }`}
        >
          {lesson.badge}
        </p>
        <p
          className={`mt-3 font-serif font-bold text-sage ${
            isPhaseBadge ? "text-5xl" : "text-4xl"
          }`}
        >
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
