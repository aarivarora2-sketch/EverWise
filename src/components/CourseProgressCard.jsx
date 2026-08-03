// Sidebar progress summary: which phase the learner is on and how much of
// the whole course is behind them. Lives in the nav so it is visible from
// every screen, not just the path.

export default function CourseProgressCard({
  percent = 0,
  phaseNumber,
  phaseTitle,
  phaseBiome,
  phaseColor = "#B0512F",
  phaseCount,
  isComplete = false,
}) {
  const safePercent = Math.min(100, Math.max(0, Math.round(percent)));

  return (
    <div className="app-navigation-progress">
      <p className="app-navigation-progress-eyebrow">
        {isComplete
          ? "Course complete"
          : phaseNumber
            ? `Phase ${phaseNumber}${phaseCount ? ` of ${phaseCount}` : ""}`
            : "Your progress"}
      </p>

      {phaseTitle ? (
        <p className="app-navigation-progress-title">{phaseTitle}</p>
      ) : null}
      {phaseBiome ? (
        <p className="app-navigation-progress-biome">{phaseBiome}</p>
      ) : null}

      <div
        className="app-navigation-progress-track"
        role="progressbar"
        aria-valuenow={safePercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Course progress"
      >
        <div
          className="app-navigation-progress-fill"
          style={{
            width: `${safePercent}%`,
            backgroundColor: phaseColor,
          }}
        />
      </div>

      <p className="app-navigation-progress-percent">
        {safePercent}% of the course done
      </p>
    </div>
  );
}
