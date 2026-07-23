import ReadAloud from "../ReadAloud";
import BlockShell from "./BlockShell";

export default function LearnBlock({ block, progress, progressTotal, onContinue, onBack }) {
  const speakParts = [
    block.heading,
    block.text,
    ...(block.bullets || []),
    block.footer,
  ].filter(Boolean);

  return (
    <BlockShell
      label="Learn"
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
        {block.text && (
          <p className="mt-5 text-2xl leading-relaxed text-ink-soft">{block.text}</p>
        )}
        {block.bullets?.length > 0 && (
          <ul className="mt-6 space-y-3">
            {block.bullets.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-xl leading-snug text-ink"
              >
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-clay" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
        {block.footer && (
          <p className="mt-6 text-xl font-semibold leading-relaxed text-ink">
            {block.footer}
          </p>
        )}
        <div className="mt-8">
          <ReadAloud text={speakParts.join(". ")} />
        </div>
      </div>
    </BlockShell>
  );
}
