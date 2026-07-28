export const TERMS_URL = "https://dexio-games.com/terms-of-use";
export const PRIVACY_POLICY_URL = "https://dexio-games.com/privacy-policy";

export function openLegalPage(type, opener = window.open) {
  const url = type === "terms" ? TERMS_URL : PRIVACY_POLICY_URL;
  opener(url, "_blank", "noopener,noreferrer");
}
