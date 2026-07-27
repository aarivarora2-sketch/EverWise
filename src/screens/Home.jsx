import {
  MessageSearchIcon,
  ShieldIcon,
  StarIcon,
} from "../components/Icons";

export default function Home({
  name,
  scamsCaught = 0,
  badgesEarned = 0,
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
            <p className="font-sans text-2xl font-semibold tracking-tight text-ink">
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

        <p className="mt-3 text-xl leading-relaxed text-ink-soft animate-fade-up">
          Learn at your own pace. Your progress is saved automatically.
        </p>

        <div className="mt-8">
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
                <span className="font-sans text-4xl font-bold text-clay">
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
                <span className="font-sans text-4xl font-bold text-sage">
                  {scamsCaught}
                </span>
              </div>
              <p className="mt-1 text-lg text-ink-soft">scams caught</p>
            </div>
          </div>

          <button className="btn-primary mt-5" onClick={onStart}>
            {allDone ? "See your path" : "Continue learning"}
          </button>
        </div>
      </div>
    </div>
  );
}
