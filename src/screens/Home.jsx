import { FlameIcon, StarIcon } from "../components/Icons";

export default function Home({ streak, scamsCaught, allDone, onStart }) {
  return (
    <div className="flex flex-1 flex-col px-7 pb-10 pt-8">
      <p className="font-serif text-2xl font-semibold tracking-tight text-ink">
        Everwise
      </p>

      <div className="mt-16 animate-fade-up">
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
            : "Two minutes. One scam to learn."}
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
      </div>
    </div>
  );
}
