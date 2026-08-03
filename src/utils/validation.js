// Public Everwise accounts use memorable usernames. Firebase Auth still
// requires an email-shaped credential, so usernames are mapped to this
// reserved, non-deliverable domain. Sponsored accounts keep real email login
// so partner learners can use password recovery.
export const USERNAME_AUTH_DOMAIN = "accounts.everwise.app";
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

export function normalizeUsername(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function isValidUsername(value) {
  const username = normalizeUsername(value);
  if (
    username.length < USERNAME_MIN_LENGTH ||
    username.length > USERNAME_MAX_LENGTH
  ) {
    return false;
  }
  return /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/.test(username);
}

export function usernameToAuthEmail(value) {
  return `${normalizeUsername(value)}@${USERNAME_AUTH_DOMAIN}`;
}

export function authEmailToUsername(value) {
  const email = String(value ?? "");
  const suffix = `@${USERNAME_AUTH_DOMAIN}`;
  return email.endsWith(suffix) ? email.slice(0, -suffix.length) : email;
}

export function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function loginIdentifierToAuthEmail(value) {
  const identifier = String(value ?? "").trim();
  return identifier.includes("@")
    ? normalizeEmail(identifier)
    : usernameToAuthEmail(identifier);
}

export function isValidEmail(value) {
  const email = normalizeEmail(value);
  if (!email || email.length > 254 || email.includes("..")) return false;

  const parts = email.split("@");
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  if (!local || local.length > 64 || !domain || !domain.includes(".")) {
    return false;
  }

  const localPattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i;
  if (
    !localPattern.test(local) ||
    local.startsWith(".") ||
    local.endsWith(".")
  ) {
    return false;
  }

  const labels = domain.split(".");
  if (
    labels.some(
      (label) =>
        !label ||
        label.length > 63 ||
        !/^[a-z0-9-]+$/i.test(label) ||
        label.startsWith("-") ||
        label.endsWith("-"),
    )
  ) {
    return false;
  }

  return labels.at(-1).length >= 2;
}
