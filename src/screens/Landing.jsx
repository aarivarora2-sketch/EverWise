export default function Landing({ onGetStarted, onLogIn }) {
  return (
    <div className="flex flex-1 flex-col px-7 pb-10 pt-12">
      <div className="animate-fade-up">
        <p className="font-serif text-4xl font-bold tracking-tight text-clay">
          Everwise
        </p>

        <h1 className="mt-16 font-serif text-6xl font-semibold leading-[1.05] tracking-tight text-ink">
          Learn to
          <br />
          spot scams,
          <br />
          one lesson
          <br />
          a day.
        </h1>
        <p className="mt-6 text-2xl leading-relaxed text-ink-soft">
          Short, friendly lessons that help you use the internet with
          confidence. About two minutes a day.
        </p>
      </div>

      <div className="mt-auto space-y-4 pt-14">
        <button className="btn-primary" onClick={onGetStarted}>
          Get Started
        </button>
        <button className="btn-secondary" onClick={onLogIn}>
          Log In
        </button>
      </div>
    </div>
  );
}
