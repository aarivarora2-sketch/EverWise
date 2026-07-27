import BlockShell from "./BlockShell";

// Embeds a YouTube video. `block.videoId` is the part of a YouTube URL after
// "v=" — e.g. https://www.youtube.com/watch?v=ABC123 → videoId: "ABC123".
export default function VideoBlock({
  block,
  progress,
  progressTotal,
  onContinue,
  onBack,
}) {
  const hasVideo = Boolean(block.videoId);

  return (
    <BlockShell
      label={block.label || "Watch"}
      progress={progress}
      progressTotal={progressTotal}
      onBack={onBack}
      onSkip={onContinue}
      footer={
        <button className="btn-primary" onClick={onContinue}>
          {block.continueLabel || "Continue"}
        </button>
      }
    >
      <div className="animate-fade-up">
        {block.heading && (
          <h1 className="page-title">
            {block.heading}
          </h1>
        )}
        {block.text && (
          <p className="mt-4 text-2xl leading-relaxed text-ink-soft">
            {block.text}
          </p>
        )}

        {hasVideo ? (
          <div className="mt-6 overflow-hidden rounded-3xl bg-ink/5 shadow-card">
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                title={block.heading || "Video"}
                src={`https://www.youtube.com/embed/${block.videoId}?rel=0`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>
        ) : null}

        {block.footer && (
          <p className="mt-6 text-xl leading-relaxed text-ink-soft">
            {block.footer}
          </p>
        )}
      </div>
    </BlockShell>
  );
}
