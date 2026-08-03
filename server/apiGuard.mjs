import { isIP } from "node:net";

const DEFAULT_MAXIMUM_BODY_BYTES = 25_000;
const DEFAULT_MAXIMUM_KEYS = 1_024;

export class ApiRequestError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

export async function readJsonBody(
  request,
  maxBytes = DEFAULT_MAXIMUM_BODY_BYTES,
) {
  const contentLength = request.headers?.["content-length"];
  if (typeof contentLength === "string" && /^\d+$/.test(contentLength)) {
    const declaredLength = Number(contentLength);
    if (!Number.isSafeInteger(declaredLength) || declaredLength > maxBytes) {
      throw new ApiRequestError(
        413,
        "PAYLOAD_TOO_LARGE",
        "The request body is too large.",
      );
    }
  }

  const chunks = [];
  let size = 0;
  try {
    for await (const chunk of request) {
      const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += bytes.byteLength;
      if (size > maxBytes) {
        throw new ApiRequestError(
          413,
          "PAYLOAD_TOO_LARGE",
          "The request body is too large.",
        );
      }
      chunks.push(bytes);
    }
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    throw new ApiRequestError(
      400,
      "INVALID_JSON",
      "The request body is invalid.",
    );
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ApiRequestError(
      400,
      "INVALID_JSON",
      "The request body is invalid.",
    );
  }
}

function normalizeIp(value) {
  if (typeof value !== "string") return null;
  const candidate = value.startsWith("::ffff:") ? value.slice(7) : value;
  return isIP(candidate) ? candidate : null;
}

function isLoopback(value) {
  return value === "127.0.0.1" || value === "::1";
}

function clientIp(request) {
  const direct = normalizeIp(request.socket?.remoteAddress) || "unknown";
  if (!isLoopback(direct)) return direct;
  const forwarded = request.headers?.["x-forwarded-for"];
  const header = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const first = typeof header === "string" ? header.split(",", 1)[0].trim() : "";
  return normalizeIp(first) || direct;
}

export function createRouteRateLimiter({
  limit,
  windowMs,
  now = Date.now,
  maximumKeys = DEFAULT_MAXIMUM_KEYS,
}) {
  const attempts = new Map();

  const prune = (timestamp) => {
    for (const [key, state] of attempts) {
      if (state.startedAt + windowMs <= timestamp) attempts.delete(key);
    }
    while (attempts.size > maximumKeys) {
      const oldest = attempts.keys().next().value;
      attempts.delete(oldest);
    }
  };

  return {
    allow(request) {
      const timestamp = now();
      prune(timestamp);
      const key = clientIp(request);
      const state = attempts.get(key);
      if (!state) {
        attempts.set(key, { count: 1, startedAt: timestamp });
        return true;
      }
      if (state.count >= limit) return false;
      state.count += 1;
      return true;
    },
  };
}
