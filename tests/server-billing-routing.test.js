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
  const stream = Readable.from(body === null ? [] : [Buffer.from(body)]);
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
  const gateway = {
    async verifyPlans(plans) {
      calls.verifyPlans += 1;
      if (!plansVerified) throw new Error("private Price mismatch price_test_private");
      return plans;
    },
  };
  const store = {
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
      return {
        async handle(input) {
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
        async handle({ response: responseValue, pathname }) {
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
