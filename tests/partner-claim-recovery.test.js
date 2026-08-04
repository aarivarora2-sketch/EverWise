import assert from "node:assert/strict";
import test from "node:test";

import {
  PARTNER_CLAIM_RECOVERY_STORAGE_KEY,
  PARTNER_CLAIM_RECOVERY_TTL_MS,
  clearPartnerClaimRecovery,
  readPartnerClaimRecovery,
  storePartnerClaimRecovery,
} from "../src/utils/partnerClaimRecovery.js";

const NOW = 1_800_000_000_000;
const UID = "firebase-learner-uid";
const OTHER_UID = "another-firebase-uid";
const INVITE_TOKEN = "i".repeat(43);

function validResearch() {
  return {
    assessmentVersion: "partner-assessment-v2",
    consentedAt: "2026-08-03T12:34:56.789Z",
    ageBand: "70-79",
    internetUse: "Every day",
    primaryDevice: "Tablet",
    confidence: "Sometimes I need help",
    scamFrequency: "few",
    concerns: ["Suspicious links"],
    bankSafetyCategory: "safe",
    aiExperience: "I’ve heard of it",
    accessibilityNeeds: ["Vision loss"],
  };
}

function validProfileBase() {
  return {
    name: "Jane",
    email: "jane@example.com",
    profileInterview: {
      age: 74,
      internetUse: "Every day",
      primaryDevice: "Tablet",
      confidence: "Sometimes I need help",
      scamFrequency: "few",
      concerns: ["Suspicious links"],
      scamScenario: "Call the bank using its official number",
      aiExperience: "I’ve heard of it",
      accessibilityNeeds: ["Vision loss"],
      trustedContact: "Maybe later",
    },
    onboardingCompleted: true,
    scamsCaught: 0,
    badges: [],
    completedLessons: [],
    trialStartedAt: null,
    subscriptionStatus: "expired",
    plan: null,
  };
}

function validInput(overrides = {}) {
  return {
    uid: UID,
    inviteToken: INVITE_TOKEN,
    partner: {
      name: "Community Partner",
      logoPath: "/partners/community-partner.svg",
    },
    profileBase: validProfileBase(),
    research: validResearch(),
    ...overrides,
  };
}

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

function storedRecord(storage) {
  return JSON.parse(storage.getItem(PARTNER_CLAIM_RECOVERY_STORAGE_KEY));
}

test("round-trips an allowlisted retry snapshot for the same UID before expiry", () => {
  const storage = new MemoryStorage();

  assert.equal(
    storePartnerClaimRecovery({ storage, now: NOW, ...validInput() }),
    true,
  );
  assert.deepEqual(storedRecord(storage), {
    version: 1,
    uid: UID,
    createdAt: NOW,
    expiresAt: NOW + 900_000,
    inviteToken: INVITE_TOKEN,
    partner: {
      name: "Community Partner",
      logoPath: "/partners/community-partner.svg",
    },
    profileBase: validProfileBase(),
    research: validResearch(),
  });
  assert.deepEqual(
    readPartnerClaimRecovery({ storage, now: NOW + 899_999, uid: UID }),
    storedRecord(storage),
  );
  assert.equal(PARTNER_CLAIM_RECOVERY_TTL_MS, 15 * 60 * 1000);
});

test("a different UID cannot read or delete another account's recovery", () => {
  const storage = new MemoryStorage();
  assert.equal(
    storePartnerClaimRecovery({ storage, now: NOW, ...validInput() }),
    true,
  );
  const original = storage.getItem(PARTNER_CLAIM_RECOVERY_STORAGE_KEY);

  assert.equal(
    readPartnerClaimRecovery({ storage, now: NOW + 1, uid: OTHER_UID }),
    null,
  );
  assert.equal(
    clearPartnerClaimRecovery({ storage, expectedUid: OTHER_UID }),
    false,
  );
  assert.equal(storage.getItem(PARTNER_CLAIM_RECOVERY_STORAGE_KEY), original);
});

test("removes a matching recovery at the exact expiry boundary", () => {
  const storage = new MemoryStorage();
  storePartnerClaimRecovery({ storage, now: NOW, ...validInput() });

  assert.equal(
    readPartnerClaimRecovery({
      storage,
      now: NOW + PARTNER_CLAIM_RECOVERY_TTL_MS,
      uid: UID,
    }),
    null,
  );
  assert.equal(storage.getItem(PARTNER_CLAIM_RECOVERY_STORAGE_KEY), null);
});

test("clear compares the stored bytes again before deleting", () => {
  const replacement = JSON.stringify({
    ...validInput({ uid: OTHER_UID }),
    version: 1,
    createdAt: NOW,
    expiresAt: NOW + 900_000,
  });
  let reads = 0;
  let removed = false;
  const storage = {
    getItem() {
      reads += 1;
      if (reads === 1) {
        return JSON.stringify({
          ...validInput(),
          version: 1,
          createdAt: NOW,
          expiresAt: NOW + 900_000,
        });
      }
      return replacement;
    },
    removeItem() {
      removed = true;
    },
  };

  assert.equal(clearPartnerClaimRecovery({ storage, expectedUid: UID }), false);
  assert.equal(removed, false);
});

test("invalid stored records are removed without exposing a retry", () => {
  const cases = [
    ["extra top-level key", (record) => ({ ...record, extra: true })],
    ["password-like key", (record) => ({ ...record, password: "secret12" })],
    ["Firebase token field", (record) => ({ ...record, idToken: "firebase-token" })],
    ["credential field", (record) => ({ ...record, credential: { secret: true } })],
    ["invalid invite token", (record) => ({ ...record, inviteToken: "short" })],
    [
      "overlong partner name",
      (record) => ({ ...record, partner: { name: "p".repeat(101) } }),
    ],
    [
      "overlong same-origin logo path",
      (record) => ({
        ...record,
        partner: { name: "Partner", logoPath: `/partners/${"x".repeat(248)}` },
      }),
    ],
    [
      "overlong nested profile value",
      (record) => ({
        ...record,
        profileBase: { ...record.profileBase, name: "n".repeat(101) },
      }),
    ],
    [
      "unknown profile field",
      (record) => ({
        ...record,
        profileBase: { ...record.profileBase, authToken: "private" },
      }),
    ],
    [
      "invalid research category",
      (record) => ({
        ...record,
        research: { ...record.research, primaryDevice: "Brain implant" },
      }),
    ],
    [
      "unknown research field",
      (record) => ({
        ...record,
        research: { ...record.research, rawResponse: "private" },
      }),
    ],
    ["non-canonical timestamps", (record) => ({ ...record, createdAt: NOW + 0.5 })],
    ["wrong TTL", (record) => ({ ...record, expiresAt: NOW + 899_999 })],
  ];

  for (const [label, mutate] of cases) {
    const storage = new MemoryStorage();
    storePartnerClaimRecovery({ storage, now: NOW, ...validInput() });
    storage.setItem(
      PARTNER_CLAIM_RECOVERY_STORAGE_KEY,
      JSON.stringify(mutate(storedRecord(storage))),
    );

    assert.equal(
      readPartnerClaimRecovery({ storage, now: NOW + 1, uid: UID }),
      null,
      label,
    );
    assert.equal(
      storage.getItem(PARTNER_CLAIM_RECOVERY_STORAGE_KEY),
      null,
      label,
    );
  }
});

test("malformed JSON remains byte-identical when UID ownership is unknowable", () => {
  const malformed = "{not-json\nprivate bytes";
  for (const uid of [UID, OTHER_UID]) {
    const storage = new MemoryStorage();
    storage.setItem(PARTNER_CLAIM_RECOVERY_STORAGE_KEY, malformed);

    assert.equal(
      readPartnerClaimRecovery({ storage, now: NOW, uid }),
      null,
    );
    assert.equal(
      storage.getItem(PARTNER_CLAIM_RECOVERY_STORAGE_KEY),
      malformed,
    );
  }
});

test("rejects nested accessors before they can change after validation", () => {
  let partnerNameReads = 0;
  const changingPartner = {};
  Object.defineProperty(changingPartner, "name", {
    enumerable: true,
    get() {
      partnerNameReads += 1;
      return partnerNameReads <= 5 ? "Partner" : "p".repeat(500);
    },
  });

  let concernReads = 0;
  const changingConcerns = [];
  Object.defineProperty(changingConcerns, "0", {
    enumerable: true,
    get() {
      concernReads += 1;
      return concernReads <= 2 ? "Suspicious links" : "x".repeat(500);
    },
  });
  changingConcerns.length = 1;

  const profileWithAccessor = validProfileBase();
  Object.defineProperty(profileWithAccessor, "name", {
    enumerable: true,
    get() {
      return "Jane";
    },
  });

  const unsafeInputs = [
    validInput({ partner: changingPartner }),
    validInput({ profileBase: profileWithAccessor }),
    validInput({ research: { ...validResearch(), concerns: changingConcerns } }),
  ];
  for (const input of unsafeInputs) {
    const storage = new MemoryStorage();
    assert.equal(
      storePartnerClaimRecovery({ storage, now: NOW, ...input }),
      false,
    );
    assert.equal(storage.getItem(PARTNER_CLAIM_RECOVERY_STORAGE_KEY), null);
  }
  assert.equal(partnerNameReads, 0);
  assert.equal(concernReads, 0);
});

test("rejects nested objects with custom prototypes", () => {
  const research = validResearch();
  Object.setPrototypeOf(research, { authToken: "inherited-private-token" });
  const storage = new MemoryStorage();

  assert.equal(
    storePartnerClaimRecovery({
      storage,
      now: NOW,
      ...validInput({ research }),
    }),
    false,
  );
  assert.equal(storage.getItem(PARTNER_CLAIM_RECOVERY_STORAGE_KEY), null);
});

test("store rejects unsafe caller-owned fields instead of persisting them", () => {
  const storage = new MemoryStorage();
  const unsafe = validInput();
  unsafe.profileBase.profileInterview.firebaseIdToken = "private-id-token";

  assert.equal(
    storePartnerClaimRecovery({ storage, now: NOW, ...unsafe }),
    false,
  );
  assert.equal(storage.getItem(PARTNER_CLAIM_RECOVERY_STORAGE_KEY), null);
});

test("storage exceptions return null or false and do not escape", () => {
  const throwingStorage = {
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("blocked");
    },
    removeItem() {
      throw new Error("blocked");
    },
  };

  assert.equal(
    storePartnerClaimRecovery({
      storage: throwingStorage,
      now: NOW,
      ...validInput(),
    }),
    false,
  );
  assert.equal(
    readPartnerClaimRecovery({ storage: throwingStorage, now: NOW, uid: UID }),
    null,
  );
  assert.equal(
    clearPartnerClaimRecovery({ storage: throwingStorage, expectedUid: UID }),
    false,
  );
});
