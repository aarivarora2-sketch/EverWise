const MAX_PARTNER_PAYLOAD_BYTES = 25_000;
const PARTNER_REQUEST_TIMEOUT_MS = 10_000;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const PARTNER_ID_PATTERN = /^[a-z0-9-]{3,50}$/;
const DISTRIBUTION_KEYS = [
  "accessibilityNeeds",
  "ageBand",
  "aiExperience",
  "bankSafetyCategory",
  "concerns",
  "confidence",
  "internetUse",
  "primaryDevice",
  "scamFrequency",
];

const SAFE_MESSAGES = {
  INVALID_INVITE: "This access link is not available.",
  PARTNER_FULL: "All sponsored places are currently in use.",
  PARTNER_SUSPENDED: "Sponsored access is temporarily unavailable.",
  ALREADY_SPONSORED: "This account already has sponsored access.",
  MEMBERSHIP_NOT_FOUND: "Sponsored access was not found.",
  INVALID_RECEIPT: "The release receipt is invalid.",
  INVALID_ADMIN: "This admin link is not available.",
  INVALID_INPUT: "The request is invalid.",
  INVALID_RESEARCH: "The research response is invalid.",
  UNAUTHENTICATED: "Please sign in again to continue.",
  RECENT_AUTH_REQUIRED: "Please sign in again before deleting your account.",
  RATE_LIMITED: "Too many requests. Try again later.",
  PARTNER_UNAVAILABLE: "Sponsored access is temporarily unavailable.",
};

export class PartnerAccessError extends Error {
  constructor(code = "PARTNER_UNAVAILABLE", status = null) {
    super(SAFE_MESSAGES[code] || SAFE_MESSAGES.PARTNER_UNAVAILABLE);
    this.name = "PartnerAccessError";
    this.code = SAFE_MESSAGES[code] ? code : "PARTNER_UNAVAILABLE";
    this.status = Number.isInteger(status) ? status : null;
  }
}

function byteLength(value) {
  return new TextEncoder().encode(value).byteLength;
}

function safeJsonBody(body) {
  let serialized;
  try {
    serialized = JSON.stringify(body ?? {});
  } catch {
    throw new PartnerAccessError("INVALID_INPUT");
  }

  if (typeof serialized !== "string" || byteLength(serialized) > MAX_PARTNER_PAYLOAD_BYTES) {
    throw new PartnerAccessError("INVALID_INPUT");
  }
  return serialized;
}

function safeCode(value) {
  return typeof value === "string" && SAFE_MESSAGES[value]
    ? value
    : "PARTNER_UNAVAILABLE";
}

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

function isCanonicalIsoDate(value) {
  if (typeof value !== "string") return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}

function validBranding(value) {
  return Boolean(
    hasExactKeys(value, ["accent", "logoPath", "name"]) &&
      typeof value.name === "string" &&
      value.name === value.name.trim() &&
      value.name.length >= 2 &&
      value.name.length <= 100 &&
      (value.logoPath === null ||
        (typeof value.logoPath === "string" &&
          value.logoPath.startsWith("/partners/") &&
          !value.logoPath.includes(".."))) &&
      typeof value.accent === "string" &&
      /^#[A-Fa-f0-9]{6}$/.test(value.accent),
  );
}

function validPartnerIdentity(value) {
  return (
    typeof value.partnerId === "string" &&
    PARTNER_ID_PATTERN.test(value.partnerId) &&
    typeof value.name === "string" &&
    validBranding(value.branding) &&
    value.name === value.branding.name
  );
}

function validPreview(value) {
  return (
    hasExactKeys(value, ["branding", "partnerId", "seatAvailable"]) &&
    typeof value.seatAvailable === "boolean" &&
    typeof value.partnerId === "string" &&
    PARTNER_ID_PATTERN.test(value.partnerId) &&
    validBranding(value.branding)
  );
}

function validAccess(value, { allowNone = true } = {}) {
  if (allowNone && hasExactKeys(value, ["status"]) && value.status === "none") {
    return true;
  }
  return Boolean(
    hasExactKeys(value, ["branding", "name", "partnerId", "status"]) &&
      (value.status === "active" || value.status === "suspended") &&
      validPartnerIdentity(value),
  );
}

function validReleaseIntent(value) {
  return Boolean(
    hasExactKeys(value, ["expiresAt", "receipt"]) &&
      TOKEN_PATTERN.test(value.receipt) &&
      isCanonicalIsoDate(value.expiresAt),
  );
}

function validReleaseCancellation(value) {
  return hasExactKeys(value, ["cancelled"]) && value.cancelled === true;
}

function validReleaseConfirmation(value) {
  return Boolean(
    hasExactKeys(value, ["idempotent", "released"]) &&
      value.released === true &&
      typeof value.idempotent === "boolean",
  );
}

function validCountMap(value) {
  return Boolean(
    isPlainObject(value) &&
      Object.entries(value).every(
        ([category, count]) =>
          category.length > 0 && Number.isSafeInteger(count) && count >= 0,
      ),
  );
}

function validDistributions(value) {
  return Boolean(
    hasExactKeys(value, DISTRIBUTION_KEYS) &&
      DISTRIBUTION_KEYS.every((key) => validCountMap(value[key])),
  );
}

function validAdminReport(value) {
  if (
    !hasExactKeys(value, [
      "branding",
      "invitation",
      "name",
      "partnerId",
      "research",
      "seats",
      "status",
      "updatedAt",
    ]) ||
    (value.status !== "active" && value.status !== "suspended") ||
    !validPartnerIdentity(value) ||
    !isCanonicalIsoDate(value.updatedAt) ||
    !hasExactKeys(value.seats, ["available", "claimed", "limit"]) ||
    !Number.isSafeInteger(value.seats.claimed) ||
    value.seats.claimed < 0 ||
    !Number.isSafeInteger(value.seats.available) ||
    value.seats.available < 0 ||
    !Number.isSafeInteger(value.seats.limit) ||
    value.seats.limit < 1 ||
    value.seats.claimed + value.seats.available !== value.seats.limit ||
    !hasExactKeys(value.invitation, ["status"]) ||
    value.invitation.status !== value.status ||
    !hasExactKeys(value.research, [
      "consentedCount",
      "consentedPercentage",
      "distributions",
      "suppressed",
    ]) ||
    !Number.isSafeInteger(value.research.consentedCount) ||
    value.research.consentedCount < 0 ||
    value.research.consentedCount > value.seats.claimed ||
    typeof value.research.consentedPercentage !== "number" ||
    !Number.isFinite(value.research.consentedPercentage) ||
    value.research.consentedPercentage < 0 ||
    value.research.consentedPercentage > 100 ||
    typeof value.research.suppressed !== "boolean"
  ) {
    return false;
  }
  if (value.research.suppressed) {
    return value.research.distributions === null;
  }
  return (
    value.research.consentedCount >= 5 &&
    validDistributions(value.research.distributions)
  );
}

function validInviteRotation(value) {
  return Boolean(
    hasExactKeys(value, ["inviteToken", "partnerId"]) &&
      typeof value.partnerId === "string" &&
      PARTNER_ID_PATTERN.test(value.partnerId) &&
      TOKEN_PATTERN.test(value.inviteToken),
  );
}

async function readBoundedResponseText(response) {
  const body = response.body;
  if (!body?.getReader) return null;

  const reader = body.getReader();
  const chunks = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!(value instanceof Uint8Array)) {
        await reader.cancel();
        return null;
      }
      totalBytes += value.byteLength;
      if (totalBytes > MAX_PARTNER_PAYLOAD_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }

    const bytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return new TextDecoder().decode(bytes);
  } finally {
    reader.releaseLock();
  }
}

async function parseResponse(response) {
  try {
    if (!response || typeof response !== "object") return null;
    const declaredLength = Number(response.headers?.get?.("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_PARTNER_PAYLOAD_BYTES) {
      return null;
    }

    const text = await readBoundedResponseText(response);
    if (typeof text !== "string" || byteLength(text) > MAX_PARTNER_PAYLOAD_BYTES) {
      return null;
    }

    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function resolveApiEndpoint(path, apiEndpointImpl) {
  if (typeof apiEndpointImpl === "function") return apiEndpointImpl(path);
  const { apiEndpoint } = await import("../utils/apiEndpoint.js");
  return apiEndpoint(path);
}

function readPublicOptions(options, keys) {
  try {
    const values = {};
    for (const key of keys) values[key] = options?.[key];
    return values;
  } catch {
    return null;
  }
}

function rejectedUnsafeArguments() {
  return Promise.reject(new PartnerAccessError());
}

async function partnerRequest(path, {
  idToken,
  body,
  fetchImpl = globalThis.fetch,
  apiEndpointImpl,
  validateResponse,
} = {}) {
  const serializedBody = safeJsonBody(body);
  let timeoutId = null;
  try {
    const controller = new AbortController();
    timeoutId = globalThis.setTimeout(
      () => controller.abort(),
      PARTNER_REQUEST_TIMEOUT_MS,
    );
    const response = await fetchImpl(
      await resolveApiEndpoint(path, apiEndpointImpl),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: serializedBody,
        signal: controller.signal,
      },
    );
    const payload = await parseResponse(response);
    if (!response?.ok) {
      throw new PartnerAccessError(safeCode(payload?.code), response?.status);
    }
    if (!payload || !validateResponse?.(payload)) {
      throw new PartnerAccessError();
    }
    return payload;
  } catch (error) {
    if (error instanceof PartnerAccessError) throw error;
    throw new PartnerAccessError();
  } finally {
    if (timeoutId !== null) globalThis.clearTimeout(timeoutId);
  }
}

export function previewInvite(options) {
  const values = readPublicOptions(options, ["inviteToken", "fetchImpl", "apiEndpointImpl"]);
  if (!values) return rejectedUnsafeArguments();
  const { inviteToken, fetchImpl, apiEndpointImpl } = values;
  return partnerRequest("/api/partner/preview", {
    body: { inviteToken },
    fetchImpl,
    apiEndpointImpl,
    validateResponse: validPreview,
  });
}

export function claimPartnerSeat(options) {
  const values = readPublicOptions(options, [
    "idToken",
    "inviteToken",
    "researchConsent",
    "researchSnapshot",
    "fetchImpl",
    "apiEndpointImpl",
  ]);
  if (!values) return rejectedUnsafeArguments();
  const {
    idToken,
    inviteToken,
    researchConsent,
    researchSnapshot,
    fetchImpl,
    apiEndpointImpl,
  } = values;
  const body = { inviteToken };
  if (researchConsent !== undefined) body.researchConsent = researchConsent;
  if (researchSnapshot !== undefined) body.researchSnapshot = researchSnapshot;
  return partnerRequest("/api/partner/claim", {
    idToken,
    body,
    fetchImpl,
    apiEndpointImpl,
    validateResponse: (payload) => validAccess(payload, { allowNone: false }),
  });
}

export function fetchPartnerAccess(options) {
  const values = readPublicOptions(options, ["idToken", "fetchImpl", "apiEndpointImpl"]);
  if (!values) return rejectedUnsafeArguments();
  const { idToken, fetchImpl, apiEndpointImpl } = values;
  return partnerRequest("/api/partner/access", {
    idToken,
    body: {},
    fetchImpl,
    apiEndpointImpl,
    validateResponse: validAccess,
  });
}

export function beginPartnerRelease(options) {
  const values = readPublicOptions(options, ["idToken", "fetchImpl", "apiEndpointImpl"]);
  if (!values) return rejectedUnsafeArguments();
  const { idToken, fetchImpl, apiEndpointImpl } = values;
  return partnerRequest("/api/partner/release-intent", {
    idToken,
    body: {},
    fetchImpl,
    apiEndpointImpl,
    validateResponse: validReleaseIntent,
  });
}

export function cancelPartnerRelease(options) {
  const values = readPublicOptions(options, [
    "idToken",
    "receipt",
    "fetchImpl",
    "apiEndpointImpl",
  ]);
  if (!values) return rejectedUnsafeArguments();
  const { idToken, receipt, fetchImpl, apiEndpointImpl } = values;
  return partnerRequest("/api/partner/release-cancel", {
    idToken,
    body: { receipt },
    fetchImpl,
    apiEndpointImpl,
    validateResponse: validReleaseCancellation,
  });
}

export function confirmPartnerRelease(options) {
  const values = readPublicOptions(options, ["receipt", "fetchImpl", "apiEndpointImpl"]);
  if (!values) return rejectedUnsafeArguments();
  const { receipt, fetchImpl, apiEndpointImpl } = values;
  return partnerRequest("/api/partner/release-confirm", {
    body: { receipt },
    fetchImpl,
    apiEndpointImpl,
    validateResponse: validReleaseConfirmation,
  });
}

export function fetchPartnerReport(options) {
  const values = readPublicOptions(options, ["adminToken", "fetchImpl", "apiEndpointImpl"]);
  if (!values) return rejectedUnsafeArguments();
  const { adminToken, fetchImpl, apiEndpointImpl } = values;
  return partnerRequest("/api/partner/admin/report", {
    body: { adminToken },
    fetchImpl,
    apiEndpointImpl,
    validateResponse: validAdminReport,
  });
}

export function rotatePartnerInvite(options) {
  const values = readPublicOptions(options, ["adminToken", "fetchImpl", "apiEndpointImpl"]);
  if (!values) return rejectedUnsafeArguments();
  const { adminToken, fetchImpl, apiEndpointImpl } = values;
  return partnerRequest("/api/partner/admin/rotate-invite", {
    body: { adminToken },
    fetchImpl,
    apiEndpointImpl,
    validateResponse: validInviteRotation,
  });
}
