import Stripe from "stripe";

import { BILLING_PLANS } from "./billingConfig.mjs";

const STRIPE_API_VERSION = "2026-02-25.clover";
const CHECKOUT_HOST = "checkout.stripe.com";
const PORTAL_HOST = "billing.stripe.com";
const MAX_SUBSCRIPTION_PAGES = 20;
const BLOCKING_STATUSES = new Set(["trialing", "active", "incomplete", "past_due"]);
const TERMINAL_SUBSCRIPTION_STATUSES = new Set(["canceled", "incomplete_expired"]);
const WEBHOOK_EVENT_TYPES = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.trial_will_end",
  "invoice.paid",
  "invoice.payment_failed",
]);
const SUBSCRIPTION_STATUSES = new Set([
  "trialing",
  "active",
  "past_due",
  "unpaid",
  "incomplete",
  "incomplete_expired",
  "paused",
  "canceled",
]);
const CHECKOUT_STATUSES = new Set(["open", "complete", "expired"]);

class BillingGatewayError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "BillingGatewayError";
    this.code = code;
  }
}

const gatewayError = (code, message) => new BillingGatewayError(code, message);

const providerFailure = () =>
  gatewayError("BILLING_PROVIDER_ERROR", "Billing provider request failed.");

const runProviderRequest = async (operation) => {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof BillingGatewayError) throw error;
    throw providerFailure();
  }
};

const requiredText = (value, label) => {
  if (typeof value !== "string" || !value.trim()) {
    throw gatewayError("BILLING_INVALID_REQUEST", `${label} is required.`);
  }
  return value.trim();
};

const hasControlCharacter = (value) =>
  [...value].some((character) => {
    const codePoint = character.codePointAt(0);
    return codePoint <= 31 || codePoint === 127;
  });

const requireUid = (value) => {
  const uid = requiredText(value, "Firebase UID");
  if (uid.length > 128 || hasControlCharacter(uid)) {
    throw gatewayError("BILLING_INVALID_REQUEST", "Firebase UID is invalid.");
  }
  return uid;
};

const requireAttempt = (value) => {
  const attempt = requiredText(value, "Operation attempt");
  if (attempt.length > 64 || !/^[A-Za-z0-9._:-]+$/u.test(attempt)) {
    throw gatewayError("BILLING_INVALID_REQUEST", "Operation attempt is invalid.");
  }
  return attempt;
};

const requireStripeId = (value, prefix, label) => {
  const id = requiredText(value, label);
  if (!id.startsWith(prefix) || !/^[A-Za-z0-9_]+$/u.test(id)) {
    throw gatewayError("BILLING_INVALID_REQUEST", `${label} is invalid.`);
  }
  return id;
};

const secretMode = (secretKey) => {
  if (secretKey.startsWith("sk_test_")) return false;
  if (secretKey.startsWith("sk_live_")) return true;
  throw gatewayError("BILLING_NOT_CONFIGURED", "Billing provider configuration is invalid.");
};

const normalizeOrigin = (value) => {
  let url;
  try {
    url = new URL(requiredText(value, "Application origin"));
  } catch (error) {
    if (error instanceof BillingGatewayError) throw error;
    throw gatewayError("BILLING_INVALID_REQUEST", "Application origin is invalid.");
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw gatewayError("BILLING_INVALID_REQUEST", "Application origin is invalid.");
  }
  return url.origin;
};

const requireHostedUrl = (value, host, kind) => {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.hostname !== host ||
      url.port ||
      url.username ||
      url.password
    ) {
      throw new Error("invalid hosted URL");
    }
    return url.toString();
  } catch {
    throw gatewayError(
      "BILLING_PROVIDER_INVALID_URL",
      `Billing provider returned an invalid hosted ${kind} URL.`,
    );
  }
};

const normalizeCheckoutExpiry = (value) => {
  if (!Number.isSafeInteger(value) || value <= 0 || !Number.isSafeInteger(value * 1_000)) {
    throw providerFailure();
  }
  try {
    return new Date(value * 1_000).toISOString();
  } catch {
    throw providerFailure();
  }
};

const normalizeCheckoutSession = (session) => {
  const id = requireStripeId(session?.id, "cs_", "Checkout Session ID");
  if (!CHECKOUT_STATUSES.has(session?.status)) throw providerFailure();
  const normalized = {
    id,
    status: session.status,
    expiresAt: normalizeCheckoutExpiry(session.expires_at),
  };
  if (session.status === "open") {
    return {
      id,
      url: requireHostedUrl(session.url, CHECKOUT_HOST, "Checkout"),
      status: session.status,
      expiresAt: normalized.expiresAt,
    };
  }
  return normalized;
};

const productIdFromPrice = (price) =>
  typeof price.product === "string" ? price.product : price.product?.id;

const normalizeVerifiedPlan = (key, plan, price) => ({
  key,
  priceId: price.id,
  productId: productIdFromPrice(price),
  currency: price.currency,
  unitAmount: price.unit_amount,
  interval: price.recurring.interval,
  trialDays: plan.trialDays,
});

const normalizeSubscription = (subscription) => {
  const firstItem = subscription.items?.data?.[0];
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;
  const priceId =
    typeof firstItem?.price === "string" ? firstItem.price : firstItem?.price?.id;

  if (
    !subscription.id ||
    !customerId ||
    !subscription.status ||
    !priceId ||
    !Number.isSafeInteger(subscription.created) ||
    subscription.created < 0
  ) {
    throw providerFailure();
  }

  return {
    id: subscription.id,
    customerId,
    created: subscription.created,
    status: subscription.status,
    priceId,
    livemode: subscription.livemode === true,
    cancelAtPeriodEnd: subscription.cancel_at_period_end === true,
    currentPeriodEnd: subscription.current_period_end ?? null,
    trialEnd: subscription.trial_end ?? null,
  };
};

const invalidWebhookEvent = () =>
  gatewayError("BILLING_WEBHOOK_EVENT_INVALID", "Billing webhook event is invalid.");

const webhookId = (value, prefix) => {
  const id = typeof value === "string" ? value : value?.id;
  return typeof id === "string" && id.startsWith(prefix) && /^[A-Za-z0-9_]+$/u.test(id)
    ? id
    : null;
};

const webhookFirebaseUid = (...metadataCandidates) => {
  const value = metadataCandidates
    .map((metadata) => metadata?.firebase_uid)
    .find((candidate) => candidate !== undefined && candidate !== null);
  if (value === undefined) return null;
  if (
    typeof value !== "string" ||
    !value ||
    value.length > 128 ||
    hasControlCharacter(value)
  ) {
    throw invalidWebhookEvent();
  }
  return value;
};

const normalizeWebhookObject = (type, object) => {
  if (!object || typeof object !== "object" || Array.isArray(object)) {
    throw invalidWebhookEvent();
  }

  let kind;
  let id;
  let status;
  let customerId;
  let subscriptionId;
  let priceId = null;
  let firebaseUid;

  if (type === "checkout.session.completed") {
    kind = "checkout.session";
    id = webhookId(object.id, "cs_");
    status = object.status === "complete" ? object.status : null;
    customerId = webhookId(object.customer, "cus_");
    subscriptionId = webhookId(object.subscription, "sub_");
    firebaseUid = webhookFirebaseUid(object.metadata);
  } else if (type.startsWith("customer.subscription.")) {
    kind = "subscription";
    id = webhookId(object.id, "sub_");
    status = SUBSCRIPTION_STATUSES.has(object.status) ? object.status : null;
    customerId = webhookId(object.customer, "cus_");
    subscriptionId = id;
    priceId = webhookId(object.items?.data?.[0]?.price, "price_");
    firebaseUid = webhookFirebaseUid(object.metadata);
  } else {
    kind = "invoice";
    id = webhookId(object.id, "in_");
    const allowedStatuses =
      type === "invoice.paid" ? new Set(["paid"]) : new Set(["open", "uncollectible"]);
    status = allowedStatuses.has(object.status) ? object.status : null;
    customerId = webhookId(object.customer, "cus_");
    subscriptionId = webhookId(
      object.subscription ?? object.parent?.subscription_details?.subscription,
      "sub_",
    );
    const firstLine = object.lines?.data?.[0];
    priceId = webhookId(
      firstLine?.price ?? firstLine?.pricing?.price_details?.price,
      "price_",
    );
    firebaseUid = webhookFirebaseUid(
      object.metadata,
      object.parent?.subscription_details?.metadata,
    );
  }

  if (
    object.object !== kind ||
    !id ||
    !status ||
    !customerId ||
    !subscriptionId ||
    (kind === "subscription" && !priceId)
  ) {
    throw invalidWebhookEvent();
  }

  return {
    kind,
    id,
    status,
    customerId,
    subscriptionId,
    priceId,
    metadata: { firebaseUid },
  };
};

const normalizeWebhookEvent = (event) => {
  if (
    !event ||
    event.object !== "event" ||
    !webhookId(event.id, "evt_") ||
    typeof event.type !== "string" ||
    !/^[a-z0-9_.]{1,128}$/u.test(event.type) ||
    !Number.isSafeInteger(event.created) ||
    event.created < 0 ||
    typeof event.livemode !== "boolean"
  ) {
    throw invalidWebhookEvent();
  }
  return {
    id: event.id,
    type: event.type,
    created: event.created,
    livemode: event.livemode,
    object: WEBHOOK_EVENT_TYPES.has(event.type)
      ? normalizeWebhookObject(event.type, event.data?.object)
      : null,
  };
};

const escapeSearchValue = (value) => value.replaceAll("\\", "\\\\").replaceAll("'", "\\'");

const validatePlanConfig = (plans) => {
  if (!plans) return false;
  const keys = Object.keys(plans).sort();
  if (keys.length !== 2 || keys[0] !== "annual" || keys[1] !== "monthly") return false;

  return ["monthly", "annual"].every((key) => {
    const expected = BILLING_PLANS[key];
    const actual = plans[key];
    return (
      actual?.key === expected.key &&
      actual.currency === expected.currency &&
      actual.unitAmount === expected.unitAmount &&
      actual.interval === expected.interval &&
      actual.trialDays === expected.trialDays &&
      typeof actual.priceId === "string" &&
      actual.priceId.startsWith("price_")
    );
  });
};

export const createStripeGateway = ({ secretKey, fetchImpl } = {}) => {
  const normalizedSecretKey = requiredText(secretKey, "Stripe secret key");
  const expectedLivemode = secretMode(normalizedSecretKey);
  const stripeOptions = { apiVersion: STRIPE_API_VERSION };
  if (fetchImpl) stripeOptions.httpClient = Stripe.createFetchHttpClient(fetchImpl);
  const stripe = new Stripe(normalizedSecretKey, stripeOptions);
  let verifiedPlans = null;

  const verifyPlans = async (plans) => {
    verifiedPlans = null;
    if (!validatePlanConfig(plans) || plans.monthly.priceId === plans.annual.priceId) {
      throw gatewayError(
        "BILLING_PLAN_MISMATCH",
        "Configured billing plans could not be verified.",
      );
    }

    return runProviderRequest(async () => {
      const prices = {};
      for (const key of ["monthly", "annual"]) {
        prices[key] = await stripe.prices.retrieve(plans[key].priceId);
      }

      const productIds = new Set();
      for (const key of ["monthly", "annual"]) {
        const expected = plans[key];
        const price = prices[key];
        const productId = productIdFromPrice(price);
        const matches =
          price.id === expected.priceId &&
          price.active === true &&
          price.livemode === expectedLivemode &&
          price.currency === expected.currency &&
          price.unit_amount === expected.unitAmount &&
          price.type === "recurring" &&
          price.recurring?.interval === expected.interval &&
          price.recurring?.interval_count === 1 &&
          typeof productId === "string" &&
          productId.length > 0;
        if (!matches) {
          throw gatewayError(
            "BILLING_PLAN_MISMATCH",
            "Configured billing plans could not be verified.",
          );
        }
        productIds.add(productId);
      }
      if (productIds.size !== 1) {
        throw gatewayError(
          "BILLING_PLAN_MISMATCH",
          "Configured billing plans could not be verified.",
        );
      }

      verifiedPlans = Object.freeze({
        monthly: Object.freeze(normalizeVerifiedPlan("monthly", plans.monthly, prices.monthly)),
        annual: Object.freeze(normalizeVerifiedPlan("annual", plans.annual, prices.annual)),
      });
      return verifiedPlans;
    });
  };

  const findOrCreateCustomer = async ({ uid, storedCustomerId } = {}) => {
    const normalizedUid = requireUid(uid);

    return runProviderRequest(async () => {
      if (storedCustomerId) {
        const customerId = requireStripeId(storedCustomerId, "cus_", "Customer ID");
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted || customer.metadata?.firebase_uid !== normalizedUid) {
          throw gatewayError("BILLING_CUSTOMER_MISMATCH", "Billing customer identity does not match.");
        }
        return { id: customer.id };
      }

      const search = await stripe.customers.search({
        query: `metadata['firebase_uid']:'${escapeSearchValue(normalizedUid)}'`,
        limit: 100,
      });
      if (!Array.isArray(search.data) || typeof search.has_more !== "boolean") {
        throw providerFailure();
      }
      const exactMatches = search.data.filter(
        (customer) => !customer.deleted && customer.metadata?.firebase_uid === normalizedUid,
      );
      if (exactMatches.length !== search.data.length) throw providerFailure();
      if (exactMatches.length > 1 || search.has_more) {
        throw gatewayError(
          "BILLING_CUSTOMER_DUPLICATE",
          "Multiple billing customers exist for this learner.",
        );
      }
      const existing = exactMatches[0];
      if (existing) {
        return { id: existing.id };
      }

      const customer = await stripe.customers.create(
        { metadata: { firebase_uid: normalizedUid } },
        { idempotencyKey: `customer:${normalizedUid}` },
      );
      if (customer.deleted || customer.metadata?.firebase_uid !== normalizedUid) {
        throw gatewayError("BILLING_CUSTOMER_MISMATCH", "Billing customer identity does not match.");
      }
      return { id: customer.id };
    });
  };

  const createCheckoutSession = async ({
    uid,
    customerId,
    planKey,
    appOrigin,
    trialEligible,
    operationAttempt,
  } = {}) => {
    const normalizedUid = requireUid(uid);
    const normalizedCustomerId = requireStripeId(customerId, "cus_", "Customer ID");
    const origin = normalizeOrigin(appOrigin);
    const attempt = requireAttempt(operationAttempt);
    if (!verifiedPlans) {
      throw gatewayError("BILLING_PLANS_UNVERIFIED", "Billing plans have not been verified.");
    }
    if (planKey !== "monthly" && planKey !== "annual") {
      throw gatewayError("BILLING_INVALID_PLAN", "Billing plan is invalid.");
    }
    if (typeof trialEligible !== "boolean") {
      throw gatewayError("BILLING_INVALID_REQUEST", "Trial eligibility is invalid.");
    }
    const plan = verifiedPlans[planKey];

    return runProviderRequest(async () => {
      const subscriptionData = { metadata: { firebase_uid: normalizedUid } };
      if (trialEligible) subscriptionData.trial_period_days = plan.trialDays;
      const session = await stripe.checkout.sessions.create(
        {
          mode: "subscription",
          payment_method_collection: "always",
          customer: normalizedCustomerId,
          client_reference_id: normalizedUid,
          line_items: [{ price: plan.priceId, quantity: 1 }],
          metadata: { firebase_uid: normalizedUid },
          subscription_data: subscriptionData,
          success_url: `${origin}/billing/confirmation?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/subscribe`,
        },
        { idempotencyKey: `checkout:${normalizedUid}:${attempt}` },
      );
      if (session.status !== "open") {
        throw gatewayError(
          "BILLING_CHECKOUT_NOT_OPEN",
          "Billing Checkout Session is not open.",
        );
      }
      return normalizeCheckoutSession(session);
    });
  };

  const retrieveCheckoutSession = async (sessionId) => {
    const normalizedSessionId = requireStripeId(sessionId, "cs_", "Checkout Session ID");
    return runProviderRequest(async () => {
      const session = normalizeCheckoutSession(
        await stripe.checkout.sessions.retrieve(normalizedSessionId),
      );
      if (session.id !== normalizedSessionId) throw providerFailure();
      return session;
    });
  };

  const expireCheckoutSession = async (sessionId) => {
    const normalizedSessionId = requireStripeId(sessionId, "cs_", "Checkout Session ID");
    return runProviderRequest(async () => {
      const session = normalizeCheckoutSession(
        await stripe.checkout.sessions.expire(normalizedSessionId),
      );
      if (session.id !== normalizedSessionId) throw providerFailure();
      if (session.status !== "expired") {
        throw gatewayError(
          "BILLING_CHECKOUT_NOT_EXPIRED",
          "Billing Checkout Session is not expired.",
        );
      }
      return session;
    });
  };

  const createPortalSession = async ({
    uid,
    customerId,
    appOrigin,
    operationAttempt,
  } = {}) => {
    const normalizedUid = requireUid(uid);
    const normalizedCustomerId = requireStripeId(customerId, "cus_", "Customer ID");
    const origin = normalizeOrigin(appOrigin);
    const attempt = requireAttempt(operationAttempt);

    return runProviderRequest(async () => {
      const session = await stripe.billingPortal.sessions.create(
        { customer: normalizedCustomerId, return_url: `${origin}/settings` },
        { idempotencyKey: `portal:${normalizedUid}:${attempt}` },
      );
      return { url: requireHostedUrl(session.url, PORTAL_HOST, "Portal") };
    });
  };

  const listBlockingSubscriptions = async ({ customerId } = {}) => {
    const normalizedCustomerId = requireStripeId(customerId, "cus_", "Customer ID");
    return runProviderRequest(async () => {
      const blocking = [];
      const seenCursors = new Set();
      let startingAfter;

      for (let pageNumber = 0; pageNumber < MAX_SUBSCRIPTION_PAGES; pageNumber += 1) {
        const subscriptions = await stripe.subscriptions.list({
          customer: normalizedCustomerId,
          status: "all",
          limit: 100,
          ...(startingAfter ? { starting_after: startingAfter } : {}),
        });
        if (!Array.isArray(subscriptions.data) || typeof subscriptions.has_more !== "boolean") {
          throw providerFailure();
        }
        blocking.push(
          ...subscriptions.data
            .filter((subscription) => BLOCKING_STATUSES.has(subscription.status))
            .map(normalizeSubscription),
        );
        if (!subscriptions.has_more) return blocking;

        const nextCursor = subscriptions.data.at(-1)?.id;
        if (
          !nextCursor ||
          typeof nextCursor !== "string" ||
          seenCursors.has(nextCursor) ||
          nextCursor === startingAfter
        ) {
          throw providerFailure();
        }
        seenCursors.add(nextCursor);
        startingAfter = nextCursor;
      }

      throw providerFailure();
    });
  };

  const listNonTerminalSubscriptions = async ({ customerId } = {}) => {
    const normalizedCustomerId = requireStripeId(customerId, "cus_", "Customer ID");
    return runProviderRequest(async () => {
      const nonterminal = [];
      const seenCursors = new Set();
      let startingAfter;
      for (let pageNumber = 0; pageNumber < MAX_SUBSCRIPTION_PAGES; pageNumber += 1) {
        const subscriptions = await stripe.subscriptions.list({
          customer: normalizedCustomerId,
          status: "all",
          limit: 100,
          ...(startingAfter ? { starting_after: startingAfter } : {}),
        });
        if (!Array.isArray(subscriptions.data) || typeof subscriptions.has_more !== "boolean") {
          throw providerFailure();
        }
        nonterminal.push(
          ...subscriptions.data
            .filter(({ status }) =>
              SUBSCRIPTION_STATUSES.has(status) &&
              !TERMINAL_SUBSCRIPTION_STATUSES.has(status))
            .map(normalizeSubscription),
        );
        if (!subscriptions.has_more) return nonterminal;
        const nextCursor = subscriptions.data.at(-1)?.id;
        if (
          !nextCursor ||
          typeof nextCursor !== "string" ||
          seenCursors.has(nextCursor) ||
          nextCursor === startingAfter
        ) throw providerFailure();
        seenCursors.add(nextCursor);
        startingAfter = nextCursor;
      }
      throw providerFailure();
    });
  };

  const retrieveSubscription = async (subscriptionId) => {
    const normalizedSubscriptionId = requireStripeId(
      subscriptionId,
      "sub_",
      "Subscription ID",
    );
    return runProviderRequest(async () =>
      normalizeSubscription(await stripe.subscriptions.retrieve(normalizedSubscriptionId)),
    );
  };

  const cancelSubscription = async ({ uid, subscriptionId, operationAttempt } = {}) => {
    const normalizedUid = requireUid(uid);
    const normalizedSubscriptionId = requireStripeId(
      subscriptionId,
      "sub_",
      "Subscription ID",
    );
    const attempt = requireAttempt(operationAttempt);
    return runProviderRequest(async () =>
      normalizeSubscription(
        await stripe.subscriptions.cancel(
          normalizedSubscriptionId,
          { invoice_now: false, prorate: false },
          { idempotencyKey: `cancel:${normalizedUid}:${attempt}` },
        ),
      ),
    );
  };

  const constructWebhookEvent = (rawBody, signature, webhookSecret) => {
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw gatewayError(
        "BILLING_WEBHOOK_SIGNATURE_INVALID",
        "Billing webhook signature verification failed.",
      );
    }
    return normalizeWebhookEvent(event);
  };

  return Object.freeze({
    verifyPlans,
    findOrCreateCustomer,
    createCheckoutSession,
    retrieveCheckoutSession,
    expireCheckoutSession,
    createPortalSession,
    listBlockingSubscriptions,
    listNonTerminalSubscriptions,
    retrieveSubscription,
    cancelSubscription,
    constructWebhookEvent,
  });
};
