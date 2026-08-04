import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import { BILLING_PLANS, loadBillingConfig } from "../server/billingConfig.mjs";
import { createStripeGateway } from "../server/stripeGateway.mjs";

const SECRET_KEY = "sk_test_gateway_secret_do_not_expose";
const WEBHOOK_SECRET = "whsec_gateway_secret_do_not_expose";
const CUSTOMER_EMAIL = "private.learner@example.com";
const APP_ORIGIN = "https://app.everwise.example";

const PLAN_CONFIG = Object.freeze({
  monthly: Object.freeze({ ...BILLING_PLANS.monthly, priceId: "price_test_monthly" }),
  annual: Object.freeze({ ...BILLING_PLANS.annual, priceId: "price_test_annual" }),
});

const priceResponse = (key, overrides = {}) => ({
  id: PLAN_CONFIG[key].priceId,
  object: "price",
  active: true,
  currency: PLAN_CONFIG[key].currency,
  unit_amount: PLAN_CONFIG[key].unitAmount,
  livemode: false,
  product: "prod_everwise_paid",
  type: "recurring",
  recurring: {
    interval: PLAN_CONFIG[key].interval,
    interval_count: 1,
    usage_type: "licensed",
  },
  metadata: {},
  ...overrides,
});

const subscriptionResponse = (id, status, overrides = {}) => ({
  id,
  object: "subscription",
  customer: "cus_learner",
  status,
  livemode: false,
  cancel_at_period_end: false,
  current_period_end: 1_800_000_000,
  trial_end: null,
  metadata: { firebase_uid: "firebase-uid-123" },
  items: {
    object: "list",
    data: [
      {
        id: `si_${id}`,
        object: "subscription_item",
        price: priceResponse("monthly"),
        quantity: 1,
      },
    ],
    has_more: false,
    url: `/v1/subscription_items?subscription=${id}`,
  },
  ...overrides,
});

const createFakeFetch = (responses) => {
  const calls = [];
  const queue = [...responses];
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    const next = queue.shift();
    assert.ok(next, `Unexpected Stripe request: ${init.method ?? "GET"} ${url}`);
    const status = next.status ?? 200;
    return new Response(JSON.stringify(next.body), {
      status,
      headers: {
        "content-type": "application/json",
        "request-id": next.requestId ?? "req_test_gateway",
      },
    });
  };
  return { fetchImpl, calls, remaining: () => queue.length };
};

const requestHeader = (call, name) => {
  const headers = new Headers(call.init.headers);
  return headers.get(name);
};

const requestParameters = (call) => {
  if ((call.init.method ?? "GET") === "GET" || !call.init.body) {
    return new URL(call.url).searchParams;
  }
  return new URLSearchParams(String(call.init.body ?? ""));
};

const createVerifiedGateway = async (extraResponses = []) => {
  const fake = createFakeFetch([
    { body: priceResponse("monthly") },
    { body: priceResponse("annual") },
    ...extraResponses,
  ]);
  const gateway = createStripeGateway({ secretKey: SECRET_KEY, fetchImpl: fake.fetchImpl });
  const verifiedPlans = await gateway.verifyPlans(PLAN_CONFIG);
  return { gateway, fake, verifiedPlans };
};

const constructSignedWebhook = (gateway, event) => {
  const payload = JSON.stringify(event);
  const timestamp = Math.floor(Date.now() / 1000);
  const digest = createHmac("sha256", WEBHOOK_SECRET)
    .update(`${timestamp}.${payload}`)
    .digest("hex");
  return gateway.constructWebhookEvent(
    Buffer.from(payload),
    `t=${timestamp},v1=${digest}`,
    WEBHOOK_SECRET,
  );
};

test("verifyPlans uses the pinned API version and returns normalized verified plans", async () => {
  const { fake, verifiedPlans } = await createVerifiedGateway();

  assert.equal(fake.remaining(), 0);
  assert.equal(requestHeader(fake.calls[0], "stripe-version"), "2026-02-25.clover");
  assert.deepEqual(verifiedPlans, {
    monthly: {
      key: "monthly",
      priceId: "price_test_monthly",
      productId: "prod_everwise_paid",
      currency: "usd",
      unitAmount: 799,
      interval: "month",
      trialDays: 3,
    },
    annual: {
      key: "annual",
      priceId: "price_test_annual",
      productId: "prod_everwise_paid",
      currency: "usd",
      unitAmount: 6000,
      interval: "year",
      trialDays: 7,
    },
  });
});

test("verifyPlans accepts the exact plan key set regardless of insertion order", async () => {
  const fake = createFakeFetch([
    { body: priceResponse("monthly") },
    { body: priceResponse("annual") },
  ]);
  const gateway = createStripeGateway({ secretKey: SECRET_KEY, fetchImpl: fake.fetchImpl });
  const reorderedPlans = {
    annual: PLAN_CONFIG.annual,
    monthly: PLAN_CONFIG.monthly,
  };

  assert.deepEqual(Object.keys(await gateway.verifyPlans(reorderedPlans)), ["monthly", "annual"]);
});

test("loaded billing configuration composes directly with Price verification", async () => {
  const fake = createFakeFetch([
    { body: priceResponse("monthly") },
    { body: priceResponse("annual") },
  ]);
  const gateway = createStripeGateway({ secretKey: SECRET_KEY, fetchImpl: fake.fetchImpl });
  const config = loadBillingConfig({
    STRIPE_SECRET_KEY: SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET,
    STRIPE_MONTHLY_PRICE_ID: "price_test_monthly",
    STRIPE_ANNUAL_PRICE_ID: "price_test_annual",
    EVERWISE_PUBLIC_APP_ORIGIN: APP_ORIGIN,
  });

  const verified = await gateway.verifyPlans(config.plans);
  assert.deepEqual(
    Object.fromEntries(Object.entries(verified).map(([key, plan]) => [key, plan.priceId])),
    { monthly: "price_test_monthly", annual: "price_test_annual" },
  );
});

test("verifyPlans rejects every unsafe Price mutation", async () => {
  const mutations = [
    ["inactive Price", "monthly", { active: false }],
    ["wrong currency", "monthly", { currency: "eur" }],
    ["wrong amount", "monthly", { unit_amount: 1 }],
    ["wrong interval", "monthly", { recurring: { interval: "year", interval_count: 1 } }],
    ["non-recurring Price", "monthly", { type: "one_time", recurring: null }],
    ["wrong mode", "monthly", { livemode: true }],
    ["different product", "annual", { product: "prod_other" }],
  ];

  for (const [label, key, overrides] of mutations) {
    const fake = createFakeFetch([
      { body: priceResponse("monthly", key === "monthly" ? overrides : {}) },
      { body: priceResponse("annual", key === "annual" ? overrides : {}) },
    ]);
    const gateway = createStripeGateway({ secretKey: SECRET_KEY, fetchImpl: fake.fetchImpl });

    await assert.rejects(gateway.verifyPlans(PLAN_CONFIG), (error) => {
      assert.match(error.message, /could not be verified/i, label);
      assert.equal(error.message.includes(SECRET_KEY), false);
      assert.equal(error.message.includes(JSON.stringify(overrides)), false);
      return true;
    });
  }
});

test("customer lookup retrieves a server-stored customer before searching", async () => {
  const fake = createFakeFetch([
    {
      body: {
        id: "cus_stored",
        object: "customer",
        deleted: false,
        email: CUSTOMER_EMAIL,
        livemode: false,
        metadata: { firebase_uid: "firebase-uid-123" },
      },
    },
  ]);
  const gateway = createStripeGateway({ secretKey: SECRET_KEY, fetchImpl: fake.fetchImpl });

  assert.deepEqual(
    await gateway.findOrCreateCustomer({
      uid: "firebase-uid-123",
      storedCustomerId: "cus_stored",
      operationAttempt: "attempt-1",
    }),
    { id: "cus_stored" },
  );
  assert.equal(fake.calls.length, 1);
  assert.match(new URL(fake.calls[0].url).pathname, /\/v1\/customers\/cus_stored$/);
});

test("customer lookup searches Firebase UID metadata and does not create a duplicate", async () => {
  const fake = createFakeFetch([
    {
      body: {
        object: "search_result",
        data: [
          {
            id: "cus_found",
            object: "customer",
            email: CUSTOMER_EMAIL,
            livemode: false,
            metadata: { firebase_uid: "firebase-uid-123" },
          },
        ],
        has_more: false,
        next_page: null,
        url: "/v1/customers/search",
      },
    },
  ]);
  const gateway = createStripeGateway({ secretKey: SECRET_KEY, fetchImpl: fake.fetchImpl });

  assert.deepEqual(
    await gateway.findOrCreateCustomer({
      uid: "firebase-uid-123",
      operationAttempt: "attempt-2",
    }),
    { id: "cus_found" },
  );
  assert.equal(fake.calls.length, 1);
  assert.equal(requestParameters(fake.calls[0]).get("query"), "metadata['firebase_uid']:'firebase-uid-123'");
  assert.equal(requestParameters(fake.calls[0]).get("limit"), "100");
});

test("customer lookup creates at most one customer with UID metadata and deterministic idempotency", async () => {
  const fake = createFakeFetch([
    {
      body: {
        object: "search_result",
        data: [],
        has_more: false,
        next_page: null,
        url: "/v1/customers/search",
      },
    },
    {
      body: {
        id: "cus_created",
        object: "customer",
        email: null,
        livemode: false,
        metadata: { firebase_uid: "firebase-uid-123" },
      },
    },
  ]);
  const gateway = createStripeGateway({ secretKey: SECRET_KEY, fetchImpl: fake.fetchImpl });

  assert.deepEqual(
    await gateway.findOrCreateCustomer({
      uid: "firebase-uid-123",
      operationAttempt: "attempt-3",
    }),
    { id: "cus_created" },
  );
  assert.equal(fake.calls.length, 2);
  assert.equal(requestParameters(fake.calls[1]).get("metadata[firebase_uid]"), "firebase-uid-123");
  assert.equal(requestParameters(fake.calls[1]).has("email"), false);
  assert.equal(
    requestHeader(fake.calls[1], "idempotency-key"),
    "customer:firebase-uid-123",
  );
});

test("concurrent first-time customer calls converge on one UID-stable Stripe customer", async () => {
  let searchCount = 0;
  let releaseSearches;
  const bothSearchesStarted = new Promise((resolve) => {
    releaseSearches = resolve;
  });
  const idempotentCustomers = new Map();
  const creationKeys = [];

  const fetchImpl = async (url, init = {}) => {
    const parsedUrl = new URL(url);
    if (parsedUrl.pathname === "/v1/customers/search") {
      searchCount += 1;
      if (searchCount === 2) releaseSearches();
      await bothSearchesStarted;
      return new Response(
        JSON.stringify({
          object: "search_result",
          data: [],
          has_more: false,
          next_page: null,
          url: "/v1/customers/search",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }

    assert.equal(parsedUrl.pathname, "/v1/customers");
    assert.equal(init.method, "POST");
    const key = requestHeader({ init }, "idempotency-key");
    creationKeys.push(key);
    if (!idempotentCustomers.has(key)) idempotentCustomers.set(key, "cus_race_stable");
    return new Response(
      JSON.stringify({
        id: idempotentCustomers.get(key),
        object: "customer",
        email: null,
        livemode: false,
        metadata: { firebase_uid: "firebase-uid-123" },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };
  const gateway = createStripeGateway({ secretKey: SECRET_KEY, fetchImpl });

  const customers = await Promise.all([
    gateway.findOrCreateCustomer({
      uid: "firebase-uid-123",
      operationAttempt: "concurrent-a",
    }),
    gateway.findOrCreateCustomer({
      uid: "firebase-uid-123",
      operationAttempt: "concurrent-b",
    }),
  ]);

  assert.deepEqual(customers, [{ id: "cus_race_stable" }, { id: "cus_race_stable" }]);
  assert.deepEqual(creationKeys, ["customer:firebase-uid-123", "customer:firebase-uid-123"]);
  assert.equal(idempotentCustomers.size, 1);
});

test("customer lookup rejects an already-duplicated Firebase UID instead of choosing one", async () => {
  const fake = createFakeFetch([
    {
      body: {
        object: "search_result",
        data: [
          {
            id: "cus_duplicate_a",
            object: "customer",
            email: CUSTOMER_EMAIL,
            livemode: false,
            metadata: { firebase_uid: "firebase-uid-123" },
          },
          {
            id: "cus_duplicate_b",
            object: "customer",
            email: "other-private@example.com",
            livemode: false,
            metadata: { firebase_uid: "firebase-uid-123" },
          },
        ],
        has_more: false,
        next_page: null,
        url: "/v1/customers/search",
      },
    },
  ]);
  const gateway = createStripeGateway({ secretKey: SECRET_KEY, fetchImpl: fake.fetchImpl });

  await assert.rejects(
    gateway.findOrCreateCustomer({
      uid: "firebase-uid-123",
      operationAttempt: "attempt-duplicate",
    }),
    (error) => {
      assert.equal(error.code, "BILLING_CUSTOMER_DUPLICATE");
      assert.match(error.message, /multiple billing customers/i);
      assert.equal(error.message.includes(CUSTOMER_EMAIL), false);
      return true;
    },
  );
  assert.equal(requestParameters(fake.calls[0]).get("limit"), "100");
  assert.equal(fake.calls.length, 1);
});

test("Checkout uses only a verified server plan, server URLs, UID metadata, and eligible trial", async () => {
  const { gateway, fake } = await createVerifiedGateway([
    {
      body: {
        id: "cs_test_created",
        object: "checkout.session",
        mode: "subscription",
        livemode: false,
        status: "open",
        url: "https://checkout.stripe.com/c/pay/cs_test_created",
      },
    },
  ]);

  assert.deepEqual(
    await gateway.createCheckoutSession({
      uid: "firebase-uid-123",
      customerId: "cus_learner",
      planKey: "monthly",
      appOrigin: APP_ORIGIN,
      trialEligible: true,
      operationAttempt: "attempt-4",
    }),
    {
      id: "cs_test_created",
      url: "https://checkout.stripe.com/c/pay/cs_test_created",
    },
  );

  const call = fake.calls[2];
  const parameters = requestParameters(call);
  assert.equal(parameters.get("mode"), "subscription");
  assert.equal(parameters.get("payment_method_collection"), "always");
  assert.equal(parameters.get("customer"), "cus_learner");
  assert.equal(parameters.get("client_reference_id"), "firebase-uid-123");
  assert.equal(parameters.get("line_items[0][price]"), "price_test_monthly");
  assert.equal(parameters.get("line_items[0][quantity]"), "1");
  assert.equal(parameters.has("line_items[1][price]"), false);
  assert.equal(parameters.get("subscription_data[trial_period_days]"), "3");
  assert.equal(parameters.get("metadata[firebase_uid]"), "firebase-uid-123");
  assert.equal(
    parameters.get("subscription_data[metadata][firebase_uid]"),
    "firebase-uid-123",
  );
  assert.equal(
    parameters.get("success_url"),
    `${APP_ORIGIN}/billing/confirmation?session_id={CHECKOUT_SESSION_ID}`,
  );
  assert.equal(parameters.get("cancel_url"), `${APP_ORIGIN}/subscribe`);
  assert.equal(requestHeader(call, "idempotency-key"), "checkout:firebase-uid-123:attempt-4");
});

test("Checkout omits a trial when the server says the learner is ineligible", async () => {
  const { gateway, fake } = await createVerifiedGateway([
    {
      body: {
        id: "cs_test_no_trial",
        object: "checkout.session",
        mode: "subscription",
        livemode: false,
        status: "open",
        url: "https://checkout.stripe.com/c/pay/cs_test_no_trial",
      },
    },
  ]);

  await gateway.createCheckoutSession({
    uid: "firebase-uid-123",
    customerId: "cus_learner",
    planKey: "annual",
    appOrigin: APP_ORIGIN,
    trialEligible: false,
    operationAttempt: "attempt-5",
  });

  const parameters = requestParameters(fake.calls[2]);
  assert.equal(parameters.get("line_items[0][price]"), "price_test_annual");
  assert.equal(parameters.has("subscription_data[trial_period_days]"), false);
});

test("Checkout refuses unverified plans and non-Stripe hosted URLs", async () => {
  const noRequests = createFakeFetch([]);
  const unverifiedGateway = createStripeGateway({
    secretKey: SECRET_KEY,
    fetchImpl: noRequests.fetchImpl,
  });
  await assert.rejects(
    unverifiedGateway.createCheckoutSession({
      uid: "firebase-uid-123",
      customerId: "cus_learner",
      planKey: "monthly",
      appOrigin: APP_ORIGIN,
      trialEligible: true,
      operationAttempt: "attempt-6",
    }),
    /verified/i,
  );

  const { gateway } = await createVerifiedGateway([
    {
      body: {
        id: "cs_test_bad_url",
        object: "checkout.session",
        mode: "subscription",
        livemode: false,
        status: "open",
        url: "https://evil.example/collect",
      },
    },
  ]);
  await assert.rejects(
    gateway.createCheckoutSession({
      uid: "firebase-uid-123",
      customerId: "cus_learner",
      planKey: "monthly",
      appOrigin: APP_ORIGIN,
      trialEligible: true,
      operationAttempt: "attempt-7",
    }),
    /hosted Checkout URL/i,
  );
});

test("Checkout returns only an open Session URL and uses a fresh attempt after terminal Sessions", async () => {
  const session = (id, status) => ({
    id,
    object: "checkout.session",
    mode: "subscription",
    livemode: false,
    ...(status === undefined ? {} : { status }),
    url: `https://checkout.stripe.com/c/pay/${id}`,
  });
  const { gateway, fake } = await createVerifiedGateway([
    { body: session("cs_test_complete", "complete") },
    { body: session("cs_test_expired", "expired") },
    { body: session("cs_test_missing_status", undefined) },
    { body: session("cs_test_fresh", "open") },
  ]);
  const create = (operationAttempt) =>
    gateway.createCheckoutSession({
      uid: "firebase-uid-123",
      customerId: "cus_learner",
      planKey: "monthly",
      appOrigin: APP_ORIGIN,
      trialEligible: false,
      operationAttempt,
    });

  for (const attempt of ["terminal-complete", "terminal-expired", "terminal-missing"]) {
    await assert.rejects(create(attempt), (error) => {
      assert.equal(error.code, "BILLING_CHECKOUT_NOT_OPEN");
      assert.match(error.message, /not open/i);
      assert.equal(error.message.includes("checkout.stripe.com"), false);
      return true;
    });
  }
  assert.deepEqual(await create("fresh-open"), {
    id: "cs_test_fresh",
    url: "https://checkout.stripe.com/c/pay/cs_test_fresh",
  });
  assert.deepEqual(
    fake.calls.slice(2).map((call) => requestHeader(call, "idempotency-key")),
    [
      "checkout:firebase-uid-123:terminal-complete",
      "checkout:firebase-uid-123:terminal-expired",
      "checkout:firebase-uid-123:terminal-missing",
      "checkout:firebase-uid-123:fresh-open",
    ],
  );
});

test("Portal uses only the configured origin and accepts only Stripe's billing host", async () => {
  const fake = createFakeFetch([
    {
      body: {
        id: "bps_test_created",
        object: "billing_portal.session",
        configuration: "bpc_test",
        created: 1_700_000_000,
        customer: "cus_learner",
        livemode: false,
        locale: null,
        on_behalf_of: null,
        return_url: `${APP_ORIGIN}/settings`,
        url: "https://billing.stripe.com/p/session/test_portal",
      },
    },
  ]);
  const gateway = createStripeGateway({ secretKey: SECRET_KEY, fetchImpl: fake.fetchImpl });

  assert.deepEqual(
    await gateway.createPortalSession({
      uid: "firebase-uid-123",
      customerId: "cus_learner",
      appOrigin: APP_ORIGIN,
      operationAttempt: "attempt-8",
    }),
    { url: "https://billing.stripe.com/p/session/test_portal" },
  );
  assert.equal(requestParameters(fake.calls[0]).get("customer"), "cus_learner");
  assert.equal(requestParameters(fake.calls[0]).get("return_url"), `${APP_ORIGIN}/settings`);
  assert.equal(requestHeader(fake.calls[0], "idempotency-key"), "portal:firebase-uid-123:attempt-8");
});

test("Portal rejects a non-Stripe URL without reflecting it", async () => {
  const privateUrl = "https://evil.example/private-session-token";
  const fake = createFakeFetch([
    {
      body: {
        id: "bps_test_bad_url",
        object: "billing_portal.session",
        customer: "cus_learner",
        livemode: false,
        return_url: `${APP_ORIGIN}/settings`,
        url: privateUrl,
      },
    },
  ]);
  const gateway = createStripeGateway({ secretKey: SECRET_KEY, fetchImpl: fake.fetchImpl });

  await assert.rejects(
    gateway.createPortalSession({
      uid: "firebase-uid-123",
      customerId: "cus_learner",
      appOrigin: APP_ORIGIN,
      operationAttempt: "attempt-9",
    }),
    (error) => {
      assert.match(error.message, /hosted Portal URL/i);
      assert.equal(error.message.includes(privateUrl), false);
      return true;
    },
  );
});

test("listBlockingSubscriptions returns only the four blocking statuses as normalized records", async () => {
  const statuses = ["trialing", "active", "incomplete", "past_due", "canceled", "unpaid"];
  const fake = createFakeFetch([
    {
      body: {
        object: "list",
        data: statuses.map((status, index) => subscriptionResponse(`sub_${index}`, status)),
        has_more: false,
        url: "/v1/subscriptions",
      },
    },
  ]);
  const gateway = createStripeGateway({ secretKey: SECRET_KEY, fetchImpl: fake.fetchImpl });

  const records = await gateway.listBlockingSubscriptions({ customerId: "cus_learner" });
  assert.deepEqual(
    records.map(({ id, status }) => ({ id, status })),
    [
      { id: "sub_0", status: "trialing" },
      { id: "sub_1", status: "active" },
      { id: "sub_2", status: "incomplete" },
      { id: "sub_3", status: "past_due" },
    ],
  );
  assert.equal(JSON.stringify(records).includes(CUSTOMER_EMAIL), false);
  assert.equal(requestParameters(fake.calls[0]).get("customer"), "cus_learner");
  assert.equal(requestParameters(fake.calls[0]).get("status"), "all");
});

test("listBlockingSubscriptions follows Stripe pagination and returns later blocking records", async () => {
  const fake = createFakeFetch([
    {
      body: {
        object: "list",
        data: [subscriptionResponse("sub_page_1", "canceled")],
        has_more: true,
        url: "/v1/subscriptions",
      },
    },
    {
      body: {
        object: "list",
        data: [subscriptionResponse("sub_page_2", "past_due")],
        has_more: false,
        url: "/v1/subscriptions",
      },
    },
  ]);
  const gateway = createStripeGateway({ secretKey: SECRET_KEY, fetchImpl: fake.fetchImpl });

  assert.deepEqual(await gateway.listBlockingSubscriptions({ customerId: "cus_learner" }), [
    {
      id: "sub_page_2",
      customerId: "cus_learner",
      status: "past_due",
      priceId: "price_test_monthly",
      livemode: false,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: 1_800_000_000,
      trialEnd: null,
    },
  ]);
  assert.equal(fake.calls.length, 2);
  assert.equal(requestParameters(fake.calls[1]).get("starting_after"), "sub_page_1");
});

test("listBlockingSubscriptions rejects empty and repeated non-progress pages", async () => {
  const malformedPageSequences = [
    [
      {
        object: "list",
        data: [],
        has_more: true,
        url: "/v1/subscriptions",
      },
    ],
    [
      {
        object: "list",
        data: [subscriptionResponse("sub_repeated_cursor", "active")],
        has_more: true,
        url: "/v1/subscriptions",
      },
      {
        object: "list",
        data: [subscriptionResponse("sub_repeated_cursor", "active")],
        has_more: true,
        url: "/v1/subscriptions",
      },
    ],
  ];

  for (const pages of malformedPageSequences) {
    const fake = createFakeFetch(pages.map((body) => ({ body })));
    const gateway = createStripeGateway({ secretKey: SECRET_KEY, fetchImpl: fake.fetchImpl });
    await assert.rejects(
      gateway.listBlockingSubscriptions({ customerId: "cus_learner" }),
      (error) => {
        assert.equal(error.code, "BILLING_PROVIDER_ERROR");
        assert.match(error.message, /provider request failed/i);
        return true;
      },
    );
  }
});

test("subscription retrieval and cancellation expose normalized records only", async () => {
  const fake = createFakeFetch([
    { body: subscriptionResponse("sub_retrieve", "active") },
    { body: subscriptionResponse("sub_cancel", "canceled") },
  ]);
  const gateway = createStripeGateway({ secretKey: SECRET_KEY, fetchImpl: fake.fetchImpl });

  assert.deepEqual(await gateway.retrieveSubscription("sub_retrieve"), {
    id: "sub_retrieve",
    customerId: "cus_learner",
    status: "active",
    priceId: "price_test_monthly",
    livemode: false,
    cancelAtPeriodEnd: false,
    currentPeriodEnd: 1_800_000_000,
    trialEnd: null,
  });
  assert.deepEqual(
    await gateway.cancelSubscription({
      uid: "firebase-uid-123",
      subscriptionId: "sub_cancel",
      operationAttempt: "attempt-10",
    }),
    {
      id: "sub_cancel",
      customerId: "cus_learner",
      status: "canceled",
      priceId: "price_test_monthly",
      livemode: false,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: 1_800_000_000,
      trialEnd: null,
    },
  );
  assert.equal(fake.calls[1].init.method, "DELETE");
  assert.equal(requestParameters(fake.calls[1]).get("prorate"), "false");
  assert.equal(requestParameters(fake.calls[1]).get("invoice_now"), "false");
  assert.equal(requestHeader(fake.calls[1], "idempotency-key"), "cancel:firebase-uid-123:attempt-10");
});

test("webhook construction returns only minimal normalized records for planned event families", () => {
  const gateway = createStripeGateway({ secretKey: SECRET_KEY, fetchImpl: async () => {} });
  const privateProviderText = `private ${CUSTOMER_EMAIL} https://checkout.stripe.com/private`;
  const subscriptionObject = (status) => ({
    id: "sub_webhook",
    object: "subscription",
    status,
    customer: "cus_learner",
    metadata: { firebase_uid: "firebase-uid-123", arbitrary: privateProviderText },
    items: {
      object: "list",
      data: [{ id: "si_webhook", price: { id: "price_test_monthly" } }],
      has_more: false,
      url: "/v1/subscription_items",
    },
    latest_invoice: { description: privateProviderText },
  });
  const cases = [
    {
      type: "checkout.session.completed",
      object: {
        id: "cs_test_webhook",
        object: "checkout.session",
        status: "complete",
        customer: "cus_learner",
        subscription: "sub_checkout",
        metadata: { firebase_uid: "firebase-uid-123", arbitrary: privateProviderText },
        customer_details: { email: CUSTOMER_EMAIL },
        url: "https://checkout.stripe.com/private",
      },
      expectedObject: {
        kind: "checkout.session",
        id: "cs_test_webhook",
        status: "complete",
        customerId: "cus_learner",
        subscriptionId: "sub_checkout",
        priceId: null,
        metadata: { firebaseUid: "firebase-uid-123" },
      },
    },
    {
      type: "customer.subscription.created",
      object: subscriptionObject("trialing"),
      expectedObject: {
        kind: "subscription",
        id: "sub_webhook",
        status: "trialing",
        customerId: "cus_learner",
        subscriptionId: "sub_webhook",
        priceId: "price_test_monthly",
        metadata: { firebaseUid: "firebase-uid-123" },
      },
    },
    {
      type: "customer.subscription.updated",
      object: subscriptionObject("active"),
      expectedObject: {
        kind: "subscription",
        id: "sub_webhook",
        status: "active",
        customerId: "cus_learner",
        subscriptionId: "sub_webhook",
        priceId: "price_test_monthly",
        metadata: { firebaseUid: "firebase-uid-123" },
      },
    },
    {
      type: "customer.subscription.deleted",
      object: subscriptionObject("canceled"),
      expectedObject: {
        kind: "subscription",
        id: "sub_webhook",
        status: "canceled",
        customerId: "cus_learner",
        subscriptionId: "sub_webhook",
        priceId: "price_test_monthly",
        metadata: { firebaseUid: "firebase-uid-123" },
      },
    },
    {
      type: "customer.subscription.trial_will_end",
      object: subscriptionObject("trialing"),
      expectedObject: {
        kind: "subscription",
        id: "sub_webhook",
        status: "trialing",
        customerId: "cus_learner",
        subscriptionId: "sub_webhook",
        priceId: "price_test_monthly",
        metadata: { firebaseUid: "firebase-uid-123" },
      },
    },
    ...["invoice.paid", "invoice.payment_failed"].map((type) => ({
      type,
      object: {
        id: type === "invoice.paid" ? "in_paid" : "in_failed",
        object: "invoice",
        status: type === "invoice.paid" ? "paid" : "open",
        customer: "cus_learner",
        subscription: "sub_invoice",
        metadata: { firebase_uid: "firebase-uid-123", arbitrary: privateProviderText },
        customer_email: CUSTOMER_EMAIL,
        description: privateProviderText,
        lines: {
          object: "list",
          data: [{ id: "il_webhook", price: { id: "price_test_annual" } }],
          has_more: false,
          url: "/v1/invoices/in_webhook/lines",
        },
      },
      expectedObject: {
        kind: "invoice",
        id: type === "invoice.paid" ? "in_paid" : "in_failed",
        status: type === "invoice.paid" ? "paid" : "open",
        customerId: "cus_learner",
        subscriptionId: "sub_invoice",
        priceId: "price_test_annual",
        metadata: { firebaseUid: "firebase-uid-123" },
      },
    })),
  ];

  for (const [index, fixture] of cases.entries()) {
    const normalized = constructSignedWebhook(gateway, {
      id: `evt_webhook_${index}`,
      object: "event",
      type: fixture.type,
      created: 1_800_000_000 + index,
      livemode: false,
      data: {
        object: fixture.object,
        previous_attributes: { arbitrary: privateProviderText },
      },
      request: { id: privateProviderText },
    });
    assert.deepEqual(normalized, {
      id: `evt_webhook_${index}`,
      type: fixture.type,
      created: 1_800_000_000 + index,
      livemode: false,
      object: fixture.expectedObject,
    });
    const serialized = JSON.stringify(normalized);
    assert.equal(serialized.includes(CUSTOMER_EMAIL), false);
    assert.equal(serialized.includes(privateProviderText), false);
    assert.equal(serialized.includes("checkout.stripe.com"), false);
    assert.equal(serialized.includes("previous_attributes"), false);
  }
});

test("webhook construction rejects unsupported types and malformed lifecycle objects", () => {
  const gateway = createStripeGateway({ secretKey: SECRET_KEY, fetchImpl: async () => {} });
  const malformedEvents = [
    {
      id: "evt_unsupported",
      object: "event",
      type: "charge.succeeded",
      created: 1_800_000_000,
      livemode: false,
      data: { object: { id: "ch_private", object: "charge" } },
    },
    {
      id: "not_an_event",
      object: "event",
      type: "checkout.session.completed",
      created: 1_800_000_000,
      livemode: false,
      data: { object: { id: "cs_test_bad", object: "checkout.session" } },
    },
    {
      id: "evt_missing_subscription",
      object: "event",
      type: "invoice.paid",
      created: 1_800_000_000,
      livemode: false,
      data: {
        object: {
          id: "in_missing_subscription",
          object: "invoice",
          status: "paid",
          customer: "cus_learner",
        },
      },
    },
    {
      id: "evt_wrong_object",
      object: "event",
      type: "customer.subscription.updated",
      created: 1_800_000_000,
      livemode: false,
      data: { object: { id: "cs_test_wrong", object: "checkout.session" } },
    },
  ];

  for (const event of malformedEvents) {
    assert.throws(
      () => constructSignedWebhook(gateway, event),
      (error) => {
        assert.equal(error.code, "BILLING_WEBHOOK_EVENT_INVALID");
        assert.match(error.message, /event is invalid/i);
        assert.equal(error.message.includes(JSON.stringify(event)), false);
        return true;
      },
    );
  }
});

test("Stripe failures and webhook signature failures are always redacted", async () => {
  const privateResponseBody = `declined ${CUSTOMER_EMAIL} ${WEBHOOK_SECRET} https://checkout.stripe.com/private`;
  const fake = createFakeFetch([
    {
      status: 402,
      body: {
        error: {
          type: "card_error",
          code: "card_declined",
          message: privateResponseBody,
        },
      },
    },
  ]);
  const gateway = createStripeGateway({ secretKey: SECRET_KEY, fetchImpl: fake.fetchImpl });

  await assert.rejects(
    gateway.findOrCreateCustomer({
      uid: "firebase-uid-123",
      storedCustomerId: "cus_private",
      operationAttempt: "attempt-11",
    }),
    (error) => {
      for (const privateValue of [
        SECRET_KEY,
        WEBHOOK_SECRET,
        CUSTOMER_EMAIL,
        privateResponseBody,
        "https://checkout.stripe.com/private",
      ]) {
        assert.equal(error.message.includes(privateValue), false);
      }
      assert.match(error.message, /provider request failed/i);
      return true;
    },
  );

  assert.throws(
    () =>
      gateway.constructWebhookEvent(
        Buffer.from(`private payload ${CUSTOMER_EMAIL}`),
        "invalid signature private response body",
        WEBHOOK_SECRET,
      ),
    (error) => {
      assert.match(error.message, /signature verification failed/i);
      assert.equal(error.message.includes(CUSTOMER_EMAIL), false);
      assert.equal(error.message.includes(WEBHOOK_SECRET), false);
      return true;
    },
  );
});
