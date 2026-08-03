import test from "node:test";
import assert from "node:assert/strict";
import {
  PRIVACY_POLICY_URL,
  TERMS_URL,
  openLegalPage,
} from "../src/config/legalLinks.js";

test("Terms opens the approved public page safely", () => {
  const calls = [];

  openLegalPage("terms", (...args) => calls.push(args));

  assert.equal(TERMS_URL, "https://everwise.dexio-games.com/terms.html");
  assert.deepEqual(calls, [[TERMS_URL, "_blank", "noopener,noreferrer"]]);
});

test("Privacy opens the approved public page safely", () => {
  const calls = [];

  openLegalPage("privacy", (...args) => calls.push(args));

  assert.equal(PRIVACY_POLICY_URL, "https://everwise.dexio-games.com/privacy.html");
  assert.deepEqual(calls, [[PRIVACY_POLICY_URL, "_blank", "noopener,noreferrer"]]);
});
