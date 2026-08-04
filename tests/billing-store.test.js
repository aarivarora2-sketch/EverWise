import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import {
  access,
  chmod,
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { createBillingStore } from "../server/billingStore.mjs";

const billingStoreUrl = new URL("../server/billingStore.mjs", import.meta.url).href;
const START = Date.parse("2026-08-03T12:00:00.000Z");
const RECORD_KEYS = [
  "cancelAtPeriodEnd",
  "customerId",
  "currentPeriodEndsAt",
  "lastEventCreated",
  "lastEventId",
  "plan",
  "status",
  "subscriptionId",
  "trialEndsAt",
  "trialUsedAt",
  "uid",
  "updatedAt",
].sort();

async function setupStore(t, { nested = false, fsImpl } = {}) {
  const root = await mkdtemp(join(tmpdir(), "everwise-billing-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  let timestamp = START;
  const filePath = nested ? join(root, "private", "billing.json") : join(root, "billing.json");
  if (nested) await mkdir(dirname(filePath), { mode: 0o750 });
  const store = createBillingStore({
    filePath,
    now: () => new Date(timestamp),
    fsImpl,
  });
  return {
    root,
    filePath,
    store,
    advance(milliseconds) {
      timestamp += milliseconds;
    },
  };
}

function subscriptionSnapshot(overrides = {}) {
  return {
    uid: "uid-1",
    customerId: "cus_one",
    subscriptionId: "sub_one",
    plan: "monthly",
    status: "active",
    trialEndsAt: null,
    currentPeriodEndsAt: "2026-09-03T12:00:00.000Z",
    cancelAtPeriodEnd: false,
    eventId: "evt_0001",
    created: 1,
    ...overrides,
  };
}

async function bind(store, uid = "uid-1", customerId = "cus_one") {
  return store.bindCustomer({ uid, customerId });
}

async function expectStoreError(operation, code) {
  await assert.rejects(operation, (error) => {
    assert.equal(error.name, "BillingStoreError");
    assert.equal(error.code, code);
    assert.doesNotMatch(error.message, /secret|email|card|stripe response/i);
    return true;
  });
}

function childResult(child) {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal, stdout, stderr }));
  });
}

async function waitForPath(path, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await access(path);
      return;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  assert.fail(`Timed out waiting for ${path}`);
}

test("missing storage is unhealthy and the first customer binding creates strict schema v1", async (t) => {
  const { filePath, store } = await setupStore(t, { nested: true });

  assert.deepEqual(await store.health(), { configured: false, healthy: false });
  await expectStoreError(() => store.getByUid("uid-1"), "BILLING_STORE_NOT_CONFIGURED");

  const record = await bind(store);
  assert.deepEqual(record, {
    uid: "uid-1",
    customerId: "cus_one",
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
    access: "none",
  });
  const disk = JSON.parse(await readFile(filePath, "utf8"));
  assert.deepEqual(Object.keys(disk).sort(), ["learners", "processedEvents", "version"]);
  assert.equal(disk.version, 1);
  assert.deepEqual(Object.keys(disk.learners["uid-1"]).sort(), RECORD_KEYS);
  assert.deepEqual(disk.processedEvents, []);
  assert.equal(Object.hasOwn(disk.learners["uid-1"], "access"), false);
  assert.deepEqual(await store.health(), { configured: true, healthy: true });
});

test("the default store path is optional and remains fail-closed when absent", async () => {
  const store = createBillingStore();
  assert.deepEqual(await store.health(), { configured: false, healthy: false });
});

test("subscription reconciliation revokes a loser before replacing it with the authoritative winner", async (t) => {
  const { store } = await setupStore(t);
  await bind(store);
  await store.applySubscriptionSnapshot(subscriptionSnapshot({
    subscriptionId: "sub_later",
    eventId: "evt_later",
    created: 200,
  }));

  assert.deepEqual(
    await store.beginSubscriptionReconciliation({
      uid: "uid-1",
      customerId: "cus_one",
      expectedSubscriptionId: "sub_later",
      eventId: "evt_earlier",
    }),
    { held: true, reason: "held" },
  );
  assert.equal((await store.getByUid("uid-1")).access, "none");

  const earlier = subscriptionSnapshot({
    subscriptionId: "sub_earlier",
    eventId: "evt_earlier",
    created: 100,
  });
  assert.deepEqual(
    await store.reconcileSubscriptionSnapshot({
      expectedSubscriptionId: "sub_later",
      snapshot: earlier,
    }),
    { applied: true, reason: "reconciled" },
  );
  const winner = await store.getByUid("uid-1");
  assert.equal(winner.subscriptionId, "sub_earlier");
  assert.equal(winner.status, "active");
  assert.equal(winner.access, "full");
  assert.equal(winner.lastEventCreated, 200);
  assert.equal(winner.lastEventId, "evt_later");

  assert.deepEqual(
    await store.reconcileSubscriptionSnapshot({
      expectedSubscriptionId: "sub_later",
      snapshot: earlier,
    }),
    { applied: false, reason: "duplicate" },
  );
  assert.deepEqual(await store.getByUid("uid-1"), winner);

  assert.deepEqual(
    await store.applySubscriptionSnapshot(subscriptionSnapshot({
      subscriptionId: "sub_attacker",
      eventId: "evt_stale",
      created: 150,
    })),
    { applied: false, reason: "stale" },
  );
  assert.equal((await store.getByUid("uid-1")).subscriptionId, "sub_earlier");
});

test("subscription reconciliation uses a compare-and-set boundary", async (t) => {
  const { store } = await setupStore(t);
  await bind(store);
  await store.applySubscriptionSnapshot(subscriptionSnapshot({
    subscriptionId: "sub_current",
  }));

  await expectStoreError(
    () => store.beginSubscriptionReconciliation({
      uid: "uid-1",
      customerId: "cus_one",
      expectedSubscriptionId: "sub_other",
      eventId: "evt_reconcile",
    }),
    "BILLING_STORE_RECONCILIATION_CONFLICT",
  );
  assert.equal((await store.getByUid("uid-1")).access, "full");
});

test("pending first-trial Checkout reservation is minimal, durable, and first-writer-wins", async (t) => {
  const { filePath, store, advance } = await setupStore(t);
  await bind(store);

  const first = await store.reservePendingTrialCheckout({
    uid: "uid-1",
    plan: "monthly",
    attemptId: "trial_attempt_monthly_1",
    checkoutUrl: "https://checkout.stripe.com/must-not-persist",
    email: "private@example.com",
    providerObject: { secret: "sk_test_must_not_persist" },
  });
  assert.deepEqual(first, {
    plan: "monthly",
    attemptId: "trial_attempt_monthly_1",
    sessionId: null,
    reservedAt: "2026-08-03T12:00:00.000Z",
    expiresAt: null,
  });

  advance(60_000);
  assert.deepEqual(
    await store.reservePendingTrialCheckout({
      uid: "uid-1",
      plan: "annual",
      attemptId: "trial_attempt_annual_2",
    }),
    first,
  );
  assert.deepEqual(await store.getPendingTrialCheckout("uid-1"), first);

  const diskText = await readFile(filePath, "utf8");
  assert.doesNotMatch(
    diskText,
    /checkout\.stripe|private@example|sk_test|providerObject|checkoutUrl/i,
  );
  const pending = JSON.parse(diskText).learners["uid-1"].pendingTrialCheckout;
  assert.deepEqual(Object.keys(pending).sort(), [
    "attemptId",
    "expiresAt",
    "plan",
    "reservedAt",
    "sessionId",
  ]);
});

test("authoritative trial use atomically refuses a later first-trial reservation", async (t) => {
  const { filePath, store } = await setupStore(t);

  for (const [index, status] of ["trialing", "active"].entries()) {
    const uid = `uid-trial-used-${index}`;
    const customerId = `cus_trial_used_${index}`;
    await bind(store, uid, customerId);
    assert.deepEqual(
      await store.applySubscriptionSnapshot(subscriptionSnapshot({
        uid,
        customerId,
        subscriptionId: `sub_trial_used_${index}`,
        status,
        trialEndsAt: "2026-08-06T12:00:00.000Z",
        eventId: `evt_trial_used_${index}`,
        created: index + 1,
      })),
      { applied: true, reason: "updated" },
    );

    assert.deepEqual(
      await store.reservePendingTrialCheckout({
        uid,
        plan: "monthly",
        attemptId: `attempt_after_trial_${index}`,
      }),
      { reserved: false, reason: "trial-used" },
    );
    assert.equal(await store.getPendingTrialCheckout(uid), null);
  }

  const disk = JSON.parse(await readFile(filePath, "utf8"));
  for (const uid of ["uid-trial-used-0", "uid-trial-used-1"]) {
    assert.equal(Object.hasOwn(disk.learners[uid], "pendingTrialCheckout"), false);
    assert.equal(typeof disk.learners[uid].trialUsedAt, "string");
  }
});

test("authoritative trial use clears a pending Checkout in the same locked snapshot write", async (t) => {
  const { filePath, store } = await setupStore(t);
  await bind(store);
  await store.reservePendingTrialCheckout({
    uid: "uid-1",
    plan: "annual",
    attemptId: "attempt_before_webhook",
  });

  assert.deepEqual(
    await store.applySubscriptionSnapshot(subscriptionSnapshot({
      status: "trialing",
      trialEndsAt: "2026-08-10T12:00:00.000Z",
    })),
    { applied: true, reason: "updated" },
  );
  assert.equal(await store.getPendingTrialCheckout("uid-1"), null);
  await expectStoreError(
    () => store.attachPendingTrialCheckout({
      uid: "uid-1",
      attemptId: "attempt_before_webhook",
      sessionId: "cs_created_during_webhook",
      expiresAt: "2026-08-03T13:00:00.000Z",
    }),
    "BILLING_STORE_RESERVATION_CONFLICT",
  );

  const persisted = JSON.parse(await readFile(filePath, "utf8")).learners["uid-1"];
  assert.equal(Object.hasOwn(persisted, "pendingTrialCheckout"), false);
  assert.equal(persisted.trialUsedAt, "2026-08-03T12:00:00.000Z");
});

test("pending Checkout attach and clear require the owning UID and exact attempt", async (t) => {
  const { store } = await setupStore(t);
  await bind(store);
  await store.reservePendingTrialCheckout({
    uid: "uid-1",
    plan: "monthly",
    attemptId: "trial_attempt_1",
  });

  const attached = await store.attachPendingTrialCheckout({
    uid: "uid-1",
    attemptId: "trial_attempt_1",
    sessionId: "cs_pending_1",
    expiresAt: "2026-08-03T13:00:00.000Z",
    url: "https://checkout.stripe.com/must-not-persist",
  });
  assert.deepEqual(attached, {
    plan: "monthly",
    attemptId: "trial_attempt_1",
    sessionId: "cs_pending_1",
    reservedAt: "2026-08-03T12:00:00.000Z",
    expiresAt: "2026-08-03T13:00:00.000Z",
  });
  assert.deepEqual(
    await store.attachPendingTrialCheckout({
      uid: "uid-1",
      attemptId: "trial_attempt_1",
      sessionId: "cs_pending_1",
      expiresAt: "2026-08-03T13:00:00.000Z",
    }),
    attached,
  );

  await expectStoreError(
    () => store.attachPendingTrialCheckout({
      uid: "uid-1",
      attemptId: "different_attempt",
      sessionId: "cs_pending_2",
      expiresAt: "2026-08-03T13:30:00.000Z",
    }),
    "BILLING_STORE_RESERVATION_CONFLICT",
  );
  await expectStoreError(
    () => store.clearPendingTrialCheckout({ uid: "uid-1", attemptId: "different_attempt" }),
    "BILLING_STORE_RESERVATION_CONFLICT",
  );
  assert.deepEqual(
    await store.clearPendingTrialCheckout({ uid: "uid-1", attemptId: "trial_attempt_1" }),
    { cleared: true },
  );
  assert.equal(await store.getPendingTrialCheckout("uid-1"), null);
  assert.deepEqual(
    await store.clearPendingTrialCheckout({ uid: "uid-1", attemptId: "trial_attempt_1" }),
    { cleared: false },
  );
});

test("pending Checkout inputs and persisted shape are strict and fail closed", async (t) => {
  const setup = await setupStore(t);
  await bind(setup.store);

  for (const input of [
    { uid: "uid-1", plan: "weekly", attemptId: "attempt_1" },
    { uid: "uid-1", plan: "monthly", attemptId: "" },
    { uid: "uid-1", plan: "monthly", attemptId: "x".repeat(65) },
  ]) {
    await expectStoreError(
      () => setup.store.reservePendingTrialCheckout(input),
      "BILLING_STORE_INVALID_INPUT",
    );
  }

  await setup.store.reservePendingTrialCheckout({
    uid: "uid-1",
    plan: "monthly",
    attemptId: "attempt_1",
  });
  for (const input of [
    { sessionId: "sub_wrong", expiresAt: "2026-08-03T13:00:00.000Z" },
    { sessionId: "cs_valid", expiresAt: "not-a-date" },
    { sessionId: "cs_valid", expiresAt: "2026-08-03T11:00:00.000Z" },
  ]) {
    await expectStoreError(
      () => setup.store.attachPendingTrialCheckout({
        uid: "uid-1",
        attemptId: "attempt_1",
        ...input,
      }),
      "BILLING_STORE_INVALID_INPUT",
    );
  }

  const disk = JSON.parse(await readFile(setup.filePath, "utf8"));
  disk.learners["uid-1"].pendingTrialCheckout.expiresAt =
    "2026-08-03T13:00:00.000Z";
  await writeFile(setup.filePath, JSON.stringify(disk), { mode: 0o600 });
  assert.deepEqual(await setup.store.health(), { configured: true, healthy: false });
});

test("independent store instances atomically converge on one pending attempt", async (t) => {
  const { filePath, store: firstStore } = await setupStore(t);
  await bind(firstStore);
  const secondStore = createBillingStore({
    filePath,
    now: () => new Date(START + 1_000),
  });

  const [first, second] = await Promise.all([
    firstStore.reservePendingTrialCheckout({
      uid: "uid-1",
      plan: "monthly",
      attemptId: "attempt_from_api_1",
    }),
    secondStore.reservePendingTrialCheckout({
      uid: "uid-1",
      plan: "annual",
      attemptId: "attempt_from_api_2",
    }),
  ]);

  assert.deepEqual(first, second);
  assert.equal(
    ["attempt_from_api_1", "attempt_from_api_2"].includes(first.attemptId),
    true,
  );
  assert.deepEqual(await firstStore.getPendingTrialCheckout("uid-1"), first);
  assert.deepEqual(await secondStore.getPendingTrialCheckout("uid-1"), first);
});

test("prototype-like UIDs support the pending Checkout lifecycle", async (t) => {
  const { store } = await setupStore(t);
  await bind(store, "__proto__", "cus_prototype_pending");
  const reservation = await store.reservePendingTrialCheckout({
    uid: "__proto__",
    plan: "annual",
    attemptId: "prototype_attempt",
  });
  assert.deepEqual(await store.getPendingTrialCheckout("__proto__"), reservation);
  await store.attachPendingTrialCheckout({
    uid: "__proto__",
    attemptId: "prototype_attempt",
    sessionId: "cs_prototype_pending",
    expiresAt: "2026-08-03T14:00:00.000Z",
  });
  assert.deepEqual(
    await store.clearPendingTrialCheckout({
      uid: "__proto__",
      attemptId: "prototype_attempt",
    }),
    { cleared: true },
  );
});

test("snapshots persist only allowlisted fields and normalize timestamps to UTC ISO", async (t) => {
  const { filePath, store } = await setupStore(t);
  await bind(store);

  await store.applySubscriptionSnapshot(subscriptionSnapshot({
    status: "trialing",
    trialEndsAt: Date.parse("2026-08-06T12:00:00.000Z") / 1000,
    currentPeriodEndsAt: "2026-09-03T08:00:00-04:00",
    paymentMethod: { card: "4242424242424242" },
    email: "learner@example.test",
    rawStripeObject: { secret: "sk_test_do_not_store" },
    checkoutUrl: "https://checkout.stripe.com/secret",
    firebaseToken: "firebase-token",
    providerResponseText: "decline details",
  }));

  const record = await store.getByUid("uid-1");
  assert.deepEqual(record, {
    uid: "uid-1",
    customerId: "cus_one",
    subscriptionId: "sub_one",
    plan: "monthly",
    status: "trialing",
    trialUsedAt: "2026-08-03T12:00:00.000Z",
    trialEndsAt: "2026-08-06T12:00:00.000Z",
    currentPeriodEndsAt: "2026-09-03T12:00:00.000Z",
    cancelAtPeriodEnd: false,
    lastEventCreated: 1,
    lastEventId: "evt_0001",
    updatedAt: "2026-08-03T12:00:00.000Z",
    access: "full",
  });
  assert.deepEqual(await store.getByCustomerId("cus_one"), record);
  const diskText = await readFile(filePath, "utf8");
  assert.doesNotMatch(
    diskText,
    /424242|learner@example|sk_test|checkout\.stripe|firebase-token|decline details|paymentMethod|rawStripe/i,
  );
  const disk = JSON.parse(diskText);
  assert.deepEqual(disk.processedEvents, [{ id: "evt_0001", created: 1 }]);
});

test("only trialing and active snapshots grant cached web access", async (t) => {
  const { store } = await setupStore(t);
  await bind(store);
  const expectations = [
    ["trialing", "full"],
    ["active", "full"],
    ["past_due", "none"],
    ["unpaid", "none"],
    ["incomplete", "none"],
    ["incomplete_expired", "none"],
    ["paused", "none"],
    ["canceled", "none"],
  ];

  for (const [index, [status, accessValue]] of expectations.entries()) {
    await store.applySubscriptionSnapshot(subscriptionSnapshot({
      status,
      plan: "annual",
      eventId: `evt_${String(index + 1).padStart(4, "0")}`,
      created: index + 1,
    }));
    assert.equal((await store.getByUid("uid-1")).access, accessValue);
  }
});

test("invalid plans, statuses, identifiers, and dates fail before changing storage", async (t) => {
  const { filePath, store } = await setupStore(t);
  await bind(store);
  const original = await readFile(filePath, "utf8");
  const invalid = [
    { plan: "lifetime" },
    { status: "enabled" },
    { customerId: "customer_one" },
    { subscriptionId: "subscription_one" },
    { eventId: "event_one" },
    { created: -1 },
    { trialEndsAt: "not-a-date" },
    { currentPeriodEndsAt: Number.NaN },
  ];
  for (const override of invalid) {
    await expectStoreError(
      () => store.applySubscriptionSnapshot(subscriptionSnapshot(override)),
      "BILLING_STORE_INVALID_INPUT",
    );
  }
  assert.equal(await readFile(filePath, "utf8"), original);
});

test("trial usage survives cancellation and deleted subscription snapshots", async (t) => {
  const { store, advance } = await setupStore(t);
  await bind(store);
  await store.applySubscriptionSnapshot(subscriptionSnapshot({
    status: "trialing",
    trialEndsAt: "2026-08-06T12:00:00.000Z",
  }));
  const usedAt = (await store.getByUid("uid-1")).trialUsedAt;
  advance(60_000);

  await store.applySubscriptionSnapshot(subscriptionSnapshot({
    status: "active",
    deleted: true,
    trialEndsAt: null,
    currentPeriodEndsAt: null,
    cancelAtPeriodEnd: false,
    eventId: "evt_0002",
    created: 2,
  }));

  const canceled = await store.getByUid("uid-1");
  assert.equal(canceled.status, "canceled");
  assert.equal(canceled.access, "none");
  assert.equal(canceled.trialUsedAt, usedAt);
  assert.equal(await store.hasUsedTrial("uid-1"), true);
  assert.equal(await store.hasUsedTrial("uid-never-bound"), false);
});

test("customer and subscription identifiers cannot bind to two UIDs", async (t) => {
  const { store } = await setupStore(t);
  await bind(store, "uid-1", "cus_one");
  await bind(store, "uid-2", "cus_two");

  await expectStoreError(
    () => bind(store, "uid-2", "cus_one"),
    "BILLING_STORE_IDENTITY_CONFLICT",
  );
  await store.applySubscriptionSnapshot(subscriptionSnapshot());
  await expectStoreError(
    () => store.applySubscriptionSnapshot(subscriptionSnapshot({
      uid: "uid-2",
      customerId: "cus_two",
      subscriptionId: "sub_one",
      eventId: "evt_0002",
      created: 2,
    })),
    "BILLING_STORE_IDENTITY_CONFLICT",
  );
});

test("duplicate events are exact no-ops", async (t) => {
  const { filePath, store } = await setupStore(t);
  await bind(store);
  assert.deepEqual(await store.applySubscriptionSnapshot(subscriptionSnapshot()), {
    applied: true,
    reason: "updated",
  });
  const original = await readFile(filePath, "utf8");

  assert.deepEqual(await store.applySubscriptionSnapshot(subscriptionSnapshot({
    status: "canceled",
    created: 999,
  })), {
    applied: false,
    reason: "duplicate",
  });
  assert.equal(await readFile(filePath, "utf8"), original);
  assert.deepEqual(await store.recordProcessedEvent({ eventId: "evt_0001", created: 1000 }), {
    recorded: false,
    reason: "duplicate",
  });
  assert.equal(await readFile(filePath, "utf8"), original);
});

test("older snapshots cannot overwrite newer state and equal times use event ID order", async (t) => {
  const { store } = await setupStore(t);
  await bind(store);
  await store.applySubscriptionSnapshot(subscriptionSnapshot({
    eventId: "evt_m",
    created: 20,
    status: "active",
  }));
  await store.applySubscriptionSnapshot(subscriptionSnapshot({
    eventId: "evt_z_old",
    created: 19,
    status: "canceled",
  }));
  await store.applySubscriptionSnapshot(subscriptionSnapshot({
    eventId: "evt_a",
    created: 20,
    status: "past_due",
  }));
  assert.equal((await store.getByUid("uid-1")).status, "active");

  assert.deepEqual(await store.applySubscriptionSnapshot(subscriptionSnapshot({
    eventId: "evt_z",
    created: 20,
    status: "past_due",
  })), {
    applied: true,
    reason: "updated",
  });
  const record = await store.getByUid("uid-1");
  assert.equal(record.status, "past_due");
  assert.equal(record.lastEventCreated, 20);
  assert.equal(record.lastEventId, "evt_z");
});

test("processed event history retains exactly the 2,000 newest ordered events", async (t) => {
  const { filePath, store } = await setupStore(t);
  const processedEvents = Array.from({ length: 2000 }, (_, index) => ({
    id: `evt_${String(index).padStart(4, "0")}`,
    created: index,
  }));
  await writeFile(filePath, `${JSON.stringify({ version: 1, learners: {}, processedEvents })}\n`, {
    mode: 0o600,
  });
  await chmod(dirname(filePath), 0o750);

  await store.recordProcessedEvent({ eventId: "evt_2000", created: 2000 });
  const disk = JSON.parse(await readFile(filePath, "utf8"));
  assert.equal(disk.processedEvents.length, 2000);
  assert.equal(disk.processedEvents[0].id, "evt_0001");
  assert.equal(disk.processedEvents.at(-1).id, "evt_2000");
  assert.equal(disk.processedEvents.some(({ id }) => id === "evt_0000"), false);
});

test("persisted schema is strict, canonical, unique, and fails closed", async (t) => {
  const corruptions = [
    (disk) => { disk.secret = "sk_test_leak"; },
    (disk) => { disk.learners["uid-1"].email = "learner@example.test"; },
    (disk) => { disk.learners["uid-1"].updatedAt = "2026-08-03T05:00:00-07:00"; },
    (disk) => { disk.learners["uid-1"].plan = "lifetime"; },
    (disk) => { disk.learners["uid-1"].status = "enabled"; },
    (disk) => {
      disk.learners["uid-2"] = { ...disk.learners["uid-1"], uid: "uid-2" };
    },
    (disk) => { disk.processedEvents.push({ ...disk.processedEvents[0] }); },
  ];

  for (const corrupt of corruptions) {
    const setup = await setupStore(t);
    await bind(setup.store);
    await setup.store.applySubscriptionSnapshot(subscriptionSnapshot());
    const disk = JSON.parse(await readFile(setup.filePath, "utf8"));
    corrupt(disk);
    await writeFile(setup.filePath, JSON.stringify(disk), { mode: 0o600 });
    assert.deepEqual(await setup.store.health(), { configured: true, healthy: false });
    const corruptText = await readFile(setup.filePath, "utf8");
    await expectStoreError(
      () => bind(setup.store, "uid-new", "cus_new"),
      "BILLING_STORE_CORRUPT",
    );
    assert.equal(await readFile(setup.filePath, "utf8"), corruptText);
  }
});

test("files, locks, backups, and parent directories keep restrictive permissions", async (t) => {
  const { filePath, store } = await setupStore(t, { nested: true });
  await bind(store);
  await store.applySubscriptionSnapshot(subscriptionSnapshot());

  assert.equal((await stat(dirname(filePath))).mode & 0o777, 0o750);
  assert.equal((await stat(filePath)).mode & 0o777, 0o600);
  assert.equal((await stat(`${filePath}.lock`)).mode & 0o777, 0o600);
  assert.equal((await stat(`${filePath}.backup`)).mode & 0o777, 0o600);
});

test("world-accessible file or parent permissions make storage unhealthy and block mutation", async (t) => {
  for (const target of ["file", "directory"]) {
    const { filePath, store } = await setupStore(t);
    await bind(store);
    const original = await readFile(filePath, "utf8");
    const path = target === "file" ? filePath : dirname(filePath);
    const unsafeMode = target === "file" ? 0o604 : 0o751;
    await chmod(path, unsafeMode);

    assert.deepEqual(await store.health(), { configured: true, healthy: false });
    await expectStoreError(
      () => bind(store, "uid-new", "cus_new"),
      "BILLING_STORE_CORRUPT",
    );
    assert.equal(await readFile(filePath, "utf8"), original);
    assert.equal((await stat(path)).mode & 0o777, unsafeMode);
  }
});

test("atomic persistence flushes a sibling temporary file before rename and syncs its directory", async (t) => {
  const events = [];
  const fsImpl = {
    async beforeAnchorCommand(command) {
      if (command.op === "writeNew") events.push(["write", command.name]);
      if (command.op === "rename") {
        events.push(["rename", command.source, command.destination]);
      }
      if (command.op === "syncDirectory") events.push(["directory-sync"]);
    },
    async afterAnchorCommand(command) {
      if (command.op === "writeNew") events.push(["file-sync", command.name]);
    },
  };
  const { store } = await setupStore(t, { nested: true, fsImpl });

  await bind(store);

  const temporaryWrite = events.findIndex(
    ([kind, name]) => kind === "write" && name.startsWith("billing.json.tmp-"),
  );
  const temporarySync = events.findIndex(
    ([kind, name]) => kind === "file-sync" && name.startsWith("billing.json.tmp-"),
  );
  const primaryRename = events.findIndex(
    ([kind, source, destination]) => kind === "rename" &&
      source.startsWith("billing.json.tmp-") && destination === "billing.json",
  );
  const directorySync = events.findIndex(
    ([kind]) => kind === "directory-sync",
  );
  assert.ok(temporaryWrite >= 0);
  assert.ok(temporaryWrite < temporarySync);
  assert.ok(temporarySync < primaryRename);
  assert.ok(primaryRename < directorySync);
});

test("a failed primary rename preserves the old file and its recoverable backup", async (t) => {
  let filePath;
  let rejectPrimaryRename = false;
  const fsImpl = {
    async beforeAnchorCommand(command) {
      if (
        rejectPrimaryRename &&
        command.op === "rename" &&
        command.destination === "billing.json" &&
        command.source.startsWith("billing.json.tmp-")
      ) {
        throw new Error("injected rename failure");
      }
    },
  };
  const setup = await setupStore(t, { fsImpl });
  filePath = setup.filePath;
  await bind(setup.store);
  const original = await readFile(filePath, "utf8");
  rejectPrimaryRename = true;

  await assert.rejects(
    () => setup.store.applySubscriptionSnapshot(subscriptionSnapshot()),
    /injected rename failure/,
  );
  assert.equal(await readFile(filePath, "utf8"), original);
  assert.equal(await readFile(`${filePath}.backup`, "utf8"), original);
  const names = await (await import("node:fs/promises")).readdir(dirname(filePath));
  assert.equal(names.some((name) => name.includes(".tmp-")), false);
});

test("a final directory-sync failure rolls back the visible primary and never acknowledges success", async (t) => {
  let filePath;
  let failFinalDirectorySync = false;
  let directorySyncs = 0;
  const fsImpl = {
    async beforeAnchorCommand(command) {
      if (command.op !== "syncDirectory") return;
      directorySyncs += 1;
      if (failFinalDirectorySync && directorySyncs === 2) {
        failFinalDirectorySync = false;
        throw new Error("injected final directory sync failure");
      }
    },
  };
  const setup = await setupStore(t, { fsImpl });
  filePath = setup.filePath;
  await bind(setup.store);
  const original = await readFile(filePath, "utf8");
  directorySyncs = 0;
  failFinalDirectorySync = true;

  await expectStoreError(
    () => setup.store.applySubscriptionSnapshot(subscriptionSnapshot()),
    "BILLING_STORE_DURABILITY_FAILED",
  );
  assert.equal(await readFile(filePath, "utf8"), original);
  assert.equal((await setup.store.getByUid("uid-1")).status, "none");

  assert.deepEqual(await setup.store.applySubscriptionSnapshot(subscriptionSnapshot()), {
    applied: true,
    reason: "updated",
  });
  assert.equal((await setup.store.getByUid("uid-1")).status, "active");
});

test("corrupt or missing primary data never resets over a recoverable backup", async (t) => {
  for (const primaryState of ["corrupt", "missing"]) {
    const { filePath, store } = await setupStore(t);
    await bind(store);
    await store.applySubscriptionSnapshot(subscriptionSnapshot());
    const backupText = await readFile(`${filePath}.backup`, "utf8");
    if (primaryState === "corrupt") {
      await writeFile(filePath, "{not json", { mode: 0o600 });
    } else {
      await unlink(filePath);
    }

    assert.deepEqual(await store.health(), { configured: true, healthy: false });
    await expectStoreError(
      () => bind(store, "uid-new", "cus_new"),
      "BILLING_STORE_CORRUPT",
    );
    assert.equal(await readFile(`${filePath}.backup`, "utf8"), backupText);
    if (primaryState === "corrupt") {
      assert.equal(await readFile(filePath, "utf8"), "{not json");
    } else {
      await assert.rejects(() => access(filePath), { code: "ENOENT" });
    }
  }
});

test("symlinked parent components are rejected before creating or chmodding external storage", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "everwise-billing-parent-link-"));
  const outside = await mkdtemp(join(tmpdir(), "everwise-billing-outside-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  t.after(() => rm(outside, { recursive: true, force: true }));
  await chmod(root, 0o750);
  await chmod(outside, 0o711);
  const linkedParent = join(root, "linked");
  await symlink(outside, linkedParent, "dir");
  const filePath = join(linkedParent, "billing.json");
  const store = createBillingStore({ filePath });

  await expectStoreError(
    () => bind(store),
    "BILLING_STORE_UNSAFE_PATH",
  );
  await assert.rejects(() => access(join(outside, "billing.json")), { code: "ENOENT" });
  assert.equal((await stat(outside)).mode & 0o777, 0o711);
});

test("symlinked primary, backup, and lock paths are rejected without touching their targets", async (t) => {
  for (const targetKind of ["primary", "backup", "lock"]) {
    const root = await mkdtemp(join(tmpdir(), `everwise-billing-${targetKind}-link-`));
    t.after(() => rm(root, { recursive: true, force: true }));
    await chmod(root, 0o750);
    const externalPath = join(root, "external.txt");
    await writeFile(externalPath, `external-${targetKind}`, { mode: 0o640 });
    const filePath = join(root, "billing.json");
    const store = createBillingStore({ filePath });

    if (targetKind === "primary") {
      await symlink(externalPath, filePath, "file");
    } else if (targetKind === "backup") {
      await bind(store);
      await symlink(externalPath, `${filePath}.backup`, "file");
    } else {
      await symlink(externalPath, `${filePath}.lock`, "file");
    }

    if (targetKind !== "lock") {
      assert.deepEqual(await store.health(), { configured: true, healthy: false });
    }
    await expectStoreError(
      () => targetKind === "backup"
        ? store.applySubscriptionSnapshot(subscriptionSnapshot())
        : bind(store),
      "BILLING_STORE_UNSAFE_PATH",
    );
    assert.equal(await readFile(externalPath, "utf8"), `external-${targetKind}`);
    assert.equal((await stat(externalPath)).mode & 0o777, 0o640);
  }
});

test("a parent swapped before or after descriptor acquisition cannot redirect a leaf mutation", async (t) => {
  for (const phase of ["before", "after"]) {
    const root = await mkdtemp(join(tmpdir(), `everwise-billing-parent-race-${phase}-`));
    const outside = await mkdtemp(join(tmpdir(), `everwise-billing-parent-race-outside-${phase}-`));
    t.after(() => rm(root, { recursive: true, force: true }));
    t.after(() => rm(outside, { recursive: true, force: true }));
    const parent = join(root, "store");
    const heldParent = join(root, "store-held");
    await mkdir(parent, { mode: 0o750 });
    await chmod(outside, 0o750);
    const filePath = join(parent, "billing.json");
    await bind(createBillingStore({ filePath }));
    const original = await readFile(filePath, "utf8");
    const externalPrimary = join(outside, "billing.json");
    await writeFile(externalPrimary, "external-primary", { mode: 0o640 });
    let swapped = false;
    const swapParent = async () => {
      await rename(parent, heldParent);
      await symlink(outside, parent, "dir");
      swapped = true;
    };
    const store = createBillingStore({
      filePath,
      fsImpl: phase === "before"
        ? { beforeParentAnchor: swapParent }
        : { afterParentAnchor: swapParent },
    });

    await expectStoreError(
      () => bind(store, `uid-race-${phase}`, `cus_race_${phase}`),
      "BILLING_STORE_UNSAFE_PATH",
    );
    assert.equal(swapped, true);
    assert.equal(await readFile(join(heldParent, "billing.json"), "utf8"), original);
    assert.equal(await readFile(externalPrimary, "utf8"), "external-primary");
    assert.equal((await stat(externalPrimary)).mode & 0o777, 0o640);
    assert.deepEqual((await readdir(outside)).sort(), ["billing.json"]);
  }
});

test("temporary and recovery leaf symlink races never mutate their targets", async (t) => {
  for (const targetKind of ["temporary", "recovery"]) {
    const setup = await setupStore(t);
    await bind(setup.store);
    const externalPath = join(setup.root, `${targetKind}-external.txt`);
    await writeFile(externalPath, `external-${targetKind}`, { mode: 0o640 });
    let injected = false;
    let directorySyncs = 0;
    const store = createBillingStore({
      filePath: setup.filePath,
      now: () => new Date(START),
      fsImpl: {
        async beforeAnchorCommand(command) {
          const racedName = command.op === "copy" ? command.destination : command.name;
          if (
            !injected &&
            ((targetKind === "temporary" &&
              command.op === "writeNew" &&
              racedName.includes(".tmp-")) ||
              (targetKind === "recovery" &&
                command.op === "copy" &&
                racedName.includes(".recovery-")))
          ) {
            await symlink(externalPath, join(dirname(setup.filePath), racedName), "file");
            injected = true;
          }
          if (targetKind === "recovery" && command.op === "syncDirectory") {
            directorySyncs += 1;
            if (directorySyncs === 2) throw new Error("force recovery path");
          }
        },
      },
    });

    await expectStoreError(
      () => store.applySubscriptionSnapshot(subscriptionSnapshot()),
      targetKind === "temporary"
        ? "BILLING_STORE_UNSAFE_PATH"
        : "BILLING_STORE_DURABILITY_FAILED",
    );
    assert.equal(injected, true);
    assert.equal(await readFile(externalPath, "utf8"), `external-${targetKind}`);
    assert.equal((await stat(externalPath)).mode & 0o777, 0o640);
  }
});

test("prototype-like valid UIDs round-trip through null-prototype learner maps", async (t) => {
  const { filePath, store } = await setupStore(t);
  await bind(store, "__proto__", "cus_proto");
  await bind(store, "constructor", "cus_constructor");
  await store.applySubscriptionSnapshot(subscriptionSnapshot({
    uid: "__proto__",
    customerId: "cus_proto",
    subscriptionId: "sub_proto",
  }));

  const reopened = createBillingStore({ filePath, now: () => new Date(START) });
  assert.equal((await reopened.getByUid("__proto__")).access, "full");
  assert.equal((await reopened.getByUid("constructor")).customerId, "cus_constructor");
  assert.equal((await reopened.getByCustomerId("cus_proto")).uid, "__proto__");
  assert.deepEqual(await reopened.bindCustomer({
    uid: "constructor",
    customerId: "cus_constructor",
  }), await reopened.getByUid("constructor"));

  const disk = JSON.parse(await readFile(filePath, "utf8"));
  assert.equal(Object.hasOwn(disk.learners, "__proto__"), true);
  assert.equal(Object.hasOwn(disk.learners, "constructor"), true);
  assert.deepEqual(Object.keys(disk.learners).sort(), ["__proto__", "constructor"]);
});

test("independent processes serialize read-modify-write mutations without losing data", async (t) => {
  const { filePath, root, store } = await setupStore(t);
  await bind(store, "uid-seed", "cus_seed");
  const markerPath = join(root, "first-writer.marker");
  const firstSource = `
    const { writeFile } = await import("node:fs/promises");
    const { createBillingStore } = await import(${JSON.stringify(billingStoreUrl)});
    let delayed = false;
    const store = createBillingStore({
      filePath: ${JSON.stringify(filePath)},
      fsImpl: {
        beforeAnchorCommand: async (command) => {
          if (!delayed && command.op === "rename" && command.destination === "billing.json" && command.source.includes(".tmp-")) {
            delayed = true;
            await writeFile(${JSON.stringify(markerPath)}, "ready");
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        },
      },
    });
    await store.bindCustomer({ uid: "uid-first", customerId: "cus_first" });
  `;
  const secondSource = `
    const { createBillingStore } = await import(${JSON.stringify(billingStoreUrl)});
    const store = createBillingStore({ filePath: ${JSON.stringify(filePath)} });
    await store.bindCustomer({ uid: "uid-second", customerId: "cus_second" });
  `;
  const first = spawn(process.execPath, ["--input-type=module", "--eval", firstSource], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  await waitForPath(markerPath);
  const second = spawn(process.execPath, ["--input-type=module", "--eval", secondSource], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  const [firstResult, secondResult] = await Promise.all([childResult(first), childResult(second)]);
  assert.deepEqual(firstResult, { code: 0, signal: null, stdout: "", stderr: "" });
  assert.deepEqual(secondResult, { code: 0, signal: null, stdout: "", stderr: "" });

  const disk = JSON.parse(await readFile(filePath, "utf8"));
  assert.deepEqual(Object.keys(disk.learners).sort(), ["uid-first", "uid-second", "uid-seed"]);
});
