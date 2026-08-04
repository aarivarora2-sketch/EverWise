import { FIREBASE_CERTIFICATES_UNAVAILABLE_CODE } from "./firebaseTokenVerifier.mjs";

const MAXIMUM_BODY_BYTES = 256 * 1024;
const BILLING_PATHS = new Map([
  ["/api/billing/plans", "plans"],
  ["/api/billing/access", "access"],
  ["/api/billing/checkout", "checkout"],
  ["/api/billing/portal", "portal"],
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

export const createBillingApi = ({
  config,
  store,
  gateway,
  partnerStore,
  verifyIdToken,
  now = () => new Date(),
} = {}) => {
  if (
    !config ||
    !store ||
    !gateway ||
    !partnerStore ||
    typeof verifyIdToken !== "function" ||
    typeof now !== "function"
  ) {
    throw new TypeError(
      "config, store, gateway, partnerStore, verifyIdToken, and now are required",
    );
  }
  let verifiedPlansPromise = null;
  let operationCounter = 0;
  const checkoutQueues = new Map();

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
    if (!verifiedPlansPromise) {
      verifiedPlansPromise = Promise.resolve().then(() => gateway.verifyPlans(config.plans));
    }
    try {
      await verifiedPlansPromise;
    } catch {
      verifiedPlansPromise = null;
      throw apiError(
        503,
        "BILLING_NOT_CONFIGURED",
        "Billing is not available right now.",
      );
    }
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

      const session = await gateway.createCheckoutSession({
        uid,
        customerId: customer.id,
        planKey,
        appOrigin: config.appOrigin,
        trialEligible: !trialUsed,
        operationAttempt: trialUsed ? operationAttempt("checkout") : "first-trial",
      });
      if (!isPlainObject(session)) {
        throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
      }
      return { url: hostedUrl(session.url, "checkout.stripe.com") };
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

  return Object.freeze({
    async handle({ request, response, pathname, body, bodyByteLength } = {}) {
      const route = BILLING_PATHS.get(pathname);
      if (!route) return false;

      if (request?.method !== "POST") {
        jsonResponse(
          response,
          405,
          { error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } },
          { Allow: "POST" },
        );
        return true;
      }

      try {
        const learner = await verifiedLearner(request, verifyIdToken);
        const parsedBody = await resolveBody(request, body, bodyByteLength);
        if (route === "plans") {
          requireExactKeys(parsedBody, []);
          await requireHealthyBilling();
          jsonResponse(response, 200, publicPlans(config.plans));
          return true;
        }
        if (route === "checkout") {
          requireExactKeys(parsedBody, ["plan"]);
          if (parsedBody.plan !== "monthly" && parsedBody.plan !== "annual") {
            throw apiError(400, "INVALID_INPUT", "The request is invalid.");
          }
          jsonResponse(response, 200, await createCheckout(learner.uid, parsedBody.plan));
          return true;
        }
        if (route === "access") {
          requireExactKeys(parsedBody, []);
          jsonResponse(response, 200, await getAccess(learner.uid));
          return true;
        }
        if (route === "portal") {
          requireExactKeys(parsedBody, []);
          jsonResponse(response, 200, await createPortal(learner.uid));
          return true;
        }
        throw apiError(503, "BILLING_UNAVAILABLE", "Billing is temporarily unavailable.");
      } catch (error) {
        errorResponse(response, error);
        return true;
      }
    },
  });
};
