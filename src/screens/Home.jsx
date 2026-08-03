import {
  MessageSearchIcon,
  ShieldIcon,
  StarIcon,
} from "../components/Icons";
import AddToHomeScreenBanner from "../components/AddToHomeScreenBanner";
import { PartnerLogo } from "../components/PartnerBrand.jsx";
import TextSizeControl from "../components/TextSizeControl";

export default function Home({
  partner = null,
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
  const partnerName = partner?.name?.trim();
  const firstName = name ? name.trim().split(" ")[0] : "";
  const textSizeControl = (
    <TextSizeControl
      textSize={textSize}
      onTextSizeChange={onTextSizeChange}
    />
  );

  return (
    // On a computer this screen sits in the dashboard pane next to the
    // sidebar (see DesktopSidebar/App.jsx) — it's a real page, not a phone
    // card, so it gets its own wide layout at the lg breakpoint. Below lg
    // (every phone, including the native app) this is unchanged.
    <div className="home-screen flex h-full min-h-0 flex-1 flex-col overflow-y-auto lg:bg-cream">
      <div className="home-content mx-auto flex h-full min-h-full w-full max-w-none flex-1 flex-col px-6 pb-3 pt-5 lg:max-w-5xl lg:px-12 lg:py-12">
        {/* Mobile-only compact header — the logo and Settings link live in
            the desktop sidebar instead, so this is redundant at lg+. */}
        <div className="home-header flex items-center justify-between gap-3 lg:hidden">
          <div className="flex items-center gap-3">
            <img
              src="/everwise-logo-192.png"
              alt=""
              aria-hidden="true"
              className="h-9 w-9 object-contain"
            />
            <div>
              <p className="font-sans text-xl font-semibold tracking-tight text-ink">
                Everwise
              </p>
              {partnerName ? (
                <div className="home-partner-lockup">
                  <PartnerLogo
                    partner={partner}
                    className="home-partner-logo"
                  />
                  <p className="home-partner-branding">
                    Access provided by {partnerName}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            className="shrink-0 rounded-full px-3 py-2 text-base font-semibold text-ink-soft transition-colors hover:bg-cream-deep"
          >
            Settings
          </button>
        </div>

        <div className="mt-4 lg:hidden">
          <AddToHomeScreenBanner />
        </div>

        {/* Mobile intro row (name + inline text-size control) */}
        <div className="home-intro mt-1 flex items-start justify-between gap-4 lg:hidden">
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
          {textSizeControl}
        </div>

        {/* Desktop page header — text size remains available in the sidebar. */}
        <div className="hidden items-start justify-between gap-6 lg:flex">
          <div>
            <p className="font-sans text-6xl font-bold tracking-tight text-ink">
              Welcome back{firstName ? `, ${firstName}` : ""}.
            </p>
            <p className="mt-3 text-2xl leading-snug text-ink-soft">
              Learn at your own pace. Your progress is saved automatically.
            </p>
            <ul className="mt-4 max-w-2xl list-disc space-y-2 pl-6 text-2xl leading-snug text-ink-soft marker:text-clay">
              <li>
                Click <strong className="font-semibold text-ink">Continue learning</strong> below to jump back into your lessons.
              </li>
              <li>
                Use <strong className="font-semibold text-ink">Check a suspicious message</strong> anytime you get a text, email, or call that feels off.
              </li>
              <li>Your badges and scams-caught count update automatically as you go.</li>
              <li>Revisit any of it anytime from the menu on the left.</li>
            </ul>
          </div>
        </div>

        <div className="home-dashboard mt-5 flex min-h-0 flex-1 flex-col justify-between gap-4 pb-1 lg:mt-12 lg:pb-0">
          <button
            type="button"
            onClick={onOpenScamChecker}
            className="home-primary w-full rounded-3xl border-2 border-clay/25 bg-clay/10 px-5 py-4 text-left transition-colors hover:bg-clay/15 lg:px-7 lg:py-5"
          >
            <div className="flex items-center gap-3 lg:items-start lg:gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-clay text-cream-card lg:h-14 lg:w-14 lg:rounded-2xl">
                <MessageSearchIcon className="h-7 w-7 lg:h-7 lg:w-7" />
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-bold text-ink lg:text-xl">
                  Check a suspicious message
                </span>
                <span className="mt-0.5 block text-base leading-snug text-ink-soft lg:hidden">
                  Paste it and get clear next steps.
                </span>

                {/* Desktop-only: the mobile card is a compact one-line
                    teaser, but this card is a supporting element beside
                    the dashboard, not the hero — keep it modest. */}
                <p className="mt-2 hidden max-w-md text-sm leading-snug text-ink-soft lg:block">
                  Got a text, email, or call that felt a little off? Paste
                  it in and get a clear breakdown of the warning signs —
                  in seconds.
                </p>
                <div className="mt-3 hidden flex-wrap gap-1.5 lg:flex">
                  {[
                    "Fake prize texts",
                    "Tech support calls",
                    "Bank & IRS alerts",
                    "Romance scams",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-clay/15 px-2.5 py-1 text-xs font-semibold text-clay-dark"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-3 hidden text-base font-bold text-clay-dark lg:block">
                  Check a message →
                </p>
              </span>
            </div>
          </button>

          <div className="home-support home-stats grid grid-cols-2 gap-3 lg:gap-8">
            <button
              type="button"
              onClick={onOpenBadges}
              className="stat-card py-3 text-left transition-transform active:translate-y-0.5 lg:flex lg:flex-col lg:justify-center lg:py-10"
            >
              <div className="flex items-center gap-2 lg:gap-4">
                <ShieldIcon className="h-6 w-6 text-clay lg:h-11 lg:w-11" />
                <span className="font-sans text-3xl font-bold text-clay lg:text-7xl">
                  {badgesEarned}
                </span>
              </div>
              <p className="mt-1 text-base text-ink-soft lg:mt-3 lg:text-2xl">
                badges <span className="font-semibold text-ink">· view</span>
              </p>
            </button>

            <div className="stat-card py-3 lg:flex lg:flex-col lg:justify-center lg:py-10">
              <div className="flex items-center gap-2 lg:gap-4">
                <StarIcon className="h-6 w-6 text-sage lg:h-11 lg:w-11" />
                <span className="font-sans text-3xl font-bold text-sage lg:text-7xl">
                  {scamsCaught}
                </span>
              </div>
              <p className="mt-1 text-base text-ink-soft lg:mt-3 lg:text-2xl">
                scams caught
              </p>
            </div>
          </div>

          <button
            className="home-primary-cta btn-primary py-4 lg:px-16 lg:py-8 lg:text-4xl"
            onClick={onStart}
          >
            {allDone ? "See your path" : "Continue learning"}
          </button>
        </div>
      </div>
    </div>
  );
}
