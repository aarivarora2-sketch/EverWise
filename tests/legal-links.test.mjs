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

  assert.equal(TERMS_URL, "https://everwise.dexio-games.com/terms.html");
  assert.deepEqual(calls, [[TERMS_URL, "_blank", "noopener,noreferrer"]]);
});

test("Privacy opens the approved public page safely", () => {
  const calls = [];

  openLegalPage("privacy", (...args) => calls.push(args));

  assert.equal(PRIVACY_POLICY_URL, "https://everwise.dexio-games.com/privacy.html");
  assert.deepEqual(calls, [[PRIVACY_POLICY_URL, "_blank", "noopener,noreferrer"]]);
});

test("Privacy explains sponsored access, optional research, aggregate reports, and data rights", async () => {
  const html = await readFile(new URL("../public/privacy.html", import.meta.url), "utf8");
  const copy = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

  assert.match(copy, /sponsored access/i);
  assert.match(copy, /optional research/i);
  assert.match(copy, /partners? (?:receive|see).*(?:aggregate|group totals)/i);
  assert.match(copy, /do not sell (?:your )?assessment answers/i);
  assert.match(copy, /delete your account.*Settings/i);
  assert.match(copy, /everwisedigitalliteracy@gmail\.com/i);
});
