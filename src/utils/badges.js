// Builds the full badge catalog from curriculum data so the Badges screen
// always stays in sync with the lessons — add a lesson, its badge appears.
//
// Profile stores earned badges as an array of badge NAME strings
// (see App.jsx finishLesson / finishExam), so matching is by name.

import { lessonsByOrder, examsByOrder, finalExam } from "../data/lessons";
import { allPhases as phases, getPhase, phaseLabel } from "../data/phases";

/**
 * All badges grouped by phase, in curriculum order.
 * [{ phase, badges: [{ name, source, subtitle, order }] }]
 */
export function badgeCatalog() {
  const byPhase = new Map();

  const push = (phaseNumber, badge) => {
    if (!badge?.name) return;
    if (!byPhase.has(phaseNumber)) byPhase.set(phaseNumber, []);
    const list = byPhase.get(phaseNumber);
    if (list.some((b) => b.name === badge.name)) return;
    list.push(badge);
  };

  lessonsByOrder.forEach((lesson) => {
    push(lesson.phase, {
      name: lesson.badge,
      source: "lesson",
      subtitle: lesson.pathTitle || lesson.title,
      order: lesson.order,
    });
  });

  examsByOrder.forEach((exam) => {
    if (!exam.phaseBadge) return;
    push(exam.phase, {
      name: exam.phaseBadge,
      source: "exam",
      subtitle: `Phase ${phaseLabel(getPhase(exam.phase))} final exam`,
      order: exam.order,
    });
  });

  // The capstone badge closes out the final phase's group.
  if (finalExam?.phaseBadge) {
    push(finalExam.phase, {
      name: finalExam.phaseBadge,
      source: "exam",
      subtitle: "Everwise final test",
      order: finalExam.order,
    });
  }

  return phases
    .filter((p) => byPhase.has(p.number))
    .map((p) => ({
      phase: p,
      badges: byPhase.get(p.number).sort((a, b) => a.order - b.order),
    }));
}

/** Flat list of every badge name in the app. */
export function allBadgeNames() {
  return badgeCatalog().flatMap((g) => g.badges.map((b) => b.name));
}

/**
 * Earned badges the catalog doesn't know about — exam result tiers like
 * "Safety Pro" are awarded dynamically, so they'd otherwise vanish.
 */
export function extraEarnedBadges(earned = []) {
  const known = new Set(allBadgeNames());
  return earned.filter((name) => !known.has(name));
}

export function badgeCounts(earned = []) {
  const total = allBadgeNames().length;
  const earnedSet = new Set(earned);
  const earnedCount = allBadgeNames().filter((n) => earnedSet.has(n)).length;
  return { earnedCount, total };
}

export { getPhase };
