import assert from "node:assert/strict";
import { Readable } from "node:stream";
import test from "node:test";

import { BILLING_PLANS } from "../server/billingConfig.mjs";
import { createBillingApi } from "../server/billingApi.mjs";

const AUTHORIZATION = "Bearer firebase-id-token";
const UID = "learner-uid";
const NOW = new Date("2026-08-03T12:00:00.000Z");

const CONFIG = Object.freeze({
  configured: true,
  appOrigin: "https://app.everwise.example",
  webhookSecret: "whsec_must_never_leave_the_server",
  plans: Object.freeze({
    monthly: Object.freeze({
      ...BILLING_PLANS.monthly,
      priceId: "price_test_monthly_private",
    }),
    annual: Object.freeze({
      ...BILLING_PLANS.annual,
      priceId: "price_test_annual_private",
    }),
  }),
});

function request({
  method = "POST",
  headers = {},
  rawBody,
} = {}) {
  const stream = Readable.from(rawBody === undefined ? [] : [rawBody]);
  stream.method = method;
  stream.headers = Object.fromEntries(
    Object.entries({
      authorization: AUTHORIZATION,
      "content-type": "application/json; charset=utf-8",
      ...headers,
    }).map(([key, value]) => [key.toLowerCase(), value]),
  );
  return stream;
}

function response() {
  return {
    status: null,
    headers: null,
    chunks: [],
    writeHead(status, headers) {
      this.status = status;
      this.headers = headers;
    },
    end(chunk = "") {
      this.chunks.push(Buffer.from(chunk));
    },
    json() {
      return JSON.parse(Buffer.concat(this.chunks).toString("utf8"));
    },
  };
}

function defaultRecord(overrides = {}) {
  return {
    uid: UID,
    customerId: null,
    subscriptionId: null,
    plan: null,
    status: "none",
    trialUsedAt: null,
    trialEndsAt: null,
    currentPeriodEndsAt: null,
    cancelAtPeriodEnd: false,
    lastEventCreated: null,
    lastEventId: null,
    updatedAt: NOW.toISOString(),
    ...overrides,
  };
}

function createHarness(overrides = {}) {
  let storedRecord = null;
  const calls = {
    verifyIdToken: [],
    verifyPlans: [],
    getByUid: [],
    bindCustomer: [],
    hasUsedTrial: [],
    getPartnerAccess: [],
    findOrCreateCustomer: [],
    listBlockingSubscriptions: [],
    createCheckoutSession: [],
    createPortalSession: [],
  };
  const store = {
    health: async () => ({ configured: true, healthy: true }),
    getByUid: async (uid) => {
      calls.getByUid.push(uid);
      return storedRecord;
    },
    bindCustomer: async (input) => {
      calls.bindCustomer.push(input);
      storedRecord = defaultRecord(input);
      return storedRecord;
    },
    hasUsedTrial: async (uid) => {
      calls.hasUsedTrial.push(uid);
      return false;
    },
    ...overrides.store,
  };
  const gateway = {
    verifyPlans: async (plans) => {
      calls.verifyPlans.push(plans);
      return plans;
    },
    findOrCreateCustomer: async (input) => {
      calls.findOrCreateCustomer.push(input);
      return { id: "cus_server_owned" };
    },
    listBlockingSubscriptions: async (input) => {
      calls.listBlockingSubscriptions.push(input);
      return [];
    },
    createCheckoutSession: async (input) => {
      calls.createCheckoutSession.push(input);
      return {
        id: "cs_private",
        url: "https://checkout.stripe.com/c/pay/test",
      };
    },
    createPortalSession: async (input) => {
      calls.createPortalSession.push(input);
      return { url: "https://billing.stripe.com/p/session" };
    },
    ...overrides.gateway,
  };
  const partnerStore = {
    getAccess: async (uid) => {
      calls.getPartnerAccess.push(uid);
      return { status: "none" };
    },
    ...overrides.partnerStore,
  };
  const verifyIdToken =
    overrides.verifyIdToken ||
    (async (token) => {
      calls.verifyIdToken.push(token);
      return { uid: UID, email: "private@example.com" };
    });
  const api = createBillingApi({
    config: overrides.config || CONFIG,
    store,
    gateway,
    partnerStore,
    verifyIdToken,
    now: overrides.now || (() => new Date(NOW)),
  });
  return { api, calls, gateway, partnerStore, store };
}

async function invoke(api, pathname, {
  body = {},
  request: requestValue = request(),
} = {}) {
  const responseValue = response();
  const handled = await api.handle({
    request: requestValue,
    response: responseValue,
    pathname,
    body,
  });
  return { handled, response: responseValue };
}

function assertJsonSecurityHeaders(headers) {
  assert.equal(headers["Content-Type"], "application/json; charset=utf-8");
  assert.equal(headers["Cache-Control"], "no-store");
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["Access-Control-Allow-Origin"], undefined);
  assert.equal(headers["Access-Control-Allow-Credentials"], undefined);
}

test("billing API handles only its four exact paths and rejects non-POST methods", async () => {
  const { api } = createHarness();

  const unrelated = await invoke(api, "/api/billing/plans/extra");
  assert.equal(unrelated.handled, false);
  assert.equal(unrelated.response.status, null);

  for (const pathname of [
    "/api/billing/plans",
    "/api/billing/access",
    "/api/billing/checkout",
    "/api/billing/portal",
  ]) {
    const result = await invoke(api, pathname, {
      request: request({ method: "GET" }),
    });
    assert.equal(result.handled, true);
    assert.equal(result.response.status, 405);
    assert.equal(result.response.headers.Allow, "POST");
    assert.deepEqual(result.response.json(), {
      error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." },
    });
    assertJsonSecurityHeaders(result.response.headers);
  }
});

test("every billing route requires one verified Firebase bearer and owns only its UID", async () => {
  for (const pathname of [
    "/api/billing/plans",
    "/api/billing/access",
    "/api/billing/checkout",
    "/api/billing/portal",
  ]) {
    let verificationCalls = 0;
    const { api } = createHarness({
      verifyIdToken: async () => {
        verificationCalls += 1;
        throw new Error("token details must stay private");
      },
    });
    const missing = await invoke(api, pathname, {
      request: request({ headers: { authorization: undefined } }),
    });
    assert.equal(missing.response.status, 401);
    assert.deepEqual(missing.response.json(), {
      error: { code: "UNAUTHENTICATED", message: "Authentication is required." },
    });
    assert.equal(verificationCalls, 0);

    const invalid = await invoke(api, pathname, {
      request: request({ headers: { authorization: "Bearer invalid-private-token" } }),
    });
    assert.equal(invalid.response.status, 401);
    assert.deepEqual(invalid.response.json(), {
      error: { code: "UNAUTHENTICATED", message: "Authentication is required." },
    });
    assert.equal(verificationCalls, 1);
    assert.equal(JSON.stringify(invalid.response.json()).includes("invalid-private-token"), false);
  }
});

test("authenticated billing requests require bounded application/json object bodies", async () => {
  const { api } = createHarness();

  const wrongType = await invoke(api, "/api/billing/plans", {
    request: request({ headers: { "content-type": "text/plain" } }),
  });
  assert.equal(wrongType.response.status, 415);
  assert.deepEqual(wrongType.response.json(), {
    error: {
      code: "UNSUPPORTED_MEDIA_TYPE",
      message: "The request must use application/json.",
    },
  });

  const declaredOversize = await invoke(api, "/api/billing/plans", {
    request: request({ headers: { "content-length": String(256 * 1024 + 1) } }),
  });
  assert.equal(declaredOversize.response.status, 413);
  assert.deepEqual(declaredOversize.response.json(), {
    error: { code: "PAYLOAD_TOO_LARGE", message: "The request body is too large." },
  });

  const actualOversize = await invoke(api, "/api/billing/checkout", {
    body: { plan: "monthly", padding: "x".repeat(256 * 1024) },
  });
  assert.equal(actualOversize.response.status, 413);

  for (const invalidBody of [null, [], "{}", 3]) {
    const invalid = await invoke(api, "/api/billing/plans", { body: invalidBody });
    assert.equal(invalid.response.status, 400);
    assert.deepEqual(invalid.response.json(), {
      error: { code: "INVALID_JSON", message: "The request body is invalid." },
    });
  }
});

test("plans are returned only after verification in exact public shape", async () => {
  const { api, calls } = createHarness();
  const result = await invoke(api, "/api/billing/plans");

  assert.equal(result.handled, true);
  assert.equal(result.response.status, 200);
  assert.deepEqual(result.response.json(), {
    plans: [
      {
        key: "annual",
        currency: "usd",
        unitAmount: 6000,
        interval: "year",
        trialDays: 7,
      },
      {
        key: "monthly",
        currency: "usd",
        unitAmount: 799,
        interval: "month",
        trialDays: 3,
      },
    ],
  });
  assert.equal(calls.verifyPlans.length, 1);
  assert.equal(calls.verifyPlans[0], CONFIG.plans);
  assertJsonSecurityHeaders(result.response.headers);
  const serialized = JSON.stringify(result.response.json());
  for (const privateValue of ["price_", "cus_", "sub_", "whsec_", "private@example.com"]) {
    assert.equal(serialized.includes(privateValue), false);
  }
});

test("Checkout accepts only an exact logical plan body", async () => {
  for (const body of [
    {},
    { plan: "weekly" },
    { plan: 1 },
    { plan: "monthly", priceId: "price_attacker" },
    { plan: "annual", trialDays: 365 },
    Object.assign(Object.create(null), { plan: "monthly", uid: "other-user" }),
  ]) {
    const { api, calls } = createHarness();
    const result = await invoke(api, "/api/billing/checkout", { body });
    assert.equal(result.response.status, 400);
    assert.deepEqual(result.response.json(), {
      error: { code: "INVALID_INPUT", message: "The request is invalid." },
    });
    assert.equal(calls.findOrCreateCustomer.length, 0);
    assert.equal(calls.createCheckoutSession.length, 0);
  }

  for (const plan of ["monthly", "annual"]) {
    const { api } = createHarness();
    const result = await invoke(api, "/api/billing/checkout", { body: { plan } });
    assert.equal(result.response.status, 200);
    assert.deepEqual(result.response.json(), {
      url: "https://checkout.stripe.com/c/pay/test",
    });
  }
});

test("Checkout snapshots a stateful JSON plan exactly once before validation", async () => {
  let reads = 0;
  const body = {};
  Object.defineProperty(body, "plan", {
    enumerable: true,
    get() {
      reads += 1;
      return reads === 1 ? "monthly" : "annual";
    },
  });
  const calls = [];
  const { api } = createHarness({
    gateway: {
      createCheckoutSession: async (input) => {
        calls.push(input);
        return { id: "cs_private", url: "https://checkout.stripe.com/c/pay/snapshot" };
      },
    },
  });

  const result = await invoke(api, "/api/billing/checkout", { body });
  assert.equal(result.response.status, 200);
  assert.equal(reads, 1);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].planKey, "monthly");
});

test("active authoritative sponsorship rejects Checkout before any Stripe call", async () => {
  const { api, calls } = createHarness({
    partnerStore: {
      getAccess: async () => ({ status: "active", partnerId: "private-partner" }),
    },
  });
  const result = await invoke(api, "/api/billing/checkout", {
    body: { plan: "monthly" },
  });

  assert.equal(result.response.status, 409);
  assert.deepEqual(result.response.json(), {
    error: {
      code: "SPONSORED_ACCESS_ACTIVE",
      message: "Your access is already provided by a partner.",
    },
  });
  assert.equal(calls.verifyPlans.length, 0);
  assert.equal(calls.findOrCreateCustomer.length, 0);
  assert.equal(calls.listBlockingSubscriptions.length, 0);
  assert.equal(calls.createCheckoutSession.length, 0);
  assert.equal(JSON.stringify(result.response.json()).includes("private-partner"), false);
});

test("an existing blocking subscription directs the learner to management", async () => {
  const record = defaultRecord({
    customerId: "cus_stored_private",
    subscriptionId: "sub_stored_private",
    plan: "monthly",
    status: "active",
  });
  const { api, calls } = createHarness({
    store: { getByUid: async () => record },
    gateway: {
      listBlockingSubscriptions: async () => [
        {
          id: "sub_remote_private",
          customerId: "cus_stored_private",
          status: "active",
          priceId: "price_test_monthly_private",
          livemode: false,
          cancelAtPeriodEnd: false,
          currentPeriodEnd: 1_800_000_000,
          trialEnd: null,
        },
      ],
    },
  });
  const result = await invoke(api, "/api/billing/checkout", {
    body: { plan: "annual" },
  });

  assert.equal(result.response.status, 409);
  assert.deepEqual(result.response.json(), {
    error: {
      code: "SUBSCRIPTION_EXISTS",
      message: "A subscription already exists for this account.",
      canManage: true,
    },
  });
  assert.equal(calls.createCheckoutSession.length, 0);
  const serialized = JSON.stringify(result.response.json());
  assert.equal(serialized.includes("cus_"), false);
  assert.equal(serialized.includes("sub_"), false);
  assert.equal(serialized.includes("price_"), false);
});

test("Checkout binds a server-owned customer and applies a trial only once per UID", async () => {
  for (const [trialUsedAt, expectedEligible] of [
    [null, true],
    ["2026-07-01T00:00:00.000Z", false],
  ]) {
    let record = trialUsedAt
      ? defaultRecord({ customerId: "cus_stored", trialUsedAt })
      : null;
    const calls = { bind: [], checkout: [], customer: [] };
    const { api } = createHarness({
      store: {
        getByUid: async () => record,
        bindCustomer: async (input) => {
          calls.bind.push(input);
          record = defaultRecord({
            customerId: input.customerId,
            trialUsedAt,
          });
          return record;
        },
        hasUsedTrial: async () => trialUsedAt !== null,
      },
      gateway: {
        findOrCreateCustomer: async (input) => {
          calls.customer.push(input);
          return { id: input.storedCustomerId || "cus_created_server_side" };
        },
        createCheckoutSession: async (input) => {
          calls.checkout.push(input);
          return { id: "cs_private", url: "https://checkout.stripe.com/c/pay/trial" };
        },
      },
    });
    const result = await invoke(api, "/api/billing/checkout", {
      body: { plan: "annual" },
    });

    assert.equal(result.response.status, 200);
    assert.deepEqual(result.response.json(), {
      url: "https://checkout.stripe.com/c/pay/trial",
    });
    assert.deepEqual(calls.customer, [
      { uid: UID, storedCustomerId: trialUsedAt ? "cus_stored" : null },
    ]);
    assert.deepEqual(calls.bind, trialUsedAt
      ? []
      : [{ uid: UID, customerId: "cus_created_server_side" }]);
    assert.equal(calls.checkout.length, 1);
    assert.equal(calls.checkout[0].uid, UID);
    assert.equal(calls.checkout[0].customerId, trialUsedAt ? "cus_stored" : "cus_created_server_side");
    assert.equal(calls.checkout[0].planKey, "annual");
    assert.equal(calls.checkout[0].appOrigin, CONFIG.appOrigin);
    assert.equal(calls.checkout[0].trialEligible, expectedEligible);
    assert.equal(typeof calls.checkout[0].operationAttempt, "string");
    assert.equal(Object.keys(calls.checkout[0]).includes("email"), false);
  }
});

test("Checkout rechecks all eligibility immediately before creating its Session", async () => {
  const order = [];
  let sponsorshipCheck = 0;
  let subscriptionCheck = 0;
  let trialCheck = 0;
  const { api } = createHarness({
    partnerStore: {
      getAccess: async () => {
        sponsorshipCheck += 1;
        order.push(`partner-${sponsorshipCheck}`);
        return sponsorshipCheck === 1 ? { status: "none" } : { status: "active" };
      },
    },
    store: {
      getByUid: async () => {
        order.push("record");
        return defaultRecord({ customerId: "cus_stored" });
      },
      hasUsedTrial: async () => {
        trialCheck += 1;
        order.push(`trial-${trialCheck}`);
        return false;
      },
    },
    gateway: {
      findOrCreateCustomer: async () => {
        order.push("customer");
        return { id: "cus_stored" };
      },
      listBlockingSubscriptions: async () => {
        subscriptionCheck += 1;
        order.push(`subscriptions-${subscriptionCheck}`);
        return [];
      },
      createCheckoutSession: async () => {
        order.push("checkout");
        return { id: "cs_private", url: "https://checkout.stripe.com/c/pay/race" };
      },
    },
  });
  const result = await invoke(api, "/api/billing/checkout", {
    body: { plan: "monthly" },
  });

  assert.equal(result.response.status, 409);
  assert.equal(result.response.json().error.code, "SPONSORED_ACCESS_ACTIVE");
  assert.equal(sponsorshipCheck, 2);
  assert.equal(subscriptionCheck, 1);
  assert.equal(trialCheck, 1);
  assert.equal(order.includes("checkout"), false);
  assert.deepEqual(order.slice(-1), ["partner-2"]);
});

test("concurrent Checkout attempts for one UID cannot both create Sessions", async () => {
  let releaseFirst;
  const firstCreated = new Promise((resolve) => {
    releaseFirst = resolve;
  });
  let createCalls = 0;
  const { api } = createHarness({
    gateway: {
      createCheckoutSession: async () => {
        createCalls += 1;
        await firstCreated;
        return { id: "cs_private", url: "https://checkout.stripe.com/c/pay/one" };
      },
    },
  });

  const first = invoke(api, "/api/billing/checkout", { body: { plan: "monthly" } });
  const second = invoke(api, "/api/billing/checkout", { body: { plan: "annual" } });
  await new Promise((resolve) => setImmediate(resolve));
  releaseFirst();
  const results = await Promise.all([first, second]);

  assert.equal(createCalls, 1);
  assert.deepEqual(results.map((result) => result.response.status).sort(), [200, 409]);
  const rejected = results.find((result) => result.response.status === 409);
  assert.deepEqual(rejected.response.json(), {
    error: {
      code: "CHECKOUT_IN_PROGRESS",
      message: "A Checkout request is already in progress.",
    },
  });
});

test("Price verification failure closes Checkout before customer or Session creation", async () => {
  const { api, calls } = createHarness({
    gateway: {
      verifyPlans: async () => {
        const error = new Error("provider response and price_test_secret");
        error.code = "BILLING_PLAN_MISMATCH";
        throw error;
      },
    },
  });
  const result = await invoke(api, "/api/billing/checkout", {
    body: { plan: "monthly" },
  });

  assert.equal(result.response.status, 503);
  assert.deepEqual(result.response.json(), {
    error: {
      code: "BILLING_NOT_CONFIGURED",
      message: "Billing is not available right now.",
    },
  });
  assert.equal(calls.findOrCreateCustomer.length, 0);
  assert.equal(calls.createCheckoutSession.length, 0);
  assert.equal(JSON.stringify(result.response.json()).includes("price_test_secret"), false);
});

test("access returns the exact normalized shared contract without billing identifiers", async () => {
  const cases = [
    {
      name: "no billing history",
      record: null,
      expected: {
        access: "none",
        status: "none",
        plan: null,
        trialEndsAt: null,
        currentPeriodEndsAt: null,
        cancelAtPeriodEnd: false,
        canStartTrial: true,
        canManage: false,
      },
    },
    {
      name: "active annual subscription",
      record: defaultRecord({
        customerId: "cus_private_active",
        subscriptionId: "sub_private_active",
        plan: "annual",
        status: "active",
        trialUsedAt: "2026-07-01T00:00:00.000Z",
        currentPeriodEndsAt: "2027-07-01T00:00:00.000Z",
        cancelAtPeriodEnd: true,
      }),
      expected: {
        access: "full",
        status: "active",
        plan: "annual",
        trialEndsAt: null,
        currentPeriodEndsAt: "2027-07-01T00:00:00.000Z",
        cancelAtPeriodEnd: true,
        canStartTrial: false,
        canManage: true,
      },
    },
    {
      name: "trialing monthly subscription",
      record: defaultRecord({
        customerId: "cus_private_trial",
        subscriptionId: "sub_private_trial",
        plan: "monthly",
        status: "trialing",
        trialUsedAt: "2026-08-03T12:00:00.000Z",
        trialEndsAt: "2026-08-06T12:00:00.000Z",
      }),
      expected: {
        access: "full",
        status: "trialing",
        plan: "monthly",
        trialEndsAt: "2026-08-06T12:00:00.000Z",
        currentPeriodEndsAt: null,
        cancelAtPeriodEnd: false,
        canStartTrial: false,
        canManage: true,
      },
    },
    {
      name: "canceled prior subscriber",
      record: defaultRecord({
        customerId: "cus_private_canceled",
        subscriptionId: "sub_private_canceled",
        plan: "monthly",
        status: "canceled",
        trialUsedAt: "2026-06-01T00:00:00.000Z",
        currentPeriodEndsAt: "2026-07-01T00:00:00.000Z",
      }),
      expected: {
        access: "none",
        status: "canceled",
        plan: "monthly",
        trialEndsAt: null,
        currentPeriodEndsAt: "2026-07-01T00:00:00.000Z",
        cancelAtPeriodEnd: false,
        canStartTrial: false,
        canManage: true,
      },
    },
  ];

  for (const entry of cases) {
    const seenUids = [];
    const { api } = createHarness({
      store: {
        getByUid: async (uid) => {
          seenUids.push(uid);
          return entry.record;
        },
      },
    });
    const result = await invoke(api, "/api/billing/access");
    assert.equal(result.response.status, 200, entry.name);
    assert.deepEqual(result.response.json(), entry.expected, entry.name);
    assert.deepEqual(seenUids, [UID]);
    assertJsonSecurityHeaders(result.response.headers);
    const serialized = JSON.stringify(result.response.json());
    for (const privateValue of ["cus_", "sub_", "price_", "private@example.com"]) {
      assert.equal(serialized.includes(privateValue), false, entry.name);
    }
  }
});

test("access fails closed for disabled configuration, unhealthy storage, or malformed records", async () => {
  const disabled = createHarness({
    config: {
      configured: false,
      appOrigin: null,
      webhookSecret: null,
      plans: BILLING_PLANS,
    },
  });
  const disabledResult = await invoke(disabled.api, "/api/billing/access");
  assert.equal(disabledResult.response.status, 503);
  assert.deepEqual(disabledResult.response.json(), {
    error: {
      code: "BILLING_NOT_CONFIGURED",
      message: "Billing is not available right now.",
    },
  });

  const unhealthy = createHarness({
    store: {
      health: async () => ({ configured: true, healthy: false, reason: "private path" }),
    },
  });
  const unhealthyResult = await invoke(unhealthy.api, "/api/billing/access");
  assert.equal(unhealthyResult.response.status, 503);
  assert.deepEqual(unhealthyResult.response.json(), {
    error: {
      code: "BILLING_UNAVAILABLE",
      message: "Billing is temporarily unavailable.",
    },
  });
  assert.equal(JSON.stringify(unhealthyResult.response.json()).includes("private path"), false);

  const malformed = createHarness({
    store: {
      getByUid: async () => defaultRecord({ status: "provider-secret-status" }),
    },
  });
  const malformedResult = await invoke(malformed.api, "/api/billing/access");
  assert.equal(malformedResult.response.status, 503);
  assert.deepEqual(malformedResult.response.json(), {
    error: {
      code: "BILLING_UNAVAILABLE",
      message: "Billing is temporarily unavailable.",
    },
  });
});

test("Portal uses only the authenticated UID's stored customer and returns only its URL", async () => {
  const record = defaultRecord({
    customerId: "cus_private_owner",
    subscriptionId: "sub_private_owner",
    plan: "annual",
    status: "active",
  });
  const calls = { uids: [], portal: [] };
  const { api } = createHarness({
    store: {
      getByUid: async (uid) => {
        calls.uids.push(uid);
        return record;
      },
    },
    gateway: {
      createPortalSession: async (input) => {
        calls.portal.push(input);
        return { url: "https://billing.stripe.com/p/session-safe" };
      },
    },
  });
  const result = await invoke(api, "/api/billing/portal");

  assert.equal(result.response.status, 200);
  assert.deepEqual(result.response.json(), {
    url: "https://billing.stripe.com/p/session-safe",
  });
  assert.deepEqual(calls.uids, [UID]);
  assert.equal(calls.portal.length, 1);
  assert.equal(calls.portal[0].uid, UID);
  assert.equal(calls.portal[0].customerId, "cus_private_owner");
  assert.equal(calls.portal[0].appOrigin, CONFIG.appOrigin);
  assert.equal(typeof calls.portal[0].operationAttempt, "string");
  const serialized = JSON.stringify(result.response.json());
  assert.equal(serialized.includes("cus_private_owner"), false);
  assert.equal(serialized.includes("sub_private_owner"), false);
});

test("Portal rejects client-owned identifiers and learners without billing history", async () => {
  const { api, calls } = createHarness();
  for (const body of [
    { customerId: "cus_attacker" },
    { uid: "another-uid" },
    { subscriptionId: "sub_attacker" },
  ]) {
    const invalid = await invoke(api, "/api/billing/portal", { body });
    assert.equal(invalid.response.status, 400);
    assert.deepEqual(invalid.response.json(), {
      error: { code: "INVALID_INPUT", message: "The request is invalid." },
    });
  }
  assert.equal(calls.createPortalSession.length, 0);

  const missing = await invoke(api, "/api/billing/portal");
  assert.equal(missing.response.status, 404);
  assert.deepEqual(missing.response.json(), {
    error: {
      code: "BILLING_HISTORY_NOT_FOUND",
      message: "Billing history was not found.",
    },
  });
  assert.equal(calls.createPortalSession.length, 0);
});
