import test from "node:test";
import assert from "node:assert/strict";
import {
  canOpenLesson,
  resolveFullAccess,
  shouldExitProtectedContent,
  shouldShowSubscriptionControls,
} from "../src/utils/access.js";

test("active sponsorship grants full access on every platform and hides controls", () => {
  for (const platform of ["web", "native", "unknown", null, undefined]) {
    assert.equal(
      resolveFullAccess({
        sponsoredStatus: "active",
        billingStatus: "unavailable",
        nativeSubscriptionStatus: "expired",
        platform,
        developmentBypass: false,
      }),
      true,
      String(platform),
    );
    assert.equal(
      shouldShowSubscriptionControls({ sponsoredStatus: "active", platform }),
      false,
      String(platform),
    );
  }
});

test("web access grants only webhook-backed Stripe trialing and active statuses", () => {
  for (const [billingStatus, expected] of [
    ["trialing", true],
    ["active", true],
    ["past_due", false],
    ["unpaid", false],
    ["incomplete", false],
    ["incomplete_expired", false],
    ["paused", false],
    ["canceled", false],
    ["none", false],
  ]) {
    assert.equal(
      resolveFullAccess({
        sponsoredStatus: "none",
        billingStatus,
        nativeSubscriptionStatus: "expired",
        platform: "web",
        developmentBypass: false,
      }),
      expected,
      billingStatus,
    );
  }
});

test("web access ignores legacy Firestore and native Apple entitlement statuses", () => {
  for (const legacyStatus of ["trial", "active"]) {
    assert.equal(
      resolveFullAccess({
        sponsoredStatus: "none",
        billingStatus: "none",
        nativeSubscriptionStatus: legacyStatus,
        subscriptionStatus: legacyStatus,
        platform: "web",
        developmentBypass: false,
      }),
      false,
      legacyStatus,
    );
  }
});

test("native access grants only the existing Apple trial and active entitlements", () => {
  for (const [nativeSubscriptionStatus, expected] of [
    ["trial", true],
    ["active", true],
    ["expired", false],
    ["none", false],
  ]) {
    assert.equal(
      resolveFullAccess({
        sponsoredStatus: "none",
        billingStatus: "none",
        nativeSubscriptionStatus,
        platform: "native",
        developmentBypass: false,
      }),
      expected,
      nativeSubscriptionStatus,
    );
  }
});

test("native access ignores browser billing state", () => {
  for (const billingStatus of ["trialing", "active"]) {
    assert.equal(
      resolveFullAccess({
        sponsoredStatus: "none",
        billingStatus,
        nativeSubscriptionStatus: "expired",
        platform: "native",
        developmentBypass: false,
      }),
      false,
      billingStatus,
    );
  }
});

test("unknown providers and unavailable statuses fail closed", () => {
  for (const input of [
    {
      sponsoredStatus: "unavailable",
      billingStatus: "active",
      nativeSubscriptionStatus: "active",
      platform: "unknown",
    },
    {
      sponsoredStatus: "none",
      billingStatus: "unavailable",
      nativeSubscriptionStatus: "active",
      platform: "web",
    },
    {
      sponsoredStatus: "none",
      billingStatus: "active",
      nativeSubscriptionStatus: "unavailable",
      platform: "native",
    },
    {
      sponsoredStatus: "none",
      billingStatus: "active",
      nativeSubscriptionStatus: "active",
      platform: undefined,
    },
  ]) {
    assert.equal(resolveFullAccess({ ...input, developmentBypass: false }), false);
  }
});

test("only the explicit boolean development bypass grants provider-independent access", () => {
  const base = {
    sponsoredStatus: "none",
    billingStatus: "none",
    nativeSubscriptionStatus: "expired",
    platform: "unknown",
  };
  assert.equal(resolveFullAccess({ ...base, developmentBypass: true }), true);
  for (const developmentBypass of [false, undefined, null, 1, "true", {}]) {
    assert.equal(
      resolveFullAccess({ ...base, developmentBypass }),
      false,
      String(developmentBypass),
    );
  }
});

test("Stripe subscription controls appear only for unsponsored web learners", () => {
  assert.equal(
    shouldShowSubscriptionControls({ sponsoredStatus: "none", platform: "web" }),
    true,
  );
  for (const input of [
    { sponsoredStatus: "active", platform: "web" },
    { sponsoredStatus: "active", platform: "native" },
    { sponsoredStatus: "none", platform: "native" },
    { sponsoredStatus: "none", platform: "unknown" },
    { sponsoredStatus: "none", platform: undefined },
  ]) {
    assert.equal(shouldShowSubscriptionControls(input), false);
  }
});

test("an EverWise roster-style username does not grant access without server sponsorship", () => {
  assert.equal(
    resolveFullAccess({
      username: "EverWise001",
      sponsoredStatus: "none",
      billingStatus: "none",
      nativeSubscriptionStatus: "expired",
      platform: "web",
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
