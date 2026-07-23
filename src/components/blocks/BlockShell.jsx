import LessonTopBar from "../LessonTopBar";

// Shared chrome for every lesson block and quiz question.
export default function BlockShell({
  label,
  progress,
  progressTotal,
  onBack,
  children,
  footer,
}) {
  return (
    <div className="flex flex-1 flex-col">
      <LessonTopBar
        label={label}
        progress={progress}
        progressTotal={progressTotal}
        onBack={onBack}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6 pt-6">
        {children}
      </div>
      {footer && (
        <div className="shrink-0 border-t border-ink/5 bg-cream px-6 py-5">
          {footer}
        </div>
      )}
    </div>
  );
}
