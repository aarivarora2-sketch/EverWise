import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { createFirebaseTokenVerifier } from "../server/firebaseTokenVerifier.mjs";

const PROJECT_ID = "everwise-46cf0";
const CERTIFICATE_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
const START = Date.parse("2026-08-02T12:00:00.000Z");
const START_SECONDS = START / 1000;

const primaryKeys = generateKeyPairSync("rsa", { modulusLength: 2048 });
const otherKeys = generateKeyPairSync("rsa", { modulusLength: 2048 });
const publicKeyPem = primaryKeys.publicKey.export({
  type: "spki",
  format: "pem",
});

function encodeJson(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function validClaims(overrides = {}) {
  return {
    aud: PROJECT_ID,
    iss: `https://securetoken.google.com/${PROJECT_ID}`,
    sub: "firebase-uid-1",
    exp: START_SECONDS + 3600,
    iat: START_SECONDS - 10,
    auth_time: START_SECONDS - 10,
    email: "learner@example.com",
    ...overrides,
  };
}

function createToken({
  header = { alg: "RS256", kid: "test-key", typ: "JWT" },
  claims = validClaims(),
  privateKey = primaryKeys.privateKey,
} = {}) {
  const headerSegment = encodeJson(header);
  const payloadSegment = encodeJson(claims);
  const signingInput = `${headerSegment}.${payloadSegment}`;
  const signature = sign("RSA-SHA256", Buffer.from(signingInput), privateKey);
  return `${signingInput}.${signature.toString("base64url")}`;
}

function certificateResponse(
  certificates = { "test-key": publicKeyPem },
  { cacheControl = "public, max-age=3600", ok = true, status = 200 } = {},
) {
  return {
    ok,
    status,
    headers: {
      get(name) {
        return name.toLowerCase() === "cache-control" ? cacheControl : null;
      },
    },
    async text() {
      return JSON.stringify(certificates);
    },
  };
}

function setupVerifier({ cacheControl, fetchImpl: customFetch } = {}) {
  let currentTime = START;
  const requests = [];
  const fetchImpl =
    customFetch ||
    (async (...args) => {
      requests.push(args);
      return certificateResponse(undefined, { cacheControl });
    });
  const verifier = createFirebaseTokenVerifier({
    projectId: PROJECT_ID,
    fetchImpl,
    now: () => new Date(currentTime),
  });
  return {
    verifier,
    requests,
    advance(milliseconds) {
      currentTime += milliseconds;
    },
  };
}

async function expectRejected(verifier, token) {
  await assert.rejects(() => verifier.verifyIdToken(token));
}

test("valid RS256 Firebase token returns only the minimal learner identity", async () => {
  const { verifier, requests } = setupVerifier();
  const token = createToken();

  assert.deepEqual(await verifier.verifyIdToken(token), {
    uid: "firebase-uid-1",
    email: "learner@example.com",
    authTime: START_SECONDS - 10,
  });
  assert.equal(requests.length, 1);
  assert.equal(requests[0][0], CERTIFICATE_URL);
  assert.equal(JSON.stringify(requests[0]).includes(token), false);
});

test("rejects a token signed by a different private key", async () => {
  const { verifier } = setupVerifier();
  await expectRejected(verifier, createToken({ privateKey: otherKeys.privateKey }));
});

test("rejects an unsupported signing algorithm", async () => {
  const { verifier } = setupVerifier();
  await expectRejected(
    verifier,
    createToken({ header: { alg: "HS256", kid: "test-key", typ: "JWT" } }),
  );
});

test("rejects an unknown certificate key identifier", async () => {
  const { verifier } = setupVerifier();
  await expectRejected(
    verifier,
    createToken({ header: { alg: "RS256", kid: "unknown", typ: "JWT" } }),
  );
});

test("rejects wrong issuer, wrong audience, and invalid token times", async () => {
  const invalidClaims = [
    { iss: "https://securetoken.google.com/wrong-project" },
    { aud: "wrong-project" },
    { exp: START_SECONDS },
    { iat: START_SECONDS + 1 },
    { auth_time: START_SECONDS + 1 },
  ];
  for (const override of invalidClaims) {
    const { verifier } = setupVerifier();
    await expectRejected(verifier, createToken({ claims: validClaims(override) }));
  }
});

test("rejects a token that expires while certificates are being fetched", async () => {
  let currentTime = START;
  const verifier = createFirebaseTokenVerifier({
    projectId: PROJECT_ID,
    fetchImpl: async () => {
      currentTime += 2_000;
      return certificateResponse();
    },
    now: () => new Date(currentTime),
  });
  const token = createToken({
    claims: validClaims({ exp: START_SECONDS + 1 }),
  });

  await expectRejected(verifier, token);
});

test("rejects blank and overlong Firebase subjects", async () => {
  for (const sub of ["", "   ", "u".repeat(129)]) {
    const { verifier } = setupVerifier();
    await expectRejected(verifier, createToken({ claims: validClaims({ sub }) }));
  }
});

test("rejects malformed, non-canonical, and oversized JWT input", async () => {
  const malformedTokens = [
    "not-a-jwt",
    "one.two.three.four",
    "..",
    `${encodeJson({ alg: "RS256", kid: "test-key" })}=.${encodeJson(validClaims())}.x`,
    `${"A".repeat(5_000)}.${encodeJson(validClaims())}.x`,
    `${encodeJson({ alg: "RS256", kid: "test-key" })}.${"A".repeat(25_000)}.x`,
    `${encodeJson({ alg: "RS256", kid: "test-key" })}.${encodeJson(validClaims())}.${"A".repeat(2_000)}`,
  ];
  for (const token of malformedTokens) {
    const { verifier } = setupVerifier();
    await expectRejected(verifier, token);
  }
});

test("rejects malformed JSON and non-object JWT header or payload", async () => {
  const validHeader = encodeJson({ alg: "RS256", kid: "test-key", typ: "JWT" });
  const validPayload = encodeJson(validClaims());
  const malformedParts = [
    [Buffer.from("not json").toString("base64url"), validPayload],
    [encodeJson([]), validPayload],
    [validHeader, Buffer.from("not json").toString("base64url")],
    [validHeader, encodeJson([])],
  ];
  for (const [header, payload] of malformedParts) {
    const { verifier } = setupVerifier();
    await expectRejected(verifier, `${header}.${payload}.AA`);
  }
});

test("rejects missing or non-numeric required claims", async () => {
  const invalidClaims = [
    { exp: "9999999999" },
    { exp: Number.MAX_SAFE_INTEGER + 1 },
    { iat: null },
    { auth_time: false },
    { email: 123 },
  ];
  for (const override of invalidClaims) {
    const { verifier } = setupVerifier();
    await expectRejected(verifier, createToken({ claims: validClaims(override) }));
  }
});

test("reuses cached certificates until their max-age expires", async () => {
  const { verifier, requests, advance } = setupVerifier();
  const token = createToken({ claims: validClaims({ exp: START_SECONDS + 7200 }) });

  await verifier.verifyIdToken(token);
  advance(3_599_000);
  await verifier.verifyIdToken(token);
  assert.equal(requests.length, 1);

  advance(2_000);
  await verifier.verifyIdToken(token);
  assert.equal(requests.length, 2);
});

test("caps certificate cache lifetime at six hours", async () => {
  const { verifier, requests, advance } = setupVerifier({
    cacheControl: "public, max-age=999999",
  });
  const token = createToken({
    claims: validClaims({ exp: START_SECONDS + 8 * 60 * 60 }),
  });

  await verifier.verifyIdToken(token);
  advance(6 * 60 * 60 * 1000 - 1);
  await verifier.verifyIdToken(token);
  assert.equal(requests.length, 1);

  advance(2);
  await verifier.verifyIdToken(token);
  assert.equal(requests.length, 2);
});

test("shares one in-flight certificate fetch across concurrent verifications", async () => {
  let fetchCount = 0;
  let releaseFetch;
  const responsePromise = new Promise((resolve) => {
    releaseFetch = resolve;
  });
  const { verifier } = setupVerifier({
    fetchImpl: async () => {
      fetchCount += 1;
      return responsePromise;
    },
  });

  const first = verifier.verifyIdToken(createToken());
  const second = verifier.verifyIdToken(
    createToken({ claims: validClaims({ sub: "firebase-uid-2" }) }),
  );
  await Promise.resolve();
  assert.equal(fetchCount, 1);

  releaseFetch(certificateResponse());
  const identities = await Promise.all([first, second]);
  assert.deepEqual(
    identities.map(({ uid }) => uid),
    ["firebase-uid-1", "firebase-uid-2"],
  );
});

test("does not retain a failed in-flight certificate request", async () => {
  let fetchCount = 0;
  const { verifier } = setupVerifier({
    fetchImpl: async () => {
      fetchCount += 1;
      if (fetchCount === 1) throw new Error("temporary network failure");
      return certificateResponse();
    },
  });

  await expectRejected(verifier, createToken());
  assert.deepEqual(await verifier.verifyIdToken(createToken()), {
    uid: "firebase-uid-1",
    email: "learner@example.com",
    authTime: START_SECONDS - 10,
  });
  assert.equal(fetchCount, 2);
});

test("rejects failed, malformed, and oversized certificate responses", async () => {
  const invalidResponses = [
    certificateResponse({}, { ok: false, status: 503 }),
    {
      ok: true,
      status: 200,
      headers: {
        get(name) {
          return name.toLowerCase() === "cache-control"
            ? "public, max-age=3600"
            : null;
        },
      },
      text: async () => "not json",
    },
    certificateResponse({ "test-key": 123 }),
    {
      ok: true,
      status: 200,
      headers: {
        get(name) {
          return name.toLowerCase() === "cache-control"
            ? "public, max-age=3600"
            : null;
        },
      },
      text: async () => `{"padding":"${"x".repeat(300_000)}"}`,
    },
  ];

  for (const response of invalidResponses) {
    const { verifier } = setupVerifier({ fetchImpl: async () => response });
    await expectRejected(verifier, createToken());
  }
});

test("stops reading a streamed certificate response at the byte limit", async () => {
  let canceled = false;
  let chunksProduced = 0;
  const body = new ReadableStream({
    pull(controller) {
      chunksProduced += 1;
      controller.enqueue(new Uint8Array(128 * 1024));
    },
    cancel() {
      canceled = true;
    },
  });
  const response = {
    ok: true,
    status: 200,
    headers: {
      get(name) {
        return name.toLowerCase() === "cache-control"
          ? "public, max-age=3600"
          : null;
      },
    },
    body,
    text: async () => {
      throw new Error("the unbounded text reader must not be used");
    },
  };
  const { verifier } = setupVerifier({ fetchImpl: async () => response });

  await expectRejected(verifier, createToken());
  assert.equal(canceled, true);
  assert.ok(chunksProduced < 10);
});

test("does not cache certificates from a malformed max-age directive", async () => {
  const { verifier, requests } = setupVerifier({
    cacheControl: "public, max-age=3600junk",
  });

  await verifier.verifyIdToken(createToken());
  await verifier.verifyIdToken(createToken());
  assert.equal(requests.length, 2);
});
