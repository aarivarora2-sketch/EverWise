import { createPublicKey, verify } from "node:crypto";

const FIREBASE_CERTIFICATE_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
const MAX_CACHE_AGE_SECONDS = 6 * 60 * 60;
const MAX_CERTIFICATE_RESPONSE_BYTES = 256 * 1024;
const MAX_CERTIFICATES = 32;
const MAX_CERTIFICATE_CHARS = 16 * 1024;
const MAX_HEADER_SEGMENT_CHARS = 4 * 1024;
const MAX_PAYLOAD_SEGMENT_CHARS = 16 * 1024;
const MAX_SIGNATURE_SEGMENT_CHARS = 1024;
const MAX_TOKEN_CHARS =
  MAX_HEADER_SEGMENT_CHARS +
  MAX_PAYLOAD_SEGMENT_CHARS +
  MAX_SIGNATURE_SEGMENT_CHARS +
  2;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;
const utf8Decoder = new TextDecoder("utf-8", { fatal: true });

export class FirebaseTokenVerificationError extends Error {
  constructor(message = "The Firebase ID token is invalid.") {
    super(message);
    this.name = "FirebaseTokenVerificationError";
    this.code = "INVALID_FIREBASE_TOKEN";
  }
}

function invalidToken() {
  return new FirebaseTokenVerificationError();
}

function certificateError() {
  return new FirebaseTokenVerificationError(
    "Firebase signing certificates are unavailable.",
  );
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function decodeSegment(segment, maximumCharacters) {
  if (
    typeof segment !== "string" ||
    segment.length < 1 ||
    segment.length > maximumCharacters ||
    segment.length % 4 === 1 ||
    !BASE64URL_PATTERN.test(segment)
  ) {
    throw invalidToken();
  }
  let decoded;
  try {
    decoded = Buffer.from(segment, "base64url");
  } catch {
    throw invalidToken();
  }
  if (decoded.length < 1 || decoded.toString("base64url") !== segment) {
    throw invalidToken();
  }
  return decoded;
}

function parseJsonSegment(segment, maximumCharacters) {
  const bytes = decodeSegment(segment, maximumCharacters);
  let value;
  try {
    value = JSON.parse(utf8Decoder.decode(bytes));
  } catch {
    throw invalidToken();
  }
  if (!isRecord(value)) throw invalidToken();
  return value;
}

function parseToken(token) {
  if (
    typeof token !== "string" ||
    token.length < 1 ||
    token.length > MAX_TOKEN_CHARS
  ) {
    throw invalidToken();
  }
  const segments = token.split(".");
  if (segments.length !== 3) throw invalidToken();
  const [headerSegment, payloadSegment, signatureSegment] = segments;
  const header = parseJsonSegment(headerSegment, MAX_HEADER_SEGMENT_CHARS);
  const claims = parseJsonSegment(payloadSegment, MAX_PAYLOAD_SEGMENT_CHARS);
  const signature = decodeSegment(
    signatureSegment,
    MAX_SIGNATURE_SEGMENT_CHARS,
  );
  if (
    header.alg !== "RS256" ||
    typeof header.kid !== "string" ||
    header.kid.length < 1 ||
    header.kid.length > 128
  ) {
    throw invalidToken();
  }
  return {
    header,
    claims,
    signature,
    signingInput: `${headerSegment}.${payloadSegment}`,
  };
}

function currentTimeMilliseconds(now) {
  const value = now();
  const milliseconds = value instanceof Date ? value.getTime() : value;
  if (typeof milliseconds !== "number" || !Number.isFinite(milliseconds)) {
    throw new TypeError("now must return a valid Date or millisecond timestamp");
  }
  return milliseconds;
}

function requireNumericDate(value) {
  if (!Number.isSafeInteger(value) || value < 0) throw invalidToken();
  return value;
}

function validateClaims(claims, projectId, nowSeconds) {
  const exp = requireNumericDate(claims.exp);
  const iat = requireNumericDate(claims.iat);
  const authTime = requireNumericDate(claims.auth_time);
  if (
    claims.aud !== projectId ||
    claims.iss !== `https://securetoken.google.com/${projectId}` ||
    typeof claims.sub !== "string" ||
    claims.sub.trim().length < 1 ||
    claims.sub.length > 128 ||
    exp <= nowSeconds ||
    iat > nowSeconds ||
    authTime > nowSeconds ||
    typeof claims.email !== "string" ||
    claims.email.length < 1
  ) {
    throw invalidToken();
  }
  return {
    uid: claims.sub,
    email: claims.email,
    authTime,
  };
}

function maxAgeSeconds(cacheControl) {
  if (typeof cacheControl !== "string") return 0;
  for (const directive of cacheControl.split(",")) {
    const match = /^\s*max-age\s*=\s*(?:"(\d+)"|(\d+))\s*$/i.exec(
      directive,
    );
    if (!match) continue;
    const parsed = Number(match[1] || match[2]);
    if (!Number.isSafeInteger(parsed) || parsed < 0) return 0;
    return Math.min(parsed, MAX_CACHE_AGE_SECONDS);
  }
  return 0;
}

function parseCertificateBody(body) {
  if (
    typeof body !== "string" ||
    Buffer.byteLength(body, "utf8") > MAX_CERTIFICATE_RESPONSE_BYTES
  ) {
    throw certificateError();
  }
  let certificates;
  try {
    certificates = JSON.parse(body);
  } catch {
    throw certificateError();
  }
  if (!isRecord(certificates)) throw certificateError();
  const entries = Object.entries(certificates);
  if (entries.length < 1 || entries.length > MAX_CERTIFICATES) {
    throw certificateError();
  }
  for (const [kid, certificate] of entries) {
    if (
      kid.length < 1 ||
      kid.length > 128 ||
      typeof certificate !== "string" ||
      certificate.length < 1 ||
      certificate.length > MAX_CERTIFICATE_CHARS
    ) {
      throw certificateError();
    }
  }
  return certificates;
}

function responseHeader(response, name) {
  if (typeof response.headers?.get !== "function") return null;
  try {
    return response.headers.get(name);
  } catch {
    throw certificateError();
  }
}

async function cancelReader(reader) {
  try {
    await reader.cancel();
  } catch {
    // The response is already being rejected; cancellation is best effort.
  }
}

async function readCertificateBody(response) {
  const contentLength = responseHeader(response, "content-length");
  if (contentLength !== null) {
    if (!/^\d+$/.test(contentLength)) throw certificateError();
    const declaredBytes = Number(contentLength);
    if (
      !Number.isSafeInteger(declaredBytes) ||
      declaredBytes > MAX_CERTIFICATE_RESPONSE_BYTES
    ) {
      throw certificateError();
    }
  }

  if (typeof response.body?.getReader === "function") {
    let reader;
    try {
      reader = response.body.getReader();
    } catch {
      throw certificateError();
    }
    const chunks = [];
    let totalBytes = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!(value instanceof Uint8Array)) throw certificateError();
        totalBytes += value.byteLength;
        if (totalBytes > MAX_CERTIFICATE_RESPONSE_BYTES) {
          await cancelReader(reader);
          throw certificateError();
        }
        chunks.push(Buffer.from(value.buffer, value.byteOffset, value.byteLength));
      }
      return utf8Decoder.decode(Buffer.concat(chunks, totalBytes));
    } catch {
      await cancelReader(reader);
      throw certificateError();
    }
  }

  if (typeof response.text !== "function") throw certificateError();
  let body;
  try {
    body = await response.text();
  } catch {
    throw certificateError();
  }
  if (
    typeof body !== "string" ||
    Buffer.byteLength(body, "utf8") > MAX_CERTIFICATE_RESPONSE_BYTES
  ) {
    throw certificateError();
  }
  return body;
}

function validateFactoryOptions(projectId, fetchImpl, now) {
  if (
    typeof projectId !== "string" ||
    projectId.trim() !== projectId ||
    projectId.length < 1 ||
    projectId.length > 128
  ) {
    throw new TypeError("projectId must be a non-empty string");
  }
  if (typeof fetchImpl !== "function") {
    throw new TypeError("fetchImpl must be a function");
  }
  if (typeof now !== "function") throw new TypeError("now must be a function");
}

export function createFirebaseTokenVerifier({
  projectId,
  fetchImpl = globalThis.fetch,
  now = () => new Date(),
} = {}) {
  validateFactoryOptions(projectId, fetchImpl, now);
  let cachedCertificates = null;
  let cacheExpiresAt = 0;
  let certificateFetch = null;

  async function fetchCertificates() {
    let response;
    try {
      response = await fetchImpl(FIREBASE_CERTIFICATE_URL, {
        method: "GET",
        headers: { accept: "application/json" },
      });
    } catch {
      throw certificateError();
    }
    if (!response?.ok) throw certificateError();
    const body = await readCertificateBody(response);
    const certificates = parseCertificateBody(body);
    const cacheControl = responseHeader(response, "cache-control");
    const lifetimeMilliseconds = maxAgeSeconds(cacheControl) * 1000;
    cachedCertificates = certificates;
    cacheExpiresAt = currentTimeMilliseconds(now) + lifetimeMilliseconds;
    return certificates;
  }

  async function getCertificates() {
    if (
      cachedCertificates !== null &&
      currentTimeMilliseconds(now) < cacheExpiresAt
    ) {
      return cachedCertificates;
    }
    if (certificateFetch === null) {
      const request = fetchCertificates().finally(() => {
        if (certificateFetch === request) certificateFetch = null;
      });
      certificateFetch = request;
    }
    return certificateFetch;
  }

  async function verifyIdToken(token) {
    const parsed = parseToken(token);
    validateClaims(
      parsed.claims,
      projectId,
      Math.floor(currentTimeMilliseconds(now) / 1000),
    );
    const certificates = await getCertificates();
    if (!Object.hasOwn(certificates, parsed.header.kid)) throw invalidToken();
    let publicKey;
    let signatureIsValid;
    try {
      publicKey = createPublicKey(certificates[parsed.header.kid]);
      signatureIsValid =
        publicKey.asymmetricKeyType === "rsa" &&
        verify(
          "RSA-SHA256",
          Buffer.from(parsed.signingInput, "ascii"),
          publicKey,
          parsed.signature,
        );
    } catch {
      throw invalidToken();
    }
    if (!signatureIsValid) throw invalidToken();
    return validateClaims(
      parsed.claims,
      projectId,
      Math.floor(currentTimeMilliseconds(now) / 1000),
    );
  }

  return { verifyIdToken };
}
