import assert from "node:assert/strict";
import test from "node:test";

import { BILLING_PLANS, loadBillingConfig } from "../server/billingConfig.mjs";

const COMPLETE_TEST_ENV = Object.freeze({
  STRIPE_SECRET_KEY: "sk_test_sensitive_key_material",
  STRIPE_WEBHOOK_SECRET: "whsec_sensitive_webhook_material",
  STRIPE_MONTHLY_PRICE_ID: "price_test_monthly",
  STRIPE_ANNUAL_PRICE_ID: "price_test_annual",
  EVERWISE_PUBLIC_APP_ORIGIN: "https://app.everwise.example/",
});

test("logical plans expose the exact server-owned offers and cannot be mutated", () => {
  assert.deepEqual(Object.keys(BILLING_PLANS), ["monthly", "annual"]);
  assert.deepEqual(BILLING_PLANS, {
    monthly: {
      key: "monthly",
      currency: "usd",
      unitAmount: 799,
      interval: "month",
      trialDays: 3,
    },
    annual: {
      key: "annual",
      currency: "usd",
      unitAmount: 6000,
      interval: "year",
      trialDays: 7,
    },
  });
  assert.equal(Object.isFrozen(BILLING_PLANS), true);
  assert.equal(Object.isFrozen(BILLING_PLANS.monthly), true);
  assert.throws(() => {
    BILLING_PLANS.monthly.unitAmount = 1;
  }, TypeError);
});

test("a complete configuration normalizes one HTTPS application origin", () => {
  const config = loadBillingConfig({
    ...COMPLETE_TEST_ENV,
    EVERWISE_PUBLIC_APP_ORIGIN: "  https://app.everwise.example:8443/  ",
  });

  assert.equal(config.configured, true);
  assert.equal(config.appOrigin, "https://app.everwise.example:8443");
  assert.equal(config.webhookSecret, COMPLETE_TEST_ENV.STRIPE_WEBHOOK_SECRET);
  assert.equal("secretKey" in config, false);
  assert.equal(JSON.stringify(config).includes("sk_test_sensitive"), false);
});

test("enabled configuration binds immutable internal Price IDs to both logical plans", () => {
  const config = loadBillingConfig(COMPLETE_TEST_ENV);

  assert.deepEqual(config.plans, {
    monthly: { ...BILLING_PLANS.monthly, priceId: "price_test_monthly" },
    annual: { ...BILLING_PLANS.annual, priceId: "price_test_annual" },
  });
  assert.notEqual(config.plans, BILLING_PLANS);
  assert.equal(Object.isFrozen(config.plans), true);
  assert.equal(Object.isFrozen(config.plans.monthly), true);
  assert.equal(Object.isFrozen(config.plans.annual), true);
});

test("entirely missing or blank Stripe settings leave billing disabled", () => {
  assert.deepEqual(loadBillingConfig({}), {
    configured: false,
    appOrigin: null,
    webhookSecret: null,
    plans: BILLING_PLANS,
  });

  assert.deepEqual(
    loadBillingConfig({
      STRIPE_SECRET_KEY: "  ",
      STRIPE_WEBHOOK_SECRET: "\t",
      STRIPE_MONTHLY_PRICE_ID: "",
      STRIPE_ANNUAL_PRICE_ID: "\n",
      EVERWISE_PUBLIC_APP_ORIGIN: " ",
    }),
    {
      configured: false,
      appOrigin: null,
      webhookSecret: null,
      plans: BILLING_PLANS,
    },
  );
});

test("partial billing configuration fails closed without exposing values", () => {
  const secret = "sk_test_do_not_expose_partial";
  const webhookSecret = "whsec_do_not_expose_partial";
  const monthlyPriceId = "price_test_do_not_expose_partial";

  assert.throws(
    () =>
      loadBillingConfig({
        STRIPE_SECRET_KEY: secret,
        STRIPE_WEBHOOK_SECRET: webhookSecret,
        STRIPE_MONTHLY_PRICE_ID: monthlyPriceId,
      }),
    (error) => {
      assert.match(error.message, /incomplete/i);
      assert.equal(error.message.includes(secret), false);
      assert.equal(error.message.includes(webhookSecret), false);
      assert.equal(error.message.includes(monthlyPriceId), false);
      return true;
    },
  );
});

test("enabled billing rejects non-HTTPS origins and origin paths", () => {
  for (const appOrigin of [
    "http://app.everwise.example",
    "https://app.everwise.example/path",
    "https://user:pass@app.everwise.example",
    "not a URL",
  ]) {
    assert.throws(
      () => loadBillingConfig({ ...COMPLETE_TEST_ENV, EVERWISE_PUBLIC_APP_ORIGIN: appOrigin }),
      /application origin/i,
    );
  }
});

test("explicit test/live Price markers cannot disagree with the secret mode", () => {
  for (const env of [
    {
      ...COMPLETE_TEST_ENV,
      STRIPE_MONTHLY_PRICE_ID: "price_live_monthly",
    },
    {
      ...COMPLETE_TEST_ENV,
      STRIPE_SECRET_KEY: "sk_live_sensitive_key_material",
      STRIPE_MONTHLY_PRICE_ID: "price_live_monthly",
      STRIPE_ANNUAL_PRICE_ID: "price_test_annual",
    },
  ]) {
    assert.throws(
      () => loadBillingConfig(env),
      (error) => {
        assert.match(error.message, /mode/i);
        for (const value of Object.values(env)) {
          assert.equal(error.message.includes(value), false);
        }
        return true;
      },
    );
  }
});

test("opaque Stripe Price IDs are accepted for later authoritative mode verification", () => {
  const config = loadBillingConfig({
    ...COMPLETE_TEST_ENV,
    STRIPE_MONTHLY_PRICE_ID: "price_1OpaqueMonthly",
    STRIPE_ANNUAL_PRICE_ID: "price_1OpaqueAnnual",
  });

  assert.equal(config.configured, true);
});
