import {
  MessageSearchIcon,
  ShieldIcon,
  StarIcon,
} from "../components/Icons";
import AddToHomeScreenBanner from "../components/AddToHomeScreenBanner";

export default function Home({
  name,
  scamsCaught = 0,
  badgesEarned = 0,
  allDone,
  textSize,
  onTextSizeChange,
  onStart,
  onOpenBadges,
  onOpenSettings,
  onOpenScamChecker,
}) {
  const firstName = name ? name.trim().split(" ")[0] : "";
  const textSizes = Array.from(
    { length: 10 },
    (_, index) => `size-${index + 1}`,
  );
  const textSizeIndex = Math.max(0, textSizes.indexOf(textSize));
  const decreaseTextSize = () =>
    onTextSizeChange(textSizes[Math.max(0, textSizeIndex - 1)]);
  const increaseTextSize = () =>
    onTextSizeChange(
      textSizes[Math.min(textSizes.length - 1, textSizeIndex + 1)],
    );

  return (
    <div className="home-screen flex h-full min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="home-content flex h-full min-h-full flex-1 flex-col px-6 pb-3 pt-5">
        <div className="home-header flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/everwise-logo-192.png"
              alt=""
              aria-hidden="true"
              className="h-9 w-9 object-contain"
            />
            <p className="font-sans text-xl font-semibold tracking-tight text-ink">
              Everwise
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            className="shrink-0 rounded-full px-3 py-2 text-base font-semibold text-ink-soft transition-colors hover:bg-cream-deep"
          >
            Settings
          </button>
        </div>

        <div className="mt-4">
          <AddToHomeScreenBanner />
        </div>

        <div className="home-intro mt-1 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xl text-ink-soft animate-fade-up">
              Hello{firstName ? (
                <>
                  , <span className="font-semibold text-ink">{firstName}</span>
                </>
              ) : null}
              .
            </p>
            <p className="mt-1 text-lg leading-snug text-ink-soft animate-fade-up">
              Learn at your own pace. Your progress is saved automatically.
            </p>
          </div>

          <div
            className="flex shrink-0 items-center overflow-hidden rounded-xl border-2 border-ink/15 bg-cream-card"
            role="group"
            aria-label="Text size"
          >
            <button
              type="button"
              onClick={decreaseTextSize}
              disabled={textSizeIndex === 0}
              aria-label="Make text smaller"
              className="text-size-control flex h-11 w-11 items-center justify-center font-bold text-ink transition-colors hover:bg-cream-deep disabled:cursor-not-allowed disabled:text-ink-faint"
            >
              −
            </button>
            <span className="h-7 w-px bg-ink/15" aria-hidden="true" />
            <button
              type="button"
              onClick={increaseTextSize}
              disabled={textSizeIndex === textSizes.length - 1}
              aria-label="Make text larger"
              className="text-size-control flex h-11 w-11 items-center justify-center font-bold text-ink transition-colors hover:bg-cream-deep disabled:cursor-not-allowed disabled:text-ink-faint"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-5 flex min-h-0 flex-1 flex-col justify-between gap-4 pb-1">
          <button
            type="button"
            onClick={onOpenScamChecker}
            className="w-full rounded-3xl border-2 border-clay/25 bg-clay/10 px-5 py-4 text-left transition-colors hover:bg-clay/15"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-clay text-cream-card">
                <MessageSearchIcon className="h-7 w-7" />
              </span>
              <span>
                <span className="block text-lg font-bold text-ink">
                  Check a suspicious message
                </span>
                <span className="mt-0.5 block text-base leading-snug text-ink-soft">
                  Paste it and get clear next steps.
                </span>
              </span>
            </div>
          </button>

          <div className="home-stats grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onOpenBadges}
              className="stat-card py-3 text-left transition-transform active:translate-y-0.5"
            >
              <div className="flex items-center gap-2">
                <ShieldIcon className="h-6 w-6 text-clay" />
                <span className="font-sans text-3xl font-bold text-clay">
                  {badgesEarned}
                </span>
              </div>
              <p className="mt-1 text-base text-ink-soft">
                badges <span className="font-semibold text-ink">· view</span>
              </p>
            </button>

            <div className="stat-card py-3">
              <div className="flex items-center gap-2">
                <StarIcon className="h-6 w-6 text-sage" />
                <span className="font-sans text-3xl font-bold text-sage">
                  {scamsCaught}
                </span>
              </div>
              <p className="mt-1 text-base text-ink-soft">scams caught</p>
            </div>
          </div>

          <button className="btn-primary py-4" onClick={onStart}>
            {allDone ? "See your path" : "Continue learning"}
          </button>
        </div>
      </div>
    </div>
  );
}
