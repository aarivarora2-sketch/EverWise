import assert from "node:assert/strict";
import { Readable } from "node:stream";
import test from "node:test";

import { createEverWiseApplication } from "../server.mjs";

const BILLING_ENV = Object.freeze({
  STRIPE_SECRET_KEY: "sk_test_server_private",
  STRIPE_WEBHOOK_SECRET: "whsec_server_private",
  STRIPE_MONTHLY_PRICE_ID: "price_test_monthly",
  STRIPE_ANNUAL_PRICE_ID: "price_test_annual",
  EVERWISE_PUBLIC_APP_ORIGIN: "https://app.everwise.example",
});

const CONFIG = Object.freeze({
  configured: true,
  appOrigin: "https://app.everwise.example",
  webhookSecret: "whsec_server_private",
  plans: Object.freeze({
    monthly: Object.freeze({ key: "monthly", priceId: "price_test_monthly" }),
    annual: Object.freeze({ key: "annual", priceId: "price_test_annual" }),
  }),
});

function request(pathname, {
  method = "POST",
  body = "{}",
  headers = {},
} = {}) {
  let iterations = 0;
  const stream = Readable.from((async function* chunks() {
    iterations += 1;
    if (body !== null) yield Buffer.from(body);
  })());
  stream.url = pathname;
  stream.method = method;
  stream.headers = Object.fromEntries(
    Object.entries({
      "content-type": "application/json",
      ...headers,
    }).map(([key, value]) => [key.toLowerCase(), value]),
  );
  Object.defineProperty(stream, "socket", {
    value: { remoteAddress: "127.0.0.1" },
  });
  stream.iterations = () => iterations;
  return stream;
}

function response() {
  return {
    status: null,
    headers: {},
    chunks: [],
    setHeader(name, value) {
      this.headers[name] = value;
    },
    writeHead(status, headers = {}) {
      this.status = status;
      Object.assign(this.headers, headers);
      return this;
    },
    end(chunk = "") {
      this.chunks.push(Buffer.from(chunk));
    },
    text() {
      return Buffer.concat(this.chunks).toString("utf8");
    },
    json() {
      return JSON.parse(this.text());
    },
  };
}

async function invoke(application, requestValue) {
  const responseValue = response();
  await application.handle(requestValue, responseValue);
  return responseValue;
}

function createDependencies({
  config = CONFIG,
  plansVerified = true,
  storeHealth = { configured: true, healthy: true },
  gatewayImplementation,
  storeImplementation,
  partnerHandledPath = null,
  webhookImplementation,
  billingApiImplementation,
} = {}) {
  const calls = {
    createPartnerStore: 0,
    createPartnerApi: 0,
    createVerifier: 0,
    loadBillingConfig: 0,
    createGateway: 0,
    verifyPlans: 0,
    createBillingStore: 0,
    createBillingApi: 0,
    createBillingWebhook: 0,
    partnerApi: [],
    billingApi: [],
    webhook: [],
    logs: [],
  };
  const partnerStore = {
    health: async () => ({ configured: false, healthy: false }),
    getAccess: async () => ({ status: "none" }),
  };
  const gateway = gatewayImplementation || {
    async verifyPlans(plans) {
      calls.verifyPlans += 1;
      if (!plansVerified) throw new Error("private Price mismatch price_test_private");
      return plans;
    },
  };
  const store = storeImplementation || {
    health: async () => storeHealth,
  };
  const dependencies = {
    createPartnerStore() {
      calls.createPartnerStore += 1;
      return partnerStore;
    },
    createPartnerApi() {
      calls.createPartnerApi += 1;
      return {
        async handle(requestValue, responseValue, pathname) {
          calls.partnerApi.push(pathname);
          if (pathname !== partnerHandledPath) return false;
          responseValue.writeHead(200, { "Content-Type": "application/json" });
          responseValue.end(JSON.stringify({ partner: true }));
          return true;
        },
      };
    },
    createFirebaseTokenVerifier() {
      calls.createVerifier += 1;
      return { verifyIdToken: async () => ({ uid: "firebase-uid-123" }) };
    },
    loadBillingConfig() {
      calls.loadBillingConfig += 1;
      if (config instanceof Error) throw config;
      return config;
    },
    createStripeGateway(options) {
      calls.createGateway += 1;
      assert.equal(options.secretKey, BILLING_ENV.STRIPE_SECRET_KEY);
      return gateway;
    },
    createBillingStore() {
      calls.createBillingStore += 1;
      return store;
    },
    createBillingApi(options) {
      calls.createBillingApi += 1;
      if (billingApiImplementation) return billingApiImplementation(options, calls);
      const authorizations = new WeakSet();
      return {
        async authorize({ request: requestValue }) {
          const authorization = {};
          authorizations.add(authorization);
          return authorization;
        },
        async handleVerified(input) {
          assert.equal(authorizations.has(input.authorization), true);
          calls.billingApi.push(input);
          input.response.writeHead(200, { "Content-Type": "application/json" });
          input.response.end(JSON.stringify({ billing: true }));
          return true;
        },
      };
    },
    createBillingWebhook(options) {
      calls.createBillingWebhook += 1;
      if (webhookImplementation) return webhookImplementation(options, calls);
      return {
        async handle(requestValue, responseValue) {
          const chunks = [];
          for await (const chunk of requestValue) chunks.push(Buffer.from(chunk));
          calls.webhook.push(Buffer.concat(chunks));
          responseValue.writeHead(200, { "Content-Type": "application/json" });
          responseValue.end(JSON.stringify({ received: true }));
        },
      };
    },
  };
  const logger = {
    error(...args) {
      calls.logs.push(["error", ...args]);
    },
    warn(...args) {
      calls.logs.push(["warn", ...args]);
    },
    info(...args) {
      calls.logs.push(["info", ...args]);
    },
    log(...args) {
      calls.logs.push(["log", ...args]);
    },
  };
  return { calls, dependencies, logger };
}

test("the raw Stripe webhook route runs before any general JSON parsing", async () => {
  const rawBytes = Buffer.from([0, 255, 123, 110, 111, 116, 45, 106, 115, 111, 110]);
  const { calls, dependencies, logger } = createDependencies();
  const application = await createEverWiseApplication({
    env: BILLING_ENV,
    dependencies,
    logger,
  });

  const result = await invoke(
    application,
    request("/api/stripe/webhook", {
      body: rawBytes,
      headers: { "stripe-signature": "t=123,v1=signature" },
    }),
  );

  assert.equal(result.status, 200);
  assert.deepEqual(calls.webhook, [rawBytes]);
  assert.equal(calls.billingApi.length, 0);
  assert.equal(calls.partnerApi.length, 0);
});

test("billing routes receive parsed JSON plus the exact measured raw byte length", async () => {
  const rawBody = ' { "plan" : "monthly", "label" : "café" }\n';
  const { calls, dependencies, logger } = createDependencies();
  const application = await createEverWiseApplication({
    env: BILLING_ENV,
    dependencies,
    logger,
  });

  const result = await invoke(
    application,
    request("/api/billing/checkout", {
      body: rawBody,
      headers: { authorization: "Bearer firebase-private-token" },
    }),
  );

  assert.equal(result.status, 200);
  assert.equal(calls.billingApi.length, 1);
  assert.equal(calls.billingApi[0].pathname, "/api/billing/checkout");
  assert.deepEqual(calls.billingApi[0].body, { plan: "monthly", label: "café" });
  assert.equal(calls.billingApi[0].bodyByteLength, Buffer.byteLength(rawBody, "utf8"));
  assert.equal(calls.billingApi[0].request.headers.authorization, "Bearer firebase-private-token");
});

test("billing JSON reader failures preserve the billing error and cache contract", async () => {
  const { calls, dependencies, logger } = createDependencies();
  const application = await createEverWiseApplication({
    env: BILLING_ENV,
    dependencies,
    logger,
  });

  const result = await invoke(
    application,
    request("/api/billing/checkout", {
      body: "{not json",
      headers: { authorization: "Bearer firebase-private-token" },
    }),
  );

  assert.equal(result.status, 400);
  assert.equal(result.headers["Cache-Control"], "no-store");
  assert.equal(result.headers["X-Content-Type-Options"], "nosniff");
  assert.deepEqual(result.json(), {
    error: { code: "INVALID_JSON", message: "The request body is invalid." },
  });
  assert.equal(calls.billingApi.length, 0);
});

test("billing authentication runs before malformed or oversized bodies are read", async () => {
  for (const body of ["{not json", "x".repeat(256 * 1024 + 1)]) {
    let authAttempts = 0;
    const { dependencies, logger } = createDependencies({
      billingApiImplementation() {
        return {
          async authorize({ response: responseValue }) {
            authAttempts += 1;
            responseValue.writeHead(401, { "Content-Type": "application/json" });
            responseValue.end(JSON.stringify({ error: { code: "UNAUTHENTICATED" } }));
            return null;
          },
          async handleVerified() {
            assert.fail("unauthenticated bodies must never reach the verified handler");
          },
        };
      },
    });
    const requestValue = request("/api/billing/checkout", { body });
    const result = await invoke(
      await createEverWiseApplication({ env: BILLING_ENV, dependencies, logger }),
      requestValue,
    );
    assert.equal(result.status, 401);
    assert.equal(authAttempts, 1);
    assert.equal(requestValue.iterations(), 0);
  }
});

test("health always includes a stable false billing shape when configuration is absent", async () => {
  const { dependencies, logger } = createDependencies({
    config: { configured: false, appOrigin: null, webhookSecret: null, plans: {} },
  });
  const application = await createEverWiseApplication({ env: {}, dependencies, logger });
  const result = await invoke(application, request("/healthz", { method: "GET", body: null }));
  assert.deepEqual(result.json(), {
    ok: true,
    readAloudConfigured: false,
    scamCheckerConfigured: false,
    partnerAccessConfigured: false,
    partnerStoreHealthy: false,
    billingConfigured: false,
    billingPlansVerified: false,
    billingStoreHealthy: false,
  });
});

test("enabled billing is composed once and health reports verified live state", async () => {
  const { calls, dependencies, logger } = createDependencies();
  const application = await createEverWiseApplication({
    env: BILLING_ENV,
    dependencies,
    logger,
  });

  const first = await invoke(application, request("/healthz", { method: "GET", body: null }));
  const second = await invoke(application, request("/healthz", { method: "GET", body: null }));

  assert.deepEqual(first.json(), {
    ok: true,
    readAloudConfigured: false,
    scamCheckerConfigured: false,
    partnerAccessConfigured: false,
    partnerStoreHealthy: false,
    billingConfigured: true,
    billingPlansVerified: true,
    billingStoreHealthy: true,
  });
  assert.deepEqual(second.json(), first.json());
  for (const name of [
    "createPartnerStore",
    "createPartnerApi",
    "createVerifier",
    "loadBillingConfig",
    "createGateway",
    "verifyPlans",
    "createBillingStore",
    "createBillingApi",
    "createBillingWebhook",
  ]) {
    assert.equal(calls[name], 1, name);
  }
});

test("partial config, Price mismatch, and unhealthy storage are false without secret reasons", async () => {
  const cases = [
    {
      name: "partial config",
      env: { STRIPE_SECRET_KEY: "sk_test_partial_private" },
      options: { config: new Error("private partial secret sk_test_partial_private") },
      expected: { billingConfigured: false, billingPlansVerified: false, billingStoreHealthy: false },
    },
    {
      name: "Price mismatch",
      env: BILLING_ENV,
      options: { plansVerified: false },
      expected: { billingConfigured: true, billingPlansVerified: false, billingStoreHealthy: true },
    },
    {
      name: "unhealthy store",
      env: BILLING_ENV,
      options: { storeHealth: { configured: true, healthy: false } },
      expected: { billingConfigured: true, billingPlansVerified: true, billingStoreHealthy: false },
    },
  ];

  for (const fixture of cases) {
    const { calls, dependencies, logger } = createDependencies(fixture.options);
    const application = await createEverWiseApplication({
      env: fixture.env,
      dependencies,
      logger,
    });
    const result = await invoke(application, request("/healthz", { method: "GET", body: null }));
    const health = result.json();
    assert.deepEqual(
      {
        billingConfigured: health.billingConfigured,
        billingPlansVerified: health.billingPlansVerified,
        billingStoreHealthy: health.billingStoreHealthy,
      },
      fixture.expected,
      fixture.name,
    );
    const serialized = JSON.stringify({ health, logs: calls.logs });
    assert.equal(serialized.includes("sk_test_partial_private"), false, fixture.name);
    assert.equal(serialized.includes("price_test_private"), false, fixture.name);
  }
});

test("failed startup plan verification blocks entitlement webhooks until an authenticated API retry recovers readiness", async () => {
  const config = {
    ...CONFIG,
    plans: {
      monthly: {
        key: "monthly",
        priceId: "price_test_monthly",
        currency: "usd",
        unitAmount: 999,
        interval: "month",
        trialDays: 7,
      },
      annual: {
        key: "annual",
        priceId: "price_test_annual",
        currency: "usd",
        unitAmount: 9999,
        interval: "year",
        trialDays: 7,
      },
    },
  };
  let verifyAttempts = 0;
  let eventId = "evt_blocked_before_verification";
  const operations = {
    construct: 0,
    retrieve: 0,
    list: 0,
    cancel: 0,
    begin: 0,
    reconcile: 0,
  };
  const authoritative = {
    id: "sub_recovered",
    customerId: "cus_recovered",
    created: 1_800_000_000,
    status: "active",
    priceId: "price_test_monthly",
    livemode: false,
    cancelAtPeriodEnd: false,
    currentPeriodEnd: 1_800_086_400,
    trialEnd: null,
  };
  const gateway = {
    async verifyPlans(plans) {
      verifyAttempts += 1;
      if (verifyAttempts === 1) throw new Error("private Price mismatch");
      return plans;
    },
    constructWebhookEvent(rawBody, signature, secret) {
      operations.construct += 1;
      assert.deepEqual(rawBody, Buffer.from("correctly-signed-lifecycle"));
      assert.equal(signature, "t=123,v1=correct-signature");
      assert.equal(secret, CONFIG.webhookSecret);
      return {
        id: eventId,
        type: "customer.subscription.updated",
        created: 1_800_000_100,
        livemode: false,
        object: {
          kind: "subscription",
          id: authoritative.id,
          status: "active",
          customerId: authoritative.customerId,
          subscriptionId: authoritative.id,
          priceId: authoritative.priceId,
          metadata: { firebaseUid: "firebase-uid-123" },
        },
      };
    },
    async retrieveSubscription() {
      operations.retrieve += 1;
      return authoritative;
    },
    async listNonTerminalSubscriptions() {
      operations.list += 1;
      return [authoritative];
    },
    async cancelSubscription() {
      operations.cancel += 1;
      throw new Error("no duplicate should be canceled");
    },
    async listBlockingSubscriptions() { return []; },
  };
  const store = {
    async health() { return { configured: true, healthy: true }; },
    async getByCustomerId() {
      return {
        uid: "firebase-uid-123",
        customerId: authoritative.customerId,
        subscriptionId: null,
        plan: null,
        status: "none",
        trialUsedAt: null,
        trialEndsAt: null,
        currentPeriodEndsAt: null,
        cancelAtPeriodEnd: false,
        lastEventCreated: null,
        lastEventId: null,
        updatedAt: "2026-08-04T00:00:00.000Z",
      };
    },
    async beginSubscriptionReconciliation() {
      operations.begin += 1;
      return { held: false, reason: "not_granting" };
    },
    async reconcileSubscriptionSnapshot() {
      operations.reconcile += 1;
      return { applied: true, reason: "reconciled" };
    },
    async applySubscriptionSnapshot() { throw new Error("not used"); },
    async recordProcessedEvent() { return { recorded: true, reason: "recorded" }; },
  };
  const { dependencies, logger } = createDependencies({
    config,
    gatewayImplementation: gateway,
    storeImplementation: store,
  });
  delete dependencies.createBillingApi;
  delete dependencies.createBillingWebhook;
  const application = await createEverWiseApplication({
    env: BILLING_ENV,
    dependencies,
    logger,
  });

  const initialHealth = await invoke(
    application,
    request("/healthz", { method: "GET", body: null }),
  );
  assert.equal(initialHealth.json().billingPlansVerified, false);
  const blocked = await invoke(application, request("/api/stripe/webhook", {
    body: Buffer.from("correctly-signed-lifecycle"),
    headers: { "stripe-signature": "t=123,v1=correct-signature" },
  }));
  assert.equal(blocked.status, 500);
  assert.equal(blocked.json().error.code, "BILLING_WEBHOOK_FAILED");
  assert.deepEqual(operations, {
    construct: 1,
    retrieve: 0,
    list: 0,
    cancel: 0,
    begin: 0,
    reconcile: 0,
  });

  const plans = await invoke(application, request("/api/billing/plans", {
    headers: { authorization: "Bearer valid-token" },
  }));
  assert.equal(plans.status, 200);
  assert.equal(verifyAttempts, 2);
  const recoveredHealth = await invoke(
    application,
    request("/healthz", { method: "GET", body: null }),
  );
  assert.equal(recoveredHealth.json().billingPlansVerified, true);

  eventId = "evt_processed_after_recovery";
  const processed = await invoke(application, request("/api/stripe/webhook", {
    body: Buffer.from("correctly-signed-lifecycle"),
    headers: { "stripe-signature": "t=123,v1=correct-signature" },
  }));
  assert.equal(processed.status, 200);
  assert.equal(operations.retrieve, 1);
  assert.equal(operations.list, 1);
  assert.equal(operations.reconcile, 1);
  assert.equal(operations.cancel, 0);
});

test("a newer failed verification cannot be overwritten by an older successful attempt", async () => {
  let verifyAttempt = 0;
  let resolveOlder;
  const olderResult = new Promise((resolve) => { resolveOlder = resolve; });
  const gateway = {
    async verifyPlans(plans) {
      verifyAttempt += 1;
      if (verifyAttempt === 1) return plans;
      if (verifyAttempt === 2) return olderResult;
      throw new Error("newer definitive mismatch");
    },
  };
  const { dependencies, logger } = createDependencies({
    gatewayImplementation: gateway,
    billingApiImplementation(options) {
      return {
        async authorize() { return {}; },
        async handleVerified({ response: responseValue }) {
          assert.equal(options.planVerifier.verifyPlans, undefined);
          const older = options.planVerifier.verify();
          const newer = options.planVerifier.verify();
          await Promise.resolve();
          resolveOlder(CONFIG.plans);
          await Promise.allSettled([older, newer]);
          responseValue.writeHead(200, { "Content-Type": "application/json" });
          responseValue.end(JSON.stringify({ attempted: true }));
          return true;
        },
      };
    },
  });
  const application = await createEverWiseApplication({
    env: BILLING_ENV,
    dependencies,
    logger,
  });

  const attempt = await invoke(application, request("/api/billing/plans", {
    headers: { authorization: "Bearer valid-token" },
  }));
  assert.equal(attempt.status, 200);
  assert.equal(verifyAttempt, 3);
  const health = await invoke(
    application,
    request("/healthz", { method: "GET", body: null }),
  );
  assert.equal(health.json().billingPlansVerified, false);
});

test("disabled local billing keeps partner and AI routes while Checkout and Portal fail closed", async () => {
  const partnerPath = "/api/partner/test-existing-route";
  const { dependencies, logger } = createDependencies({
    config: {
      configured: false,
      appOrigin: null,
      webhookSecret: null,
      plans: {},
    },
    partnerHandledPath: partnerPath,
    billingApiImplementation(options) {
      assert.equal(options.config.configured, false);
      return {
        async authorize() {
          return {};
        },
        async handleVerified({ response: responseValue, pathname }) {
          if (!["/api/billing/checkout", "/api/billing/portal"].includes(pathname)) {
            return false;
          }
          responseValue.writeHead(503, { "Content-Type": "application/json" });
          responseValue.end(JSON.stringify({
            error: {
              code: "BILLING_NOT_CONFIGURED",
              message: "Billing is not available right now.",
            },
          }));
          return true;
        },
      };
    },
  });
  const application = await createEverWiseApplication({ env: {}, dependencies, logger });

  const partner = await invoke(application, request(partnerPath));
  assert.deepEqual(partner.json(), { partner: true });

  const narration = await invoke(
    application,
    request("/api/read-aloud", { body: JSON.stringify({ text: "Hello" }) }),
  );
  assert.equal(narration.status, 503);
  assert.equal(narration.text(), "Read-aloud service is not configured");

  const scam = await invoke(
    application,
    request("/api/check-message", { body: JSON.stringify({ message: "Hello" }) }),
  );
  assert.equal(scam.status, 503);
  assert.deepEqual(scam.json(), { error: "Scam checker is not configured" });

  for (const pathname of ["/api/billing/checkout", "/api/billing/portal"]) {
    const billing = await invoke(
      application,
      request(pathname, { headers: { authorization: "Bearer token" } }),
    );
    assert.equal(billing.status, 503);
    assert.equal(billing.json().error.code, "BILLING_NOT_CONFIGURED");
  }
});
