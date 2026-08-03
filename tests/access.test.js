import test from "node:test";
import assert from "node:assert/strict";
import {
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
