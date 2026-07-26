import {
  FlameIcon,
  MessageSearchIcon,
  ShieldIcon,
  StarIcon,
} from "../components/Icons";
import { weekDays, nextMilestone } from "../utils/streak";

function WeekStrip({ days }) {
  return (
    <div className="mt-5 flex items-end justify-between gap-1.5">
      {days.map((day) => (
        <div key={day.key} className="flex flex-1 flex-col items-center gap-2">
          <div
            className={`flex h-10 w-full max-w-[42px] items-center justify-center rounded-xl transition-colors ${
              day.done
                ? "bg-clay text-cream-card"
                : day.isToday
                ? "border-2 border-dashed border-clay/45 bg-transparent text-clay/60"
                : "bg-ink/[0.07] text-ink-faint"
            }`}
            aria-hidden="true"
          >
            {day.done ? <FlameIcon className="h-5 w-5" /> : null}
          </div>
          <span
            className={`text-[15px] font-bold ${
              day.isToday ? "text-clay" : "text-ink-faint"
            }`}
          >
            {day.letter}
          </span>
          <span className="sr-only">
            {day.key}
            {day.done ? " practiced" : " not practiced"}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Home({
  name,
  streak = 0,
  scamsCaught = 0,
  badgesEarned = 0,
  practiceDays = [],
  lastCompletedDate = null,
  doneToday = false,
  atRisk = false,
  allDone,
  subscriptionStatus,
  trialDaysLeft,
  onStart,
  onOpenBadges,
  onOpenPaywall,
  onOpenSettings,
  onOpenScamChecker,
}) {
  const firstName = name ? name.trim().split(" ")[0] : "";
  const showTrialBanner = subscriptionStatus === "trial";
  const days = weekDays(streak, lastCompletedDate, practiceDays);
  const upcoming = nextMilestone(streak);
  const toGo = upcoming ? upcoming - streak : null;

  let streakCaption;
  if (streak === 0) {
    streakCaption = "Start your streak today.";
  } else if (doneToday) {
    streakCaption =
      toGo && toGo <= 5
        ? `${toGo} more day${toGo === 1 ? "" : "s"} to ${upcoming}.`
        : "Come back tomorrow to keep it going.";
  } else {
    streakCaption = "Finish a lesson today to keep it.";
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto pb-10">
      {showTrialBanner ? (
        <button
          type="button"
          onClick={onOpenPaywall}
          className="w-full bg-clay px-5 py-3 text-center text-lg font-semibold text-cream-card transition-colors hover:bg-clay-dark sm:rounded-t-[40px]"
        >
          Free trial: {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left.
        </button>
      ) : null}

      <div className="flex flex-1 flex-col px-7 pt-7">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/everwise-logo-192.png"
              alt=""
              aria-hidden="true"
              className="h-11 w-11 object-contain"
            />
            <p className="font-serif text-2xl font-semibold tracking-tight text-ink">
              Everwise
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            className="shrink-0 rounded-full px-4 py-2 text-lg font-semibold text-ink-soft transition-colors hover:bg-cream-deep"
          >
            Settings
          </button>
        </div>

        {firstName && (
          <p className="mt-6 text-2xl text-ink-soft animate-fade-up">
            Hello, <span className="font-semibold text-ink">{firstName}</span>.
          </p>
        )}

        {/* Streak hero — the main event on this screen. */}
        <div className="mt-5 animate-fade-up rounded-3xl bg-cream-card px-6 py-7 shadow-card">
          <div className="flex items-center justify-center gap-4">
            <FlameIcon
              className={`h-16 w-16 ${streak > 0 ? "text-clay" : "text-ink/20"}`}
            />
            <div>
              <p
                className={`font-serif text-7xl font-bold leading-none ${
                  streak > 0 ? "text-clay" : "text-ink/25"
                }`}
              >
                {streak}
              </p>
            </div>
          </div>
          <p className="mt-3 text-center text-2xl font-semibold text-ink">
            {streak === 1 ? "day streak" : "day streak"}
          </p>
          <p className="mt-1 text-center text-lg text-ink-soft">
            {streakCaption}
          </p>

          <WeekStrip days={days} />
        </div>

        {atRisk && (
          <div
            className="mt-4 animate-fade-up rounded-3xl border-2 border-clay/35 bg-clay/10 px-6 py-5"
            role="status"
          >
            <p className="text-xl font-bold leading-snug text-clay">
              Your {streak}-day streak ends tonight.
            </p>
            <p className="mt-1 text-lg leading-snug text-ink-soft">
              One lesson keeps it alive.
            </p>
          </div>
        )}

        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={onOpenScamChecker}
            className="w-full rounded-3xl border-2 border-clay/25 bg-clay/10 px-6 py-5 text-left transition-colors hover:bg-clay/15"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-clay text-cream-card">
                <MessageSearchIcon className="h-8 w-8" />
              </span>
              <span>
                <span className="block text-xl font-bold text-ink">
                  Check a suspicious message
                </span>
                <span className="mt-1 block text-lg leading-snug text-ink-soft">
                  Paste it and get clear next steps.
                </span>
              </span>
            </div>
          </button>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={onOpenBadges}
              className="stat-card text-left transition-transform active:translate-y-0.5"
            >
              <div className="flex items-center gap-2">
                <ShieldIcon className="h-7 w-7 text-clay" />
                <span className="font-serif text-4xl font-bold text-clay">
                  {badgesEarned}
                </span>
              </div>
              <p className="mt-1 text-lg text-ink-soft">
                badges <span className="font-semibold text-ink">· view</span>
              </p>
            </button>

            <div className="stat-card">
              <div className="flex items-center gap-2">
                <StarIcon className="h-7 w-7 text-sage" />
                <span className="font-serif text-4xl font-bold text-sage">
                  {scamsCaught}
                </span>
              </div>
              <p className="mt-1 text-lg text-ink-soft">scams caught</p>
            </div>
          </div>

          <button className="btn-primary mt-5" onClick={onStart}>
            {allDone
              ? "See your path"
              : doneToday
              ? "Keep learning"
              : streak > 0
              ? "Keep your streak"
              : "Start today's lesson"}
          </button>
        </div>
      </div>
    </div>
  );
}
