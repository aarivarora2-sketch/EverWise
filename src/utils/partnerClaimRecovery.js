import { minimizeResearchSnapshot } from "../../server/partnerResearch.mjs";
import { buildResearchSnapshot } from "./partnerResearch.js";
import { isValidEmail, normalizeEmail } from "./validation.js";

export const PARTNER_CLAIM_RECOVERY_STORAGE_KEY =
  "everwise-partner-claim-recovery";
export const PARTNER_CLAIM_RECOVERY_TTL_MS = 15 * 60 * 1000;

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const MAX_UID_LENGTH = 128;
const MAX_NAME_LENGTH = 100;
const MAX_LOGO_PATH_LENGTH = 256;
const TOP_LEVEL_KEYS = [
  "createdAt",
  "expiresAt",
  "inviteToken",
  "partner",
  "profileBase",
  "research",
  "uid",
  "version",
];
const PROFILE_BASE_KEYS = [
  "badges",
  "completedLessons",
  "email",
  "name",
  "onboardingCompleted",
  "plan",
  "profileInterview",
  "scamsCaught",
  "subscriptionStatus",
  "trialStartedAt",
];
const PROFILE_INTERVIEW_KEYS = [
  "accessibilityNeeds",
  "age",
  "aiExperience",
  "concerns",
  "confidence",
  "internetUse",
  "primaryDevice",
  "scamFrequency",
  "scamScenario",
  "trustedContact",
];
const PARTNER_KEYS = new Set(["logoPath", "name"]);
const SCAM_SCENARIOS = new Set([
  "",
  "Open the link",
  "Reply to the message",
  "Call the bank using its official number",
  "I’m not sure",
]);
const TRUSTED_CONTACTS = new Set(["", "Yes", "Maybe later", "No"]);

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactKeys(value, keys) {
  if (!isPlainObject(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return (
    actual.length === expected.length &&
    actual.every((key, index) => key === expected[index])
  );
}

function validUid(uid) {
  return (
    typeof uid === "string" &&
    uid.length > 0 &&
    uid.length <= MAX_UID_LENGTH
  );
}

function normalizePartner(value) {
  if (!isPlainObject(value)) return null;
  const keys = Object.keys(value);
  if (
    keys.length < 1 ||
    keys.length > 2 ||
    keys.some((key) => !PARTNER_KEYS.has(key)) ||
    typeof value.name !== "string" ||
    value.name !== value.name.trim() ||
    value.name.length < 2 ||
    value.name.length > MAX_NAME_LENGTH
  ) {
    return null;
  }
  const normalized = { name: value.name };
  if (Object.hasOwn(value, "logoPath")) {
    if (
      value.logoPath !== null &&
      (typeof value.logoPath !== "string" ||
        value.logoPath.length > MAX_LOGO_PATH_LENGTH ||
        !value.logoPath.startsWith("/partners/") ||
        value.logoPath.includes(".."))
    ) {
      return null;
    }
    if (value.logoPath !== null) normalized.logoPath = value.logoPath;
  }
  return normalized;
}

function normalizeProfileInterview(value) {
  if (!hasExactKeys(value, PROFILE_INTERVIEW_KEYS)) return null;
  if (
    !Number.isInteger(value.age) ||
    value.age < 18 ||
    value.age > 120 ||
    !SCAM_SCENARIOS.has(value.scamScenario) ||
    !TRUSTED_CONTACTS.has(value.trustedContact)
  ) {
    return null;
  }
  let minimized;
  try {
    minimized = minimizeResearchSnapshot(
      buildResearchSnapshot(value, {
        consent: true,
        consentedAt: "2000-01-01T00:00:00.000Z",
      }),
    );
  } catch {
    return null;
  }
  return {
    age: value.age,
    internetUse:
      value.internetUse === "" ? "" : minimized.internetUse,
    primaryDevice:
      value.primaryDevice === "" ? "" : minimized.primaryDevice,
    confidence: value.confidence === "" ? "" : minimized.confidence,
    scamFrequency:
      value.scamFrequency === "" ? "" : minimized.scamFrequency,
    concerns: [...minimized.concerns],
    scamScenario: value.scamScenario,
    aiExperience:
      value.aiExperience === "" ? "" : minimized.aiExperience,
    accessibilityNeeds: [...minimized.accessibilityNeeds],
    trustedContact: value.trustedContact,
  };
}

function normalizeProfileBase(value) {
  if (!hasExactKeys(value, PROFILE_BASE_KEYS)) return null;
  const email = normalizeEmail(value.email);
  const profileInterview = normalizeProfileInterview(value.profileInterview);
  if (
    typeof value.name !== "string" ||
    value.name !== value.name.trim() ||
    value.name.length < 1 ||
    value.name.length > MAX_NAME_LENGTH ||
    typeof value.email !== "string" ||
    value.email !== email ||
    !isValidEmail(email) ||
    !profileInterview ||
    value.onboardingCompleted !== true ||
    value.scamsCaught !== 0 ||
    !Array.isArray(value.badges) ||
    value.badges.length !== 0 ||
    !Array.isArray(value.completedLessons) ||
    value.completedLessons.length !== 0 ||
    value.trialStartedAt !== null ||
    value.subscriptionStatus !== "expired" ||
    value.plan !== null
  ) {
    return null;
  }
  return {
    name: value.name,
    email,
    profileInterview,
    onboardingCompleted: true,
    scamsCaught: 0,
    badges: [],
    completedLessons: [],
    trialStartedAt: null,
    subscriptionStatus: "expired",
    plan: null,
  };
}

function normalizeResearch(value) {
  if (value === null) return null;
  try {
    return minimizeResearchSnapshot(value);
  } catch {
    return undefined;
  }
}

function normalizeRecord(value) {
  if (!hasExactKeys(value, TOP_LEVEL_KEYS)) return null;
  const partner = normalizePartner(value.partner);
  const profileBase = normalizeProfileBase(value.profileBase);
  const research = normalizeResearch(value.research);
  if (
    value.version !== 1 ||
    !validUid(value.uid) ||
    !Number.isFinite(value.createdAt) ||
    !Number.isInteger(value.createdAt) ||
    !Number.isFinite(value.expiresAt) ||
    !Number.isInteger(value.expiresAt) ||
    value.expiresAt - value.createdAt !== PARTNER_CLAIM_RECOVERY_TTL_MS ||
    typeof value.inviteToken !== "string" ||
    !TOKEN_PATTERN.test(value.inviteToken) ||
    !partner ||
    !profileBase ||
    research === undefined
  ) {
    return null;
  }
  return {
    version: 1,
    uid: value.uid,
    createdAt: value.createdAt,
    expiresAt: value.expiresAt,
    inviteToken: value.inviteToken,
    partner,
    profileBase,
    research,
  };
}

function removeIfUnchanged(storage, expectedSerialized) {
  try {
    if (
      storage.getItem(PARTNER_CLAIM_RECOVERY_STORAGE_KEY) !==
      expectedSerialized
    ) {
      return false;
    }
    storage.removeItem(PARTNER_CLAIM_RECOVERY_STORAGE_KEY);
    return storage.getItem(PARTNER_CLAIM_RECOVERY_STORAGE_KEY) === null;
  } catch {
    return false;
  }
}

export function storePartnerClaimRecovery({
  storage,
  now,
  uid,
  inviteToken,
  partner,
  profileBase,
  research,
} = {}) {
  try {
    const record = normalizeRecord({
      version: 1,
      uid,
      createdAt: now,
      expiresAt: now + PARTNER_CLAIM_RECOVERY_TTL_MS,
      inviteToken,
      partner,
      profileBase,
      research,
    });
    if (!record) return false;
    const serialized = JSON.stringify(record);
    storage.setItem(PARTNER_CLAIM_RECOVERY_STORAGE_KEY, serialized);
    return storage.getItem(PARTNER_CLAIM_RECOVERY_STORAGE_KEY) === serialized;
  } catch {
    return false;
  }
}

export function readPartnerClaimRecovery({ storage, now, uid } = {}) {
  let serialized;
  try {
    serialized = storage.getItem(PARTNER_CLAIM_RECOVERY_STORAGE_KEY);
    if (serialized === null) return null;
    const parsed = JSON.parse(serialized);
    if (validUid(parsed?.uid) && parsed.uid !== uid) return null;
    const record = normalizeRecord(parsed);
    if (!record || !validUid(uid) || record.expiresAt <= now) {
      removeIfUnchanged(storage, serialized);
      return null;
    }
    return record.uid === uid ? record : null;
  } catch {
    if (typeof serialized === "string") {
      removeIfUnchanged(storage, serialized);
    }
    return null;
  }
}

export function clearPartnerClaimRecovery({ storage, expectedUid } = {}) {
  try {
    if (!validUid(expectedUid)) return false;
    const serialized = storage.getItem(PARTNER_CLAIM_RECOVERY_STORAGE_KEY);
    if (serialized === null) return false;
    const parsed = JSON.parse(serialized);
    if (parsed?.uid !== expectedUid) return false;
    return removeIfUnchanged(storage, serialized);
  } catch {
    return false;
  }
}
