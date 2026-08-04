import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  PRIVACY_POLICY_URL,
  TERMS_URL,
  openLegalPage,
} from "../src/config/legalLinks.js";

test("Terms opens the approved public page safely", () => {
  const calls = [];

  openLegalPage("terms", (...args) => calls.push(args));

  assert.equal(TERMS_URL, "https://dexio-games.com/terms-of-use");
  assert.deepEqual(calls, [[TERMS_URL, "_blank", "noopener,noreferrer"]]);
});

test("Privacy opens the approved public page safely", () => {
  const calls = [];

  openLegalPage("privacy", (...args) => calls.push(args));

  assert.equal(PRIVACY_POLICY_URL, "https://dexio-games.com/privacy-policy");
  assert.deepEqual(calls, [[PRIVACY_POLICY_URL, "_blank", "noopener,noreferrer"]]);
});

test("Privacy explains sponsored access, optional research, aggregate reports, and data rights", async () => {
  const html = await readFile(new URL("../public/privacy.html", import.meta.url), "utf8");
  const copy = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

  assert.match(copy, /sponsored access/i);
  assert.match(copy, /email address.*(?:only|when).*(?:invitation|invite)/i);
  assert.match(copy, /fixed username.*synthetic.*internal.*email/i);
  assert.match(copy, /fixed username.*not asked.*personal email/i);
  assert.match(copy, /optional research/i);
  assert.match(copy, /pre-provisioned.*not asked.*research consent/i);
  assert.match(copy, /invitation.*separate.*optional.*consent/i);
  assert.match(copy, /minimized/i);
  assert.match(copy, /pseudonymized/i);
  assert.match(copy, /internally linked.*(?:deletion|delete).*(?:aggregate|group totals)/i);
  assert.match(copy, /partners? (?:receive|see).*(?:aggregate|group totals)/i);
  assert.match(copy, /do not sell (?:your )?assessment answers/i);
  assert.match(copy, /delete your account.*Settings/i);
  assert.match(copy, /everwisedigitalliteracy@gmail\.com/i);
});

test("Privacy accurately explains ordinary passwords and the private pre-provisioned roster", async () => {
  const html = await readFile(new URL("../public/privacy.html", import.meta.url), "utf8");
  const copy = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

  assert.match(copy, /ordinary learner accounts.*Firebase.*password.*not visible to Everwise/i);
  assert.match(copy, /operator-generated.*pre-provisioned roster.*plain(?:text)? usernames and passwords.*private distribution/i);
  assert.match(copy, /roster.*outside GitHub.*cloud-synced storage.*cloud deployment artifacts.*owner-only local access/i);
  assert.match(copy, /pre-provisioned credentials.*not temporary.*not forced to change/i);
  assert.doesNotMatch(copy, /password.*never stored by us in plain text or visible to us/i);
});
