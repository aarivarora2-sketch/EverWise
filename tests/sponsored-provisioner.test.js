import test from "node:test";
import assert from "node:assert/strict";
import { buildSponsoredRoster } from "../scripts/sponsoredRoster.mjs";
import {
  preflightSponsoredProvisioning,
  provisionSponsoredRoster,
} from "../scripts/sponsoredProvisioner.mjs";

const INVITE_TOKEN = "invite-secret";
const ADMIN_TOKEN = "admin-secret";
const API_KEY = "firebase-api-key-secret";
const API_ORIGIN = "https://everwise.dexio-games.com";
const BRANDING = {
  name: "Community Partner",
  logoPath: null,
  accent: "#2F6B61",
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

const PREFLIGHT = {
  partnerId: "community-partner",
  partnerName: "Community Partner",
  firebaseProjectId: "games-caf0e",
  seats: { claimed: 0, available: 500, limit: 500 },
};

const ACTIVE_ACCESS = {
  status: "active",
  partnerId: "community-partner",
  name: "Community Partner",
  branding: BRANDING,
};

function makeRoster({ firstStatus = "pending", remainingStatus = "active" } = {}) {
  let state = 0x6d2b79f5;
  const deterministicBytes = (size) =>
    Buffer.from(
      Array.from({ length: size }, () => {
        state ^= state << 13;
        state ^= state >>> 17;
        state ^= state << 5;
        return state & 0xff;
      }),
    );
  return buildSponsoredRoster({ randomBytesImpl: deterministicBytes }).map((row, index) => ({
    ...row,
    status: index === 0 ? firstStatus : remainingStatus,
  }));
}

function codedError(code, { status = null, message = code } = {}) {
  return Object.assign(new Error(message), { code, status });
}

function provisioningOptions(overrides = {}) {
  return {
    rows: makeRoster(),
    apiOrigin: API_ORIGIN,
    inviteToken: INVITE_TOKEN,
    preflight: PREFLIGHT,
    firebaseClient: {},
    partnerOperations: {},
    persistRows: async () => {},
    onProgress: () => {},
    backoff: async () => {},
    ...overrides,
  };
}

function pendingScenario({
  existing = false,
  rows = makeRoster(),
  firstSignInError = codedError("INVALID_LOGIN_CREDENTIALS"),
  createImpl = async () => ({ uid: "uid-1", idToken: "id-token-1" }),
  accessImpl = async () => ({ status: "none" }),
  claimImpl = async () => ACTIVE_ACCESS,
  persistImpl = async () => {},
} = {}) {
  const calls = {
    signIn: 0,
    create: 0,
    access: 0,
    claim: 0,
    delete: 0,
    persist: 0,
    backoff: [],
    progress: [],
  };
  const firstEmail = "everwise001@accounts.everwise.app";
  const firstIdToken = "id-token-1";
  const firebaseClient = {
    async signIn({ email }) {
      calls.signIn += 1;
      if (email !== firstEmail) return { uid: `uid-${email}`, idToken: `token-${email}` };
      if (existing) return { uid: "uid-1", idToken: firstIdToken };
      throw firstSignInError;
    },
    async createAccount(credentials) {
      calls.create += 1;
      return createImpl(credentials, calls.create);
    },
    async deleteAccount({ idToken }) {
      calls.delete += 1;
      assert.equal(idToken, firstIdToken);
    },
  };
  const partnerOperations = {
    async fetchPartnerAccess({ idToken }) {
      if (idToken !== firstIdToken) return ACTIVE_ACCESS;
      calls.access += 1;
      return accessImpl(calls.access);
    },
    async claimPartnerSeat(options) {
      calls.claim += 1;
      return claimImpl(calls.claim, options);
    },
  };
  const options = provisioningOptions({
    rows,
    firebaseClient,
    partnerOperations,
    async persistRows(nextRows) {
      calls.persist += 1;
      return persistImpl(nextRows, calls.persist);
    },
    onProgress(update) {
      calls.progress.push(update);
    },
    async backoff(attempt) {
      calls.backoff.push(attempt);
    },
  });
  return { calls, options };
}

function preflightDependencies({ preview = PREVIEW, report = REPORT, projectId = "games-caf0e" } = {}) {
  const calls = [];
  return {
    calls,
    firebaseClient: {
      apiKey: API_KEY,
      async getProject() {
        calls.push({ operation: "firebase.getProject" });
        return { projectId };
      },
    },
    partnerOperations: {
      async previewInvite(options) {
        calls.push({ operation: "partner.preview", options });
        return preview;
      },
      async fetchPartnerReport(options) {
        calls.push({ operation: "partner.report", options });
        return report;
      },
    },
  };
}

function assertSecretsAbsent(error) {
  assert.ok(error instanceof Error);
  for (const secret of [INVITE_TOKEN, ADMIN_TOKEN, API_KEY]) {
    assert.equal(error.message.includes(secret), false);
  }
  return true;
}

test("preflight verifies the production partner, empty 500-seat pilot, and Firebase project without URL credentials", async () => {
  const dependencies = preflightDependencies();

  const result = await preflightSponsoredProvisioning({
    apiOrigin: API_ORIGIN,
    inviteToken: INVITE_TOKEN,
    adminToken: ADMIN_TOKEN,
    firebaseClient: dependencies.firebaseClient,
    partnerOperations: dependencies.partnerOperations,
  });

  assert.deepEqual(result, {
    partnerId: "community-partner",
    partnerName: "Community Partner",
    firebaseProjectId: "games-caf0e",
    seats: { claimed: 0, available: 500, limit: 500 },
  });
  assert.equal(dependencies.calls.length, 3);
  const previewCall = dependencies.calls.find(({ operation }) => operation === "partner.preview");
  const reportCall = dependencies.calls.find(({ operation }) => operation === "partner.report");
  assert.equal(previewCall.options.inviteToken, INVITE_TOKEN);
  assert.equal(reportCall.options.adminToken, ADMIN_TOKEN);
  assert.equal(previewCall.options.apiEndpointImpl("/api/partner/preview"), `${API_ORIGIN}/api/partner/preview`);
  assert.equal(reportCall.options.apiEndpointImpl("/api/partner/admin/report"), `${API_ORIGIN}/api/partner/admin/report`);
  assert.equal(previewCall.options.apiEndpointImpl("/api/partner/preview").includes(INVITE_TOKEN), false);
  assert.equal(reportCall.options.apiEndpointImpl("/api/partner/admin/report").includes(ADMIN_TOKEN), false);
});

test("preflight rejects insecure production origins before calling dependencies", async () => {
  const dependencies = preflightDependencies();

  await assert.rejects(
    preflightSponsoredProvisioning({
      apiOrigin: "http://everwise.dexio-games.com",
      inviteToken: INVITE_TOKEN,
      adminToken: ADMIN_TOKEN,
      firebaseClient: dependencies.firebaseClient,
      partnerOperations: dependencies.partnerOperations,
    }),
    assertSecretsAbsent,
  );
  assert.deepEqual(dependencies.calls, []);
});

test("preflight rejects mismatched partner identities, suspended pilots, unavailable seats, wrong counts, and wrong Firebase projects", async () => {
  const invalidCases = [
    {
      name: "partner id mismatch",
      dependencies: preflightDependencies({
        report: { ...REPORT, partnerId: "other-partner" },
      }),
    },
    {
      name: "partner name mismatch",
      dependencies: preflightDependencies({
        report: {
          ...REPORT,
          name: "Other Partner",
          branding: { ...BRANDING, name: "Other Partner" },
        },
      }),
    },
    {
      name: "suspended partner",
      dependencies: preflightDependencies({
        report: {
          ...REPORT,
          status: "suspended",
          invitation: { status: "suspended" },
        },
      }),
    },
    {
      name: "unavailable seat",
      dependencies: preflightDependencies({ preview: { ...PREVIEW, seatAvailable: false } }),
    },
    {
      name: "nonempty seat counts",
      dependencies: preflightDependencies({
        report: { ...REPORT, seats: { claimed: 1, available: 499, limit: 500 } },
      }),
    },
    {
      name: "wrong seat limit",
      dependencies: preflightDependencies({
        report: { ...REPORT, seats: { claimed: 0, available: 499, limit: 499 } },
      }),
    },
    {
      name: "wrong Firebase project",
      dependencies: preflightDependencies({ projectId: "other-project" }),
    },
  ];

  for (const { name, dependencies } of invalidCases) {
    await assert.rejects(
      preflightSponsoredProvisioning({
        apiOrigin: API_ORIGIN,
        inviteToken: INVITE_TOKEN,
        adminToken: ADMIN_TOKEN,
        firebaseClient: dependencies.firebaseClient,
        partnerOperations: dependencies.partnerOperations,
      }),
      (error) => {
        assertSecretsAbsent(error);
        assert.ok(error.message.length > 0, name);
        return true;
      },
      name,
    );
  }
});

test("preflight rejects malformed dependency payloads without exposing credentials", async () => {
  for (const dependencies of [
    preflightDependencies({ preview: { ...PREVIEW, unexpected: true } }),
    preflightDependencies({ report: { ...REPORT, unexpected: true } }),
    preflightDependencies({ report: { ...REPORT, seats: null } }),
    preflightDependencies({ report: { ...REPORT, research: null } }),
    preflightDependencies({ projectId: null }),
  ]) {
    await assert.rejects(
      preflightSponsoredProvisioning({
        apiOrigin: API_ORIGIN,
        inviteToken: INVITE_TOKEN,
        adminToken: ADMIN_TOKEN,
        firebaseClient: dependencies.firebaseClient,
        partnerOperations: dependencies.partnerOperations,
      }),
      assertSecretsAbsent,
    );
  }
});

test("a pending account with invalid sign-in is created, claimed, persisted, then reported active", async () => {
  const rows = makeRoster();
  const order = [];
  let claimOptions;
  const firebaseClient = {
    async signIn({ email }) {
      if (email === "everwise001@accounts.everwise.app") {
        order.push("firebase.signIn");
        throw codedError("INVALID_LOGIN_CREDENTIALS");
      }
      return { uid: `uid-${email}`, idToken: `token-${email}` };
    },
    async createAccount({ email, password }) {
      assert.equal(email, "everwise001@accounts.everwise.app");
      assert.equal(password, rows[0].password);
      order.push("firebase.createAccount");
      return { uid: "uid-1", idToken: "id-token-1" };
    },
  };
  const partnerOperations = {
    async fetchPartnerAccess({ idToken }) {
      return idToken === "id-token-1" ? { status: "none" } : ACTIVE_ACCESS;
    },
    async claimPartnerSeat(options) {
      claimOptions = options;
      order.push("partner.claim");
      return ACTIVE_ACCESS;
    },
  };
  const progress = [];

  const result = await provisionSponsoredRoster(
    provisioningOptions({
      rows,
      firebaseClient,
      partnerOperations,
      async persistRows(nextRows) {
        assert.equal(nextRows[0].status, "active");
        assert.equal(rows[0].status, "pending");
        order.push("roster.persist.active");
      },
      onProgress(update) {
        if (update.accountNumber === 1) order.push(`progress.${update.status}`);
        progress.push(update);
      },
    }),
  );

  assert.deepEqual(order.slice(0, 4), [
    "firebase.signIn",
    "firebase.createAccount",
    "partner.claim",
    "roster.persist.active",
  ]);
  assert.equal(order[4], "progress.active");
  assert.deepEqual(
    {
      idToken: claimOptions.idToken,
      inviteToken: claimOptions.inviteToken,
      researchConsent: claimOptions.researchConsent,
    },
    { idToken: "id-token-1", inviteToken: INVITE_TOKEN, researchConsent: false },
  );
  assert.deepEqual(progress[0], {
    accountNumber: 1,
    username: "EverWise001",
    status: "active",
  });
  assert.deepEqual(result, { active: 500, pending: 0, failed: 0 });
});

test("active roster rows sign in and verify authoritative access without account creation or claims", async () => {
  const calls = { signIn: 0, access: 0, create: 0, claim: 0, persist: 0 };
  const rows = makeRoster({ firstStatus: "active", remainingStatus: "active" });

  const result = await provisionSponsoredRoster(
    provisioningOptions({
      rows,
      firebaseClient: {
        async signIn({ email }) {
          calls.signIn += 1;
          return { uid: `uid-${email}`, idToken: `token-${email}` };
        },
        async createAccount() {
          calls.create += 1;
          throw new Error("must not create");
        },
      },
      partnerOperations: {
        async fetchPartnerAccess() {
          calls.access += 1;
          return ACTIVE_ACCESS;
        },
        async claimPartnerSeat() {
          calls.claim += 1;
          throw new Error("must not claim");
        },
      },
      async persistRows() {
        calls.persist += 1;
      },
    }),
  );

  assert.deepEqual(calls, { signIn: 500, access: 500, create: 0, claim: 0, persist: 0 });
  assert.deepEqual(result, { active: 500, pending: 0, failed: 0 });
});

test("an ambiguous claim that later verifies active persists the row without deleting the account", async () => {
  const scenario = pendingScenario({
    accessImpl: async (attempt) => (attempt === 1 ? { status: "none" } : ACTIVE_ACCESS),
    claimImpl: async () => {
      throw codedError("UNAVAILABLE");
    },
  });

  const result = await provisionSponsoredRoster(scenario.options);

  assert.equal(scenario.calls.claim, 3);
  assert.equal(scenario.calls.access, 2);
  assert.equal(scenario.calls.persist, 1);
  assert.equal(scenario.calls.delete, 0);
  assert.deepEqual(scenario.calls.backoff, [1, 2]);
  assert.deepEqual(result, { active: 500, pending: 0, failed: 0 });
});

test("definitive claim rejections delete only an account created by this attempt and report the row failed", async () => {
  for (const code of [
    "PARTNER_FULL",
    "INVALID_INVITE",
    "PARTNER_SUSPENDED",
    "ALREADY_SPONSORED",
  ]) {
    const scenario = pendingScenario({
      claimImpl: async () => {
        throw codedError(code);
      },
    });

    const result = await provisionSponsoredRoster(scenario.options);

    assert.equal(scenario.calls.claim, 1, code);
    assert.equal(scenario.calls.access, 2, code);
    assert.equal(scenario.calls.delete, 1, code);
    assert.equal(scenario.calls.persist, 0, code);
    assert.deepEqual(scenario.calls.progress[0], {
      accountNumber: 1,
      username: "EverWise001",
      status: "failed",
    });
    assert.deepEqual(result, { active: 499, pending: 0, failed: 1 }, code);
  }
});

test("an unavailable claim with authoritative none remains pending and does not delete the created account", async () => {
  const scenario = pendingScenario({
    claimImpl: async () => {
      throw codedError("PARTNER_UNAVAILABLE", { status: 503 });
    },
  });

  const result = await provisionSponsoredRoster(scenario.options);

  assert.equal(scenario.calls.claim, 3);
  assert.equal(scenario.calls.access, 2);
  assert.equal(scenario.calls.delete, 0);
  assert.equal(scenario.calls.persist, 0);
  assert.deepEqual(scenario.calls.progress[0], {
    accountNumber: 1,
    username: "EverWise001",
    status: "pending",
  });
  assert.deepEqual(result, { active: 499, pending: 1, failed: 0 });
});

test("an unavailable claim and unavailable reconciliation remains pending without deletion", async () => {
  const scenario = pendingScenario({
    accessImpl: async (attempt) => {
      if (attempt === 1) return { status: "none" };
      throw codedError("UNAVAILABLE");
    },
    claimImpl: async () => {
      throw codedError("UNAVAILABLE");
    },
  });

  const result = await provisionSponsoredRoster(scenario.options);

  assert.equal(scenario.calls.claim, 3);
  assert.equal(scenario.calls.access, 4);
  assert.equal(scenario.calls.delete, 0);
  assert.equal(scenario.calls.persist, 0);
  assert.deepEqual(result, { active: 499, pending: 1, failed: 0 });
});

test("an account that existed before the run is never deleted after a definitive rejection", async () => {
  const scenario = pendingScenario({
    existing: true,
    claimImpl: async () => {
      throw codedError("PARTNER_FULL");
    },
  });

  const result = await provisionSponsoredRoster(scenario.options);

  assert.equal(scenario.calls.create, 0);
  assert.equal(scenario.calls.claim, 1);
  assert.equal(scenario.calls.delete, 0);
  assert.deepEqual(result, { active: 499, pending: 0, failed: 1 });
});

test("a persistence failure after a successful claim preserves external account and membership for resume", async () => {
  const scenario = pendingScenario({
    persistImpl: async () => {
      throw new Error(`disk failed ${INVITE_TOKEN} id-token-1`);
    },
  });

  await assert.rejects(provisionSponsoredRoster(scenario.options), (error) => {
    assertSecretsAbsent(error);
    assert.equal(error.message.includes("id-token-1"), false);
    assert.match(error.message, /1 \(EverWise001\)/);
    return true;
  });
  assert.equal(scenario.calls.claim, 1);
  assert.equal(scenario.calls.delete, 0);
  assert.equal(scenario.calls.persist, 1);
});

test("an active-row sign-in failure stops without creating a replacement account", async () => {
  const rows = makeRoster({ firstStatus: "active", remainingStatus: "active" });
  const scenario = pendingScenario({
    rows,
    firstSignInError: codedError("INVALID_LOGIN_CREDENTIALS", {
      message: `raw ${rows[0].password} ${API_KEY}`,
    }),
  });

  await assert.rejects(provisionSponsoredRoster(scenario.options), (error) => {
    assertSecretsAbsent(error);
    assert.equal(error.message.includes(rows[0].password), false);
    return true;
  });
  assert.equal(scenario.calls.signIn, 1);
  assert.equal(scenario.calls.create, 0);
  assert.equal(scenario.calls.claim, 0);
  assert.equal(scenario.calls.delete, 0);
});

test("retryable claim failures use at most three attempts and injected backoff", async () => {
  const retryableErrors = [
    codedError("UNAVAILABLE"),
    codedError("PARTNER_UNAVAILABLE"),
    codedError(undefined, { status: 429 }),
    codedError(undefined, { status: 503 }),
    codedError("PARTNER_UNAVAILABLE", { status: 429 }),
    codedError("PARTNER_UNAVAILABLE", { status: 500 }),
  ];

  for (const retryableError of retryableErrors) {
    const scenario = pendingScenario({
      claimImpl: async (attempt) => {
        if (attempt < 3) throw retryableError;
        return ACTIVE_ACCESS;
      },
    });

    const result = await provisionSponsoredRoster(scenario.options);

    assert.equal(scenario.calls.claim, 3);
    assert.deepEqual(scenario.calls.backoff, [1, 2]);
    assert.deepEqual(result, { active: 500, pending: 0, failed: 0 });
  }
});

test("a RATE_LIMITED service error with HTTP 429 retries at most three total attempts", async () => {
  const scenario = pendingScenario({
    claimImpl: async (attempt) => {
      if (attempt < 3) throw codedError("RATE_LIMITED", { status: 429 });
      return ACTIVE_ACCESS;
    },
  });

  const result = await provisionSponsoredRoster(scenario.options);

  assert.equal(scenario.calls.claim, 3);
  assert.deepEqual(scenario.calls.backoff, [1, 2]);
  assert.deepEqual(result, { active: 500, pending: 0, failed: 0 });
});

test("nonretryable claim errors stop after one attempt", async () => {
  const scenario = pendingScenario({
    claimImpl: async () => {
      throw codedError("INVALID_ADMIN", { status: 401, message: ADMIN_TOKEN });
    },
  });

  await assert.rejects(provisionSponsoredRoster(scenario.options), (error) => {
    assertSecretsAbsent(error);
    return true;
  });
  assert.equal(scenario.calls.claim, 1);
  assert.deepEqual(scenario.calls.backoff, []);
  assert.equal(scenario.calls.delete, 0);
});

test("a nonretryable code is not retried even when it carries a 5xx status", async () => {
  const scenario = pendingScenario({
    claimImpl: async () => {
      throw codedError("INVALID_ADMIN", { status: 503 });
    },
  });

  await assert.rejects(provisionSponsoredRoster(scenario.options), /EverWise001/);
  assert.equal(scenario.calls.claim, 1);
  assert.deepEqual(scenario.calls.backoff, []);
});

test("conflicting Firebase and partner states stop with account-only safe errors", async () => {
  const emailExists = pendingScenario({
    createImpl: async () => {
      throw codedError("EMAIL_EXISTS", { message: `raw ${API_KEY} ${INVITE_TOKEN}` });
    },
  });
  await assert.rejects(provisionSponsoredRoster(emailExists.options), (error) => {
    assertSecretsAbsent(error);
    assert.match(error.message, /1 \(EverWise001\)/);
    return true;
  });
  assert.equal(emailExists.calls.claim, 0);

  for (const access of [
    { ...ACTIVE_ACCESS, partnerId: "other-partner" },
    { ...ACTIVE_ACCESS, status: "suspended" },
    { status: "active", partnerId: "community-partner" },
  ]) {
    const scenario = pendingScenario({ accessImpl: async () => access });
    await assert.rejects(provisionSponsoredRoster(scenario.options), (error) => {
      assertSecretsAbsent(error);
      assert.match(error.message, /1 \(EverWise001\)/);
      return true;
    });
    assert.equal(scenario.calls.claim, 0);
    assert.equal(scenario.calls.delete, 0);
  }
});

test("cleanup verifies access once and skips deletion when a rejected claim is already active", async () => {
  const scenario = pendingScenario({
    accessImpl: async (attempt) => (attempt === 1 ? { status: "none" } : ACTIVE_ACCESS),
    claimImpl: async () => {
      throw codedError("ALREADY_SPONSORED");
    },
  });

  const result = await provisionSponsoredRoster(scenario.options);

  assert.equal(scenario.calls.claim, 1);
  assert.equal(scenario.calls.access, 2);
  assert.equal(scenario.calls.delete, 0);
  assert.equal(scenario.calls.persist, 1);
  assert.deepEqual(result, { active: 500, pending: 0, failed: 0 });
});

test("a malformed cleanup access response is a terminal conflict and never triggers deletion", async () => {
  const scenario = pendingScenario({
    accessImpl: async (attempt) => (attempt === 1 ? { status: "none" } : null),
    claimImpl: async () => {
      throw codedError("PARTNER_FULL");
    },
  });

  await assert.rejects(provisionSponsoredRoster(scenario.options), /EverWise001/);
  assert.equal(scenario.calls.access, 2);
  assert.equal(scenario.calls.delete, 0);
});

test("injected backoff and progress failures are sanitized after external state may have changed", async () => {
  const backoffScenario = pendingScenario({
    claimImpl: async () => {
      throw codedError("UNAVAILABLE");
    },
  });
  backoffScenario.options.backoff = async () => {
    throw new Error(`backoff ${ADMIN_TOKEN} id-token-1`);
  };
  await assert.rejects(provisionSponsoredRoster(backoffScenario.options), (error) => {
    assertSecretsAbsent(error);
    assert.equal(error.message.includes("id-token-1"), false);
    return true;
  });

  const progressScenario = pendingScenario();
  progressScenario.options.onProgress = () => {
    throw new Error(`progress ${INVITE_TOKEN} ${progressScenario.options.rows[0].password}`);
  };
  await assert.rejects(provisionSponsoredRoster(progressScenario.options), (error) => {
    assertSecretsAbsent(error);
    assert.equal(error.message.includes(progressScenario.options.rows[0].password), false);
    return true;
  });
  assert.equal(progressScenario.calls.persist, 1);
  assert.equal(progressScenario.calls.delete, 0);
});

test("an asynchronous progress rejection is awaited and sanitized", async () => {
  const scenario = pendingScenario();
  const secret = `${INVITE_TOKEN} id-token-1 ${scenario.options.rows[0].password}`;
  scenario.options.onProgress = async () => {
    throw new Error(secret);
  };

  await assert.rejects(provisionSponsoredRoster(scenario.options), (error) => {
    assertSecretsAbsent(error);
    assert.equal(error.message.includes("id-token-1"), false);
    assert.equal(error.message.includes(scenario.options.rows[0].password), false);
    assert.match(error.message, /1 \(EverWise001\)/);
    return true;
  });
  assert.equal(scenario.calls.persist, 1);
  assert.equal(scenario.calls.delete, 0);
});

test("progress payloads contain only account identity and status", async () => {
  const scenario = pendingScenario();

  await provisionSponsoredRoster(scenario.options);

  for (const update of scenario.calls.progress) {
    assert.deepEqual(Object.keys(update).sort(), ["accountNumber", "status", "username"]);
    const output = JSON.stringify(update);
    for (const secret of [
      INVITE_TOKEN,
      ADMIN_TOKEN,
      API_KEY,
      "id-token-1",
      scenario.options.rows[0].password,
    ]) {
      assert.equal(output.includes(secret), false);
    }
  }
});
