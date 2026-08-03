import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { generateKeyPairSync, sign } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { createFirebaseTokenVerifier } from "../server/firebaseTokenVerifier.mjs";
import { createPartnerApi } from "../server/partnerApi.mjs";
import { PartnerStoreError } from "../server/partnerErrors.mjs";
import { createPartnerStore } from "../server/partnerStore.mjs";

const PARTNER_PATHS = [
  "/api/partner/preview",
  "/api/partner/claim",
  "/api/partner/access",
  "/api/partner/release-intent",
  "/api/partner/release-cancel",
  "/api/partner/release-confirm",
  "/api/partner/admin/report",
  "/api/partner/admin/rotate-invite",
];

const BRANDING = {
  name: "Community Partner",
  logoPath: null,
  accent: "#2F6B61",
};

const AUTHORIZATION = {
  "Content-Type": "application/json",
  Authorization: "Bearer learner-token",
};
const START_SECONDS = Date.parse("2026-08-02T12:00:00.000Z") / 1000;
const FIREBASE_PROJECT_ID = "everwise-46cf0";
const firebaseKeys = generateKeyPairSync("rsa", { modulusLength: 2048 });
const otherFirebaseKeys = generateKeyPairSync("rsa", { modulusLength: 2048 });
const firebasePublicKeyPem = firebaseKeys.publicKey.export({
  type: "spki",
  format: "pem",
});

function encodeFirebaseSegment(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function firebaseBearerToken(privateKey = firebaseKeys.privateKey) {
  const header = encodeFirebaseSegment({
    alg: "RS256",
    kid: "test-key",
    typ: "JWT",
  });
  const payload = encodeFirebaseSegment({
    aud: FIREBASE_PROJECT_ID,
    iss: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
    sub: "firebase-learner-uid",
    exp: START_SECONDS + 3600,
    iat: START_SECONDS - 10,
    auth_time: START_SECONDS - 10,
    email: "learner@private.example",
  });
  const signingInput = `${header}.${payload}`;
  const signature = sign(
    "RSA-SHA256",
    Buffer.from(signingInput),
    privateKey,
  );
  return `${signingInput}.${signature.toString("base64url")}`;
}

function realFirebaseVerifier(certificate) {
  return createFirebaseTokenVerifier({
    projectId: FIREBASE_PROJECT_ID,
    now: () => new Date(START_SECONDS * 1000),
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: {
        get(name) {
          return name.toLowerCase() === "cache-control"
            ? "public, max-age=3600"
            : null;
        },
      },
      async text() {
        return JSON.stringify({ "test-key": certificate });
      },
    }),
  });
}

function researchSnapshot(overrides = {}) {
  return {
    ageBand: "70-79",
    internetUse: "Every day",
    primaryDevice: "Tablet",
    confidence: "Sometimes I need help",
    scamFrequency: "few",
    concerns: ["Suspicious links"],
    bankSafetyCategory: "safe",
    aiExperience: "I’ve heard of it",
    accessibilityNeeds: ["Vision loss"],
    consentedAt: "2026-08-02T12:00:00.000Z",
    assessmentVersion: "partner-assessment-v2",
    ...overrides,
  };
}

async function setupApi(
  t,
  {
    seatLimit = 5,
    learnerIdentityOverrides = {},
    verifyIdToken: verifyIdTokenOverride,
  } = {},
) {
  const directory = await mkdtemp(join(tmpdir(), "everwise-partner-api-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  let currentTime = Date.parse("2026-08-02T12:00:00.000Z");
  const now = () => new Date(currentTime);
  const store = createPartnerStore({
    filePath: join(directory, "partners.json"),
    now,
    testOnlyAllowCustomSeatLimits: true,
  });
  const created = await store.createPartner({
    partnerId: "pilot",
    name: "Community Partner",
    seatLimit,
    branding: BRANDING,
  });
  const tokenUids = new Map([
    ["learner-token", "learner-uid"],
    ["second-learner-token", "second-learner-uid"],
  ]);
  const verifyIdToken =
    verifyIdTokenOverride ||
    (async (token) => {
      const uid = tokenUids.get(token);
      if (!uid) {
        throw new Error("invalid Firebase token containing private detail");
      }
      return {
        uid,
        email: `${uid}@private.example`,
        authTime: START_SECONDS,
        ...learnerIdentityOverrides,
      };
    });
  const api = createPartnerApi({ store, verifyIdToken, now });
  const server = createServer(async (request, response) => {
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (!(await api.handle(request, response, pathname))) {
      response.writeHead(404).end("not found");
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const address = server.address();
  const request = async (pathname, {
    method = "POST",
    body = {},
    headers = { "Content-Type": "application/json" },
  } = {}) => {
    const response = await fetch(`http://127.0.0.1:${address.port}${pathname}`, {
      method,
      headers,
      ...(method === "GET" || method === "HEAD"
        ? {}
        : { body: typeof body === "string" ? body : JSON.stringify(body) }),
    });
    const text = await response.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      // Method and ownership checks do not require a JSON body from the fallback.
    }
    return { response, text, json };
  };
  return {
    api,
    store,
    created,
    request,
    advance(milliseconds) {
      currentTime += milliseconds;
    },
  };
}

function assertSecurityHeaders(response) {
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
}

function assertGenericError(json, code) {
  assert.equal(json.code, code);
  assert.equal(typeof json.message, "string");
  const serialized = JSON.stringify(json);
  assert.equal(serialized.includes("pilot"), false);
  assert.equal(serialized.includes("Community Partner"), false);
  assert.equal(serialized.includes("private.example"), false);
}

async function directRequest(api, {
  pathname,
  body,
  remoteAddress,
  forwardedFor,
}) {
  const request = Readable.from([Buffer.from(JSON.stringify(body))]);
  request.method = "POST";
  request.headers = {
    "content-type": "application/json",
    ...(forwardedFor ? { "x-forwarded-for": forwardedFor } : {}),
  };
  Object.defineProperty(request, "socket", {
    value: { remoteAddress },
  });
  let statusCode;
  let headers;
  let text = "";
  const response = {
    writeHead(status, responseHeaders) {
      statusCode = status;
      headers = responseHeaders;
      return this;
    },
    end(chunk = "") {
      text += chunk;
    },
  };
  const owned = await api.handle(request, response, pathname);
  return {
    owned,
    statusCode,
    headers,
    json: text ? JSON.parse(text) : null,
  };
}

async function reservePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function waitForServer(child, url, stderr) {
  const deadline = Date.now() + 3_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`server exited before listening: ${stderr()}`);
    }
    try {
      return await fetch(url);
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }
  throw new Error(`server did not listen in time: ${stderr()}`);
}

async function startPartnerServer(t, { localQaOrigin } = {}) {
  const directory = await mkdtemp(join(tmpdir(), "everwise-partner-cors-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const storePath = join(directory, "partners.json");
  const store = createPartnerStore({ filePath: storePath });
  const created = await store.createPartner({
    partnerId: "local-qa",
    name: "LOCAL QA Partner",
    seatLimit: 500,
    branding: {
      name: "LOCAL QA Partner",
      logoPath: null,
      accent: "#2F6B61",
    },
  });
  const port = await reservePort();
  let stderrText = "";
  const env = {
    ...process.env,
    HOST: "127.0.0.1",
    PORT: String(port),
    EVERWISE_PARTNER_STORE_PATH: storePath,
    OPENAI_API_KEY: "",
    ELEVENLABS_API_KEY: "",
  };
  if (localQaOrigin === undefined) {
    delete env.EVERWISE_LOCAL_QA_ORIGIN;
  } else {
    env.EVERWISE_LOCAL_QA_ORIGIN = localQaOrigin;
  }
  const child = spawn(process.execPath, ["server.mjs"], {
    cwd: join(import.meta.dirname, ".."),
    env,
    stdio: ["ignore", "ignore", "pipe"],
  });
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => {
    stderrText += chunk;
  });
  t.after(() => {
    if (child.exitCode === null) child.kill("SIGTERM");
  });

  const baseUrl = `http://127.0.0.1:${port}`;
  await waitForServer(child, `${baseUrl}/healthz`, () => stderrText);
  return { baseUrl, created };
}

function deferred() {
  let resolve;
  const promise = new Promise((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function nextTurn() {
  return new Promise((resolve) => setImmediate(resolve));
}

function createRateLimitApi({ getAdminReport, now = () => new Date() }) {
  const store = {
    getAdminReport,
    async rotateInvite({ adminToken }) {
      if (adminToken !== "valid-admin") {
        throw new PartnerStoreError("INVALID_ADMIN", "private detail");
      }
      return { partnerId: "pilot", inviteToken: "a".repeat(43) };
    },
  };
  return createPartnerApi({
    store,
    verifyIdToken: async () => {
      throw new Error("not used");
    },
    now,
  });
}

function directAdminReport(api, ip, adminToken) {
  return directRequest(api, {
    pathname: "/api/partner/admin/report",
    body: { adminToken },
    remoteAddress: ip,
  });
}

test("owns exactly the eight partner routes and rejects non-POST methods", async (t) => {
  const { api, request } = await setupApi(t);
  const unknown = await directRequest(api, {
    pathname: "/api/partner/not-a-route",
    body: {},
    remoteAddress: "127.0.0.1",
  });
  assert.equal(unknown.owned, false);

  for (const pathname of PARTNER_PATHS) {
    const { response, json } = await request(pathname, { method: "GET" });
    assert.equal(response.status, 405, pathname);
    assert.equal(json.code, "METHOD_NOT_ALLOWED", pathname);
    assertSecurityHeaders(response);
  }
});

test("bounds JSON bodies at 25 KB and rejects malformed JSON", async (t) => {
  const { request } = await setupApi(t);
  const tooLarge = await request("/api/partner/preview", {
    body: { inviteToken: "a".repeat(25_001) },
  });
  assert.equal(tooLarge.response.status, 413);
  assert.equal(tooLarge.json.code, "PAYLOAD_TOO_LARGE");
  assertSecurityHeaders(tooLarge.response);

  const malformed = await request("/api/partner/preview", { body: "{not json" });
  assert.equal(malformed.response.status, 400);
  assert.equal(malformed.json.code, "INVALID_JSON");
  assertSecurityHeaders(malformed.response);
});

test("previews valid invitations and returns generic invalid and suspended errors", async (t) => {
  const { store, created, request } = await setupApi(t);
  const valid = await request("/api/partner/preview", {
    body: { inviteToken: created.inviteToken },
  });
  assert.equal(valid.response.status, 200);
  assert.deepEqual(valid.json, {
    partnerId: "pilot",
    branding: BRANDING,
    seatAvailable: true,
  });
  assertSecurityHeaders(valid.response);

  const invalid = await request("/api/partner/preview", {
    body: { inviteToken: "not-an-invite" },
  });
  assert.equal(invalid.response.status, 400);
  assertGenericError(invalid.json, "INVALID_INVITE");

  await store.setPartnerStatus({ partnerId: "pilot", status: "suspended" });
  const suspended = await request("/api/partner/preview", {
    body: { inviteToken: created.inviteToken },
  });
  assert.equal(suspended.response.status, 403);
  assertGenericError(suspended.json, "PARTNER_SUSPENDED");
});

test("requires a valid Authorization bearer for every authenticated learner route", async (t) => {
  const { request } = await setupApi(t);
  const authenticatedRoutes = [
    "/api/partner/claim",
    "/api/partner/access",
    "/api/partner/release-intent",
    "/api/partner/release-cancel",
  ];
  for (const pathname of authenticatedRoutes) {
    for (const headers of [
      { "Content-Type": "application/json" },
      { "Content-Type": "application/json", Authorization: "Basic learner-token" },
      { "Content-Type": "application/json", Authorization: "Bearer invalid-token" },
    ]) {
      const result = await request(pathname, {
        headers,
        body: { idToken: "learner-token" },
      });
      assert.equal(result.response.status, 401, pathname);
      assertGenericError(result.json, "UNAUTHENTICATED");
      assert.equal(JSON.stringify(result.json).includes("invalid-token"), false);
      assertSecurityHeaders(result.response);
    }
  }
});

test("maps real malformed Firebase signing material to a safe retryable response", async (t) => {
  const privateCertificateDetail = "not-a-certificate-private-detail";
  const verifier = realFirebaseVerifier(privateCertificateDetail);
  const bearer = firebaseBearerToken();
  const { created, request } = await setupApi(t, {
    verifyIdToken: verifier.verifyIdToken,
  });

  const result = await request("/api/partner/claim", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer}`,
    },
    body: { inviteToken: created.inviteToken, researchConsent: false },
  });

  assert.equal(result.response.status, 503);
  assert.deepEqual(result.json, {
    code: "PARTNER_UNAVAILABLE",
    message: "Sponsored access is temporarily unavailable.",
  });
  assert.equal(result.text.includes(privateCertificateDetail), false);
  assert.equal(result.text.includes("Firebase signing certificates"), false);
  assertSecurityHeaders(result.response);
});

test("keeps a real wrong-signature Firebase bearer unauthenticated", async (t) => {
  const verifier = realFirebaseVerifier(firebasePublicKeyPem);
  const bearer = firebaseBearerToken(otherFirebaseKeys.privateKey);
  const { created, request } = await setupApi(t, {
    verifyIdToken: verifier.verifyIdToken,
  });

  const result = await request("/api/partner/claim", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer}`,
    },
    body: { inviteToken: created.inviteToken, researchConsent: false },
  });

  assert.equal(result.response.status, 401);
  assertGenericError(result.json, "UNAUTHENTICATED");
  assert.equal(result.text.includes("Firebase"), false);
});

test("supports claim, returning access, release cancellation, and receipt-only confirmation", async (t) => {
  const { store, created, request } = await setupApi(t);
  const claim = await request("/api/partner/claim", {
    headers: AUTHORIZATION,
    body: {
      inviteToken: created.inviteToken,
      researchConsent: false,
      researchSnapshot: { email: "must-not-be-stored@example.com" },
    },
  });
  assert.equal(claim.response.status, 200);
  assert.deepEqual(claim.json, {
    status: "active",
    partnerId: "pilot",
    name: "Community Partner",
    branding: BRANDING,
  });

  const access = await request("/api/partner/access", {
    headers: AUTHORIZATION,
  });
  assert.equal(access.response.status, 200);
  assert.deepEqual(access.json, claim.json);

  const firstIntent = await request("/api/partner/release-intent", {
    headers: AUTHORIZATION,
  });
  assert.equal(firstIntent.response.status, 200);
  assert.match(firstIntent.json.receipt, /^[A-Za-z0-9_-]{43}$/);

  const cancelled = await request("/api/partner/release-cancel", {
    headers: AUTHORIZATION,
    body: { receipt: firstIntent.json.receipt },
  });
  assert.equal(cancelled.response.status, 200);
  assert.deepEqual(cancelled.json, { cancelled: true });
  assert.equal((await store.getAccess("learner-uid")).status, "active");

  const retryIntent = await request("/api/partner/release-intent", {
    headers: AUTHORIZATION,
  });
  const confirmed = await request("/api/partner/release-confirm", {
    body: { receipt: retryIntent.json.receipt },
  });
  assert.equal(confirmed.response.status, 200);
  assert.deepEqual(confirmed.json, { released: true, idempotent: false });
  assert.equal((await store.getAccess("learner-uid")).status, "none");

  const idempotent = await request("/api/partner/release-confirm", {
    body: { receipt: retryIntent.json.receipt },
  });
  assert.equal(idempotent.response.status, 200);
  assert.deepEqual(idempotent.json, { released: true, idempotent: true });
});

test("release intent requires authentication no older than five minutes", async (t) => {
  const cases = [
    {
      label: "fresh at the five-minute boundary",
      learnerIdentityOverrides: { authTime: START_SECONDS - 300 },
      expectedStatus: 200,
    },
    {
      label: "stale",
      learnerIdentityOverrides: { authTime: START_SECONDS - 301 },
      expectedStatus: 401,
    },
    {
      label: "future",
      learnerIdentityOverrides: { authTime: START_SECONDS + 1 },
      expectedStatus: 401,
    },
    {
      label: "missing",
      learnerIdentityOverrides: { authTime: undefined },
      expectedStatus: 401,
    },
  ];

  for (const entry of cases) {
    await t.test(entry.label, async (t) => {
      const { created, request } = await setupApi(t, {
        learnerIdentityOverrides: entry.learnerIdentityOverrides,
      });
      const claim = await request("/api/partner/claim", {
        headers: AUTHORIZATION,
        body: {
          inviteToken: created.inviteToken,
          researchConsent: false,
        },
      });
      assert.equal(claim.response.status, 200);

      const intent = await request("/api/partner/release-intent", {
        headers: AUTHORIZATION,
      });
      assert.equal(intent.response.status, entry.expectedStatus);
      if (entry.expectedStatus === 401) {
        assert.equal(intent.json.code, "RECENT_AUTH_REQUIRED");
        assertGenericError(intent.json, "RECENT_AUTH_REQUIRED");
      } else {
        assert.equal(typeof intent.json.receipt, "string");
      }
    });
  }
});

test("maps full, suspended, and invalid-receipt store failures to stable safe codes", async (t) => {
  const { store, created, request } = await setupApi(t, { seatLimit: 1 });
  await request("/api/partner/claim", {
    headers: AUTHORIZATION,
    body: { inviteToken: created.inviteToken, researchConsent: false },
  });
  const full = await request("/api/partner/claim", {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer second-learner-token",
    },
    body: { inviteToken: created.inviteToken, researchConsent: false },
  });
  assert.equal(full.response.status, 409);
  assertGenericError(full.json, "PARTNER_FULL");

  await store.setPartnerStatus({ partnerId: "pilot", status: "suspended" });
  const suspended = await request("/api/partner/claim", {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer second-learner-token",
    },
    body: { inviteToken: created.inviteToken, researchConsent: false },
  });
  assert.equal(suspended.response.status, 403);
  assertGenericError(suspended.json, "PARTNER_SUSPENDED");

  const invalidReceipt = await request("/api/partner/release-confirm", {
    body: { receipt: "not-a-receipt" },
  });
  assert.equal(invalidReceipt.response.status, 400);
  assertGenericError(invalidReceipt.json, "INVALID_RECEIPT");
});

test("returns aggregate admin reports and rotates learner invitations using body tokens", async (t) => {
  const { created, request } = await setupApi(t);
  const report = await request("/api/partner/admin/report", {
    body: { adminToken: created.adminToken },
  });
  assert.equal(report.response.status, 200);
  assert.equal(report.json.partnerId, "pilot");
  assert.deepEqual(report.json.seats, { claimed: 0, available: 5, limit: 5 });

  const headerOnly = await request("/api/partner/admin/report", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${created.adminToken}`,
    },
    body: {},
  });
  assert.equal(headerOnly.response.status, 401);
  assertGenericError(headerOnly.json, "INVALID_ADMIN");

  const rotated = await request("/api/partner/admin/rotate-invite", {
    body: { adminToken: created.adminToken },
  });
  assert.equal(rotated.response.status, 200);
  assert.equal(rotated.json.partnerId, "pilot");
  assert.match(rotated.json.inviteToken, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(rotated.json.inviteToken, created.inviteToken);

  const oldInvite = await request("/api/partner/preview", {
    body: { inviteToken: created.inviteToken },
  });
  assert.equal(oldInvite.json.code, "INVALID_INVITE");
  const replacement = await request("/api/partner/preview", {
    body: { inviteToken: rotated.json.inviteToken },
  });
  assert.equal(replacement.response.status, 200);
});

test("cooldowns one IP for ten minutes after ten invalid admin attempts", async (t) => {
  const { created, request, advance } = await setupApi(t);
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const invalid = await request("/api/partner/admin/report", {
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "203.0.113.10",
      },
      body: { adminToken: "invalid-admin-token" },
    });
    assert.equal(invalid.response.status, 401, `attempt ${attempt}`);
    assertGenericError(invalid.json, "INVALID_ADMIN");
  }
  const blocked = await request("/api/partner/admin/report", {
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": "203.0.113.10",
    },
    body: { adminToken: created.adminToken },
  });
  assert.equal(blocked.response.status, 429);
  assertGenericError(blocked.json, "RATE_LIMITED");

  const otherIp = await request("/api/partner/admin/report", {
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": "203.0.113.11",
    },
    body: { adminToken: created.adminToken },
  });
  assert.equal(otherIp.response.status, 200);

  advance(10 * 60 * 1000);
  const recovered = await request("/api/partner/admin/report", {
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": "203.0.113.10",
    },
    body: { adminToken: created.adminToken },
  });
  assert.equal(recovered.response.status, 200);
});

test("limits 30 successful reports per token and IP without limiting invite rotation", async (t) => {
  const { created, request, advance } = await setupApi(t);
  const headers = {
    "Content-Type": "application/json",
    "X-Forwarded-For": "198.51.100.20",
  };
  for (let count = 1; count <= 30; count += 1) {
    const report = await request("/api/partner/admin/report", {
      headers,
      body: { adminToken: created.adminToken },
    });
    assert.equal(report.response.status, 200, `report ${count}`);
  }
  const limited = await request("/api/partner/admin/report", {
    headers,
    body: { adminToken: created.adminToken },
  });
  assert.equal(limited.response.status, 429);
  assertGenericError(limited.json, "RATE_LIMITED");

  const rotation = await request("/api/partner/admin/rotate-invite", {
    headers,
    body: { adminToken: created.adminToken },
  });
  assert.equal(rotation.response.status, 200);

  const otherIp = await request("/api/partner/admin/report", {
    headers: { ...headers, "X-Forwarded-For": "198.51.100.21" },
    body: { adminToken: created.adminToken },
  });
  assert.equal(otherIp.response.status, 200);

  advance(60 * 1000);
  const nextWindow = await request("/api/partner/admin/report", {
    headers,
    body: { adminToken: created.adminToken },
  });
  assert.equal(nextWindow.response.status, 200);
});

test("atomically admits only 30 concurrent successful reports per token and IP", async () => {
  const gate = deferred();
  let storeCalls = 0;
  const api = createRateLimitApi({
    async getAdminReport({ adminToken }) {
      assert.equal(adminToken, "valid-admin");
      storeCalls += 1;
      await gate.promise;
      return { partnerId: "pilot" };
    },
  });
  const requests = Array.from({ length: 31 }, () =>
    directAdminReport(api, "198.51.100.80", "valid-admin"),
  );
  await nextTurn();
  gate.resolve();

  const results = await Promise.all(requests);
  assert.equal(results.filter(({ statusCode }) => statusCode === 200).length, 30);
  assert.equal(results.filter(({ statusCode }) => statusCode === 429).length, 1);
  assert.equal(storeCalls, 30);
});

test("atomically applies invalid-admin cooldown to concurrent attempts from one IP", async () => {
  const gate = deferred();
  let storeCalls = 0;
  const api = createRateLimitApi({
    async getAdminReport() {
      storeCalls += 1;
      await gate.promise;
      throw new PartnerStoreError("INVALID_ADMIN", "private detail");
    },
  });
  const requests = Array.from({ length: 11 }, () =>
    directAdminReport(api, "198.51.100.81", "invalid-admin"),
  );
  await nextTurn();
  gate.resolve();

  const results = await Promise.all(requests);
  assert.equal(results.filter(({ statusCode }) => statusCode === 401).length, 10);
  assert.equal(results.filter(({ statusCode }) => statusCode === 429).length, 1);
  assert.equal(storeCalls, 10);
});

test("failed report operations roll back admission because only successes count", async () => {
  let failuresRemaining = 5;
  let successes = 0;
  const api = createRateLimitApi({
    async getAdminReport({ adminToken }) {
      assert.equal(adminToken, "valid-admin");
      if (failuresRemaining > 0) {
        failuresRemaining -= 1;
        throw new PartnerStoreError("STORE_CORRUPT", "private detail");
      }
      successes += 1;
      return { partnerId: "pilot" };
    },
  });
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const failed = await directAdminReport(
      api,
      "198.51.100.82",
      "valid-admin",
    );
    assert.equal(failed.statusCode, 503);
  }
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    const successful = await directAdminReport(
      api,
      "198.51.100.82",
      "valid-admin",
    );
    assert.equal(successful.statusCode, 200);
  }
  const limited = await directAdminReport(
    api,
    "198.51.100.82",
    "valid-admin",
  );
  assert.equal(limited.statusCode, 429);
  assert.equal(successes, 30);
});

test("bounds attacker-created limiter keys without evicting an active cooldown", async () => {
  const api = createRateLimitApi({
    async getAdminReport({ adminToken }) {
      if (adminToken !== "valid-admin") {
        throw new PartnerStoreError("INVALID_ADMIN", "private detail");
      }
      return { partnerId: "pilot" };
    },
  });
  const oldestIp = "10.0.0.1";
  const protectedIp = "10.0.0.2";
  assert.equal(
    (await directAdminReport(api, oldestIp, "invalid-admin")).statusCode,
    401,
  );
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    assert.equal(
      (await directAdminReport(api, protectedIp, "invalid-admin")).statusCode,
      401,
    );
  }

  for (let index = 0; index < 1_024; index += 1) {
    const third = Math.floor(index / 256);
    const fourth = index % 256;
    const attackerIp = `172.16.${third}.${fourth}`;
    assert.equal(
      (await directAdminReport(api, attackerIp, "invalid-admin")).statusCode,
      401,
    );
  }

  const stillBlocked = await directAdminReport(
    api,
    protectedIp,
    "valid-admin",
  );
  assert.equal(stillBlocked.statusCode, 429);

  for (let attempt = 1; attempt <= 9; attempt += 1) {
    assert.equal(
      (await directAdminReport(api, oldestIp, "invalid-admin")).statusCode,
      401,
    );
  }
  const evictedHistory = await directAdminReport(api, oldestIp, "valid-admin");
  assert.equal(evictedHistory.statusCode, 200);
});

test("bounds report limiter keys without evicting an active report limit", async () => {
  const api = createRateLimitApi({
    async getAdminReport() {
      return { partnerId: "pilot" };
    },
  });
  const oldestIp = "10.1.0.1";
  const protectedIp = "10.1.0.2";
  await directAdminReport(api, oldestIp, "oldest-admin");
  for (let request = 1; request <= 30; request += 1) {
    assert.equal(
      (await directAdminReport(api, protectedIp, "protected-admin")).statusCode,
      200,
    );
  }

  for (let index = 0; index < 1_024; index += 1) {
    const third = Math.floor(index / 256);
    const fourth = index % 256;
    const attackerIp = `172.20.${third}.${fourth}`;
    assert.equal(
      (await directAdminReport(api, attackerIp, `attacker-admin-${index}`))
        .statusCode,
      200,
    );
  }

  const protectedLimit = await directAdminReport(
    api,
    protectedIp,
    "protected-admin",
  );
  assert.equal(protectedLimit.statusCode, 429);

  for (let request = 1; request <= 29; request += 1) {
    assert.equal(
      (await directAdminReport(api, oldestIp, "oldest-admin")).statusCode,
      200,
    );
  }
  const evictedHistory = await directAdminReport(
    api,
    oldestIp,
    "oldest-admin",
  );
  assert.equal(evictedHistory.statusCode, 200);
});

test("ignores spoofed forwarded addresses from non-loopback direct clients", async (t) => {
  const { api, created } = await setupApi(t);
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const invalid = await directRequest(api, {
      pathname: "/api/partner/admin/report",
      body: { adminToken: "invalid-admin-token" },
      remoteAddress: "198.51.100.55",
      forwardedFor: `203.0.113.${attempt}`,
    });
    assert.equal(invalid.statusCode, 401);
  }
  const blocked = await directRequest(api, {
    pathname: "/api/partner/admin/report",
    body: { adminToken: created.adminToken },
    remoteAddress: "198.51.100.55",
    forwardedFor: "203.0.113.250",
  });
  assert.equal(blocked.statusCode, 429);
  assert.equal(blocked.json.code, "RATE_LIMITED");
});

test("admin JSON contains aggregates but no token hashes, UID keys, emails, or rows", async (t) => {
  const { store, created, request } = await setupApi(t);
  for (let index = 1; index <= 5; index += 1) {
    await store.claimSeat({
      uid: `private-learner-uid-${index}`,
      inviteToken: created.inviteToken,
      researchConsent: true,
      researchSnapshot: researchSnapshot({
        primaryDevice: index % 2 === 0 ? "Computer" : "Tablet",
      }),
    });
  }
  const report = await request("/api/partner/admin/report", {
    body: { adminToken: created.adminToken },
  });
  assert.equal(report.response.status, 200);
  assert.equal(report.json.research.suppressed, false);
  assert.deepEqual(report.json.research.distributions.primaryDevice, {
    Computer: 2,
    Tablet: 3,
  });

  const forbiddenKeys = [];
  function scan(value) {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      if (/hash|uid|email|individual|submission|row/i.test(key)) {
        forbiddenKeys.push(key);
      }
      scan(child);
    }
  }
  scan(report.json);
  assert.deepEqual(forbiddenKeys, []);
  const serialized = JSON.stringify(report.json);
  for (const secret of [
    created.inviteToken,
    created.adminToken,
    "private-learner-uid-1",
    "private-learner-uid-5",
    "private.example",
  ]) {
    assert.equal(serialized.includes(secret), false);
  }
});

test("server permits the configured local QA origin for partner browser requests", async (t) => {
  const { baseUrl, created } = await startPartnerServer(t, {
    localQaOrigin: "http://127.0.0.1:5174",
  });

  const preflight = await fetch(`${baseUrl}/api/partner/preview`, {
    method: "OPTIONS",
    headers: {
      Origin: "http://127.0.0.1:5174",
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type",
    },
  });
  assert.equal(preflight.status, 204);
  assert.equal(
    preflight.headers.get("access-control-allow-origin"),
    "http://127.0.0.1:5174",
  );
  assert.equal(preflight.headers.get("access-control-allow-methods"), "POST");
  assert.equal(
    preflight.headers.get("access-control-allow-headers"),
    "Authorization, Content-Type",
  );
  assert.equal(preflight.headers.get("vary"), "Origin");
  assert.equal(preflight.headers.get("access-control-allow-credentials"), null);

  const preview = await fetch(`${baseUrl}/api/partner/preview`, {
    method: "POST",
    headers: {
      Origin: "http://127.0.0.1:5174",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inviteToken: created.inviteToken }),
  });
  assert.equal(preview.status, 200);
  assert.equal(
    preview.headers.get("access-control-allow-origin"),
    "http://127.0.0.1:5174",
  );
  assert.equal(preview.headers.get("access-control-allow-credentials"), null);
  assert.equal((await preview.json()).partnerId, "local-qa");
});

test("server rejects non-exact local QA origin configuration and mismatched requests", async (t) => {
  const cases = [
    {
      name: "normalized dot path",
      configuredOrigin: "http://127.0.0.1:5174/.",
      requestOrigin: "http://127.0.0.1:5174",
    },
    {
      name: "encoded normalized dot path",
      configuredOrigin: "http://127.0.0.1:5174/%2e",
      requestOrigin: "http://127.0.0.1:5174",
    },
    {
      name: "empty query marker",
      configuredOrigin: "http://127.0.0.1:5174/?",
      requestOrigin: "http://127.0.0.1:5174",
    },
    {
      name: "empty fragment marker",
      configuredOrigin: "http://127.0.0.1:5174/#",
      requestOrigin: "http://127.0.0.1:5174",
    },
    {
      name: "empty credential marker",
      configuredOrigin: "http://:@127.0.0.1:5174",
      requestOrigin: "http://127.0.0.1:5174",
    },
    {
      name: "external host",
      configuredOrigin: "http://example.com:5174",
      requestOrigin: "http://example.com:5174",
    },
    {
      name: "mismatched request origin",
      configuredOrigin: "http://127.0.0.1:5174",
      requestOrigin: "http://localhost:5174",
    },
    {
      name: "configuration absent",
      configuredOrigin: undefined,
      requestOrigin: "http://127.0.0.1:5174",
    },
  ];

  for (const { name, configuredOrigin, requestOrigin } of cases) {
    await t.test(name, async (t) => {
      const { baseUrl } = await startPartnerServer(t, {
        localQaOrigin: configuredOrigin,
      });
      const preflight = await fetch(`${baseUrl}/api/partner/preview`, {
        method: "OPTIONS",
        headers: {
          Origin: requestOrigin,
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "content-type",
        },
      });
      assert.equal(preflight.status, 405);
      assert.equal(
        preflight.headers.get("access-control-allow-origin"),
        null,
      );
      assert.equal(
        preflight.headers.get("access-control-allow-credentials"),
        null,
      );
    });
  }
});

test("server composes partner health without changing narration and scam-checker routes", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "everwise-partner-server-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const port = await reservePort();
  let stderrText = "";
  const child = spawn(process.execPath, ["server.mjs"], {
    cwd: join(import.meta.dirname, ".."),
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(port),
      EVERWISE_PARTNER_STORE_PATH: join(directory, "partners.json"),
      OPENAI_API_KEY: "",
      ELEVENLABS_API_KEY: "",
    },
    stdio: ["ignore", "ignore", "pipe"],
  });
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => {
    stderrText += chunk;
  });
  t.after(() => {
    if (child.exitCode === null) child.kill("SIGTERM");
  });

  const baseUrl = `http://127.0.0.1:${port}`;
  const health = await waitForServer(child, `${baseUrl}/healthz`, () => stderrText);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), {
    ok: true,
    readAloudConfigured: false,
    scamCheckerConfigured: false,
    partnerAccessConfigured: false,
    partnerStoreHealthy: true,
  });

  const narration = await fetch(`${baseUrl}/api/read-aloud`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "Hello" }),
  });
  assert.equal(narration.status, 503);
  assert.equal(await narration.text(), "Read-aloud service is not configured");

  const scamCheck = await fetch(`${baseUrl}/api/check-message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Hello" }),
  });
  assert.equal(scamCheck.status, 503);
  assert.deepEqual(await scamCheck.json(), {
    error: "Scam checker is not configured",
  });

  const malformed = await fetch(`${baseUrl}/api/check-message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{not json",
  });
  assert.equal(malformed.status, 400);
  assert.deepEqual(await malformed.json(), {
    error: "The request body is invalid.",
    code: "INVALID_JSON",
  });

  const oversized = await fetch(`${baseUrl}/api/check-message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "x".repeat(25_001) }),
  });
  assert.equal(oversized.status, 413);
  assert.deepEqual(await oversized.json(), {
    error: "The request body is too large.",
    code: "PAYLOAD_TOO_LARGE",
  });

  for (let index = 0; index < 27; index += 1) {
    const allowed = await fetch(`${baseUrl}/api/check-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Hello" }),
    });
    assert.equal(allowed.status, 503);
  }
  const limited = await fetch(`${baseUrl}/api/check-message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Hello" }),
  });
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("retry-after"), "60");
  assert.deepEqual(await limited.json(), {
    error: "Too many requests. Please wait and try again.",
    code: "RATE_LIMITED",
  });
});
