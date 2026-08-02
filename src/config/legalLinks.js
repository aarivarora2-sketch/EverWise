export const TERMS_URL = "https://everwise.dexio-games.com/terms.html";
export const PRIVACY_POLICY_URL = "https://everwise.dexio-games.com/privacy.html";

export function openLegalPage(type, opener = window.open) {
  const url = type === "terms" ? TERMS_URL : PRIVACY_POLICY_URL;
  opener(url, "_blank", "noopener,noreferrer");
}
