const freezePlan = (plan) => Object.freeze(plan);

export const BILLING_PLANS = Object.freeze({
  monthly: freezePlan({
    key: "monthly",
    currency: "usd",
    unitAmount: 799,
    interval: "month",
    trialDays: 3,
  }),
  annual: freezePlan({
    key: "annual",
    currency: "usd",
    unitAmount: 6000,
    interval: "year",
    trialDays: 7,
  }),
});

const ENVIRONMENT_NAMES = Object.freeze([
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_MONTHLY_PRICE_ID",
  "STRIPE_ANNUAL_PRICE_ID",
  "EVERWISE_PUBLIC_APP_ORIGIN",
]);

const trimmedValue = (value) => (typeof value === "string" ? value.trim() : "");

const normalizeAppOrigin = (rawOrigin) => {
  let url;
  try {
    url = new URL(rawOrigin);
  } catch {
    throw new Error("Billing application origin must be a valid HTTPS origin.");
  }

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error("Billing application origin must be a valid HTTPS origin.");
  }

  return url.origin;
};

const modeFromSecretKey = (secretKey) => {
  if (secretKey.startsWith("sk_test_")) return "test";
  if (secretKey.startsWith("sk_live_")) return "live";
  throw new Error("Billing secret key format is invalid.");
};

const explicitModeFromPriceId = (priceId) => {
  if (priceId.startsWith("price_test_")) return "test";
  if (priceId.startsWith("price_live_")) return "live";
  return null;
};

export const loadBillingConfig = (env = {}) => {
  const values = Object.fromEntries(
    ENVIRONMENT_NAMES.map((name) => [name, trimmedValue(env[name])]),
  );
  const presentCount = Object.values(values).filter(Boolean).length;

  if (presentCount === 0) {
    return {
      configured: false,
      appOrigin: null,
      webhookSecret: null,
      plans: BILLING_PLANS,
    };
  }

  if (presentCount !== ENVIRONMENT_NAMES.length) {
    throw new Error("Billing configuration is incomplete.");
  }

  const mode = modeFromSecretKey(values.STRIPE_SECRET_KEY);
  if (!values.STRIPE_WEBHOOK_SECRET.startsWith("whsec_")) {
    throw new Error("Billing webhook secret format is invalid.");
  }

  for (const priceId of [
    values.STRIPE_MONTHLY_PRICE_ID,
    values.STRIPE_ANNUAL_PRICE_ID,
  ]) {
    if (!priceId.startsWith("price_")) {
      throw new Error("Billing Price ID format is invalid.");
    }
    const explicitMode = explicitModeFromPriceId(priceId);
    if (explicitMode && explicitMode !== mode) {
      throw new Error("Billing secret and Price modes do not match.");
    }
  }

  return {
    configured: true,
    appOrigin: normalizeAppOrigin(values.EVERWISE_PUBLIC_APP_ORIGIN),
    webhookSecret: values.STRIPE_WEBHOOK_SECRET,
    plans: BILLING_PLANS,
  };
};
