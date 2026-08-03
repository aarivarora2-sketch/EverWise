export const ASSESSMENT_VERSION = "partner-assessment-v1";

const SAFE_BANK_SCENARIO = "Call the bank using its official number";

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
    internetUse: interview.internetUse,
    primaryDevice: interview.primaryDevice,
    confidence: interview.confidence,
    scamFrequency: interview.scamFrequency,
    concerns: Array.isArray(interview.concerns)
      ? [...interview.concerns]
      : interview.concerns,
    safeBankChoice: interview.scamScenario === SAFE_BANK_SCENARIO,
    aiExperience: interview.aiExperience,
    accessibilityNeeds: Array.isArray(interview.accessibilityNeeds)
      ? [...interview.accessibilityNeeds]
      : interview.accessibilityNeeds,
  };
}
