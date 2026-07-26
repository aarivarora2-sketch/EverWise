import ReadAloud from "../ReadAloud";
import BlockShell from "./BlockShell";

// Ties today's lesson back to earlier ones, so lessons feel connected
// instead of like separate pieces of information.
export default function MemoryBlock({
  block,
  progress,
  progressTotal,
  onContinue,
  onBack,
}) {
  const links = block.links || [];
  const speakText = [
    "Memory connection.",
    ...links.map((l) => `${l.lesson}. ${l.note}`),
  ].join(" ");

  return (
    <BlockShell
      label="Remember"
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
        <h1 className="font-serif text-3xl font-semibold leading-tight text-ink">
          You've practiced these skills before
        </h1>
        <p className="mt-3 text-xl leading-relaxed text-ink-soft">
          Today's lesson builds on what you already know.
        </p>

        <div className="mt-7 space-y-4">
          {links.map((link) => (
            <div
              key={link.lesson}
              className="rounded-3xl bg-cream-card px-6 py-5 shadow-card"
            >
              <p className="text-base font-bold uppercase tracking-wide text-clay">
                {link.lesson}
              </p>
              <p className="mt-2 text-xl leading-relaxed text-ink">
                {link.note}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-7">
          <ReadAloud text={speakText} />
        </div>
      </div>
    </BlockShell>
  );
}
