import {
  badgeCatalog,
  badgeCounts,
  extraEarnedBadges,
} from "../utils/badges";
import { phaseLabel } from "../data/phases";
import {
  ArrowLeftIcon,
  LockIcon,
  ShieldIcon,
  TrophyIcon,
} from "../components/Icons";

// Mix color A into color B by weight (0-1 = how much of A).
function mixHex(a, b, weightA) {
  const parse = (hex) => {
    const h = hex.replace("#", "");
    const n = parseInt(
      h.length === 3 ? h.split("").map((c) => c + c).join("") : h,
      16
    );
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const w = Math.min(1, Math.max(0, weightA));
  const r = Math.round(ar * w + br * (1 - w));
  const g = Math.round(ag * w + bg * (1 - w));
  const bl = Math.round(ab * w + bb * (1 - w));
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, "0")}`;
}

const CREAM = "#EFE9DC";

function BadgeTile({ badge, earned, color }) {
  const lockedFill = mixHex(color, CREAM, 0.16);
  const lockedText = mixHex(color, "#6B675F", 0.3);

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
        style={
          earned
            ? {
                backgroundColor: color,
                color: "#FFFFFF",
                boxShadow: `0 5px 0 ${mixHex(color, "#000000", 0.75)}`,
              }
            : { backgroundColor: lockedFill, color: lockedText }
        }
        aria-hidden="true"
      >
        {earned ? (
          badge.source === "exam" ? (
            <TrophyIcon className="h-12 w-12" />
          ) : (
            <ShieldIcon className="h-12 w-12" />
          )
        ) : (
          <LockIcon className="h-10 w-10" />
        )}
      </div>
      <p
        className="mt-3 text-[17px] font-semibold leading-snug"
        style={{ color: earned ? color : lockedText }}
      >
        {badge.name}
      </p>
      <p className="mt-0.5 text-[15px] leading-snug text-ink-faint">
        {earned ? badge.subtitle : "Not earned yet"}
      </p>
    </div>
  );
}

export default function Badges({ badges = [], onBack }) {
  const earnedSet = new Set(badges);
  const groups = badgeCatalog();
  const { earnedCount, total } = badgeCounts(badges);
  const bonus = extraEarnedBadges(badges);
  const pct = total > 0 ? Math.round((earnedCount / total) * 100) : 0;

  return (
    <div className="flex flex-1 flex-col">
      <header className="rounded-t-none bg-[#B5502E] px-5 py-4 text-cream-card sm:rounded-t-[40px]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to home"
            className="rounded-full p-1.5 text-cream-card/90 transition-colors hover:bg-white/15"
          >
            <ArrowLeftIcon className="h-7 w-7" />
          </button>
          <div>
            <h1 className="font-sans text-2xl font-semibold">Your badges</h1>
            <p className="text-sm font-semibold text-cream-card/75">
              {earnedCount} of {total} earned
            </p>
          </div>
        </div>

        <div
          className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/25"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={earnedCount}
          aria-label="Badges earned"
        >
          <div
            className="h-full rounded-full bg-cream-card transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-10 pt-7">
        {earnedCount === 0 && (
          <p className="mb-8 rounded-3xl bg-cream-card px-6 py-6 text-center text-xl leading-snug text-ink-soft shadow-card">
            Finish your first lesson to earn your first badge.
          </p>
        )}

        {groups.map(({ phase, badges: list }) => {
          const got = list.filter((b) => earnedSet.has(b.name)).length;
          return (
            <section key={phase.number} className="mb-10">
              <div
                className="h-px w-full"
                style={{ backgroundColor: phase.color }}
                aria-hidden="true"
              />
              <p
                className="mt-3 text-[15px] font-bold uppercase tracking-[0.12em]"
                style={{ color: phase.color }}
              >
                Phase {phaseLabel(phase)} · {phase.biome}
              </p>
              <div className="mt-1 flex items-baseline justify-between gap-3">
                <h2 className="font-sans text-[26px] font-bold leading-tight text-ink">
                  {phase.title}
                </h2>
                <span
                  className="shrink-0 text-[15px] font-bold"
                  style={{ color: phase.color }}
                >
                  {got}/{list.length}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8">
                {list.map((badge) => (
                  <BadgeTile
                    key={badge.name}
                    badge={badge}
                    earned={earnedSet.has(badge.name)}
                    color={phase.color}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {bonus.length > 0 && (
          <section className="mb-4">
            <div
              className="h-px w-full bg-sage"
              aria-hidden="true"
            />
            <p className="mt-3 text-[15px] font-bold uppercase tracking-[0.12em] text-sage-dark">
              Bonus
            </p>
            <h2 className="mt-1 font-sans text-[26px] font-bold leading-tight text-ink">
              Exam honors
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8">
              {bonus.map((name) => (
                <BadgeTile
                  key={name}
                  badge={{ name, source: "exam", subtitle: "Exam result" }}
                  earned
                  color="#6B8E5A"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
