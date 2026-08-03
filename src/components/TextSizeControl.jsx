// The −/+ text size stepper. It lives in one place so every screen can show
// the same control: the persistent nav (tablet and desktop), the Home intro
// row, and the Settings screen (the reliable route on a phone, where the nav
// is hidden).

import { TEXT_SIZES, textSizeStep } from "../utils/textSize";

export default function TextSizeControl({
  textSize,
  onTextSizeChange,
  className = "",
  buttonClassName = "h-11 w-11 lg:h-20 lg:w-20",
  label = "Text size",
}) {
  const index = Math.max(0, TEXT_SIZES.indexOf(textSize));
  const atSmallest = index === 0;
  const atLargest = index === TEXT_SIZES.length - 1;

  return (
    <div
      className={`flex shrink-0 items-center overflow-hidden rounded-xl border-2 border-ink/15 bg-cream-card ${className}`}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onTextSizeChange(textSizeStep(textSize, -1))}
        disabled={atSmallest}
        aria-label="Make text smaller"
        className={`text-size-control flex items-center justify-center font-bold text-ink transition-colors hover:bg-cream-deep disabled:cursor-not-allowed disabled:text-ink-faint ${buttonClassName}`}
      >
        −
      </button>
      <span className="h-7 w-px bg-ink/15 lg:h-12" aria-hidden="true" />
      <button
        type="button"
        onClick={() => onTextSizeChange(textSizeStep(textSize, 1))}
        disabled={atLargest}
        aria-label="Make text larger"
        className={`text-size-control flex items-center justify-center font-bold text-ink transition-colors hover:bg-cream-deep disabled:cursor-not-allowed disabled:text-ink-faint ${buttonClassName}`}
      >
        +
      </button>
    </div>
  );
}
