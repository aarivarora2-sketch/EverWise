import Stripe from "stripe";

import { BILLING_PLANS } from "./billingConfig.mjs";

const STRIPE_API_VERSION = "2026-02-25.clover";
const CHECKOUT_HOST = "checkout.stripe.com";
const PORTAL_HOST = "billing.stripe.com";
const BLOCKING_STATUSES = new Set(["trialing", "active", "incomplete", "past_due"]);

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

  if (!subscription.id || !customerId || !subscription.status || !priceId) {
    throw providerFailure();
  }

  return {
    id: subscription.id,
    customerId,
    status: subscription.status,
    priceId,
    livemode: subscription.livemode === true,
    cancelAtPeriodEnd: subscription.cancel_at_period_end === true,
    currentPeriodEnd: subscription.current_period_end ?? null,
    trialEnd: subscription.trial_end ?? null,
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

  const findOrCreateCustomer = async ({ uid, storedCustomerId, operationAttempt } = {}) => {
    const normalizedUid = requireUid(uid);
    const attempt = requireAttempt(operationAttempt);

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
        limit: 1,
      });
      const existing = search.data[0];
      if (existing) {
        if (existing.metadata?.firebase_uid !== normalizedUid) {
          throw gatewayError("BILLING_CUSTOMER_MISMATCH", "Billing customer identity does not match.");
        }
        return { id: existing.id };
      }

      const customer = await stripe.customers.create(
        { metadata: { firebase_uid: normalizedUid } },
        { idempotencyKey: `customer:${normalizedUid}:${attempt}` },
      );
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
      return {
        id: requiredText(session.id, "Checkout Session ID"),
        url: requireHostedUrl(session.url, CHECKOUT_HOST, "Checkout"),
      };
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
      const subscriptions = await stripe.subscriptions.list({
        customer: normalizedCustomerId,
        status: "all",
        limit: 100,
      });
      return subscriptions.data
        .filter((subscription) => BLOCKING_STATUSES.has(subscription.status))
        .map(normalizeSubscription);
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
    try {
      return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw gatewayError(
        "BILLING_WEBHOOK_SIGNATURE_INVALID",
        "Billing webhook signature verification failed.",
      );
    }
  };

  return Object.freeze({
    verifyPlans,
    findOrCreateCustomer,
    createCheckoutSession,
    createPortalSession,
    listBlockingSubscriptions,
    retrieveSubscription,
    cancelSubscription,
    constructWebhookEvent,
  });
};
