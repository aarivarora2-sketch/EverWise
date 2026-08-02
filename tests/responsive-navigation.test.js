import test from "node:test";
import assert from "node:assert/strict";

import { primaryNavigationState } from "../src/utils/responsiveNavigation.js";

const expectedLabels = [
  "Home",
  "Course",
  "Scam Checker",
  "Badges",
  "Settings",
];

test("signed-out screens do not expose primary application navigation", () => {
  assert.deepEqual(primaryNavigationState("landing", false), []);
});

test("signed-in Home exposes the full primary navigation in a stable order", () => {
  const items = primaryNavigationState("home", true);

  assert.deepEqual(
    items.map((item) => item.label),
    expectedLabels,
  );
  assert.equal(items.find((item) => item.id === "home")?.active, true);
  assert.equal(items.filter((item) => item.active).length, 1);
});

test("course path marks Course as the active destination", () => {
  const items = primaryNavigationState("path", true);

  assert.equal(items.find((item) => item.id === "course")?.active, true);
  assert.equal(items.filter((item) => item.active).length, 1);
});

test("focused learning screens omit primary navigation", () => {
  for (const screen of ["lesson", "challenge", "exam", "complete", "paywall"]) {
    assert.deepEqual(primaryNavigationState(screen, true), []);
  }
});
