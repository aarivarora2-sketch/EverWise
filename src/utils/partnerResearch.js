export const ASSESSMENT_VERSION = "partner-assessment-v2";

const SAFE_BANK_SCENARIO = "Call the bank using its official number";
const PREFER_NOT_TO_SAY = "Prefer not to say";

function categoryOrPrivateDefault(value) {
  return typeof value === "string" && value.trim()
    ? value
    : PREFER_NOT_TO_SAY;
}

function bankSafetyCategory(value) {
  if (value === SAFE_BANK_SCENARIO) return "safe";
  if (typeof value !== "string" || !value.trim() || value === PREFER_NOT_TO_SAY) {
    return "skipped";
  }
  return "unsafe-or-other";
}

export function ageBand(age) {
  if (!Number.isInteger(age) || age < 18) {
    throw new TypeError("age must be an integer age of at least 18");
  }

  if (age <= 39) return "18-39";
  if (age <= 59) return "40-59";
  if (age <= 69) return "60-69";
  if (age <= 79) return "70-79";
  if (age <= 89) return "80-89";
  return "90+";
}

export function buildResearchSnapshot(
  interview = {},
  { consent, consentedAt } = {},
) {
  if (!consent) return null;
  if (typeof consentedAt !== "string" || !consentedAt.trim()) {
    throw new TypeError("consentedAt is required when consent is true");
  }

  return {
    assessmentVersion: ASSESSMENT_VERSION,
    consentedAt,
    ageBand: ageBand(interview.age),
    internetUse: categoryOrPrivateDefault(interview.internetUse),
    primaryDevice: categoryOrPrivateDefault(interview.primaryDevice),
    confidence: categoryOrPrivateDefault(interview.confidence),
    scamFrequency: categoryOrPrivateDefault(interview.scamFrequency),
    concerns: Array.isArray(interview.concerns)
      ? [...interview.concerns]
      : [],
    bankSafetyCategory: bankSafetyCategory(interview.scamScenario),
    aiExperience: categoryOrPrivateDefault(interview.aiExperience),
    accessibilityNeeds: Array.isArray(interview.accessibilityNeeds)
      ? [...interview.accessibilityNeeds]
      : [],
  };
}
