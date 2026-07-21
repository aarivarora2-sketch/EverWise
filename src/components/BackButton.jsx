import { ArrowLeftIcon } from "./Icons";

// A large, clearly labeled back control for the entry-flow screens.
export default function BackButton({ onClick, label = "Back" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-ml-2 flex items-center gap-1 rounded-full p-2 text-lg font-semibold text-ink-soft transition-colors hover:bg-cream-deep"
      aria-label={label}
    >
      <ArrowLeftIcon className="h-7 w-7" />
      {label}
    </button>
  );
}
