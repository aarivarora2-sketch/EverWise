import test from "node:test";
import assert from "node:assert/strict";
import {
  requiredCourseIds,
  isCourseComplete,
  phaseRequirementsComplete,
  isPlayableUnlocked,
  findCurrentPlayableId,
  labelFinalLessonsForChallenges,
  getChallengeCompletionContent,
} from "../src/utils/courseProgress.js";

const lessons = [
  {
    id: "p1-l1",
    kind: "lesson",
    phase: 1,
    order: 0,
    complete: { next: "Old Phase 1 label" },
  },
  {
    id: "p2-l1",
    kind: "lesson",
    phase: 2,
    order: 0,
    complete: { next: "Old Phase 2 label" },
  },
];

const challenges = [
  {
    id: "phase1-challenge",
    kind: "challenge",
    phase: 1,
    nextKind: "phase",
    nextLabel: "Phase 2 — Safe Internet Habits",
  },
  {
    id: "phase2-challenge",
    kind: "challenge",
    phase: 2,
    nextKind: "exam",
    nextLabel: "Phase 2 Final Exam",
  },
];

const exams = [
  {
    id: "phase2-exam",
    kind: "exam",
    phase: 2,
  },
];

const curriculum = { lessons, challenges, exams };

const playables = [
  { ...lessons[0], kind: "lesson" },
  { ...challenges[0], kind: "challenge" },
  { ...lessons[1], kind: "lesson" },
  { ...challenges[1], kind: "challenge" },
  { ...exams[0], kind: "exam" },
];

test("requiredCourseIds returns every required item in phase order", () => {
  assert.deepEqual(
    requiredCourseIds(lessons, challenges, exams),
    [
      "p1-l1",
      "phase1-challenge",
      "p2-l1",
      "phase2-challenge",
      "phase2-exam",
    ],
  );
});

test("course completion requires exact lesson, challenge, and exam IDs", () => {
  const requiredIds = requiredCourseIds(lessons, challenges, exams);

  assert.equal(isCourseComplete(["p1-l1"], requiredIds), false);
  assert.equal(
    isCourseComplete(
      ["p1-l1", "p2-l1", "phase1-challenge", "phase2-challenge"],
      requiredIds,
    ),
    false,
  );
  assert.equal(
    isCourseComplete(
      ["p1-l1", "p2-l1", "phase1-challenge", "phase2-exam"],
      requiredIds,
    ),
    false,
  );
  assert.equal(isCourseComplete(requiredIds, requiredIds), true);
  assert.equal(
    isCourseComplete([...requiredIds, "historical-completion-id"], requiredIds),
    true,
  );
});

test("phaseRequirementsComplete includes the challenge and optional exam", () => {
  assert.equal(
    phaseRequirementsComplete(1, new Set(["p1-l1"]), curriculum),
    false,
  );
  assert.equal(
    phaseRequirementsComplete(
      1,
      new Set(["p1-l1", "phase1-challenge"]),
      curriculum,
    ),
    true,
  );
  assert.equal(
    phaseRequirementsComplete(
      2,
      new Set(["p2-l1", "phase2-challenge"]),
      curriculum,
    ),
    false,
  );
  assert.equal(
    phaseRequirementsComplete(
      2,
      new Set(["p2-l1", "phase2-challenge", "phase2-exam"]),
      curriculum,
    ),
    true,
  );
});

test("playables unlock only in lesson, challenge, exam, next-phase order", () => {
  assert.equal(
    isPlayableUnlocked(challenges[0], new Set(), curriculum),
    false,
  );
  assert.equal(
    isPlayableUnlocked(challenges[0], new Set(["p1-l1"]), curriculum),
    true,
  );
  assert.equal(
    isPlayableUnlocked(lessons[1], new Set(["p1-l1"]), curriculum),
    false,
  );
  assert.equal(
    isPlayableUnlocked(
      lessons[1],
      new Set(["p1-l1", "phase1-challenge"]),
      curriculum,
    ),
    true,
  );
  assert.equal(
    isPlayableUnlocked(
      exams[0],
      new Set(["p2-l1", "phase2-challenge"]),
      curriculum,
    ),
    true,
  );
  assert.equal(
    isPlayableUnlocked(exams[0], new Set(["p2-l1"]), curriculum),
    false,
  );
});

test("findCurrentPlayableId stops at every phase-ending requirement", () => {
  assert.equal(findCurrentPlayableId(playables, [], curriculum), "p1-l1");
  assert.equal(
    findCurrentPlayableId(playables, ["p1-l1"], curriculum),
    "phase1-challenge",
  );
  assert.equal(
    findCurrentPlayableId(
      playables,
      ["p1-l1", "phase1-challenge"],
      curriculum,
    ),
    "p2-l1",
  );
  assert.equal(
    findCurrentPlayableId(
      playables,
      ["p1-l1", "phase1-challenge", "p2-l1"],
      curriculum,
    ),
    "phase2-challenge",
  );
  assert.equal(
    findCurrentPlayableId(
      playables,
      ["p1-l1", "phase1-challenge", "p2-l1", "phase2-challenge"],
      curriculum,
    ),
    "phase2-exam",
  );
  assert.equal(
    findCurrentPlayableId(
      playables,
      [
        "p1-l1",
        "phase1-challenge",
        "p2-l1",
        "phase2-challenge",
        "phase2-exam",
      ],
      curriculum,
    ),
    null,
  );
});

test("only each phase's final lesson points to its Final Challenge", () => {
  const source = [
    {
      id: "p1-l1",
      phase: 1,
      order: 0,
      complete: { next: "Second lesson" },
    },
    {
      id: "p1-l2",
      phase: 1,
      order: 1,
      complete: { next: "Old phase ending" },
    },
    {
      id: "p2-l1",
      phase: 2,
      order: 0,
      complete: { next: "Old phase ending" },
    },
  ];
  const original = structuredClone(source);
  const normalized = labelFinalLessonsForChallenges(source, challenges);

  assert.deepEqual(source, original);
  assert.equal(normalized[0].complete.next, "Second lesson");
  assert.equal(normalized[1].complete.next, "Phase 1 Final Challenge");
  assert.equal(normalized[2].complete.next, "Phase 2 Final Challenge");
  assert.notEqual(normalized[1], source[1]);
  assert.equal(normalized[0], source[0]);
});

test("challenge completion copy names the real next step", () => {
  assert.deepEqual(
    getChallengeCompletionContent({
      phase: 3,
      nextKind: "exam",
      nextLabel: "Phase 3 Final Exam",
    }),
    {
      title: "Review complete",
      body: "Nice work reviewing Phase 3. Next: Phase 3 Final Exam.",
    },
  );
  assert.deepEqual(
    getChallengeCompletionContent({
      phase: 8,
      nextKind: "phase",
      nextLabel: "Phase 9 — The Warning Signs",
    }),
    {
      title: "Review complete",
      body:
        "Nice work reviewing Phase 8. Next: Phase 9 — The Warning Signs.",
    },
  );
  assert.deepEqual(
    getChallengeCompletionContent({
      phase: 17,
      nextKind: "course",
      nextLabel: "Course complete",
    }),
    {
      title: "Final Challenge complete",
      body: "You completed the Everwise course.",
    },
  );
});
