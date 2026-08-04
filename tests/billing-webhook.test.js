import assert from "node:assert/strict";
import { Readable } from "node:stream";
import test from "node:test";

import { createBillingWebhook } from "../server/billingWebhook.mjs";

const UID = "firebase-uid-123";
const WEBHOOK_SECRET = "whsec_private_webhook_secret";
const PRIVATE_VALUES = [
  "private.learner@example.com",
  WEBHOOK_SECRET,
  "https://checkout.stripe.com/private",
  "private-metadata-value",
  "Stripe-Signature: private-signature",
];

const CONFIG = Object.freeze({
  configured: true,
  livemode: false,
  webhookSecret: WEBHOOK_SECRET,
  plans: Object.freeze({
    monthly: Object.freeze({ key: "monthly", priceId: "price_test_monthly" }),
    annual: Object.freeze({ key: "annual", priceId: "price_test_annual" }),
  }),
});

function request({
  method = "POST",
  chunks = [Buffer.from("raw webhook bytes")],
  headers = { "stripe-signature": "t=123,v1=private-signature" },
} = {}) {
  let iterations = 0;
  const source = Readable.from((async function* body() {
    iterations += 1;
    for (const chunk of chunks) yield chunk;
  })());
  source.method = method;
  source.headers = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
  );
  source.iterations = () => iterations;
  return source;
}

function response() {
  return {
    status: null,
    headers: null,
    chunks: [],
    writeHead(status, headers) {
      this.status = status;
      this.headers = headers;
      return this;
    },
    end(chunk = "") {
      this.chunks.push(Buffer.from(chunk));
    },
    json() {
      return JSON.parse(Buffer.concat(this.chunks).toString("utf8"));
    },
  };
}

const event = (overrides = {}) => ({
  id: "evt_current",
  type: "customer.subscription.updated",
  created: 1_800_000_000,
  livemode: false,
  object: {
    kind: "subscription",
    id: "sub_current",
    status: "active",
    customerId: "cus_server_bound",
    subscriptionId: "sub_current",
    priceId: "price_test_monthly",
    metadata: { firebaseUid: UID },
  },
  ...overrides,
});

const subscription = (overrides = {}) => ({
  id: "sub_current",
  customerId: "cus_server_bound",
  created: 1_799_000_000,
  status: "active",
  priceId: "price_test_monthly",
  livemode: false,
  cancelAtPeriodEnd: false,
  currentPeriodEnd: 1_800_086_400,
  trialEnd: 1_800_043_200,
  ...overrides,
});

function record(overrides = {}) {
  return {
    uid: UID,
    customerId: "cus_server_bound",
    subscriptionId: null,
    plan: null,
    status: "none",
    trialUsedAt: null,
    trialEndsAt: null,
    currentPeriodEndsAt: null,
    cancelAtPeriodEnd: false,
    lastEventCreated: null,
    lastEventId: null,
    updatedAt: "2026-08-03T12:00:00.000Z",
    ...overrides,
  };
}

function createHarness(overrides = {}) {
  const calls = {
    construct: [],
    getByCustomerId: [],
    retrieveSubscription: [],
    cancelSubscription: [],
    applySubscriptionSnapshot: [],
    recordProcessedEvent: [],
    logs: [],
  };
  let currentRecord = overrides.record === undefined ? record() : overrides.record;
  const normalizedEvent = overrides.event || event();
  const gateway = {
    constructWebhookEvent(rawBody, signature, secret) {
      calls.construct.push({ rawBody, signature, secret });
      if (overrides.constructWebhookEvent) {
        return overrides.constructWebhookEvent(rawBody, signature, secret);
      }
      return normalizedEvent;
    },
    async retrieveSubscription(subscriptionId) {
      calls.retrieveSubscription.push(subscriptionId);
      if (overrides.subscriptions?.[subscriptionId]) {
        return overrides.subscriptions[subscriptionId];
      }
      return overrides.subscription || subscription();
    },
    async cancelSubscription(input) {
      calls.cancelSubscription.push(input);
      return subscription({ id: input.subscriptionId, status: "canceled" });
    },
    ...overrides.gateway,
  };
  const store = {
    async getByCustomerId(customerId) {
      calls.getByCustomerId.push(customerId);
      return currentRecord;
    },
    async applySubscriptionSnapshot(snapshot) {
      calls.applySubscriptionSnapshot.push(snapshot);
      return overrides.applyResult || { applied: true, reason: "updated" };
    },
    async recordProcessedEvent(input) {
      calls.recordProcessedEvent.push(input);
      return overrides.recordResult || { recorded: true, reason: "recorded" };
    },
    ...overrides.store,
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
    ...overrides.logger,
  };
  return {
    calls,
    webhook: createBillingWebhook({
      config: overrides.config || CONFIG,
      store,
      gateway,
      logger,
    }),
    setRecord(value) {
      currentRecord = value;
    },
  };
}

async function invoke(webhook, requestValue = request()) {
  const responseValue = response();
  await webhook.handle(requestValue, responseValue);
  return { request: requestValue, response: responseValue };
}

function assertSafeJson(responseValue, status, code) {
  assert.equal(responseValue.status, status);
  assert.equal(responseValue.headers["Cache-Control"], "no-store");
  assert.equal(responseValue.headers["X-Content-Type-Options"], "nosniff");
  const payload = responseValue.json();
  assert.equal(payload.error?.code || payload.received, code);
  for (const privateValue of PRIVATE_VALUES) {
    assert.equal(JSON.stringify(payload).includes(privateValue), false);
  }
}

test("POST verification receives the exact raw bytes, signature, and secret after one stream read", async () => {
  const chunks = [Buffer.from([0, 255, 1]), Buffer.from("{not-json}")];
  const requestValue = request({ chunks });
  const { webhook, calls } = createHarness({
    event: event({ type: "charge.succeeded", object: null }),
  });

  const result = await invoke(webhook, requestValue);

  assert.equal(result.request.iterations(), 1);
  assert.equal(calls.construct.length, 1);
  assert.deepEqual(calls.construct[0].rawBody, Buffer.concat(chunks));
  assert.equal(calls.construct[0].signature, "t=123,v1=private-signature");
  assert.equal(calls.construct[0].secret, WEBHOOK_SECRET);
  assertSafeJson(result.response, 200, true);
});

test("non-POST requests are rejected without consuming the webhook body", async () => {
  const requestValue = request({ method: "GET" });
  const { webhook, calls } = createHarness();

  const result = await invoke(webhook, requestValue);

  assert.equal(requestValue.iterations(), 0);
  assert.equal(calls.construct.length, 0);
  assert.equal(result.response.status, 405);
  assert.equal(result.response.headers.Allow, "POST");
});

test("missing, repeated, or blank Stripe signatures fail before gateway verification", async () => {
  for (const headers of [
    {},
    { "stripe-signature": "" },
    { "stripe-signature": ["first", "second"] },
  ]) {
    const { webhook, calls } = createHarness();
    const result = await invoke(webhook, request({ headers }));
    assertSafeJson(result.response, 400, "BILLING_WEBHOOK_INVALID");
    assert.equal(calls.construct.length, 0);
  }
});

test("signature, event-shape, and livemode failures return one redacted client error", async () => {
  const failures = [
    Object.assign(new Error(`invalid ${PRIVATE_VALUES.join(" ")}`), {
      code: "BILLING_WEBHOOK_SIGNATURE_INVALID",
    }),
    Object.assign(new Error(`malformed ${PRIVATE_VALUES.join(" ")}`), {
      code: "BILLING_WEBHOOK_EVENT_INVALID",
    }),
  ];
  for (const failure of failures) {
    const { webhook, calls } = createHarness({
      constructWebhookEvent() {
        throw failure;
      },
    });
    const result = await invoke(webhook);
    assertSafeJson(result.response, 400, "BILLING_WEBHOOK_INVALID");
    const serializedLogs = JSON.stringify(calls.logs);
    for (const privateValue of PRIVATE_VALUES) {
      assert.equal(serializedLogs.includes(privateValue), false);
    }
  }

  const { webhook, calls } = createHarness({
    event: event({ livemode: true }),
  });
  const result = await invoke(webhook);
  assertSafeJson(result.response, 400, "BILLING_WEBHOOK_INVALID");
  assert.equal(calls.retrieveSubscription.length, 0);
});

test("actual and declared bodies over 256 KiB are rejected before verification", async () => {
  const oversize = Buffer.alloc(256 * 1024 + 1, 97);
  for (const requestValue of [
    request({ chunks: [oversize] }),
    request({
      chunks: [Buffer.from("small")],
      headers: {
        "stripe-signature": "t=123,v1=private-signature",
        "content-length": String(oversize.byteLength),
      },
    }),
  ]) {
    const { webhook, calls } = createHarness();
    const result = await invoke(webhook, requestValue);
    assertSafeJson(result.response, 413, "PAYLOAD_TOO_LARGE");
    assert.equal(calls.construct.length, 0);
  }
});

test("verified irrelevant and duplicate events return 200 so Stripe will not retry", async () => {
  const irrelevant = createHarness({
    event: event({ id: "evt_irrelevant", type: "charge.succeeded", object: null }),
    recordResult: { recorded: false, reason: "duplicate" },
  });
  const irrelevantResult = await invoke(irrelevant.webhook);
  assertSafeJson(irrelevantResult.response, 200, true);
  assert.deepEqual(irrelevant.calls.recordProcessedEvent, [
    { eventId: "evt_irrelevant", created: 1_800_000_000 },
  ]);

  const duplicate = createHarness({
    applyResult: { applied: false, reason: "duplicate" },
  });
  const duplicateResult = await invoke(duplicate.webhook);
  assertSafeJson(duplicateResult.response, 200, true);
  assert.equal(duplicate.calls.applySubscriptionSnapshot.length, 1);
});

test("every access-changing lifecycle retrieves and persists one authoritative snapshot", async () => {
  const cases = [
    ["checkout.session.completed", "checkout.session", "cs_completed", false],
    ["customer.subscription.created", "subscription", "sub_current", false],
    ["customer.subscription.updated", "subscription", "sub_current", false],
    ["customer.subscription.deleted", "subscription", "sub_current", true],
    ["invoice.paid", "invoice", "in_paid", false],
    ["invoice.payment_failed", "invoice", "in_failed", false],
  ];

  for (const [type, kind, objectId, deleted] of cases) {
    const normalizedEvent = event({
      id: `evt_${objectId}`,
      type,
      object: {
        ...event().object,
        kind,
        id: objectId,
      },
    });
    const { webhook, calls } = createHarness({ event: normalizedEvent });
    const result = await invoke(webhook);

    assertSafeJson(result.response, 200, true);
    assert.deepEqual(calls.retrieveSubscription, ["sub_current"], type);
    assert.deepEqual(calls.applySubscriptionSnapshot, [
      {
        eventId: `evt_${objectId}`,
        created: 1_800_000_000,
        uid: UID,
        customerId: "cus_server_bound",
        subscriptionId: "sub_current",
        plan: "monthly",
        status: "active",
        deleted,
        cancelAtPeriodEnd: false,
        trialEndsAt: "2027-01-15T20:00:00.000Z",
        currentPeriodEndsAt: "2027-01-16T08:00:00.000Z",
      },
    ], type);
  }
});

test("identity is resolved from the bound customer before matching event UID metadata", async () => {
  const cases = [
    { name: "unknown customer", record: null },
    { name: "conflicting metadata", event: event({ object: {
      ...event().object,
      metadata: { firebaseUid: "attacker-uid" },
    } }) },
    { name: "missing metadata", event: event({ object: {
      ...event().object,
      metadata: { firebaseUid: null },
    } }) },
    { name: "authoritative customer mismatch", subscription: subscription({
      customerId: "cus_different",
    }) },
  ];

  for (const fixture of cases) {
    const { webhook, calls } = createHarness(fixture);
    const result = await invoke(webhook);
    assertSafeJson(result.response, 400, "BILLING_WEBHOOK_INVALID");
    assert.equal(calls.applySubscriptionSnapshot.length, 0, fixture.name);
  }
});

test("server-bound identity is read before event UID metadata and metadata is snapshotted once", async () => {
  const order = [];
  const metadata = {};
  Object.defineProperty(metadata, "firebaseUid", {
    enumerable: true,
    get() {
      order.push("metadata");
      return UID;
    },
  });
  const normalizedEvent = event({
    object: { ...event().object, metadata },
  });
  const { webhook } = createHarness({
    event: normalizedEvent,
    store: {
      async getByCustomerId() {
        order.push("store");
        return record();
      },
    },
  });

  const result = await invoke(webhook);

  assertSafeJson(result.response, 200, true);
  assert.deepEqual(order, ["store", "metadata"]);
});

test("an authoritative subscription Price must map through the configured allowlist", async () => {
  const { webhook, calls } = createHarness({
    subscription: subscription({ priceId: "price_test_attacker_selected" }),
  });
  const result = await invoke(webhook);

  assertSafeJson(result.response, 400, "BILLING_WEBHOOK_INVALID");
  assert.equal(calls.applySubscriptionSnapshot.length, 0);
});

test("trial_will_end is observability-only and cannot alter access", async () => {
  const { webhook, calls } = createHarness({
    event: event({ type: "customer.subscription.trial_will_end" }),
  });
  const result = await invoke(webhook);

  assertSafeJson(result.response, 200, true);
  assert.equal(calls.retrieveSubscription.length, 0);
  assert.equal(calls.applySubscriptionSnapshot.length, 0);
  assert.deepEqual(calls.recordProcessedEvent, [
    { eventId: "evt_current", created: 1_800_000_000 },
  ]);
  assert.deepEqual(calls.logs, [["info", "BILLING_TRIAL_WILL_END"]]);
});

test("a later duplicate subscription is canceled and can never grant access", async () => {
  const { webhook, calls } = createHarness({
    record: record({
      subscriptionId: "sub_earliest",
      plan: "monthly",
      status: "trialing",
      lastEventCreated: 1_799_999_000,
      lastEventId: "evt_earliest",
    }),
    event: event({
      id: "evt_later_duplicate",
      created: 1_799_000_000,
      object: { ...event().object, subscriptionId: "sub_later", id: "sub_later" },
    }),
    subscriptions: {
      sub_later: subscription({ id: "sub_later", created: 1_800_000_000, status: "trialing" }),
      sub_earliest: subscription({ id: "sub_earliest", created: 1_700_000_000, status: "trialing" }),
    },
  });
  const result = await invoke(webhook);

  assertSafeJson(result.response, 200, true);
  assert.deepEqual(calls.cancelSubscription, [
    {
      uid: UID,
      subscriptionId: "sub_later",
      operationAttempt: "evt_later_duplicate",
    },
  ]);
  assert.equal(calls.applySubscriptionSnapshot.length, 0);
  assert.deepEqual(calls.recordProcessedEvent, [
    { eventId: "evt_later_duplicate", created: 1_799_000_000 },
  ]);
  assert.deepEqual(calls.logs, [["warn", "BILLING_DUPLICATE_SUBSCRIPTION"]]);
});

test("an earlier subscription arriving out of order replaces and cancels the later duplicate", async () => {
  const { webhook, calls } = createHarness({
    record: record({
      subscriptionId: "sub_later",
      plan: "annual",
      status: "active",
      lastEventCreated: 1_800_000_500,
      lastEventId: "evt_later",
    }),
    event: event({
      id: "evt_earlier",
      created: 1_900_000_000,
      object: { ...event().object, subscriptionId: "sub_earlier", id: "sub_earlier" },
    }),
    subscriptions: {
      sub_earlier: subscription({ id: "sub_earlier", created: 1_700_000_000, status: "trialing" }),
      sub_later: subscription({ id: "sub_later", created: 1_800_000_000, status: "active" }),
    },
  });
  const result = await invoke(webhook);

  assertSafeJson(result.response, 200, true);
  assert.deepEqual(calls.cancelSubscription, [
    { uid: UID, subscriptionId: "sub_later", operationAttempt: "evt_earlier" },
  ]);
  assert.equal(calls.applySubscriptionSnapshot.length, 1);
  assert.equal(calls.applySubscriptionSnapshot[0].subscriptionId, "sub_earlier");
});

test("error logs contain only stable codes even when dependencies throw private details", async () => {
  const { webhook, calls } = createHarness({
    gateway: {
      async retrieveSubscription() {
        throw new Error(PRIVATE_VALUES.join(" "));
      },
    },
  });
  const result = await invoke(webhook);

  assert.equal(result.response.status, 500);
  assert.deepEqual(calls.logs, [["error", "BILLING_WEBHOOK_FAILED"]]);
  const serialized = JSON.stringify({ response: result.response.json(), logs: calls.logs });
  for (const privateValue of PRIVATE_VALUES) {
    assert.equal(serialized.includes(privateValue), false);
  }
});
