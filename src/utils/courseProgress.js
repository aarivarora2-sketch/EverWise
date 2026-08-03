function asDoneSet(completed) {
  return completed instanceof Set ? completed : new Set(completed);
}

function sortedPhases(lessons, challenges, exams) {
  return [
    ...new Set(
      [...lessons, ...challenges, ...exams]
        .map((item) => item.phase)
        .filter(Number.isFinite),
    ),
  ].sort((a, b) => a - b);
}

export function requiredCourseIds(lessons, challenges, exams) {
  const ids = [];

  for (const phase of sortedPhases(lessons, challenges, exams)) {
    ids.push(
      ...lessons
        .filter((item) => item.phase === phase)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((item) => item.id),
      ...challenges
        .filter((item) => item.phase === phase)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((item) => item.id),
      ...exams
        .filter((item) => item.phase === phase)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((item) => item.id),
    );
  }

  return ids;
}

// Overall course standing for the sidebar: which phase the learner is
// working through, and how far along the whole course they are. Percent is
// measured against every required item (lessons + challenges + exams), so it
// matches what the path screen actually asks them to finish.
export function courseStanding(completedIds, requiredIds, curriculum) {
  const doneSet = asDoneSet(completedIds);
  const total = requiredIds.length;
  const completed = requiredIds.filter((id) => doneSet.has(id)).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const { lessons, challenges, exams } = curriculum;
  const phases = sortedPhases(lessons, challenges, exams);

  // The current phase is the first one still carrying unfinished work; if
  // everything is done we stay on the last phase rather than running off the
  // end of the list.
  const currentPhase =
    phases.find(
      (phase) =>
        !phaseRequirementsComplete(phase, doneSet, {
          lessons,
          challenges,
          exams,
        }),
    ) ?? phases.at(-1) ?? null;

  return {
    completed,
    total,
    percent,
    currentPhase,
    phaseCount: phases.length,
    isComplete: total > 0 && completed === total,
  };
}

export function isCourseComplete(completedIds, requiredIds) {
  const doneSet = asDoneSet(completedIds);
  return requiredIds.every((id) => doneSet.has(id));
}

export function phaseRequirementsComplete(
  phase,
  completed,
  { lessons, challenges, exams },
) {
  const doneSet = asDoneSet(completed);
  const required = [
    ...lessons.filter((item) => item.phase === phase),
    ...challenges.filter((item) => item.phase === phase),
    ...exams.filter((item) => item.phase === phase),
  ];

  return required.length > 0 && required.every((item) => doneSet.has(item.id));
}

export function isPlayableUnlocked(
  playable,
  completed,
  { lessons, challenges, exams },
) {
  const doneSet = asDoneSet(completed);

  if (doneSet.has(playable.id)) return true;

  if (playable.kind === "challenge") {
    const phaseLessons = lessons.filter(
      (lesson) => lesson.phase === playable.phase,
    );
    return (
      phaseLessons.length > 0 &&
      phaseLessons.every((lesson) => doneSet.has(lesson.id))
    );
  }

  if (playable.kind === "exam") {
    const phaseLessons = lessons.filter(
      (lesson) => lesson.phase === playable.phase,
    );
    const phaseChallenges = challenges.filter(
      (challenge) => challenge.phase === playable.phase,
    );
    return (
      phaseLessons.length > 0 &&
      phaseLessons.every((lesson) => doneSet.has(lesson.id)) &&
      phaseChallenges.length > 0 &&
      phaseChallenges.every((challenge) => doneSet.has(challenge.id))
    );
  }

  if (playable.kind === "lesson") {
    const firstPhase = Math.min(...lessons.map((lesson) => lesson.phase));
    if (playable.phase === firstPhase) return true;

    return phaseRequirementsComplete(playable.phase - 1, doneSet, {
      lessons,
      challenges,
      exams,
    });
  }

  return false;
}

export function findCurrentPlayableId(
  playables,
  completed,
  curriculum,
) {
  const doneSet = asDoneSet(completed);

  for (const playable of playables) {
    if (doneSet.has(playable.id)) continue;
    return isPlayableUnlocked(playable, doneSet, curriculum)
      ? playable.id
      : null;
  }

  return null;
}

export function labelFinalLessonsForChallenges(lessons, challenges) {
  const challengePhases = new Set(
    challenges.map((challenge) => challenge.phase),
  );
  const lastLessonIdByPhase = new Map();

  for (const lesson of lessons) {
    if (!challengePhases.has(lesson.phase)) continue;
    const current = lastLessonIdByPhase.get(lesson.phase);
    if (!current || (lesson.order ?? 0) > (current.order ?? 0)) {
      lastLessonIdByPhase.set(lesson.phase, lesson);
    }
  }

  return lessons.map((lesson) => {
    if (lastLessonIdByPhase.get(lesson.phase)?.id !== lesson.id) {
      return lesson;
    }

    return {
      ...lesson,
      complete: {
        ...(lesson.complete ?? {}),
        next: `Phase ${lesson.phase} Final Challenge`,
      },
    };
  });
}

export function getChallengeCompletionContent(challenge) {
  if (challenge.nextKind === "course") {
    return {
      title: "Final Challenge complete",
      body: "You completed the Everwise course.",
    };
  }

  return {
    title: "Review complete",
    body:
      `Nice work reviewing Phase ${challenge.phase}. ` +
      `Next: ${challenge.nextLabel}.`,
  };
}
