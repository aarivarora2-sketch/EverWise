import test from "node:test";
import assert from "node:assert/strict";
import {
  canOpenLesson,
  resolveFullAccess,
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
