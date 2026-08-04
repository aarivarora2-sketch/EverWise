import test from "node:test";
import assert from "node:assert/strict";
import {
  canOpenLesson,
  resolveFullAccess,
  shouldExitProtectedContent,
  shouldShowSubscriptionControls,
} from "../src/utils/access.js";

test("active sponsored users have full access without subscription controls", () => {
  assert.equal(
    resolveFullAccess({
      sponsoredStatus: "active",
      subscriptionStatus: "expired",
      developmentBypass: false,
    }),
    true,
  );
  assert.equal(
    shouldShowSubscriptionControls({
      sponsoredStatus: "active",
    }),
    false,
  );
});

test("public expired users remain gated", () => {
  assert.equal(
    resolveFullAccess({
      sponsoredStatus: "none",
      subscriptionStatus: "expired",
      developmentBypass: false,
    }),
    false,
  );
});

test("an EverWise roster-style username does not grant access without server sponsorship", () => {
  assert.equal(
    resolveFullAccess({
      username: "EverWise001",
      sponsoredStatus: "none",
      subscriptionStatus: "expired",
      developmentBypass: false,
    }),
    false,
  );
});

test("public learners can complete the introduction and Lesson 1 only", () => {
  assert.equal(
    canOpenLesson({ lessonId: "welcome", completed: false, fullAccess: false }),
    true,
  );
  assert.equal(
    canOpenLesson({ lessonId: "internet", completed: false, fullAccess: false }),
    true,
  );
  assert.equal(
    canOpenLesson({ lessonId: "devices", completed: false, fullAccess: false }),
    false,
  );
  assert.equal(
    canOpenLesson({ lessonId: "devices", completed: true, fullAccess: false }),
    true,
  );
  assert.equal(
    canOpenLesson({ lessonId: "devices", completed: false, fullAccess: true }),
    true,
  );
});

test("only unfinished protected course content exits after access is revoked", () => {
  const cases = [
    {
      name: "unfinished protected lesson",
      input: {
        screen: "lesson",
        itemId: "devices",
        completedIds: [],
        fullAccess: false,
      },
      expected: true,
    },
    {
      name: "unfinished challenge",
      input: {
        screen: "challenge",
        itemId: "challenge-1",
        completedIds: [],
        fullAccess: false,
      },
      expected: true,
    },
    {
      name: "unfinished exam",
      input: {
        screen: "exam",
        itemId: "exam-1",
        completedIds: [],
        fullAccess: false,
      },
      expected: true,
    },
    {
      name: "completed protected lesson",
      input: {
        screen: "lesson",
        itemId: "devices",
        completedIds: ["devices"],
        fullAccess: false,
      },
      expected: false,
    },
    {
      name: "completed challenge",
      input: {
        screen: "challenge",
        itemId: "challenge-1",
        completedIds: ["challenge-1"],
        fullAccess: false,
      },
      expected: false,
    },
    {
      name: "completed exam",
      input: {
        screen: "exam",
        itemId: "exam-1",
        completedIds: ["exam-1"],
        fullAccess: false,
      },
      expected: false,
    },
    {
      name: "free welcome lesson",
      input: {
        screen: "lesson",
        itemId: "welcome",
        completedIds: [],
        fullAccess: false,
      },
      expected: false,
    },
    {
      name: "free Lesson 1",
      input: {
        screen: "lesson",
        itemId: "internet",
        completedIds: [],
        fullAccess: false,
      },
      expected: false,
    },
    {
      name: "non-player screen",
      input: {
        screen: "path",
        itemId: "devices",
        completedIds: [],
        fullAccess: false,
      },
      expected: false,
    },
    {
      name: "missing item ID",
      input: {
        screen: "lesson",
        itemId: null,
        completedIds: [],
        fullAccess: false,
      },
      expected: false,
    },
    {
      name: "full access",
      input: {
        screen: "exam",
        itemId: "exam-1",
        completedIds: [],
        fullAccess: true,
      },
      expected: false,
    },
  ];

  for (const { name, input, expected } of cases) {
    assert.equal(shouldExitProtectedContent(input), expected, name);
  }
});
