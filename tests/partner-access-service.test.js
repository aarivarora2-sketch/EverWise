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
  rotatePartnerInvite,
} from "../src/services/partnerAccess.js";

const INVITE_TOKEN = "i".repeat(43);
const ADMIN_TOKEN = "a".repeat(43);
const RECEIPT = "r".repeat(43);
const ID_TOKEN = "firebase.id.token";

function successfulFetch(calls, responseBody = { ok: true }) {
  return async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      status: 200,
      headers: { get: () => null },
      text: async () => JSON.stringify(responseBody),
    };
  };
}

function sameOriginEndpoint(path) {
  return `https://everwise.example${path}`;
}

test("partner methods use POST, the shared endpoint resolver, JSON bodies, and correct authentication", async () => {
  const cases = [
    {
      method: previewInvite,
      args: { inviteToken: INVITE_TOKEN },
      path: "/api/partner/preview",
      body: { inviteToken: INVITE_TOKEN },
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
    },
    {
      method: fetchPartnerAccess,
      args: { idToken: ID_TOKEN },
      path: "/api/partner/access",
      body: {},
      authenticated: true,
    },
    {
      method: beginPartnerRelease,
      args: { idToken: ID_TOKEN },
      path: "/api/partner/release-intent",
      body: {},
      authenticated: true,
    },
    {
      method: cancelPartnerRelease,
      args: { idToken: ID_TOKEN, receipt: RECEIPT },
      path: "/api/partner/release-cancel",
      body: { receipt: RECEIPT },
      authenticated: true,
    },
    {
      method: confirmPartnerRelease,
      args: { receipt: RECEIPT },
      path: "/api/partner/release-confirm",
      body: { receipt: RECEIPT },
    },
    {
      method: fetchPartnerReport,
      args: { adminToken: ADMIN_TOKEN },
      path: "/api/partner/admin/report",
      body: { adminToken: ADMIN_TOKEN },
    },
    {
      method: rotatePartnerInvite,
      args: { adminToken: ADMIN_TOKEN },
      path: "/api/partner/admin/rotate-invite",
      body: { adminToken: ADMIN_TOKEN },
    },
  ];

  for (const entry of cases) {
    const calls = [];
    await entry.method({
      ...entry.args,
      fetchImpl: successfulFetch(calls),
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
    text: async () => JSON.stringify({
      code: "INVALID_INVITE",
      message: `server detail ${INVITE_TOKEN}`,
    }),
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

test("uses safe generic errors for malformed, oversized, and failed responses", async () => {
  for (const fetchImpl of [
    async () => ({
      ok: false,
      status: 500,
      headers: { get: () => "999999" },
      text: async () => JSON.stringify({ code: "INVALID_INVITE", message: INVITE_TOKEN }),
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
