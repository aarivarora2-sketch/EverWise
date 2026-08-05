export const MAX_BILLING_RESPONSE_BYTES = 25_000;
export const BILLING_REQUEST_TIMEOUT_MS = 10_000;

const SAFE_MESSAGES = Object.freeze({
  BILLING_HISTORY_NOT_FOUND: "Billing history was not found.",
  BILLING_NOT_CONFIGURED: "Billing is not available right now.",
  BILLING_UNAVAILABLE: "Billing is temporarily unavailable.",
  CHECKOUT_CONFIRMING: "Your subscription is being confirmed.",
  CHECKOUT_ELIGIBILITY_CHANGED: "Billing eligibility changed. Please try again.",
  CHECKOUT_IN_PROGRESS: "A Checkout request is already in progress.",
  INVALID_INPUT: "The request is invalid.",
  INVALID_JSON: "The request is invalid.",
  PAYLOAD_TOO_LARGE: "The request is invalid.",
  SPONSORED_ACCESS_ACTIVE: "Your access is already provided by a partner.",
  SUBSCRIPTION_EXISTS: "A subscription already exists for this account.",
  UNAUTHENTICATED: "Please sign in again to continue.",
  UNSUPPORTED_MEDIA_TYPE: "The request is invalid.",
});

const ERROR_STATUSES = Object.freeze({
  BILLING_HISTORY_NOT_FOUND: 404,
  BILLING_NOT_CONFIGURED: 503,
  BILLING_UNAVAILABLE: 503,
  CHECKOUT_CONFIRMING: 409,
  CHECKOUT_ELIGIBILITY_CHANGED: 409,
  CHECKOUT_IN_PROGRESS: 409,
  INVALID_INPUT: 400,
  INVALID_JSON: 400,
  PAYLOAD_TOO_LARGE: 413,
  SPONSORED_ACCESS_ACTIVE: 409,
  SUBSCRIPTION_EXISTS: 409,
  UNAUTHENTICATED: 401,
  UNSUPPORTED_MEDIA_TYPE: 415,
});

const ACCESS_KEYS = Object.freeze([
  "access",
  "cancelAtPeriodEnd",
  "canManage",
  "canStartTrial",
  "currentPeriodEndsAt",
  "plan",
  "status",
  "trialEndsAt",
]);

const BILLING_STATUSES = new Set([
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

export class BillingAccessError extends Error {
  constructor(code = "BILLING_UNAVAILABLE", status = null, canManage = false) {
    const safeCode = Object.hasOwn(SAFE_MESSAGES, code)
      ? code
      : "BILLING_UNAVAILABLE";
    super(SAFE_MESSAGES[safeCode]);
    this.name = "BillingAccessError";
    this.code = safeCode;
    this.status = Number.isInteger(status) ? status : null;
    this.canManage = safeCode === "SUBSCRIPTION_EXISTS" && canManage === true;
  }
}

const unavailable = () => new BillingAccessError();

const isPlainObject = (value) => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const hasExactKeys = (value, expectedKeys) => {
  if (!isPlainObject(value)) return false;
  const actualKeys = Object.keys(value).sort();
  const sortedExpected = [...expectedKeys].sort();
  return (
    actualKeys.length === sortedExpected.length &&
    actualKeys.every((key, index) => key === sortedExpected[index])
  );
};

const canonicalTimestampOrNull = (value) => {
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) return undefined;
  const normalized = new Date(milliseconds).toISOString();
  return normalized === value ? normalized : undefined;
};

const normalizePlans = (payload) => {
  if (!hasExactKeys(payload, ["plans"]) || !Array.isArray(payload.plans)) {
    return null;
  }
  const expected = [
    {
      key: "annual",
      currency: "usd",
      unitAmount: 6000,
      interval: "year",
      trialDays: 7,
    },
    {
      key: "monthly",
      currency: "usd",
      unitAmount: 799,
      interval: "month",
      trialDays: 3,
    },
  ];
  if (payload.plans.length !== expected.length) return null;
  const plans = [];
  for (let index = 0; index < expected.length; index += 1) {
    const plan = payload.plans[index];
    const offer = expected[index];
    const keys = ["currency", "interval", "key", "trialDays", "unitAmount"];
    if (
      !hasExactKeys(plan, keys) ||
      !keys.every((key) => plan[key] === offer[key])
    ) {
      return null;
    }
    plans.push({ ...offer });
  }
  return { plans };
};

const normalizeAccess = (payload) => {
  if (!hasExactKeys(payload, ACCESS_KEYS)) return null;
  const status = payload.status;
  const plan = payload.plan;
  const trialEndsAt = canonicalTimestampOrNull(payload.trialEndsAt);
  const currentPeriodEndsAt = canonicalTimestampOrNull(payload.currentPeriodEndsAt);
  const grantsAccess = GRANTING_STATUSES.has(status);
  if (
    !BILLING_STATUSES.has(status) ||
    (payload.access !== "full" && payload.access !== "none") ||
    (payload.access === "full") !== grantsAccess ||
    (status === "none"
      ? plan !== null
      : plan !== "monthly" && plan !== "annual") ||
    trialEndsAt === undefined ||
    currentPeriodEndsAt === undefined ||
    typeof payload.cancelAtPeriodEnd !== "boolean" ||
    typeof payload.canStartTrial !== "boolean" ||
    typeof payload.canManage !== "boolean"
  ) {
    return null;
  }
  return {
    access: payload.access,
    status,
    plan,
    trialEndsAt,
    currentPeriodEndsAt,
    cancelAtPeriodEnd: payload.cancelAtPeriodEnd,
    canStartTrial: payload.canStartTrial,
    canManage: payload.canManage,
  };
};

const normalizeHostedUrl = (payload, hostname) => {
  if (!hasExactKeys(payload, ["url"]) || typeof payload.url !== "string") {
    return null;
  }
  try {
    const url = new URL(payload.url);
    if (
      url.protocol !== "https:" ||
      url.hostname !== hostname ||
      url.port ||
      url.username ||
      url.password
    ) {
      return null;
    }
    return { url: url.toString() };
  } catch {
    return null;
  }
};

const normalizeCheckout = (payload) =>
  normalizeHostedUrl(payload, "checkout.stripe.com");

const normalizePortal = (payload) =>
  normalizeHostedUrl(payload, "billing.stripe.com");

const snapshotDependencies = (options) => {
  if (options !== undefined && !isPlainObject(options)) return null;
  try {
    const fetchImpl = options?.fetchImpl ?? globalThis.fetch;
    const apiEndpointImpl = options?.apiEndpointImpl;
    const setTimeoutImpl = options?.setTimeoutImpl ?? globalThis.setTimeout;
    const clearTimeoutImpl = options?.clearTimeoutImpl ?? globalThis.clearTimeout;
    if (
      typeof fetchImpl !== "function" ||
      (apiEndpointImpl !== undefined && typeof apiEndpointImpl !== "function") ||
      typeof setTimeoutImpl !== "function" ||
      typeof clearTimeoutImpl !== "function"
    ) {
      return null;
    }
    return { fetchImpl, apiEndpointImpl, setTimeoutImpl, clearTimeoutImpl };
  } catch {
    return null;
  }
};

const authenticatedToken = async (user) => {
  let getIdToken;
  try {
    getIdToken = user?.getIdToken;
  } catch {
    throw new BillingAccessError("UNAUTHENTICATED");
  }
  if (typeof getIdToken !== "function") {
    throw new BillingAccessError("UNAUTHENTICATED");
  }
  let token;
  try {
    token = await Reflect.apply(getIdToken, user, []);
  } catch {
    throw new BillingAccessError("UNAUTHENTICATED");
  }
  if (
    typeof token !== "string" ||
    token.length < 1 ||
    token.length > 16_384 ||
    /\s/u.test(token)
  ) {
    throw new BillingAccessError("UNAUTHENTICATED");
  }
  return token;
};

const resolveApiEndpoint = async (path, apiEndpointImpl) => {
  if (apiEndpointImpl) return apiEndpointImpl(path);
  const { apiEndpoint } = await import("../utils/apiEndpoint.js");
  return apiEndpoint(path);
};

const validContentType = (value) =>
  typeof value === "string" &&
  /^application\/json(?:\s*;\s*charset\s*=\s*(?:utf-8|"utf-8"))?\s*$/iu.test(value);

const hasNoStore = (value) =>
  typeof value === "string" &&
  value
    .split(",")
    .map((directive) => directive.trim().toLowerCase())
    .includes("no-store");

const createRequestTermination = (controller) => {
  let claimed = false;

  const abortClaimedRequest = () => {
    try {
      controller.abort();
    } catch {
      // Abort failure cannot expose provider details or release the claim.
    }
  };

  return Object.freeze({
    abort() {
      if (claimed) return false;
      claimed = true;
      abortClaimedRequest();
      return true;
    },
    async cancel(cancellation, owner) {
      if (claimed) return false;
      claimed = true;
      let pending;
      try {
        pending = Reflect.apply(cancellation, owner, []);
      } catch {
        abortClaimedRequest();
        return true;
      }
      try {
        await pending;
      } catch {
        // An invoked cancellation keeps ownership even when it later rejects.
      }
      return true;
    },
  });
};

const parseResponse = async (response, termination) => {
  let body;
  let bodyCancel;
  let reader;
  let read;
  let readerCancel;
  let releaseLock;
  let readerAcquired = false;
  let released = false;
  let streamComplete = false;
  const chunks = [];
  let totalBytes = 0;

  const terminate = async () => {
    if (streamComplete) return;
    const cancellation = readerAcquired ? readerCancel : bodyCancel;
    const owner = readerAcquired ? reader : body;
    if (typeof cancellation === "function") {
      await termination.cancel(cancellation, owner);
      return;
    }
    termination.abort();
  };

  const release = () => {
    if (!readerAcquired || released) return;
    released = true;
    try {
      if (typeof releaseLock === "function") {
        Reflect.apply(releaseLock, reader, []);
      }
    } catch {
      // Reader cleanup failure cannot replace the safe billing error.
    }
  };

  try {
    if (response === null || typeof response !== "object") throw new Error();
    body = response.body;
    if (body === null || typeof body !== "object") throw new Error();
    bodyCancel = body.cancel;
    if (bodyCancel !== undefined && typeof bodyCancel !== "function") {
      bodyCancel = undefined;
      throw new Error();
    }

    const ok = response.ok;
    const status = response.status;
    const headers = response.headers;
    if (
      typeof ok !== "boolean" ||
      !Number.isInteger(status) ||
      status < 100 ||
      status > 599 ||
      headers === null ||
      typeof headers !== "object"
    ) {
      throw new Error();
    }
    const getHeader = headers.get;
    if (typeof getHeader !== "function") throw new Error();
    const contentType = Reflect.apply(getHeader, headers, ["content-type"]);
    const cacheControl = Reflect.apply(getHeader, headers, ["cache-control"]);
    const contentLength = Reflect.apply(getHeader, headers, ["content-length"]);
    if (!validContentType(contentType) || !hasNoStore(cacheControl)) {
      throw new Error();
    }
    if (
      contentLength !== null &&
      (typeof contentLength !== "string" ||
        !/^\d+$/u.test(contentLength) ||
        !Number.isSafeInteger(Number(contentLength)) ||
        Number(contentLength) > MAX_BILLING_RESPONSE_BYTES)
    ) {
      throw new Error();
    }

    const getReader = body.getReader;
    if (typeof getReader !== "function") throw new Error();
    reader = Reflect.apply(getReader, body, []);
    readerAcquired = true;
    if (!reader || typeof reader !== "object") throw new Error();
    releaseLock = reader.releaseLock;
    if (typeof releaseLock !== "function") throw new Error();
    readerCancel = reader.cancel;
    if (readerCancel !== undefined && typeof readerCancel !== "function") {
      readerCancel = undefined;
      throw new Error();
    }
    read = reader.read;
    if (typeof read !== "function") throw new Error();

    while (true) {
      const result = await Reflect.apply(read, reader, []);
      if (!isPlainObject(result)) throw new Error();
      const done = result.done;
      if (done === true) {
        streamComplete = true;
        break;
      }
      const value = result.value;
      if (done !== false || !(value instanceof Uint8Array)) throw new Error();
      totalBytes += value.byteLength;
      if (totalBytes > MAX_BILLING_RESPONSE_BYTES) throw new Error();
      chunks.push(value);
    }
    const bytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const payload = JSON.parse(text);
    if (!isPlainObject(payload)) return null;
    return { ok, status, payload };
  } catch {
    await terminate();
    return null;
  } finally {
    release();
  }
};

const normalizedApiError = ({ payload, status }) => {
  if (!hasExactKeys(payload, ["error"]) || !isPlainObject(payload.error)) {
    return unavailable();
  }
  const error = payload.error;
  let code;
  let message;
  let canManage = false;
  try {
    code = error.code;
    message = error.message;
    if (code === "SUBSCRIPTION_EXISTS") {
      if (!hasExactKeys(error, ["canManage", "code", "message"])) {
        return unavailable();
      }
      canManage = error.canManage;
      if (canManage !== true) return unavailable();
    } else if (!hasExactKeys(error, ["code", "message"])) {
      return unavailable();
    }
  } catch {
    return unavailable();
  }
  if (
    typeof code !== "string" ||
    typeof message !== "string" ||
    !Object.hasOwn(ERROR_STATUSES, code) ||
    ERROR_STATUSES[code] !== status
  ) {
    return unavailable();
  }
  return new BillingAccessError(code, status, canManage);
};

const billingRequest = async ({
  user,
  path,
  body,
  normalize,
  options,
}) => {
  const dependencies = snapshotDependencies(options);
  // TEMP DIAGNOSTIC - remove before merging a real fix.
  console.log("[DIAG billingRequest] dependencies: " + JSON.stringify({
    ok: Boolean(dependencies),
    path,
  }));
  if (!dependencies) throw unavailable();
  // Destructured to plain locals before use: calling these as
  // dependencies.fetchImpl(...) etc. would invoke them with `this` bound to
  // the plain `dependencies` object. The real fetch/setTimeout/clearTimeout
  // are native functions that require `this` to be the actual global object
  // (or undefined, for a bare identifier call) and throw "Illegal
  // invocation" otherwise — which happened on every single billing request,
  // before any network activity, which is why this never worked.
  const { fetchImpl, apiEndpointImpl, setTimeoutImpl, clearTimeoutImpl } =
    dependencies;
  const token = await authenticatedToken(user);
  console.log("[DIAG billingRequest] token acquired, len=" + (token ? token.length : "null"));
  const controller = new AbortController();
  const termination = createRequestTermination(controller);
  let timeoutId = null;
  try {
    timeoutId = setTimeoutImpl(termination.abort, BILLING_REQUEST_TIMEOUT_MS);
    const endpoint = await resolveApiEndpoint(path, apiEndpointImpl);
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const parsed = await parseResponse(response, termination);
    if (!parsed) throw unavailable();
    if (!parsed.ok) throw normalizedApiError(parsed);
    if (parsed.status !== 200) throw unavailable();
    const normalized = normalize(parsed.payload);
    if (!normalized) throw unavailable();
    return normalized;
  } catch (error) {
    // TEMP DIAGNOSTIC - remove before merging a real fix.
    console.log("[DIAG billingRequest] real error: " + JSON.stringify({
      isBillingAccessError: error instanceof BillingAccessError,
      name: error?.name,
      message: error?.message,
      stack: String(error?.stack).slice(0, 800),
    }));
    if (error instanceof BillingAccessError) throw error;
    throw unavailable();
  } finally {
    if (timeoutId !== null) {
      try {
        clearTimeoutImpl(timeoutId);
      } catch {
        // Cleanup cannot expose dependency details or change a completed result.
      }
    }
  }
};

export function fetchBillingPlans(user, options) {
  return billingRequest({
    user,
    path: "/api/billing/plans",
    body: {},
    normalize: normalizePlans,
    options,
  });
}

export function fetchBillingAccess(user, options) {
  return billingRequest({
    user,
    path: "/api/billing/access",
    body: {},
    normalize: normalizeAccess,
    options,
  });
}

export function createBillingCheckout(user, plan, options) {
  if (plan !== "monthly" && plan !== "annual") {
    return Promise.reject(new BillingAccessError("INVALID_INPUT"));
  }
  return billingRequest({
    user,
    path: "/api/billing/checkout",
    body: { plan },
    normalize: normalizeCheckout,
    options,
  });
}

export function createBillingPortal(user, options) {
  return billingRequest({
    user,
    path: "/api/billing/portal",
    body: {},
    normalize: normalizePortal,
    options,
  });
}
