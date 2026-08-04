import assert from "node:assert/strict";
import test from "node:test";

import { BILLING_PLANS } from "../server/billingConfig.mjs";
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
  assert.equal(requestParameters(fake.calls[0]).get("limit"), "1");
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
    "customer:firebase-uid-123:attempt-3",
  );
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
