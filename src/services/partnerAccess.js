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

export function previewInvite(options) {
  const values = readPublicOptions(options, ["inviteToken", "fetchImpl", "apiEndpointImpl"]);
  if (!values) return rejectedUnsafeArguments();
  const { inviteToken, fetchImpl, apiEndpointImpl } = values;
  return partnerRequest("/api/partner/preview", {
    body: { inviteToken },
    fetchImpl,
    apiEndpointImpl,
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
  });
}
