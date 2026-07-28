import { useEffect, useRef } from "react";
import LessonTopBar from "../LessonTopBar";

// Shared chrome for every lesson block and quiz question.
export default function BlockShell({
  label,
  progress,
  progressTotal,
  onBack,
  onSkip,
  children,
  footer,
  scrollKey,
  revealKey,
}) {
  const contentRef = useRef(null);
  const hadFooterRef = useRef(Boolean(footer));

  // Multi-question activities reuse the same shell. Always begin a new
  // question at the top instead of leaving the learner at the old scroll spot.
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [scrollKey]);

  // When feedback and its action appear, bring them into view automatically.
  // The action remains outside the scrolling area, so it is always easy to tap.
  useEffect(() => {
    const hasFooter = Boolean(footer);
    const shouldReveal = hasFooter && !hadFooterRef.current;
    hadFooterRef.current = hasFooter;

    if (!shouldReveal) return undefined;

    const frame = window.requestAnimationFrame(() => {
      const content = contentRef.current;
      content?.scrollTo({ top: content.scrollHeight, behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [footer]);

  // Some activities always have a footer (for example, Check becomes
  // Continue), so they explicitly signal when their feedback should be shown.
  useEffect(() => {
    if (revealKey == null) return undefined;

    const frame = window.requestAnimationFrame(() => {
      const content = contentRef.current;
      content?.scrollTo({ top: content.scrollHeight, behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [revealKey]);

  return (
    <div className="flex h-full max-h-full min-h-0 flex-1 flex-col overflow-hidden">
      <LessonTopBar
        label={label}
        progress={progress}
        progressTotal={progressTotal}
        onBack={onBack}
        onSkip={onSkip}
      />
      <div
        ref={contentRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6 pt-6"
      >
        {children}
      </div>
      <div className="shrink-0 border-t border-ink/5 bg-cream px-6 py-5">
        {footer || (
          <button
            type="button"
            className="btn-primary"
            disabled
            aria-label="Choose an answer before continuing"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
