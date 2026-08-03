import test from "node:test";
import assert from "node:assert/strict";
import {
  FirebaseIdentityError,
  createFirebaseIdentityClient,
} from "../scripts/firebaseIdentityClient.mjs";

const apiKey = "public-test-key";
const email = "everwise001@accounts.everwise.app";
const password = "Example-Password-29!";
const idToken = "id-token-1";
const firebaseRawMessage = "EMAIL_EXISTS: private firebase detail";

function streamBody(chunks, { keepOpen = false, onCancel, byob = true } = {}) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    ...(byob ? { type: "bytes" } : {}),
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      if (!keepOpen) controller.close();
    },
    cancel: onCancel,
  });
}

function response(body, { ok = true, status = 200 } = {}) {
  return { ok, status, body: streamBody([JSON.stringify(body)]) };
}

function expectSafeError(error, code, rawMessage = firebaseRawMessage) {
  assert.ok(error instanceof FirebaseIdentityError);
  assert.equal(error.code, code);
  for (const secret of [apiKey, email, password, idToken, rawMessage]) {
    assert.equal(`${error.name}:${error.code}:${error.message}`.includes(secret), false);
  }
  return true;
}

test("uses the exact Firebase endpoint and account request bodies", async () => {
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });
    if (url.includes("signUp")) return response({ localId: "firebase-uid-1", idToken });
    if (url.includes("signInWithPassword")) return response({ localId: "firebase-uid-2", idToken: "id-token-2" });
    return response({});
  };
  const client = createFirebaseIdentityClient({ apiKey, fetchImpl });

  assert.deepEqual(await client.createAccount({ email, password }), {
    uid: "firebase-uid-1", idToken,
  });
  assert.deepEqual(await client.signIn({ email, password }), {
    uid: "firebase-uid-2", idToken: "id-token-2",
  });
  await client.deleteAccount({ idToken });

  assert.equal(requests[0].url, "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=public-test-key");
  assert.deepEqual(JSON.parse(requests[0].options.body), { email, password, returnSecureToken: true });
  assert.equal(requests[1].url, "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=public-test-key");
  assert.deepEqual(JSON.parse(requests[1].options.body), { email, password, returnSecureToken: true });
  assert.equal(requests[2].url, "https://identitytoolkit.googleapis.com/v1/accounts:delete?key=public-test-key");
  assert.deepEqual(JSON.parse(requests[2].options.body), { idToken });
  for (const request of requests) {
    assert.equal(request.options.method, "POST");
    assert.deepEqual(request.options.headers, { "Content-Type": "application/json" });
  }
});

test("gets only the required EverWise Firebase project", async () => {
  const requests = [];
  const client = createFirebaseIdentityClient({
    apiKey,
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return response({ projectId: "games-caf0e", ignored: "not returned" });
    },
  });
  assert.deepEqual(await client.getProject(), { projectId: "games-caf0e" });
  assert.equal(requests[0].url, "https://identitytoolkit.googleapis.com/v1/projects?key=public-test-key");
  assert.equal(requests[0].options.method, "GET");
  assert.deepEqual(requests[0].options.headers, {});
  assert.equal("body" in requests[0].options, false);
});

test("rejects malformed account or project success responses", async () => {
  const cases = [
    ["malformed JSON", async () => ({ ok: true, status: 200, body: streamBody(["not json"]) }), (client) => client.createAccount({ email, password })],
    ["missing local id", async () => response({ idToken }), (client) => client.createAccount({ email, password })],
    ["missing token", async () => response({ localId: "firebase-uid-1" }), (client) => client.signIn({ email, password })],
    ["missing project", async () => response({}), (client) => client.getProject()],
    ["wrong project", async () => response({ projectId: "other-project" }), (client) => client.getProject()],
  ];
  for (const [, fetchImpl, call] of cases) {
    const client = createFirebaseIdentityClient({ apiKey, fetchImpl });
    await assert.rejects(call(client), (error) => expectSafeError(error, "INVALID_RESPONSE"));
  }
});

test("rejects null, malformed, and overlong public account arguments safely", async () => {
  const client = createFirebaseIdentityClient({ apiKey, fetchImpl: async () => response({}) });
  const cases = [
    () => client.createAccount(null),
    () => client.signIn(null),
    () => client.deleteAccount(null),
    () => client.createAccount({ email: "e".repeat(321), password }),
    () => client.signIn({ email, password: "p".repeat(1_025) }),
    () => client.deleteAccount({ idToken: "t".repeat(16_385) }),
  ];
  for (const call of cases) {
    await assert.rejects(call(), (error) => expectSafeError(error, "INVALID_RESPONSE"));
  }
});

test("rejects a non-boolean fetch ok value before returning credentials", async () => {
  const client = createFirebaseIdentityClient({
    apiKey,
    fetchImpl: async () => ({
      ok: "true",
      status: 200,
      body: streamBody([JSON.stringify({ localId: "firebase-uid-1", idToken })]),
    }),
  });
  await assert.rejects(client.createAccount({ email, password }), (error) => expectSafeError(error, "INVALID_RESPONSE"));
});

test("rejects response streams larger than 25,000 bytes", async () => {
  let cancelled = false;
  let largestReadBuffer = 0;
  const client = createFirebaseIdentityClient({
    apiKey,
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      body: new ReadableStream({
        type: "bytes",
        pull(controller) {
          const view = controller.byobRequest?.view;
          assert.ok(view instanceof Uint8Array);
          largestReadBuffer = Math.max(largestReadBuffer, view.byteLength);
          view.fill(120);
          controller.byobRequest.respond(view.byteLength);
        },
        cancel() { cancelled = true; },
      }),
    }),
  });
  await assert.rejects(client.getProject(), (error) => expectSafeError(error, "INVALID_RESPONSE"));
  assert.equal(cancelled, true);
  assert.equal(largestReadBuffer, 25_001);
});

test("rejects response bodies that cannot be bounded with a BYOB reader", async () => {
  const client = createFirebaseIdentityClient({
    apiKey,
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      body: streamBody([JSON.stringify({ projectId: "games-caf0e" })], { byob: false }),
    }),
  });
  await assert.rejects(client.getProject(), (error) => expectSafeError(error, "INVALID_RESPONSE"));
});

test("maps Firebase failures to safe stable error codes", async () => {
  const cases = [
    ["EMAIL_EXISTS", "EMAIL_EXISTS"],
    ["INVALID_LOGIN_CREDENTIALS", "INVALID_LOGIN_CREDENTIALS"],
    ["EMAIL_NOT_FOUND", "INVALID_LOGIN_CREDENTIALS"],
    ["INVALID_PASSWORD", "INVALID_LOGIN_CREDENTIALS"],
    ["OPERATION_NOT_ALLOWED", "OPERATION_NOT_ALLOWED"],
    ["TOO_MANY_ATTEMPTS_TRY_LATER", "RATE_LIMITED"],
  ];
  for (const [firebaseMessage, code] of cases) {
    const rawMessage = `${firebaseMessage}: private firebase detail`;
    const client = createFirebaseIdentityClient({
      apiKey,
      fetchImpl: async () => response({ error: { message: rawMessage } }, { ok: false, status: 400 }),
    });
    await assert.rejects(client.createAccount({ email, password }), (error) => expectSafeError(error, code, rawMessage));
  }
});

test("maps HTTP 429 with malformed failure content to a safe rate-limit error", async () => {
  const client = createFirebaseIdentityClient({
    apiKey,
    fetchImpl: async () => ({ ok: false, status: 429, body: streamBody(["not json"]) }),
  });
  await assert.rejects(client.createAccount({ email, password }), (error) => expectSafeError(error, "RATE_LIMITED", "not json"));
});

test("clears the timeout after a normal response", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let signal;
  const client = createFirebaseIdentityClient({
    apiKey,
    timeoutMs: 200,
    fetchImpl: async (_url, options) => {
      signal = options.signal;
      return response({ projectId: "games-caf0e" });
    },
  });
  await client.getProject();
  t.mock.timers.tick(200);
  assert.equal(signal.aborted, false);
});

test("maps aborted and network failures to unavailable without secret disclosure", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let signal;
  const client = createFirebaseIdentityClient({
    apiKey,
    timeoutMs: 200,
    fetchImpl: async (_url, options) => {
      signal = options.signal;
      return new Promise((_resolve, reject) => signal.addEventListener("abort", () => reject(new Error(`${email}${password}${idToken}`)), { once: true }));
    },
  });
  const request = client.deleteAccount({ idToken });
  await Promise.resolve();
  t.mock.timers.tick(200);
  await assert.rejects(request, (error) => expectSafeError(error, "UNAVAILABLE"));
  assert.equal(signal.aborted, true);

  const networkClient = createFirebaseIdentityClient({ apiKey, fetchImpl: async () => { throw new Error(`${apiKey}${email}${password}${idToken}`); } });
  await assert.rejects(networkClient.createAccount({ email, password }), (error) => expectSafeError(error, "UNAVAILABLE"));
});
