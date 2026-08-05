import { randomUUID } from "node:crypto";

import { FIREBASE_CERTIFICATES_UNAVAILABLE_CODE } from "./firebaseTokenVerifier.mjs";

const MAXIMUM_BODY_BYTES = 256 * 1024;
const TERMINAL_SUBSCRIPTION_STATUSES = new Set(["canceled", "incomplete_expired"]);
const BILLING_PATHS = new Map([
  ["/api/billing/plans", "plans"],
  ["/api/billing/access", "access"],
  ["/api/billing/checkout", "checkout"],
  ["/api/billing/portal", "portal"],
  ["/api/billing/cancel", "cancel"],
]);

class BillingApiError extends Error {
  constructor(status, code, message, details = null) {
    super(message);
    this.name = "BillingApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const apiError = (status, code, message, details) =>
  new BillingApiError(status, code, message, details);

const isPlainObject = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const jsonResponse = (response, status, payload, additionalHeaders = {}) => {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...additionalHeaders,
  });
  response.end(JSON.stringify(payload));
};

const errorResponse = (response, error) => {
  if (error instanceof BillingApiError) {
    jsonResponse(response, error.status, {
      error: {
        code: error.code,
        message: error.message,
        ...(error.details || {}),
      },
    });
    return;
  }
  jsonResponse(response, 503, {
    error: {
      code: "BILLING_UNAVAILABLE",
      message: "Billing is temporarily unavailable.",
    },
  });
};

const bearerToken = (request) => {
  const header = request.headers?.authorization;
  if (typeof header !== "string") return null;
  return /^Bearer ([^\s]+)$/u.exec(header)?.[1] || null;
};

const verifiedLearner = async (request, verifyIdToken) => {
  const token = bearerToken(request);
  if (!token) {
    throw apiError(401, "UNAUTHENTICATED", "Authentication is required.");
  }
  try {
    const learner = await verifyIdToken(token);
    const uid = learner?.uid;
    if (
      !isPlainObject(learner) ||
      typeof uid !== "string" ||
      uid.length < 1 ||
      uid.length > 128 ||
      uid !== uid.trim()
    ) {
      throw new Error("invalid verifier result");
    }
    return { uid };
  } catch (error) {
    if (error?.code === FIREBASE_CERTIFICATES_UNAVAILABLE_CODE) {
      throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
    }
    throw apiError(401, "UNAUTHENTICATED", "Authentication is required.");
  }
};

const requireJsonContentType = (request) => {
  const contentType = request.headers?.["content-type"];
  if (
    typeof contentType !== "string" ||
    !/^application\/json(?:\s*;\s*charset\s*=\s*(?:utf-8|"utf-8"))?\s*$/iu.test(
      contentType,
    )
  ) {
    throw apiError(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "The request must use application/json.",
    );
  }
};

const requireBoundedLength = (request) => {
  const contentLength = request.headers?.["content-length"];
  if (contentLength === undefined) return null;
  if (typeof contentLength !== "string" || !/^\d+$/u.test(contentLength)) {
    throw apiError(400, "INVALID_JSON", "The request body is invalid.");
  }
  const declaredLength = Number(contentLength);
  if (!Number.isSafeInteger(declaredLength) || declaredLength > MAXIMUM_BODY_BYTES) {
    throw apiError(413, "PAYLOAD_TOO_LARGE", "The request body is too large.");
  }
  return declaredLength;
};

const readBody = async (request) => {
  const chunks = [];
  let size = 0;
  try {
    for await (const chunk of request) {
      const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += bytes.byteLength;
      if (size > MAXIMUM_BODY_BYTES) {
        throw apiError(413, "PAYLOAD_TOO_LARGE", "The request body is too large.");
      }
      chunks.push(bytes);
    }
  } catch (error) {
    if (error instanceof BillingApiError) throw error;
    throw apiError(400, "INVALID_JSON", "The request body is invalid.");
  }
  try {
    return JSON.parse(Buffer.concat(chunks, size).toString("utf8"));
  } catch {
    throw apiError(400, "INVALID_JSON", "The request body is invalid.");
  }
};

const resolveBody = async (request, providedBody, providedBodyByteLength) => {
  requireJsonContentType(request);
  const declaredLength = requireBoundedLength(request);
  if (providedBody !== undefined) {
    if (!Number.isSafeInteger(providedBodyByteLength) || providedBodyByteLength < 0) {
      throw apiError(400, "INVALID_JSON", "The request body is invalid.");
    }
    if (providedBodyByteLength > MAXIMUM_BODY_BYTES) {
      throw apiError(413, "PAYLOAD_TOO_LARGE", "The request body is too large.");
    }
    if (declaredLength !== null && declaredLength !== providedBodyByteLength) {
      throw apiError(400, "INVALID_JSON", "The request body is invalid.");
    }
  }
  const body = providedBody === undefined ? await readBody(request) : providedBody;
  if (!isPlainObject(body)) {
    throw apiError(400, "INVALID_JSON", "The request body is invalid.");
  }
  let serialized;
  try {
    serialized = JSON.stringify(body);
  } catch {
    throw apiError(400, "INVALID_JSON", "The request body is invalid.");
  }
  if (typeof serialized !== "string") {
    throw apiError(400, "INVALID_JSON", "The request body is invalid.");
  }
  const serializedByteLength = Buffer.byteLength(serialized, "utf8");
  if (serializedByteLength > MAXIMUM_BODY_BYTES) {
    throw apiError(413, "PAYLOAD_TOO_LARGE", "The request body is too large.");
  }
  if (providedBody !== undefined && serializedByteLength > providedBodyByteLength) {
    throw apiError(400, "INVALID_JSON", "The request body is invalid.");
  }
  return JSON.parse(serialized);
};

const requireExactKeys = (body, expectedKeys) => {
  const actualKeys = Object.keys(body).sort();
  const sortedExpected = [...expectedKeys].sort();
  if (
    actualKeys.length !== sortedExpected.length ||
    actualKeys.some((key, index) => key !== sortedExpected[index])
  ) {
    throw apiError(400, "INVALID_INPUT", "The request is invalid.");
  }
};

const publicPlans = (plans) => ({
  plans: ["annual", "monthly"].map((key) => ({
    key,
    currency: plans[key].currency,
    unitAmount: plans[key].unitAmount,
    interval: plans[key].interval,
    trialDays: plans[key].trialDays,
  })),
});

const sponsoredAccessError = () =>
  apiError(
    409,
    "SPONSORED_ACCESS_ACTIVE",
    "Your access is already provided by a partner.",
  );

const existingSubscriptionError = () =>
  apiError(
    409,
    "SUBSCRIPTION_EXISTS",
    "A subscription already exists for this account.",
    { canManage: true },
  );

const checkoutConfirmingError = () =>
  apiError(
    409,
    "CHECKOUT_CONFIRMING",
    "Your subscription is being confirmed.",
  );

const checkoutEligibilityChangedError = () =>
  apiError(
    409,
    "CHECKOUT_ELIGIBILITY_CHANGED",
    "Billing eligibility changed. Please try again.",
  );

const SUBSCRIPTION_STATUSES = new Set([
  "trialing",
  "active",
  "past_due",
  "unpaid",
  "incomplete",
  "incomplete_expired",
  "paused",
  "canceled",
  "none",
]);
const GRANTING_STATUSES = new Set(["trialing", "active"]);

const nullableString = (value) => value === null || typeof value === "string";

const publicAccess = (record) => {
  if (record === null) {
    return {
      access: "none",
      status: "none",
      plan: null,
      trialEndsAt: null,
      currentPeriodEndsAt: null,
      cancelAtPeriodEnd: false,
      canStartTrial: true,
      canManage: false,
    };
  }
  const validPlan = record.plan === null || record.plan === "monthly" || record.plan === "annual";
  const validStatusPlan =
    (record.status === "none" && record.plan === null) ||
    (record.status !== "none" && (record.plan === "monthly" || record.plan === "annual"));
  if (
    !isPlainObject(record) ||
    !SUBSCRIPTION_STATUSES.has(record.status) ||
    !validPlan ||
    !validStatusPlan ||
    !nullableString(record.trialUsedAt) ||
    !nullableString(record.trialEndsAt) ||
    !nullableString(record.currentPeriodEndsAt) ||
    typeof record.cancelAtPeriodEnd !== "boolean" ||
    typeof record.customerId !== "string" ||
    !record.customerId
  ) {
    throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
  }
  return {
    access: GRANTING_STATUSES.has(record.status) ? "full" : "none",
    status: record.status,
    plan: record.plan,
    trialEndsAt: record.trialEndsAt,
    currentPeriodEndsAt: record.currentPeriodEndsAt,
    cancelAtPeriodEnd: record.cancelAtPeriodEnd,
    canStartTrial: record.trialUsedAt === null,
    canManage: true,
  };
};

const hostedUrl = (value, hostname) => {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.hostname !== hostname ||
      url.port ||
      url.username ||
      url.password
    ) {
      throw new Error("invalid hosted URL");
    }
    return url.toString();
  } catch {
    throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
  }
};

const canonicalDate = (value) => {
  if (typeof value !== "string") return null;
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) return null;
  const canonical = new Date(milliseconds).toISOString();
  return canonical === value ? canonical : null;
};

const checkoutSessionId = (value) =>
  typeof value === "string" && /^cs_[A-Za-z0-9_]+$/u.test(value) ? value : null;

const pendingTrialCheckout = (value) => {
  if (!isPlainObject(value)) return null;
  const keys = Object.keys(value).sort();
  const expected = ["attemptId", "expiresAt", "plan", "reservedAt", "sessionId"];
  if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) {
    return null;
  }
  if (
    (value.plan !== "monthly" && value.plan !== "annual") ||
    typeof value.attemptId !== "string" ||
    !/^[A-Za-z0-9._:-]{1,64}$/u.test(value.attemptId) ||
    !canonicalDate(value.reservedAt)
  ) {
    return null;
  }
  if (value.sessionId === null && value.expiresAt === null) return value;
  if (
    !checkoutSessionId(value.sessionId) ||
    !canonicalDate(value.expiresAt) ||
    Date.parse(value.expiresAt) <= Date.parse(value.reservedAt)
  ) {
    return null;
  }
  return value;
};

const checkoutLifecycle = (value) => {
  if (!isPlainObject(value) || !checkoutSessionId(value.id) || !canonicalDate(value.expiresAt)) {
    return null;
  }
  const expected = value.status === "open"
    ? ["expiresAt", "id", "status", "url"]
    : ["expiresAt", "id", "status"];
  const keys = Object.keys(value).sort();
  if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) {
    return null;
  }
  if (value.status === "open") {
    return typeof value.url === "string" ? value : null;
  }
  return value.status === "expired" || value.status === "complete" ? value : null;
};

export const createBillingApi = ({
  config,
  store,
  gateway,
  planVerifier,
  partnerStore,
  verifyIdToken,
  now = () => new Date(),
} = {}) => {
  if (
    !config ||
    !store ||
    !gateway ||
    !planVerifier ||
    typeof planVerifier.verify !== "function" ||
    typeof planVerifier.isVerified !== "function" ||
    !partnerStore ||
    typeof verifyIdToken !== "function" ||
    typeof now !== "function"
  ) {
    throw new TypeError(
      "config, store, gateway, planVerifier, partnerStore, verifyIdToken, and now are required",
    );
  }
  let verifiedPlansPromise = null;
  let operationCounter = 0;
  const checkoutQueues = new Map();
  const authorizations = new WeakMap();

  const operationAttempt = (kind) => {
    const value = now();
    if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
      throw new TypeError("now must return a valid Date");
    }
    operationCounter += 1;
    return `${kind}-${value.getTime().toString(36)}-${operationCounter.toString(36)}`;
  };

  const requireHealthyBilling = async () => {
    if (config.configured !== true || !config.plans || !config.appOrigin) {
      throw apiError(
        503,
        "BILLING_NOT_CONFIGURED",
        "Billing is not available right now.",
      );
    }
    const health = await store.health();
    if (health?.configured !== true || health.healthy !== true) {
      throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
    }
    if (planVerifier.isVerified() === true) return;
    if (!verifiedPlansPromise) {
      verifiedPlansPromise = Promise.resolve().then(() =>
        planVerifier.verify());
    }
    const verification = verifiedPlansPromise;
    try {
      await verification;
      if (planVerifier.isVerified() !== true) {
        throw new Error("billing plans remain unverified");
      }
    } catch {
      if (verifiedPlansPromise === verification) verifiedPlansPromise = null;
      throw apiError(
        503,
        "BILLING_NOT_CONFIGURED",
        "Billing is not available right now.",
      );
    }
    if (verifiedPlansPromise === verification) verifiedPlansPromise = null;
  };

  const rejectActiveSponsorship = async (uid) => {
    const access = await partnerStore.getAccess(uid);
    if (!isPlainObject(access) || !["active", "none", "suspended"].includes(access.status)) {
      throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
    }
    if (access.status === "active") throw sponsoredAccessError();
  };

  const rejectBlockingSubscriptions = async (customerId) => {
    const subscriptions = await gateway.listBlockingSubscriptions({ customerId });
    if (!Array.isArray(subscriptions)) {
      throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
    }
    if (subscriptions.length > 0) throw existingSubscriptionError();
  };

  const enqueueCheckout = (uid, operation) => {
    let state = checkoutQueues.get(uid);
    if (!state) {
      state = { generation: 0, pending: 0, tail: Promise.resolve() };
      checkoutQueues.set(uid, state);
    }
    const observedGeneration = state.generation;
    state.pending += 1;
    const run = state.tail.then(async () => {
      if (state.generation !== observedGeneration) {
        throw apiError(
          409,
          "CHECKOUT_IN_PROGRESS",
          "A Checkout request is already in progress.",
        );
      }
      const result = await operation();
      state.generation += 1;
      return result;
    });
    state.tail = run.catch(() => {});
    return run.finally(() => {
      state.pending -= 1;
      if (state.pending === 0 && checkoutQueues.get(uid) === state) {
        checkoutQueues.delete(uid);
      }
    });
  };

  const createCheckout = (uid, planKey) =>
    enqueueCheckout(uid, async () => {
      await rejectActiveSponsorship(uid);
      await requireHealthyBilling();

      let record = await store.getByUid(uid);
      if (record !== null && !isPlainObject(record)) {
        throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
      }
      const customer = await gateway.findOrCreateCustomer({
        uid,
        storedCustomerId: record?.customerId || null,
      });
      if (!isPlainObject(customer) || typeof customer.id !== "string") {
        throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
      }
      if (!record) {
        record = await store.bindCustomer({ uid, customerId: customer.id });
      }

      await rejectBlockingSubscriptions(customer.id);
      await store.hasUsedTrial(uid);

      // Re-read every eligibility authority after customer resolution and immediately
      // before creating Checkout. This closes webhook and sponsorship races.
      await rejectActiveSponsorship(uid);
      const currentRecord = await store.getByUid(uid);
      if (!isPlainObject(currentRecord) || currentRecord.customerId !== customer.id) {
        throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
      }
      await rejectBlockingSubscriptions(customer.id);
      const trialUsed = await store.hasUsedTrial(uid);
      if (typeof trialUsed !== "boolean") {
        throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
      }

      const requireOpenSession = (value) => {
        const session = checkoutLifecycle(value);
        if (!session || session.status !== "open") {
          throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
        }
        return session;
      };
      const requirePending = (value) => {
        const pending = pendingTrialCheckout(value);
        if (!pending) {
          throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
        }
        return pending;
      };
      const clearPending = async (pending) => {
        const result = await store.clearPendingTrialCheckout({
          uid,
          attemptId: pending.attemptId,
        });
        if (!isPlainObject(result) || result.cleared !== true) {
          throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
        }
      };
      const createNoTrialCheckout = async () => {
        const session = requireOpenSession(await gateway.createCheckoutSession({
          uid,
          customerId: customer.id,
          planKey,
          appOrigin: config.appOrigin,
          trialEligible: false,
          operationAttempt: randomUUID(),
        }));
        return { url: hostedUrl(session.url, "checkout.stripe.com") };
      };
      const recheckEligibility = async () => {
        await rejectActiveSponsorship(uid);
        const latestRecord = await store.getByUid(uid);
        if (!isPlainObject(latestRecord) || latestRecord.customerId !== customer.id) {
          throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
        }
        await rejectBlockingSubscriptions(customer.id);
        const latestTrialUsed = await store.hasUsedTrial(uid);
        if (typeof latestTrialUsed !== "boolean") {
          throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
        }
        return latestTrialUsed;
      };
      const reservationRefusedForTrialUse = (value) =>
        isPlainObject(value) &&
        Object.keys(value).sort().join(",") === "reason,reserved" &&
        value.reserved === false &&
        value.reason === "trial-used";
      const expireIneligibleTrial = async (session) => {
        let expired;
        try {
          expired = checkoutLifecycle(
            await gateway.expireCheckoutSession(session.id),
          );
        } catch {
          throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
        }
        if (!expired || expired.id !== session.id || expired.status !== "expired") {
          throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
        }
        throw checkoutEligibilityChangedError();
      };
      const requireCurrentTrialReservation = async (pending, session) => {
        let trialUsed;
        let currentPendingValue;
        try {
          trialUsed = await store.hasUsedTrial(uid);
          currentPendingValue = await store.getPendingTrialCheckout(uid);
        } catch {
          await expireIneligibleTrial(session);
        }
        const currentPending = currentPendingValue === null
          ? null
          : pendingTrialCheckout(currentPendingValue);
        if (
          trialUsed !== false ||
          !currentPending ||
          currentPending.attemptId !== pending.attemptId ||
          currentPending.sessionId !== session.id ||
          currentPending.plan !== pending.plan ||
          currentPending.expiresAt !== session.expiresAt
        ) {
          await expireIneligibleTrial(session);
        }
      };

      const existingPendingValue = await store.getPendingTrialCheckout(uid);
      const existingPending = existingPendingValue === null
        ? null
        : requirePending(existingPendingValue);
      if (trialUsed) {
        if (existingPending) await clearPending(existingPending);
        return createNoTrialCheckout();
      }

      const reserve = async () => {
        const result = await store.reservePendingTrialCheckout({
          uid,
          plan: planKey,
          attemptId: randomUUID(),
        });
        return reservationRefusedForTrialUse(result) ? null : requirePending(result);
      };
      let pending = existingPending || await reserve();
      if (pending === null) {
        if (await recheckEligibility()) return createNoTrialCheckout();
        throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
      }

      for (let transition = 0; transition < 4; transition += 1) {
        let session;
        if (pending.sessionId === null) {
          session = requireOpenSession(await gateway.createCheckoutSession({
            uid,
            customerId: customer.id,
            planKey: pending.plan,
            appOrigin: config.appOrigin,
            trialEligible: true,
            operationAttempt: pending.attemptId,
          }));
          let attached;
          try {
            attached = requirePending(await store.attachPendingTrialCheckout({
              uid,
              attemptId: pending.attemptId,
              sessionId: session.id,
              expiresAt: session.expiresAt,
            }));
          } catch {
            await expireIneligibleTrial(session);
          }
          if (attached.sessionId !== session.id || attached.expiresAt !== session.expiresAt) {
            throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
          }
          pending = attached;
        } else {
          session = checkoutLifecycle(
            await gateway.retrieveCheckoutSession(pending.sessionId),
          );
          if (!session || session.id !== pending.sessionId) {
            throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
          }
        }

        if (session.status === "complete") throw checkoutConfirmingError();
        if (session.status === "open" && pending.plan === planKey) {
          await requireCurrentTrialReservation(pending, session);
          return { url: hostedUrl(session.url, "checkout.stripe.com") };
        }
        if (session.status === "open") {
          const expired = checkoutLifecycle(
            await gateway.expireCheckoutSession(pending.sessionId),
          );
          if (
            !expired ||
            expired.id !== pending.sessionId ||
            expired.status !== "expired"
          ) {
            throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
          }
        } else if (session.status !== "expired") {
          throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
        }

        await clearPending(pending);
        if (await recheckEligibility()) return createNoTrialCheckout();
        pending = await reserve();
        if (pending === null) {
          if (await recheckEligibility()) return createNoTrialCheckout();
          throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
        }
      }
      throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
    });

  const getAccess = async (uid) => {
    await requireHealthyBilling();
    return publicAccess(await store.getByUid(uid));
  };

  const createPortal = async (uid) => {
    await requireHealthyBilling();
    const record = await store.getByUid(uid);
    if (!isPlainObject(record) || typeof record.customerId !== "string" || !record.customerId) {
      throw apiError(
        404,
        "BILLING_HISTORY_NOT_FOUND",
        "Billing history was not found.",
      );
    }
    const session = await gateway.createPortalSession({
      uid,
      customerId: record.customerId,
      appOrigin: config.appOrigin,
      operationAttempt: operationAttempt("portal"),
    });
    if (!isPlainObject(session)) {
      throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
    }
    return { url: hostedUrl(session.url, "billing.stripe.com") };
  };

  // Cancels the caller's own subscription so deleting an account cannot leave
  // a live Stripe subscription billing a card that its owner can no longer
  // reach. The uid comes from the verified Firebase token and the subscription
  // id is read from this server's own store keyed by that uid, so a caller can
  // never name someone else's subscription.
  const cancelOwnSubscription = async (uid) => {
    await requireHealthyBilling();
    const record = await store.getByUid(uid);
    if (record !== null && !isPlainObject(record)) {
      throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
    }
    const subscriptionId = record?.subscriptionId ?? null;
    if (subscriptionId === null) {
      // No live subscription: deleting the account is already safe.
      return { canceled: false };
    }
    if (typeof subscriptionId !== "string" || !subscriptionId) {
      throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
    }
    const canceled = await gateway.cancelSubscription({
      uid,
      subscriptionId,
      operationAttempt: operationAttempt("cancel"),
    });
    // Only report success once Stripe confirms a terminal state, so the client
    // never deletes the account believing billing has stopped when it has not.
    if (
      !isPlainObject(canceled) ||
      !TERMINAL_SUBSCRIPTION_STATUSES.has(canceled.status)
    ) {
      throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
    }
    return { canceled: true };
  };

  const respondForRoute = async ({ route, learner, request, response, body, bodyByteLength }) => {
    const parsedBody = await resolveBody(request, body, bodyByteLength);
    if (route === "plans") {
      requireExactKeys(parsedBody, []);
      await requireHealthyBilling();
      jsonResponse(response, 200, publicPlans(config.plans));
      return;
    }
    if (route === "checkout") {
      requireExactKeys(parsedBody, ["plan"]);
      if (parsedBody.plan !== "monthly" && parsedBody.plan !== "annual") {
        throw apiError(400, "INVALID_INPUT", "The request is invalid.");
      }
      jsonResponse(response, 200, await createCheckout(learner.uid, parsedBody.plan));
      return;
    }
    if (route === "access") {
      requireExactKeys(parsedBody, []);
      jsonResponse(response, 200, await getAccess(learner.uid));
      return;
    }
    if (route === "portal") {
      requireExactKeys(parsedBody, []);
      jsonResponse(response, 200, await createPortal(learner.uid));
      return;
    }
    if (route === "cancel") {
      requireExactKeys(parsedBody, []);
      jsonResponse(response, 200, await cancelOwnSubscription(learner.uid));
      return;
    }
    throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
  };

  const requirePostRoute = (request, response, pathname) => {
    const route = BILLING_PATHS.get(pathname);
    if (!route) return null;
    if (request?.method !== "POST") {
      jsonResponse(
        response,
        405,
        { error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } },
        { Allow: "POST" },
      );
      return false;
    }
    return route;
  };

  return Object.freeze({
    async authorize({ request, response, pathname } = {}) {
      const route = requirePostRoute(request, response, pathname);
      if (!route) return null;
      try {
        const learner = await verifiedLearner(request, verifyIdToken);
        const authorization = Object.freeze({});
        authorizations.set(authorization, { request, response, pathname, route, learner });
        return authorization;
      } catch (error) {
        errorResponse(response, error);
        return null;
      }
    },
    async handleVerified({
      authorization,
      request,
      response,
      pathname,
      body,
      bodyByteLength,
    } = {}) {
      const authorized = authorizations.get(authorization);
      if (
        !authorized ||
        authorized.request !== request ||
        authorized.response !== response ||
        authorized.pathname !== pathname
      ) {
        errorResponse(
          response,
          apiError(401, "UNAUTHENTICATED", "Authentication is required."),
        );
        return true;
      }
      authorizations.delete(authorization);
      try {
        await respondForRoute({
          route: authorized.route,
          learner: authorized.learner,
          request,
          response,
          body,
          bodyByteLength,
        });
      } catch (error) {
        errorResponse(response, error);
      }
      return true;
    },
    async handle({ request, response, pathname, body, bodyByteLength } = {}) {
      const route = requirePostRoute(request, response, pathname);
      if (route === null) return false;
      if (route === false) return true;

      try {
        const learner = await verifiedLearner(request, verifyIdToken);
        await respondForRoute({ route, learner, request, response, body, bodyByteLength });
        return true;
      } catch (error) {
        errorResponse(response, error);
        return true;
      }
    },
  });
};
