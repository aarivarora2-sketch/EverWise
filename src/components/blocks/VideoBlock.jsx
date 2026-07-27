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
          <h1 className="font-serif text-4xl font-semibold leading-tight text-ink">
            {block.heading}
          </h1>
        )}
        {block.text && (
          <p className="mt-4 text-2xl leading-relaxed text-ink-soft">
            {block.text}
          </p>
        )}

        <div className="mt-6 overflow-hidden rounded-3xl bg-ink/5 shadow-card">
          {hasVideo ? (
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                title={block.heading || "Video"}
                src={`https://www.youtube.com/embed/${block.videoId}?rel=0`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          ) : (
            <div className="flex min-h-[200px] flex-col items-center justify-center px-6 py-10 text-center">
              <p className="text-xl font-semibold text-ink">
                Video coming soon
              </p>
              <p className="mt-2 text-lg text-ink-soft">
                Add the YouTube ID to this lesson to show it here.
              </p>
            </div>
          )}
        </div>

        {block.footer && (
          <p className="mt-6 text-xl leading-relaxed text-ink-soft">
            {block.footer}
          </p>
        )}
      </div>
    </BlockShell>
  );
}
