import { PartnerStoreError } from "./partnerErrors.mjs";

export const ASSESSMENT_VERSION = "partner-assessment-v1";

const SNAPSHOT_KEYS = [
  "accessibilityNeeds",
  "ageBand",
  "aiExperience",
  "assessmentVersion",
  "concerns",
  "confidence",
  "consentedAt",
  "internetUse",
  "primaryDevice",
  "safeBankChoice",
  "scamFrequency",
];

const CATEGORIES = {
  ageBand: new Set(["18-39", "40-59", "60-69", "70-79", "80-89", "90+"]),
  internetUse: new Set(["Every day", "A few times a week", "Rarely", "Almost never"]),
  primaryDevice: new Set(["Smartphone", "Tablet", "Computer", "TV"]),
  confidence: new Set([
    "Confident",
    "Sometimes I need help",
    "I often have difficulties",
    "I’m just getting started",
  ]),
  scamFrequency: new Set(["never", "few", "often", "many"]),
  concerns: new Set([
    "Scam calls and messages",
    "Money or bank-card theft",
    "Suspicious links",
    "Account hacking",
    "Fake news",
    "Knowing what to trust",
  ]),
  aiExperience: new Set([
    "Yes, regularly",
    "I’ve tried it a few times",
    "I’ve heard of it",
    "I don’t know what it is yet",
  ]),
  accessibilityNeeds: new Set([
    "Arthritis or joint discomfort",
    "Memory difficulties",
    "Vision loss",
    "Tremors or hand movement",
    "Hearing difficulties",
    "Another need",
    "Prefer not to say",
  ]),
};

function invalidResearch() {
  return new PartnerStoreError(
    "INVALID_RESEARCH",
    "The research snapshot is invalid.",
  );
}

function requireCategory(field, value) {
  if (!CATEGORIES[field].has(value)) throw invalidResearch();
  return value;
}

function requireCategoryArray(field, value) {
  if (!Array.isArray(value) || new Set(value).size !== value.length) {
    throw invalidResearch();
  }
  for (const item of value) requireCategory(field, item);
  return [...value];
}

export function minimizeResearchSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    throw invalidResearch();
  }
  const keys = Object.keys(snapshot).sort();
  if (
    keys.length !== SNAPSHOT_KEYS.length ||
    keys.some((key, index) => key !== SNAPSHOT_KEYS[index])
  ) {
    throw invalidResearch();
  }
  if (snapshot.assessmentVersion !== ASSESSMENT_VERSION) {
    throw invalidResearch();
  }
  if (
    typeof snapshot.consentedAt !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(snapshot.consentedAt) ||
    Number.isNaN(Date.parse(snapshot.consentedAt))
  ) {
    throw invalidResearch();
  }
  if (typeof snapshot.safeBankChoice !== "boolean") {
    throw invalidResearch();
  }

  return {
    assessmentVersion: ASSESSMENT_VERSION,
    consentedAt: snapshot.consentedAt,
    ageBand: requireCategory("ageBand", snapshot.ageBand),
    internetUse: requireCategory("internetUse", snapshot.internetUse),
    primaryDevice: requireCategory("primaryDevice", snapshot.primaryDevice),
    confidence: requireCategory("confidence", snapshot.confidence),
    scamFrequency: requireCategory("scamFrequency", snapshot.scamFrequency),
    concerns: requireCategoryArray("concerns", snapshot.concerns),
    safeBankChoice: snapshot.safeBankChoice,
    aiExperience: requireCategory("aiExperience", snapshot.aiExperience),
    accessibilityNeeds: requireCategoryArray(
      "accessibilityNeeds",
      snapshot.accessibilityNeeds,
    ),
  };
}

function sortedCounts(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

export function aggregateResearch(records) {
  const snapshots = Object.values(records);
  if (snapshots.length < 5) return null;
  return {
    ageBand: sortedCounts(snapshots.map(({ ageBand }) => ageBand)),
    internetUse: sortedCounts(snapshots.map(({ internetUse }) => internetUse)),
    primaryDevice: sortedCounts(snapshots.map(({ primaryDevice }) => primaryDevice)),
    confidence: sortedCounts(snapshots.map(({ confidence }) => confidence)),
    scamFrequency: sortedCounts(snapshots.map(({ scamFrequency }) => scamFrequency)),
    concerns: sortedCounts(snapshots.flatMap(({ concerns }) => concerns)),
    safeBankChoice: sortedCounts(
      snapshots.map(({ safeBankChoice }) => (safeBankChoice ? "safe" : "other")),
    ),
    aiExperience: sortedCounts(snapshots.map(({ aiExperience }) => aiExperience)),
    accessibilityNeeds: sortedCounts(
      snapshots.flatMap(({ accessibilityNeeds }) => accessibilityNeeds),
    ),
  };
}
