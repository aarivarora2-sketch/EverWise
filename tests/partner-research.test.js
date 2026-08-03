import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createPartnerStore } from "../server/partnerStore.mjs";
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

test("a consented skipped client assessment passes the real store contract and claims access", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "everwise-research-contract-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  let randomCall = 0;
  const store = createPartnerStore({
    filePath: join(directory, "partners.json"),
    now: () => new Date("2026-08-02T12:00:00.000Z"),
    randomBytes: (size) => Buffer.alloc(size, (randomCall += 1)),
  });
  const created = await store.createPartner({
    partnerId: "community-partner",
    name: "Community Partner",
    seatLimit: 500,
    branding: {
      name: "Community Partner",
      logoPath: null,
      accent: "#2F6B61",
    },
  });
  const snapshot = buildResearchSnapshot(
    {
      name: "Jane",
      email: "jane@example.com",
      age: 74,
      internetUse: "",
      primaryDevice: "",
      confidence: "",
      scamFrequency: "",
      concerns: [],
      scamScenario: "",
      aiExperience: "",
      accessibilityNeeds: [],
      trustedContact: "",
    },
    { consent: true, consentedAt: "2026-08-02T12:00:00.000Z" },
  );

  const claimed = await store.claimSeat({
    uid: "skipped-consented-learner",
    inviteToken: created.inviteToken,
    researchConsent: true,
    researchSnapshot: snapshot,
  });

  assert.equal(claimed.status, "active");
  assert.equal((await store.getAccess("skipped-consented-learner")).status, "active");
  assert.deepEqual(snapshot, {
    assessmentVersion: "partner-assessment-v1",
    consentedAt: "2026-08-02T12:00:00.000Z",
    ageBand: "70-79",
    internetUse: "Prefer not to say",
    primaryDevice: "Prefer not to say",
    confidence: "Prefer not to say",
    scamFrequency: "Prefer not to say",
    concerns: [],
    safeBankChoice: false,
    aiExperience: "Prefer not to say",
    accessibilityNeeds: [],
  });
});
