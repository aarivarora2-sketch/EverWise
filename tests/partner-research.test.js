import test from "node:test";
import assert from "node:assert/strict";
import {
  ASSESSMENT_VERSION,
  ageBand,
  buildResearchSnapshot,
} from "../src/utils/partnerResearch.js";

test("ageBand minimizes exact ages", () => {
  assert.equal(ageBand(18), "18-39");
  assert.equal(ageBand(40), "40-59");
  assert.equal(ageBand(68), "60-69");
  assert.equal(ageBand(77), "70-79");
  assert.equal(ageBand(85), "80-89");
  assert.equal(ageBand(93), "90+");
});

test("research snapshot excludes direct identifiers", () => {
  const snapshot = buildResearchSnapshot(
    {
      name: "Jane",
      email: "jane@example.com",
      age: 77,
      internetUse: "Every day",
      primaryDevice: "Tablet",
      confidence: "Sometimes I need help",
      scamFrequency: "few",
      concerns: ["Suspicious links"],
      scamScenario: "Call the bank using its official number",
      aiExperience: "I’ve heard of it",
      accessibilityNeeds: ["Vision loss"],
      trustedContact: "Yes",
    },
    { consent: true, consentedAt: "2026-08-02T12:00:00.000Z" },
  );

  assert.deepEqual(snapshot, {
    assessmentVersion: ASSESSMENT_VERSION,
    consentedAt: "2026-08-02T12:00:00.000Z",
    ageBand: "70-79",
    internetUse: "Every day",
    primaryDevice: "Tablet",
    confidence: "Sometimes I need help",
    scamFrequency: "few",
    concerns: ["Suspicious links"],
    safeBankChoice: true,
    aiExperience: "I’ve heard of it",
    accessibilityNeeds: ["Vision loss"],
  });
  for (const forbidden of ["name", "email", "age", "trustedContact", "password"]) {
    assert.equal(forbidden in snapshot, false);
  }
});

test("research snapshot is omitted when consent is false", () => {
  assert.equal(buildResearchSnapshot({ age: 77 }, { consent: false }), null);
});

test("research snapshot rejects invalid age when consented", () => {
  assert.throws(
    () => buildResearchSnapshot({ age: "77" }, { consent: true, consentedAt: "2026-08-02" }),
    TypeError,
  );
});

test("research snapshot requires a consent timestamp when consented", () => {
  assert.throws(
    () => buildResearchSnapshot({ age: 77 }, { consent: true }),
    TypeError,
  );
});
