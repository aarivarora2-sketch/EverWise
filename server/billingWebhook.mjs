const MAXIMUM_BODY_BYTES = 256 * 1024;

const ACCESS_CHANGING_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
]);
const TRIAL_OBSERVABILITY_EVENT = "customer.subscription.trial_will_end";
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
const TERMINAL_SUBSCRIPTION_STATUSES = new Set(["canceled", "incomplete_expired"]);
const EVENT_ID_PATTERN = /^evt_[A-Za-z0-9_]+$/u;
const CUSTOMER_ID_PATTERN = /^cus_[A-Za-z0-9_]+$/u;
const SUBSCRIPTION_ID_PATTERN = /^sub_[A-Za-z0-9_]+$/u;
const PRICE_ID_PATTERN = /^price_[A-Za-z0-9_]+$/u;

class BillingWebhookError extends Error {
  constructor(status, code) {
    super(code);
    this.name = "BillingWebhookError";
    this.status = status;
    this.code = code;
  }
}

const webhookError = (status, code) => new BillingWebhookError(status, code);
const invalidWebhook = () => webhookError(400, "BILLING_WEBHOOK_INVALID");
const tooLarge = () => webhookError(413, "PAYLOAD_TOO_LARGE");

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

const errorResponse = (response, status, code, message) => {
  jsonResponse(response, status, { error: { code, message } });
};

const contentLength = (request) => {
  const value = request.headers?.["content-length"];
  if (value === undefined) return null;
  if (typeof value !== "string" || !/^\d+$/u.test(value)) throw invalidWebhook();
  const length = Number(value);
  if (!Number.isSafeInteger(length)) throw invalidWebhook();
  if (length > MAXIMUM_BODY_BYTES) throw tooLarge();
  return length;
};

const readRawBody = async (request) => {
  contentLength(request);
  const chunks = [];
  let length = 0;
  try {
    for await (const chunk of request) {
      const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      length += bytes.byteLength;
      if (length > MAXIMUM_BODY_BYTES) throw tooLarge();
      chunks.push(bytes);
    }
  } catch (error) {
    if (error instanceof BillingWebhookError) throw error;
    throw invalidWebhook();
  }
  return Buffer.concat(chunks, length);
};

const stripeSignature = (request) => {
  const value = request.headers?.["stripe-signature"];
  if (typeof value !== "string" || !value.trim()) throw invalidWebhook();
  return value;
};

const validUid = (value) =>
  typeof value === "string" &&
  value.length > 0 &&
  value.length <= 128 &&
  value === value.trim() &&
  ![...value].some((character) => {
    const codePoint = character.codePointAt(0);
    return codePoint <= 31 || codePoint === 127;
  });

const validateEventEnvelope = (event, expectedLivemode) => {
  if (
    !isPlainObject(event) ||
    typeof event.id !== "string" ||
    !EVENT_ID_PATTERN.test(event.id) ||
    typeof event.type !== "string" ||
    !event.type ||
    !Number.isSafeInteger(event.created) ||
    event.created < 0 ||
    typeof event.livemode !== "boolean" ||
    event.livemode !== expectedLivemode
  ) {
    throw invalidWebhook();
  }
  return event;
};

const validateLifecycleObject = (object) => {
  if (
    !isPlainObject(object) ||
    typeof object.kind !== "string" ||
    typeof object.id !== "string" ||
    typeof object.customerId !== "string" ||
    !CUSTOMER_ID_PATTERN.test(object.customerId) ||
    typeof object.subscriptionId !== "string" ||
    !SUBSCRIPTION_ID_PATTERN.test(object.subscriptionId) ||
    !isPlainObject(object.metadata)
  ) {
    throw invalidWebhook();
  }
  return object;
};

const validateBoundRecord = (record, customerId) => {
  if (
    !isPlainObject(record) ||
    !validUid(record.uid) ||
    record.customerId !== customerId
  ) {
    throw invalidWebhook();
  }
  return record;
};

const validateSubscription = (value, object, expectedLivemode) => {
  if (
    !isPlainObject(value) ||
    typeof value.id !== "string" ||
    !SUBSCRIPTION_ID_PATTERN.test(value.id) ||
    value.id !== object.subscriptionId ||
    value.customerId !== object.customerId ||
    !Number.isSafeInteger(value.created) ||
    value.created < 0 ||
    !SUBSCRIPTION_STATUSES.has(value.status) ||
    typeof value.priceId !== "string" ||
    !PRICE_ID_PATTERN.test(value.priceId) ||
    value.livemode !== expectedLivemode ||
    typeof value.cancelAtPeriodEnd !== "boolean" ||
    !validOptionalUnixSeconds(value.currentPeriodEnd) ||
    !validOptionalUnixSeconds(value.trialEnd)
  ) {
    throw invalidWebhook();
  }
  return value;
};

function validOptionalUnixSeconds(value) {
  return (
    value === null ||
    (Number.isSafeInteger(value) && value >= 0 && Number.isSafeInteger(value * 1_000))
  );
}

const optionalIsoDate = (seconds) => {
  if (seconds === null) return null;
  try {
    return new Date(seconds * 1_000).toISOString();
  } catch {
    throw invalidWebhook();
  }
};

const planForPrice = (plans, priceId) => {
  const matches = ["monthly", "annual"].filter(
    (key) => plans?.[key]?.priceId === priceId,
  );
  if (matches.length !== 1) throw invalidWebhook();
  return matches[0];
};

const isNonTerminal = (status) =>
  SUBSCRIPTION_STATUSES.has(status) && !TERMINAL_SUBSCRIPTION_STATUSES.has(status);

const validStoreResult = (value, actionKey, reasons) =>
  isPlainObject(value) &&
  typeof value[actionKey] === "boolean" &&
  typeof value.reason === "string" &&
  reasons.has(value.reason);

export const createBillingWebhook = ({ config, store, gateway, logger } = {}) => {
  if (
    !config ||
    !store ||
    !gateway ||
    !logger ||
    typeof store.getByCustomerId !== "function" ||
    typeof store.applySubscriptionSnapshot !== "function" ||
    typeof store.recordProcessedEvent !== "function" ||
    typeof gateway.constructWebhookEvent !== "function" ||
    typeof gateway.retrieveSubscription !== "function" ||
    typeof gateway.cancelSubscription !== "function"
  ) {
    throw new TypeError("config, store, gateway, and logger are required");
  }

  const recordEventOnly = async (event) => {
    const result = await store.recordProcessedEvent({
      eventId: event.id,
      created: event.created,
    });
    if (!validStoreResult(result, "recorded", new Set(["recorded", "duplicate"]))) {
      throw new Error("invalid billing store result");
    }
  };

  const processLifecycle = async (event) => {
    const object = validateLifecycleObject(event.object);
    const record = validateBoundRecord(
      await store.getByCustomerId(object.customerId),
      object.customerId,
    );
    const eventUid = object.metadata.firebaseUid;
    if (!validUid(eventUid) || eventUid !== record.uid) throw invalidWebhook();

    const authoritative = validateSubscription(
      await gateway.retrieveSubscription(object.subscriptionId),
      object,
      config.livemode,
    );
    const plan = planForPrice(config.plans, authoritative.priceId);

    if (
      typeof record.subscriptionId === "string" &&
      record.subscriptionId !== authoritative.id
    ) {
      if (!SUBSCRIPTION_ID_PATTERN.test(record.subscriptionId)) throw invalidWebhook();
      const existing = validateSubscription(
        await gateway.retrieveSubscription(record.subscriptionId),
        {
          customerId: object.customerId,
          subscriptionId: record.subscriptionId,
        },
        config.livemode,
      );
      planForPrice(config.plans, existing.priceId);
      if (isNonTerminal(existing.status)) {
        if (!isNonTerminal(authoritative.status)) {
          await recordEventOnly(event);
          return;
        }

        const incomingIsEarlier =
          authoritative.created !== existing.created
            ? authoritative.created < existing.created
            : authoritative.id < existing.id;
        const duplicateSubscriptionId = incomingIsEarlier
          ? existing.id
          : authoritative.id;
        await gateway.cancelSubscription({
          uid: record.uid,
          subscriptionId: duplicateSubscriptionId,
          operationAttempt: event.id,
        });
        logger.warn("BILLING_DUPLICATE_SUBSCRIPTION");
        if (!incomingIsEarlier) {
          await recordEventOnly(event);
          return;
        }
      } else if (!isNonTerminal(authoritative.status)) {
        await recordEventOnly(event);
        return;
      }
    }

    const result = await store.applySubscriptionSnapshot({
      eventId: event.id,
      created: event.created,
      uid: record.uid,
      customerId: authoritative.customerId,
      subscriptionId: authoritative.id,
      plan,
      status: authoritative.status,
      deleted: event.type === "customer.subscription.deleted",
      cancelAtPeriodEnd: authoritative.cancelAtPeriodEnd,
      trialEndsAt: optionalIsoDate(authoritative.trialEnd),
      currentPeriodEndsAt: optionalIsoDate(authoritative.currentPeriodEnd),
    });
    if (
      !validStoreResult(
        result,
        "applied",
        new Set(["updated", "duplicate", "stale"]),
      )
    ) {
      throw new Error("invalid billing store result");
    }
  };

  return Object.freeze({
    async handle(request, response) {
      if (request?.method !== "POST") {
        jsonResponse(
          response,
          405,
          { error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } },
          { Allow: "POST" },
        );
        return;
      }

      if (
        config.configured !== true ||
        typeof config.webhookSecret !== "string" ||
        !config.webhookSecret ||
        typeof config.livemode !== "boolean"
      ) {
        errorResponse(
          response,
          503,
          "BILLING_NOT_CONFIGURED",
          "Billing is not available right now.",
        );
        return;
      }

      try {
        const signature = stripeSignature(request);
        const rawBody = await readRawBody(request);
        let event;
        try {
          event = gateway.constructWebhookEvent(
            rawBody,
            signature,
            config.webhookSecret,
          );
        } catch {
          throw invalidWebhook();
        }
        validateEventEnvelope(event, config.livemode);

        if (event.type === TRIAL_OBSERVABILITY_EVENT) {
          validateLifecycleObject(event.object);
          await recordEventOnly(event);
          logger.info("BILLING_TRIAL_WILL_END");
        } else if (ACCESS_CHANGING_EVENTS.has(event.type)) {
          await processLifecycle(event);
        } else {
          await recordEventOnly(event);
        }
        jsonResponse(response, 200, { received: true });
      } catch (error) {
        if (error instanceof BillingWebhookError) {
          const message =
            error.status === 413
              ? "The request body is too large."
              : "The webhook request is invalid.";
          errorResponse(response, error.status, error.code, message);
          return;
        }
        logger.error("BILLING_WEBHOOK_FAILED");
        errorResponse(
          response,
          500,
          "BILLING_WEBHOOK_FAILED",
          "The webhook could not be processed.",
        );
      }
    },
  });
};
