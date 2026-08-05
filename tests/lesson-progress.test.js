import test from "node:test";
import assert from "node:assert/strict";
import {
  clearAllLessonPositions,
  clearLessonPosition,
  readLessonPosition,
  saveLessonPosition,
} from "../src/utils/lessonProgress.js";

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => (Object.hasOwn(data, key) ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
    removeItem: (key) => {
      delete data[key];
    },
    raw: data,
  };
}

const POSITION = { phase: "quiz", blockIndex: 3, quizIndex: 2, score: 1 };

test("a saved place is returned to the same learner and lesson only", () => {
  const storage = memoryStorage();
  assert.equal(
    saveLessonPosition({ uid: "u1", lessonId: "internet", position: POSITION, storage }),
    true,
  );

  assert.deepEqual(
    readLessonPosition({ uid: "u1", lessonId: "internet", storage }),
    POSITION,
  );
  // A different lesson, or a different learner on the same device, must not
  // inherit someone else's place.
  assert.equal(readLessonPosition({ uid: "u1", lessonId: "ai", storage }), null);
  assert.equal(readLessonPosition({ uid: "u2", lessonId: "internet", storage }), null);
});

test("finishing or leaving clears only the place it should", () => {
  const storage = memoryStorage();
  saveLessonPosition({ uid: "u1", lessonId: "internet", position: POSITION, storage });
  saveLessonPosition({ uid: "u1", lessonId: "ai", position: POSITION, storage });

  clearLessonPosition({ uid: "u1", lessonId: "internet", storage });
  assert.equal(readLessonPosition({ uid: "u1", lessonId: "internet", storage }), null);
  assert.deepEqual(readLessonPosition({ uid: "u1", lessonId: "ai", storage }), POSITION);

  // Signing out wipes every place, so a shared device never shows the next
  // person where the previous learner had reached.
  clearAllLessonPositions({ storage });
  assert.equal(readLessonPosition({ uid: "u1", lessonId: "ai", storage }), null);
});

test("malformed, corrupt, or out-of-range stored data is ignored rather than trusted", () => {
  for (const stored of [
    "not json at all",
    JSON.stringify("a string"),
    JSON.stringify({ "u1 internet": { phase: "nonsense", blockIndex: 0, quizIndex: 0, score: 0 } }),
    JSON.stringify({ "u1 internet": { phase: "block", blockIndex: -1, quizIndex: 0, score: 0 } }),
    JSON.stringify({ "u1 internet": { phase: "block", blockIndex: 1.5, quizIndex: 0, score: 0 } }),
    JSON.stringify({ "u1 internet": { phase: "block", blockIndex: 10_000, quizIndex: 0, score: 0 } }),
    JSON.stringify({ "u1 internet": { phase: "block", blockIndex: 0 } }),
    JSON.stringify({ "u1 internet": null }),
  ]) {
    const storage = memoryStorage({ "everwise.lessonPosition.v1": stored });
    assert.equal(
      readLessonPosition({ uid: "u1", lessonId: "internet", storage }),
      null,
      `trusted bad data: ${stored}`,
    );
  }
});

test("a refused or unavailable store never throws into the lesson", () => {
  const hostile = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("full");
    },
    removeItem: () => {
      throw new Error("blocked");
    },
  };

  assert.equal(readLessonPosition({ uid: "u1", lessonId: "internet", storage: hostile }), null);
  assert.equal(
    saveLessonPosition({ uid: "u1", lessonId: "internet", position: POSITION, storage: hostile }),
    false,
  );
  assert.equal(clearAllLessonPositions({ storage: hostile }), false);
  // Missing storage entirely (private mode, very old browser) is also fine.
  assert.equal(readLessonPosition({ uid: "u1", lessonId: "internet" }), null);
  assert.equal(saveLessonPosition({ uid: "u1", lessonId: "internet", position: POSITION }), false);
});

test("an invalid position is never written", () => {
  const storage = memoryStorage();
  for (const position of [
    null,
    { phase: "block" },
    { phase: "elsewhere", blockIndex: 0, quizIndex: 0, score: 0 },
    { phase: "block", blockIndex: 0, quizIndex: 0, score: -1 },
  ]) {
    assert.equal(
      saveLessonPosition({ uid: "u1", lessonId: "internet", position, storage }),
      false,
    );
  }
  assert.equal(readLessonPosition({ uid: "u1", lessonId: "internet", storage }), null);
});
