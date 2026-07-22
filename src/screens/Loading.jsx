export default function Loading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-7 text-center">
      <img
        src="/everwise-icon.svg"
        alt=""
        aria-hidden="true"
        className="h-16 w-16 rounded-2xl"
      />
      <p className="mt-6 font-serif text-3xl font-semibold text-ink">Everwise</p>
      <p className="mt-2 text-lg text-ink-soft" role="status">
        Loading…
      </p>
    </div>
  );
}
