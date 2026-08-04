import test from "node:test";
import assert from "node:assert/strict";
import {
  PartnerAccessError,
  beginPartnerRelease,
  cancelPartnerRelease,
  claimPartnerSeat,
  confirmPartnerRelease,
  fetchPartnerAccess,
  fetchPartnerReport,
  previewInvite,
  registerProvisionedLogin,
  resolveProvisionedLogin,
  rotatePartnerInvite,
} from "../src/services/partnerAccess.js";

const INVITE_TOKEN = "i".repeat(43);
const ADMIN_TOKEN = "a".repeat(43);
const RECEIPT = "r".repeat(43);
const ID_TOKEN = "firebase.id.token";
const BRANDING = {
  name: "Community Partner",
  logoPath: null,
  accent: "#2F6B61",
};
const ACTIVE_ACCESS = {
  status: "active",
  partnerId: "community-partner",
  name: "Community Partner",
  branding: BRANDING,
};
const PREVIEW = {
  partnerId: "community-partner",
  branding: BRANDING,
  seatAvailable: true,
};
const REPORT = {
  partnerId: "community-partner",
  name: "Community Partner",
  status: "active",
  branding: BRANDING,
  seats: { claimed: 0, available: 500, limit: 500 },
  invitation: { status: "active" },
  research: {
    consentedCount: 0,
    consentedPercentage: 0,
    suppressed: true,
    distributions: null,
  },
  updatedAt: "2026-08-03T00:00:00.000Z",
};

function successfulFetch(calls, responseBody = { ok: true }) {
  return async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      status: 200,
      headers: { get: () => null },
      body: streamBody([JSON.stringify(responseBody)]),
    };
  };
}

function sameOriginEndpoint(path) {
  return `https://everwise.example${path}`;
}

function streamBody(chunks, { onCancel, keepOpen = false } = {}) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      if (!keepOpen) controller.close();
    },
    cancel: onCancel,
  });
}

test("partner methods use POST, the shared endpoint resolver, JSON bodies, and correct authentication", async () => {
  const cases = [
    {
      method: resolveProvisionedLogin,
      args: { username: "EverWise001" },
      path: "/api/partner/login",
      body: { username: "EverWise001" },
      response: {
        authEmail: "ewp-0123456789abcdef0123456789abcdef0123456789abcdef@accounts.everwise.app",
      },
    },
    {
      method: registerProvisionedLogin,
      args: {
        idToken: ID_TOKEN,
        adminToken: ADMIN_TOKEN,
        username: "EverWise001",
      },
      path: "/api/partner/admin/register-login",
      body: { adminToken: ADMIN_TOKEN, username: "EverWise001" },
      authenticated: true,
      response: { ...ACTIVE_ACCESS, username: "everwise001" },
    },
    {
      method: previewInvite,
      args: { inviteToken: INVITE_TOKEN },
      path: "/api/partner/preview",
      body: { inviteToken: INVITE_TOKEN },
      response: PREVIEW,
    },
    {
      method: claimPartnerSeat,
      args: {
        idToken: ID_TOKEN,
        inviteToken: INVITE_TOKEN,
        researchConsent: false,
        researchSnapshot: null,
      },
      path: "/api/partner/claim",
      body: {
        inviteToken: INVITE_TOKEN,
        researchConsent: false,
        researchSnapshot: null,
      },
      authenticated: true,
      response: ACTIVE_ACCESS,
    },
    {
      method: fetchPartnerAccess,
      args: { idToken: ID_TOKEN },
      path: "/api/partner/access",
      body: {},
      authenticated: true,
      response: { status: "none" },
    },
    {
      method: beginPartnerRelease,
      args: { idToken: ID_TOKEN },
      path: "/api/partner/release-intent",
      body: {},
      authenticated: true,
      response: {
        receipt: RECEIPT,
        expiresAt: "2026-08-04T00:00:00.000Z",
      },
    },
    {
      method: cancelPartnerRelease,
      args: { idToken: ID_TOKEN, receipt: RECEIPT },
      path: "/api/partner/release-cancel",
      body: { receipt: RECEIPT },
      authenticated: true,
      response: { cancelled: true },
    },
    {
      method: confirmPartnerRelease,
      args: { receipt: RECEIPT },
      path: "/api/partner/release-confirm",
      body: { receipt: RECEIPT },
      response: { released: true, idempotent: false },
    },
    {
      method: fetchPartnerReport,
      args: { adminToken: ADMIN_TOKEN },
      path: "/api/partner/admin/report",
      body: { adminToken: ADMIN_TOKEN },
      response: REPORT,
    },
    {
      method: rotatePartnerInvite,
      args: { adminToken: ADMIN_TOKEN },
      path: "/api/partner/admin/rotate-invite",
      body: { adminToken: ADMIN_TOKEN },
      response: {
        partnerId: "community-partner",
        inviteToken: INVITE_TOKEN,
      },
    },
  ];

  for (const entry of cases) {
    const calls = [];
    await entry.method({
      ...entry.args,
      fetchImpl: successfulFetch(calls, entry.response),
      apiEndpointImpl: sameOriginEndpoint,
    });

    assert.equal(calls.length, 1, entry.path);
    const [{ url, options }] = calls;
    assert.equal(url, sameOriginEndpoint(entry.path));
    assert.equal(url.includes(INVITE_TOKEN), false);
    assert.equal(url.includes(ADMIN_TOKEN), false);
    assert.equal(url.includes(RECEIPT), false);
    assert.equal(options.method, "POST");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.equal(options.headers.Authorization, entry.authenticated ? `Bearer ${ID_TOKEN}` : undefined);
    assert.deepEqual(JSON.parse(options.body), entry.body);
    assert.equal(options.headers.Authorization?.includes(INVITE_TOKEN) ?? false, false);
    assert.equal(options.headers.Authorization?.includes(ADMIN_TOKEN) ?? false, false);
    assert.equal(options.headers.Authorization?.includes(RECEIPT) ?? false, false);
  }
});

test("maps stable API codes to safe PartnerAccessError messages without token disclosure", async () => {
  const fetchImpl = async () => ({
    ok: false,
    status: 400,
    headers: { get: () => null },
    body: streamBody([JSON.stringify({
      code: "INVALID_INVITE",
      message: `server detail ${INVITE_TOKEN}`,
    })]),
  });

  await assert.rejects(
    previewInvite({
      inviteToken: INVITE_TOKEN,
      fetchImpl,
      apiEndpointImpl: sameOriginEndpoint,
    }),
    (error) => {
      assert.ok(error instanceof PartnerAccessError);
      assert.equal(error.code, "INVALID_INVITE");
      assert.equal(error.message.includes(INVITE_TOKEN), false);
      assert.equal(error.message, "This access link is not available.");
      return true;
    },
  );
});

test("maps recent-auth rejection to a stable safe client error", async () => {
  const fetchImpl = async () => ({
    ok: false,
    status: 401,
    headers: { get: () => null },
    body: streamBody([
      JSON.stringify({
        code: "RECENT_AUTH_REQUIRED",
        message: `private server detail ${ID_TOKEN}`,
      }),
    ]),
  });

  await assert.rejects(
    beginPartnerRelease({
      idToken: ID_TOKEN,
      fetchImpl,
      apiEndpointImpl: sameOriginEndpoint,
    }),
    (error) => {
      assert.ok(error instanceof PartnerAccessError);
      assert.equal(error.code, "RECENT_AUTH_REQUIRED");
      assert.equal(error.message.includes(ID_TOKEN), false);
      return true;
    },
  );
});

test("uses safe generic errors for malformed, oversized, and failed responses", async () => {
  for (const fetchImpl of [
    async () => ({
      ok: false,
      status: 500,
      headers: { get: () => "999999" },
    }),
    async () => {
      throw new Error(INVITE_TOKEN);
    },
    async () => undefined,
    async () => ({
      ok: false,
      status: 500,
      get headers() {
        throw new Error(INVITE_TOKEN);
      },
    }),
  ]) {
    await assert.rejects(
      previewInvite({
        inviteToken: INVITE_TOKEN,
        fetchImpl,
        apiEndpointImpl: sameOriginEndpoint,
      }),
      (error) => {
        assert.ok(error instanceof PartnerAccessError);
        assert.equal(error.code, "PARTNER_UNAVAILABLE");
        assert.equal(error.message.includes(INVITE_TOKEN), false);
        return true;
      },
    );
  }
});

test("rejects malformed successful bodies for every partner endpoint", async () => {
  const cases = [
    [previewInvite, { inviteToken: INVITE_TOKEN }, PREVIEW],
    [
      claimPartnerSeat,
      {
        idToken: ID_TOKEN,
        inviteToken: INVITE_TOKEN,
        researchConsent: false,
        researchSnapshot: null,
      },
      ACTIVE_ACCESS,
    ],
    [fetchPartnerAccess, { idToken: ID_TOKEN }, { status: "none" }],
    [
      beginPartnerRelease,
      { idToken: ID_TOKEN },
      { receipt: RECEIPT, expiresAt: "2026-08-04T00:00:00.000Z" },
    ],
    [
      cancelPartnerRelease,
      { idToken: ID_TOKEN, receipt: RECEIPT },
      { cancelled: true },
    ],
    [
      confirmPartnerRelease,
      { receipt: RECEIPT },
      { released: true, idempotent: false },
    ],
    [fetchPartnerReport, { adminToken: ADMIN_TOKEN }, REPORT],
    [
      rotatePartnerInvite,
      { adminToken: ADMIN_TOKEN },
      { partnerId: "community-partner", inviteToken: INVITE_TOKEN },
    ],
  ];

  for (const [method, args, validBody] of cases) {
    await assert.rejects(
      method({
        ...args,
        fetchImpl: successfulFetch([], { ...validBody, unexpected: true }),
        apiEndpointImpl: sameOriginEndpoint,
      }),
      (error) => {
        assert.ok(error instanceof PartnerAccessError);
        assert.equal(error.code, "PARTNER_UNAVAILABLE");
        return true;
      },
    );
  }
});

test("malformed access success cannot erase known sponsorship", async () => {
  await assert.rejects(
    fetchPartnerAccess({
      idToken: ID_TOKEN,
      fetchImpl: successfulFetch([], {
        status: "none",
        branding: BRANDING,
      }),
      apiEndpointImpl: sameOriginEndpoint,
    }),
    (error) => {
      assert.ok(error instanceof PartnerAccessError);
      assert.equal(error.code, "PARTNER_UNAVAILABLE");
      return true;
    },
  );
});

test("aborts a partner request at its bounded timeout", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let signal;
  const request = previewInvite({
    inviteToken: INVITE_TOKEN,
    apiEndpointImpl: sameOriginEndpoint,
    fetchImpl: async (_url, options) => {
      signal = options.signal;
      return new Promise((_resolve, reject) => {
        signal?.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
      });
    },
  });

  await Promise.resolve();
  await Promise.resolve();
  assert.ok(signal instanceof AbortSignal);
  t.mock.timers.tick(60_000);
  await assert.rejects(request, (error) => {
    assert.ok(error instanceof PartnerAccessError);
    assert.equal(error.code, "PARTNER_UNAVAILABLE");
    return true;
  });
  assert.equal(signal.aborted, true);
});

test("clears the partner timeout after a completed response", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let signal;
  const result = await previewInvite({
    inviteToken: INVITE_TOKEN,
    apiEndpointImpl: sameOriginEndpoint,
    fetchImpl: async (_url, options) => {
      signal = options.signal;
      return successfulFetch([], PREVIEW)(_url, options);
    },
  });

  assert.deepEqual(result, PREVIEW);
  assert.ok(signal instanceof AbortSignal);
  t.mock.timers.tick(60_000);
  assert.equal(signal.aborted, false);
});

test("parses bounded chunked responses and cancels a stream that exceeds the response limit", async () => {
  const success = await previewInvite({
    inviteToken: INVITE_TOKEN,
    apiEndpointImpl: sameOriginEndpoint,
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: { get: () => null },
      body: streamBody([
        '{"partnerId":"community-partner","branding":{"name":"Community Partner",',
        '"logoPath":null,"accent":"#2F6B61"},"seatAvailable":true}',
      ]),
    }),
  });
  assert.deepEqual(success, PREVIEW);

  let cancelled = false;
  await assert.rejects(
    previewInvite({
      inviteToken: INVITE_TOKEN,
      apiEndpointImpl: sameOriginEndpoint,
      fetchImpl: async () => ({
        ok: false,
        status: 500,
        headers: { get: () => null },
        body: streamBody(["x".repeat(25_001)], {
          keepOpen: true,
          onCancel: () => {
            cancelled = true;
          },
        }),
      }),
    }),
    PartnerAccessError,
  );
  assert.equal(cancelled, true);
});

test("rejects oversized partner request bodies without exposing their contents", async () => {
  await assert.rejects(
    claimPartnerSeat({
      idToken: ID_TOKEN,
      inviteToken: INVITE_TOKEN,
      researchConsent: true,
      researchSnapshot: { notes: INVITE_TOKEN.repeat(700) },
      fetchImpl: successfulFetch([]),
      apiEndpointImpl: sameOriginEndpoint,
    }),
    (error) => {
      assert.ok(error instanceof PartnerAccessError);
      assert.equal(error.code, "INVALID_INPUT");
      assert.equal(error.message.includes(INVITE_TOKEN), false);
      return true;
    },
  );
});

test("converts hostile public argument getters to safe PartnerAccessError rejections", async () => {
  const cases = [
    [previewInvite, "inviteToken"],
    [claimPartnerSeat, "idToken"],
    [fetchPartnerReport, "adminToken"],
    [confirmPartnerRelease, "receipt"],
  ];

  for (const [method, property] of cases) {
    const options = {
      apiEndpointImpl: sameOriginEndpoint,
      fetchImpl: successfulFetch([]),
    };
    Object.defineProperty(options, property, {
      get() {
        throw new Error(INVITE_TOKEN);
      },
    });

    let request;
    assert.doesNotThrow(() => {
      request = method(options);
    });
    await assert.rejects(request, (error) => {
      assert.ok(error instanceof PartnerAccessError);
      assert.equal(error.message.includes(INVITE_TOKEN), false);
      return true;
    });
  }
});
