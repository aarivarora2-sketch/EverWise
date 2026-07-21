import { TrophyIcon, FlameIcon, StarIcon } from "../components/Icons";

export default function Complete({
  streak,
  scamsCaught,
  wasProtection,
  allDone,
  onDone,
}) {
  return (
    <div className="flex flex-1 flex-col items-center px-7 pb-10 pt-8 text-center">
      <div className="mt-14 animate-pop-in">
        <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-sage text-cream-card shadow-node-sage">
          <TrophyIcon className="h-16 w-16" />
        </div>
      </div>

      <h1 className="mt-10 font-serif text-5xl font-semibold leading-tight text-ink animate-fade-up">
        {allDone ? "Path complete!" : "Lesson complete!"}
      </h1>
      <p className="mt-4 text-2xl text-ink-soft">
        {wasProtection
          ? "That's one more trick you can spot."
          : "A new everyday skill, learned."}
      </p>

      <div className="mt-12 grid w-full grid-cols-2 gap-4">
        <div className="stat-card flex flex-col items-center">
          <FlameIcon className="h-8 w-8 text-clay" />
          <span className="mt-1 font-serif text-4xl font-bold text-clay">
            {streak}
          </span>
          <p className="text-lg text-ink-soft">day streak</p>
        </div>
        <div className="stat-card flex flex-col items-center">
          <StarIcon className="h-8 w-8 text-sage" />
          <span className="mt-1 font-serif text-4xl font-bold text-sage">
            {scamsCaught}
          </span>
          <p className="text-lg text-ink-soft">scams caught</p>
        </div>
      </div>

      <div className="mt-auto w-full pt-14">
        <button className="btn-primary" onClick={onDone}>
          {allDone ? "See your path" : "Back to your path"}
        </button>
      </div>
    </div>
  );
}
