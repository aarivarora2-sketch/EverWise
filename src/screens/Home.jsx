import { FlameIcon, StarIcon } from "../components/Icons";

export default function Home({
  name,
  streak,
  scamsCaught,
  allDone,
  subscriptionStatus,
  trialDaysLeft,
  onStart,
  onOpenPaywall,
  onOpenSettings,
}) {
  const firstName = name ? name.trim().split(" ")[0] : "";
  const showTrialBanner = subscriptionStatus === "trial";
  const showUpgrade =
    subscriptionStatus === "trial" || subscriptionStatus === "expired";

  return (
    <div className="flex flex-1 flex-col pb-10">
      {showTrialBanner ? (
        <button
          type="button"
          onClick={onOpenPaywall}
          className="w-full bg-clay px-5 py-3 text-center text-lg font-semibold text-cream-card transition-colors hover:bg-clay-dark sm:rounded-t-[40px]"
        >
          Free trial: {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left.
        </button>
      ) : null}

      <div className="flex flex-1 flex-col px-7 pt-8">
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
          <p className="mt-8 text-2xl text-ink-soft animate-fade-up">
            Hello, <span className="font-semibold text-ink">{firstName}</span>.
          </p>
        )}

        <div className={`${firstName ? "mt-6" : "mt-16"} animate-fade-up`}>
          <h1 className="font-serif text-6xl font-semibold leading-[1.05] tracking-tight text-ink">
            {allDone ? (
              <>
                All done
                <br />
                for today.
              </>
            ) : (
              <>
                Today's
                <br />
                lesson is
                <br />
                ready.
              </>
            )}
          </h1>
          <p className="mt-6 text-xl text-ink-soft">
            {allDone
              ? "Great work. Come back tomorrow for the next one."
              : "One lesson at a time."}
          </p>
        </div>

        <div className="mt-auto pt-14">
          <div className="grid grid-cols-2 gap-4">
            <div className="stat-card">
              <div className="flex items-center gap-2">
                <FlameIcon className="h-7 w-7 text-clay" />
                <span className="font-serif text-4xl font-bold text-clay">
                  {streak}
                </span>
              </div>
              <p className="mt-1 text-lg text-ink-soft">days in a row</p>
            </div>

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
            {allDone ? "See your path" : "Start today's lesson"}
          </button>

          {showUpgrade ? (
            <button
              type="button"
              onClick={onOpenPaywall}
              className="btn-secondary mt-3"
            >
              Upgrade
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
