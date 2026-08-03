import { createHash } from "node:crypto";
import { PartnerStoreError } from "./partnerErrors.mjs";
import { FIREBASE_CERTIFICATES_UNAVAILABLE_CODE } from "./firebaseTokenVerifier.mjs";
import { requestClientIp } from "./apiGuard.mjs";

const MAXIMUM_BODY_BYTES = 25_000;
const INVALID_ADMIN_WINDOW_MS = 10 * 60 * 1000;
const INVALID_ADMIN_LIMIT = 10;
const INVALID_ADMIN_COOLDOWN_MS = 10 * 60 * 1000;
const REPORT_WINDOW_MS = 60 * 1000;
const REPORT_LIMIT = 30;
const MAXIMUM_RATE_LIMIT_KEYS = 1_024;
const RECENT_AUTHENTICATION_SECONDS = 5 * 60;

const ROUTES = new Map([
  ["/api/partner/preview", "preview"],
  ["/api/partner/claim", "claim"],
  ["/api/partner/access", "access"],
  ["/api/partner/release-intent", "releaseIntent"],
  ["/api/partner/release-cancel", "releaseCancel"],
  ["/api/partner/release-confirm", "releaseConfirm"],
  ["/api/partner/admin/report", "adminReport"],
  ["/api/partner/admin/rotate-invite", "rotateInvite"],
]);

const ERROR_RESPONSES = {
  INVALID_INVITE: {
    status: 400,
    message: "This access link is not available.",
  },
  PARTNER_FULL: {
    status: 409,
    message: "All sponsored places are currently in use.",
  },
  PARTNER_SUSPENDED: {
    status: 403,
    message: "Sponsored access is temporarily unavailable.",
  },
  ALREADY_SPONSORED: {
    status: 409,
    message: "This account already has sponsored access.",
  },
  MEMBERSHIP_NOT_FOUND: {
    status: 404,
    message: "Sponsored access was not found.",
  },
  INVALID_RECEIPT: {
    status: 400,
    message: "The release receipt is invalid.",
  },
  INVALID_ADMIN: {
    status: 401,
    message: "This admin link is not available.",
  },
  INVALID_INPUT: {
    status: 400,
    message: "The request is invalid.",
  },
  INVALID_RESEARCH: {
    status: 400,
    message: "The research response is invalid.",
  },
  STORE_NOT_CONFIGURED: {
    status: 503,
    message: "Sponsored access is temporarily unavailable.",
  },
  STORE_CORRUPT: {
    status: 503,
    message: "Sponsored access is temporarily unavailable.",
  },
};

class PartnerApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "PartnerApiError";
    this.status = status;
    this.code = code;
  }
}

function apiError(status, code, message) {
  return new PartnerApiError(status, code, message);
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function requireAllowedKeys(body, allowedKeys) {
  if (
    !isPlainObject(body) ||
    Object.keys(body).some((key) => !allowedKeys.includes(key))
  ) {
    throw apiError(400, "INVALID_INPUT", "The request is invalid.");
  }
  return body;
}

async function readJsonBody(request) {
  const contentLength = request.headers?.["content-length"];
  if (typeof contentLength === "string" && /^\d+$/.test(contentLength)) {
    const declaredLength = Number(contentLength);
    if (
      !Number.isSafeInteger(declaredLength) ||
      declaredLength > MAXIMUM_BODY_BYTES
    ) {
      throw apiError(
        413,
        "PAYLOAD_TOO_LARGE",
        "The request body is too large.",
      );
    }
  }

  const chunks = [];
  let byteLength = 0;
  try {
    for await (const chunk of request) {
      const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      byteLength += bytes.byteLength;
      if (byteLength > MAXIMUM_BODY_BYTES) {
        throw apiError(
          413,
          "PAYLOAD_TOO_LARGE",
          "The request body is too large.",
        );
      }
      chunks.push(bytes);
    }
  } catch (error) {
    if (error instanceof PartnerApiError) throw error;
    throw apiError(400, "INVALID_JSON", "The request body is invalid.");
  }

  try {
    return JSON.parse(Buffer.concat(chunks, byteLength).toString("utf8"));
  } catch {
    throw apiError(400, "INVALID_JSON", "The request body is invalid.");
  }
}

function jsonResponse(response, status, body, additionalHeaders = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    ...additionalHeaders,
  });
  response.end(JSON.stringify(body));
}

function errorResponse(response, error) {
  if (error instanceof PartnerApiError) {
    jsonResponse(response, error.status, {
      code: error.code,
      message: error.message,
    });
    return;
  }
  if (error instanceof PartnerStoreError) {
    const safe = ERROR_RESPONSES[error.code];
    if (safe) {
      jsonResponse(response, safe.status, {
        code: error.code,
        message: safe.message,
      });
      return;
    }
  }
  jsonResponse(response, 500, {
    code: "INTERNAL_ERROR",
    message: "The request could not be completed.",
  });
}

function bearerToken(request) {
  const header = request.headers?.authorization;
  if (typeof header !== "string") return null;
  const match = /^Bearer ([^\s]+)$/.exec(header);
  return match ? match[1] : null;
}

async function verifiedLearner(request, verifyIdToken) {
  const token = bearerToken(request);
  if (!token) {
    throw apiError(401, "UNAUTHENTICATED", "Authentication is required.");
  }
  try {
    const learner = await verifyIdToken(token);
    if (
      !isPlainObject(learner) ||
      typeof learner.uid !== "string" ||
      learner.uid.length < 1 ||
      learner.uid.length > 128
    ) {
      throw new Error("invalid verifier result");
    }
    return learner;
  } catch (error) {
    if (error?.code === FIREBASE_CERTIFICATES_UNAVAILABLE_CODE) {
      throw apiError(
        503,
        "PARTNER_UNAVAILABLE",
        "Sponsored access is temporarily unavailable.",
      );
    }
    throw apiError(401, "UNAUTHENTICATED", "Authentication is required.");
  }
}

function currentMilliseconds(now) {
  const value = now();
  const milliseconds = value instanceof Date ? value.getTime() : Number.NaN;
  if (!Number.isFinite(milliseconds)) {
    throw new TypeError("now must return a valid Date");
  }
  return milliseconds;
}

function requireRecentAuthentication(learner, now) {
  const nowSeconds = Math.floor(currentMilliseconds(now) / 1000);
  if (
    !Number.isSafeInteger(learner.authTime) ||
    learner.authTime > nowSeconds ||
    nowSeconds - learner.authTime > RECENT_AUTHENTICATION_SECONDS
  ) {
    throw apiError(
      401,
      "RECENT_AUTH_REQUIRED",
      "Recent authentication is required.",
    );
  }
}

function tokenRateKey(token, ip) {
  const tokenHash = createHash("sha256").update(String(token), "utf8").digest("hex");
  return `${ip}:${tokenHash}`;
}

function pruneTimestamps(timestamps, threshold) {
  return timestamps.filter((timestamp) => timestamp > threshold);
}

export function createPartnerApi({ store, verifyIdToken, now = () => new Date() }) {
  if (!store || typeof verifyIdToken !== "function" || typeof now !== "function") {
    throw new TypeError("store, verifyIdToken, and now are required");
  }
  const invalidAdminByIp = new Map();
  const successfulReports = new Map();
  const adminQueues = new Map();

  function pruneExpiredRateLimits(timestamp) {
    for (const [ip, state] of invalidAdminByIp) {
      if (state.blockedUntil > timestamp) continue;
      if (state.blockedUntil !== 0) {
        invalidAdminByIp.delete(ip);
        continue;
      }
      state.timestamps = pruneTimestamps(
        state.timestamps,
        timestamp - INVALID_ADMIN_WINDOW_MS,
      );
      if (state.timestamps.length === 0) invalidAdminByIp.delete(ip);
    }
    for (const [key, state] of successfulReports) {
      state.timestamps = pruneTimestamps(
        state.timestamps,
        timestamp - REPORT_WINDOW_MS,
      );
      if (state.timestamps.length === 0) successfulReports.delete(key);
    }
  }

  function invalidEvictionKey(timestamp) {
    let selectedKey = null;
    let selectedState = null;
    for (const [key, state] of invalidAdminByIp) {
      const selectedIsBlocked = selectedState?.blockedUntil > timestamp;
      const stateIsBlocked = state.blockedUntil > timestamp;
      if (
        selectedState === null ||
        (selectedIsBlocked && !stateIsBlocked) ||
        (selectedIsBlocked === stateIsBlocked &&
          (state.timestamps.length < selectedState.timestamps.length ||
            (state.timestamps.length === selectedState.timestamps.length &&
              state.lastSeen < selectedState.lastSeen)))
      ) {
        selectedKey = key;
        selectedState = state;
      }
    }
    return selectedKey;
  }

  function reportEvictionKey() {
    let selectedKey = null;
    let selectedState = null;
    for (const [key, state] of successfulReports) {
      if (
        selectedState === null ||
        state.timestamps.length < selectedState.timestamps.length ||
        (state.timestamps.length === selectedState.timestamps.length &&
          state.lastSeen < selectedState.lastSeen)
      ) {
        selectedKey = key;
        selectedState = state;
      }
    }
    return selectedKey;
  }

  function enforceRateLimitBounds(timestamp) {
    while (invalidAdminByIp.size > MAXIMUM_RATE_LIMIT_KEYS) {
      invalidAdminByIp.delete(invalidEvictionKey(timestamp));
    }
    while (successfulReports.size > MAXIMUM_RATE_LIMIT_KEYS) {
      successfulReports.delete(reportEvictionKey());
    }
  }

  async function serializeAdmin(ip, operation) {
    const previous = adminQueues.get(ip) || Promise.resolve();
    let release;
    const current = new Promise((resolve) => {
      release = resolve;
    });
    adminQueues.set(ip, current);
    await previous;
    try {
      return await operation();
    } finally {
      release();
      if (adminQueues.get(ip) === current) adminQueues.delete(ip);
    }
  }

  function adminIsBlocked(ip, timestamp) {
    const state = invalidAdminByIp.get(ip);
    if (!state) return false;
    if (state.blockedUntil > timestamp) return true;
    return false;
  }

  function recordInvalidAdmin(ip, timestamp) {
    const state = invalidAdminByIp.get(ip) || {
      timestamps: [],
      blockedUntil: 0,
      lastSeen: timestamp,
    };
    state.timestamps = pruneTimestamps(
      state.timestamps,
      timestamp - INVALID_ADMIN_WINDOW_MS,
    );
    state.timestamps.push(timestamp);
    state.lastSeen = timestamp;
    if (state.timestamps.length >= INVALID_ADMIN_LIMIT) {
      state.timestamps = [];
      state.blockedUntil = timestamp + INVALID_ADMIN_COOLDOWN_MS;
    }
    invalidAdminByIp.set(ip, state);
    enforceRateLimitBounds(timestamp);
  }

  function reportIsLimited(key) {
    const state = successfulReports.get(key);
    return Boolean(state && state.timestamps.length >= REPORT_LIMIT);
  }

  function recordSuccessfulReport(key, timestamp) {
    const state = successfulReports.get(key) || {
      timestamps: [],
      lastSeen: timestamp,
    };
    state.timestamps.push(timestamp);
    state.lastSeen = timestamp;
    successfulReports.set(key, state);
    enforceRateLimitBounds(timestamp);
  }

  async function runAdmin(request, body, operation) {
    const ip = requestClientIp(request);
    return serializeAdmin(ip, async () => {
      const timestamp = currentMilliseconds(now);
      pruneExpiredRateLimits(timestamp);
      if (adminIsBlocked(ip, timestamp)) {
        throw apiError(
          429,
          "RATE_LIMITED",
          "Too many requests. Try again later.",
        );
      }
      try {
        return await operation(body.adminToken, ip, timestamp);
      } catch (error) {
        if (error instanceof PartnerStoreError && error.code === "INVALID_ADMIN") {
          recordInvalidAdmin(ip, timestamp);
        }
        throw error;
      }
    });
  }

  return {
    async handle(request, response, pathname) {
      const route = ROUTES.get(pathname);
      if (!route) return false;

      if (request.method !== "POST") {
        jsonResponse(
          response,
          405,
          { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." },
          { Allow: "POST" },
        );
        return true;
      }

      try {
        let learner = null;
        if (["claim", "access", "releaseIntent", "releaseCancel"].includes(route)) {
          learner = await verifiedLearner(request, verifyIdToken);
        }
        const body = await readJsonBody(request);
        let result;

        switch (route) {
          case "preview": {
            requireAllowedKeys(body, ["inviteToken"]);
            result = await store.previewInvite({ inviteToken: body.inviteToken });
            break;
          }
          case "claim": {
            requireAllowedKeys(body, [
              "inviteToken",
              "researchConsent",
              "researchSnapshot",
            ]);
            if (
              body.researchConsent !== undefined &&
              typeof body.researchConsent !== "boolean"
            ) {
              throw apiError(400, "INVALID_INPUT", "The request is invalid.");
            }
            result = await store.claimSeat({
              uid: learner.uid,
              inviteToken: body.inviteToken,
              researchConsent: body.researchConsent,
              researchSnapshot: body.researchSnapshot,
            });
            break;
          }
          case "access": {
            requireAllowedKeys(body, []);
            result = await store.getAccess(learner.uid);
            break;
          }
          case "releaseIntent": {
            requireAllowedKeys(body, []);
            requireRecentAuthentication(learner, now);
            result = await store.beginRelease({ uid: learner.uid });
            break;
          }
          case "releaseCancel": {
            requireAllowedKeys(body, ["receipt"]);
            result = await store.cancelRelease({
              uid: learner.uid,
              receipt: body.receipt,
            });
            break;
          }
          case "releaseConfirm": {
            requireAllowedKeys(body, ["receipt"]);
            result = await store.confirmRelease({ receipt: body.receipt });
            break;
          }
          case "adminReport": {
            requireAllowedKeys(body, ["adminToken"]);
            result = await runAdmin(
              request,
              body,
              async (adminToken, ip, timestamp) => {
                const key = tokenRateKey(adminToken, ip);
                if (reportIsLimited(key)) {
                  throw apiError(
                    429,
                    "RATE_LIMITED",
                    "Too many requests. Try again later.",
                  );
                }
                const report = await store.getAdminReport({ adminToken });
                recordSuccessfulReport(key, timestamp);
                return report;
              },
            );
            break;
          }
          case "rotateInvite": {
            requireAllowedKeys(body, ["adminToken"]);
            result = await runAdmin(request, body, (adminToken) =>
              store.rotateInvite({ adminToken }),
            );
            break;
          }
        }

        jsonResponse(response, 200, result);
      } catch (error) {
        errorResponse(response, error);
      }
      return true;
    },
  };
}
