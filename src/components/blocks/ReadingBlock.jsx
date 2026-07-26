import ReadAloud from "../ReadAloud";
import BlockShell from "./BlockShell";

// Opening screen of a scam-protection lesson: the objective, the question the
// lesson answers, the five universal warning signs reminder, and the reading.
export default function ReadingBlock({
  block,
  progress,
  progressTotal,
  onContinue,
  onBack,
}) {
  const speakText = [
    block.objective && `Learning goal. ${block.objective}`,
    block.question,
    block.text,
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <BlockShell
      label={block.label || "Learn"}
      progress={progress}
      progressTotal={progressTotal}
      onBack={onBack}
      footer={
        <button className="btn-primary" onClick={onContinue}>
          Continue
        </button>
      }
    >
      <div className="animate-fade-up">
        {block.heading && (
          <h1 className="font-serif text-4xl font-semibold leading-tight text-ink">
            {block.heading}
          </h1>
        )}

        {block.question && (
          <p className="mt-4 font-serif text-2xl italic leading-snug text-clay">
            &ldquo;{block.question}&rdquo;
          </p>
        )}

        {block.objective && (
          <div className="mt-6 rounded-3xl bg-cream-card px-6 py-5 shadow-card">
            <p className="text-base font-bold uppercase tracking-wide text-ink-faint">
              What you'll learn
            </p>
            <p className="mt-2 text-xl leading-relaxed text-ink">
              {block.objective}
            </p>
          </div>
        )}

        {block.warningSigns?.length > 0 && (
          <div className="mt-5 rounded-3xl bg-clay/10 px-6 py-5">
            <p className="text-base font-bold uppercase tracking-wide text-clay">
              The five warning signs
            </p>
            <ul className="mt-3 space-y-2">
              {block.warningSigns.map((sign) => (
                <li
                  key={sign}
                  className="flex gap-3 text-lg leading-snug text-ink"
                >
                  <span aria-hidden="true">🚩</span>
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-6 text-2xl leading-relaxed text-ink-soft">
          {block.text}
        </p>

        <div className="mt-7">
          <ReadAloud text={speakText} />
        </div>
      </div>
    </BlockShell>
  );
}
