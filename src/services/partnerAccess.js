const MAX_PARTNER_PAYLOAD_BYTES = 25_000;

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

async function parseResponse(response) {
  try {
    if (!response || typeof response !== "object") return null;
    const declaredLength = Number(response.headers?.get?.("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_PARTNER_PAYLOAD_BYTES) {
      return null;
    }

    const text = await response.text();
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

async function partnerRequest(path, {
  idToken,
  body,
  fetchImpl = globalThis.fetch,
  apiEndpointImpl,
} = {}) {
  const serializedBody = safeJsonBody(body);
  let response;
  try {
    response = await fetchImpl(await resolveApiEndpoint(path, apiEndpointImpl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: serializedBody,
    });
  } catch {
    throw new PartnerAccessError();
  }

  const payload = await parseResponse(response);
  try {
    if (!response?.ok) {
      throw new PartnerAccessError(safeCode(payload?.code), response?.status);
    }
  } catch (error) {
    if (error instanceof PartnerAccessError) throw error;
    throw new PartnerAccessError();
  }
  if (!payload) throw new PartnerAccessError();
  return payload;
}

export function previewInvite({ inviteToken, fetchImpl, apiEndpointImpl } = {}) {
  return partnerRequest("/api/partner/preview", {
    body: { inviteToken },
    fetchImpl,
    apiEndpointImpl,
  });
}

export function claimPartnerSeat({
  idToken,
  inviteToken,
  researchConsent,
  researchSnapshot,
  fetchImpl,
  apiEndpointImpl,
} = {}) {
  const body = { inviteToken };
  if (researchConsent !== undefined) body.researchConsent = researchConsent;
  if (researchSnapshot !== undefined) body.researchSnapshot = researchSnapshot;
  return partnerRequest("/api/partner/claim", {
    idToken,
    body,
    fetchImpl,
    apiEndpointImpl,
  });
}

export function fetchPartnerAccess({ idToken, fetchImpl, apiEndpointImpl } = {}) {
  return partnerRequest("/api/partner/access", {
    idToken,
    body: {},
    fetchImpl,
    apiEndpointImpl,
  });
}

export function beginPartnerRelease({ idToken, fetchImpl, apiEndpointImpl } = {}) {
  return partnerRequest("/api/partner/release-intent", {
    idToken,
    body: {},
    fetchImpl,
    apiEndpointImpl,
  });
}

export function cancelPartnerRelease({
  idToken,
  receipt,
  fetchImpl,
  apiEndpointImpl,
} = {}) {
  return partnerRequest("/api/partner/release-cancel", {
    idToken,
    body: { receipt },
    fetchImpl,
    apiEndpointImpl,
  });
}

export function confirmPartnerRelease({ receipt, fetchImpl, apiEndpointImpl } = {}) {
  return partnerRequest("/api/partner/release-confirm", {
    body: { receipt },
    fetchImpl,
    apiEndpointImpl,
  });
}

export function fetchPartnerReport({ adminToken, fetchImpl, apiEndpointImpl } = {}) {
  return partnerRequest("/api/partner/admin/report", {
    body: { adminToken },
    fetchImpl,
    apiEndpointImpl,
  });
}

export function rotatePartnerInvite({ adminToken, fetchImpl, apiEndpointImpl } = {}) {
  return partnerRequest("/api/partner/admin/rotate-invite", {
    body: { adminToken },
    fetchImpl,
    apiEndpointImpl,
  });
}
