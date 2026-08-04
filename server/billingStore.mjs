import { spawn } from "node:child_process";
import * as fsPromises from "node:fs/promises";
import { dirname } from "node:path";
import { isDeepStrictEqual } from "node:util";

const SCHEMA_VERSION = 1;
const MAX_PROCESSED_EVENTS = 2000;
const DIRECTORY_MODE = 0o750;
const FILE_MODE = 0o600;
const ROOT_KEYS = ["learners", "processedEvents", "version"];
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
];
const EVENT_KEYS = ["created", "id"];
const PLANS = new Set(["monthly", "annual"]);
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
const ACCESS_STATUSES = new Set(["trialing", "active"]);
const CUSTOMER_ID_PATTERN = /^cus_[A-Za-z0-9_]+$/u;
const SUBSCRIPTION_ID_PATTERN = /^sub_[A-Za-z0-9_]+$/u;
const EVENT_ID_PATTERN = /^evt_[A-Za-z0-9_]+$/u;

let temporaryFileCounter = 0;

const LOCK_HELPER_SOURCE = String.raw`
use strict;
use warnings;
use Fcntl qw(:flock);

flock(STDIN, LOCK_EX)
  or die "lock acquisition failed\n";
$| = 1;
print "LOCKED\n";
`;

export class BillingStoreError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "BillingStoreError";
    this.code = code;
  }
}

function storeError(code, message) {
  return new BillingStoreError(code, message);
}

function invalidInput() {
  return storeError("BILLING_STORE_INVALID_INPUT", "The billing store input is invalid.");
}

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactKeys(value, expected) {
  const keys = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  return (
    keys.length === sortedExpected.length &&
    keys.every((key, index) => key === sortedExpected[index])
  );
}

function validUid(value) {
  return (
    typeof value === "string" &&
    value.length >= 1 &&
    value.length <= 128 &&
    value === value.trim() &&
    ![...value].some((character) => {
      const codePoint = character.codePointAt(0);
      return codePoint <= 31 || codePoint === 127;
    })
  );
}

function canonicalIso(value) {
  if (typeof value !== "string") return false;
  const timestamp = Date.parse(value);
  return !Number.isNaN(timestamp) && new Date(timestamp).toISOString() === value;
}

function validOptionalIso(value) {
  return value === null || canonicalIso(value);
}

function validEventCreated(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function compareEvents(left, right) {
  if (left.created !== right.created) return left.created - right.created;
  if (left.id < right.id) return -1;
  if (left.id > right.id) return 1;
  return 0;
}

function validateRecord(uid, record) {
  if (
    !isPlainObject(record) ||
    !hasExactKeys(record, RECORD_KEYS) ||
    record.uid !== uid ||
    !validUid(record.uid) ||
    !CUSTOMER_ID_PATTERN.test(record.customerId) ||
    !validOptionalIso(record.trialUsedAt) ||
    !validOptionalIso(record.trialEndsAt) ||
    !validOptionalIso(record.currentPeriodEndsAt) ||
    typeof record.cancelAtPeriodEnd !== "boolean" ||
    !canonicalIso(record.updatedAt)
  ) {
    return false;
  }

  if (record.status === "none") {
    return (
      record.subscriptionId === null &&
      record.plan === null &&
      record.trialUsedAt === null &&
      record.trialEndsAt === null &&
      record.currentPeriodEndsAt === null &&
      record.cancelAtPeriodEnd === false &&
      record.lastEventCreated === null &&
      record.lastEventId === null
    );
  }

  return (
    SUBSCRIPTION_STATUSES.has(record.status) &&
    SUBSCRIPTION_ID_PATTERN.test(record.subscriptionId) &&
    PLANS.has(record.plan) &&
    validEventCreated(record.lastEventCreated) &&
    EVENT_ID_PATTERN.test(record.lastEventId) &&
    (record.status !== "trialing" || record.trialUsedAt !== null)
  );
}

function validateData(data) {
  try {
    if (
      !isPlainObject(data) ||
      !hasExactKeys(data, ROOT_KEYS) ||
      data.version !== SCHEMA_VERSION ||
      !isPlainObject(data.learners) ||
      !Array.isArray(data.processedEvents) ||
      data.processedEvents.length > MAX_PROCESSED_EVENTS
    ) {
      throw new Error("invalid root");
    }

    const customerIds = new Set();
    const subscriptionIds = new Set();
    for (const [uid, record] of Object.entries(data.learners)) {
      if (!validateRecord(uid, record) || customerIds.has(record.customerId)) {
        throw new Error("invalid learner");
      }
      customerIds.add(record.customerId);
      if (record.subscriptionId !== null) {
        if (subscriptionIds.has(record.subscriptionId)) {
          throw new Error("duplicate subscription");
        }
        subscriptionIds.add(record.subscriptionId);
      }
    }

    const eventIds = new Set();
    let priorEvent = null;
    for (const event of data.processedEvents) {
      if (
        !isPlainObject(event) ||
        !hasExactKeys(event, EVENT_KEYS) ||
        !EVENT_ID_PATTERN.test(event.id) ||
        !validEventCreated(event.created) ||
        eventIds.has(event.id) ||
        (priorEvent && compareEvents(priorEvent, event) >= 0)
      ) {
        throw new Error("invalid event history");
      }
      eventIds.add(event.id);
      priorEvent = event;
    }
  } catch {
    throw storeError("BILLING_STORE_CORRUPT", "The billing store is corrupt.");
  }
  return data;
}

function emptyData() {
  return { version: SCHEMA_VERSION, learners: {}, processedEvents: [] };
}

function clone(value) {
  return structuredClone(value);
}

function nowDate(now) {
  const value = now();
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new TypeError("now must return a valid Date");
  }
  return value;
}

function requireUid(value) {
  if (!validUid(value)) throw invalidInput();
  return value;
}

function requireIdentifier(value, pattern) {
  if (typeof value !== "string" || !pattern.test(value)) throw invalidInput();
  return value;
}

function requireEventCreated(value) {
  if (!validEventCreated(value)) throw invalidInput();
  return value;
}

function normalizeOptionalTimestamp(value) {
  if (value === null || value === undefined) return null;
  let date;
  if (typeof value === "number" && validEventCreated(value)) {
    date = new Date(value * 1000);
  } else if (typeof value === "string") {
    date = new Date(value);
  } else {
    throw invalidInput();
  }
  if (Number.isNaN(date.getTime())) throw invalidInput();
  return date.toISOString();
}

function viewRecord(record) {
  if (!record) return null;
  return {
    ...clone(record),
    access: ACCESS_STATUSES.has(record.status) ? "full" : "none",
  };
}

function addProcessedEvent(data, event) {
  data.processedEvents.push(event);
  data.processedEvents.sort(compareEvents);
  if (data.processedEvents.length > MAX_PROCESSED_EVENTS) {
    data.processedEvents.splice(0, data.processedEvents.length - MAX_PROCESSED_EVENTS);
  }
}

function includesProcessedEvent(data, eventId) {
  return data.processedEvents.some(({ id }) => id === eventId);
}

function eventIsNewer(created, eventId, record) {
  if (record.lastEventCreated === null) return true;
  if (created !== record.lastEventCreated) return created > record.lastEventCreated;
  return eventId > record.lastEventId;
}

async function acquireInterprocessMutationLock(filePath, operations) {
  let lockHandle;
  try {
    lockHandle = await operations.open(`${filePath}.lock`, "a+", FILE_MODE);
    await operations.chmod(`${filePath}.lock`, FILE_MODE);
  } catch {
    throw storeError(
      "BILLING_STORE_LOCK_FAILED",
      "The billing store lock could not open.",
    );
  }

  let lockHandleOpen = true;
  const closeLockHandle = async () => {
    if (!lockHandleOpen) return;
    lockHandleOpen = false;
    await lockHandle.close();
  };

  return new Promise((resolve, reject) => {
    const helper = spawn("/usr/bin/perl", ["-e", LOCK_HELPER_SOURCE], {
      stdio: [lockHandle.fd, "pipe", "pipe"],
    });
    let stdout = "";
    let settled = false;
    let stderr = "";
    helper.stdout.setEncoding("utf8");
    helper.stderr.setEncoding("utf8");
    helper.stdout.on("data", (chunk) => { stdout += chunk; });
    helper.stderr.on("data", (chunk) => { stderr = `${stderr}${chunk}`.slice(-1000); });
    helper.once("error", () => {
      if (settled) return;
      settled = true;
      closeLockHandle().then(
        () => reject(storeError(
          "BILLING_STORE_LOCK_FAILED",
          "The billing store lock could not start.",
        )),
        reject,
      );
    });
    helper.once("close", (code, signal) => {
      if (settled) return;
      settled = true;
      if (code === 0 && signal === null && stdout === "LOCKED\n") {
        resolve(closeLockHandle);
        return;
      }
      closeLockHandle().then(
        () => reject(storeError(
          "BILLING_STORE_LOCK_FAILED",
          stderr
            ? "The billing store lock ended unexpectedly."
            : "The billing store lock failed.",
        )),
        reject,
      );
    });
  });
}

async function syncPath(path, flags, operations) {
  const handle = await operations.open(path, flags);
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function persistAtomically(filePath, data, hadPriorFile, operations) {
  temporaryFileCounter += 1;
  const suffix = `${process.pid}-${temporaryFileCounter}`;
  const temporaryPath = `${filePath}.tmp-${suffix}`;
  const backupPath = `${filePath}.backup`;
  const backupTemporaryPath = `${backupPath}.tmp-${suffix}`;
  let handle;
  try {
    handle = await operations.open(temporaryPath, "wx", FILE_MODE);
    await handle.writeFile(`${JSON.stringify(data, null, 2)}\n`, "utf8");
    await handle.sync();
    await handle.close();
    handle = null;
    await operations.chmod(temporaryPath, FILE_MODE);

    if (hadPriorFile) {
      await operations.copyFile(filePath, backupTemporaryPath);
      await operations.chmod(backupTemporaryPath, FILE_MODE);
      await syncPath(backupTemporaryPath, "r+", operations);
      await operations.rename(backupTemporaryPath, backupPath);
      await syncPath(dirname(filePath), "r", operations);
    }

    await operations.rename(temporaryPath, filePath);
    await operations.chmod(filePath, FILE_MODE);
    await syncPath(dirname(filePath), "r", operations);
  } finally {
    if (handle) await handle.close().catch(() => {});
    await operations.unlink(temporaryPath).catch(() => {});
    await operations.unlink(backupTemporaryPath).catch(() => {});
  }
}

function mutation(result, changed = true) {
  return { result, changed };
}

export function createBillingStore({
  filePath = "/var/lib/everwise/billing.json",
  now = () => new Date(),
  fsImpl,
} = {}) {
  if (typeof filePath !== "string" || !filePath) {
    throw new TypeError("filePath must be a non-empty string");
  }
  if (typeof now !== "function") throw new TypeError("now must be a function");
  if (fsImpl !== undefined && !isPlainObject(fsImpl)) {
    throw new TypeError("fsImpl must be an object");
  }
  const operations = { ...fsPromises, ...(fsImpl || {}) };
  let mutationQueue = Promise.resolve();

  function secureDirectoryMode(mode) {
    const permissions = mode & 0o777;
    return (permissions & 0o700) === 0o700 && (permissions & 0o027) === 0;
  }

  async function prepareParentDirectory() {
    const parentPath = dirname(filePath);
    try {
      const parent = await operations.stat(parentPath);
      if (!parent.isDirectory() || !secureDirectoryMode(parent.mode)) {
        throw storeError("BILLING_STORE_CORRUPT", "The billing store is corrupt.");
      }
    } catch (error) {
      if (error instanceof BillingStoreError) throw error;
      if (error?.code !== "ENOENT") {
        throw storeError("BILLING_STORE_CORRUPT", "The billing store is corrupt.");
      }
      await operations.mkdir(parentPath, { recursive: true, mode: DIRECTORY_MODE });
    }
    await operations.chmod(parentPath, DIRECTORY_MODE);
  }

  async function verifyStoredPermissions() {
    try {
      const [parent, primary] = await Promise.all([
        operations.stat(dirname(filePath)),
        operations.stat(filePath),
      ]);
      if (
        !parent.isDirectory() ||
        !primary.isFile() ||
        !secureDirectoryMode(parent.mode) ||
        (primary.mode & 0o777) !== FILE_MODE
      ) {
        throw new Error("unsafe permissions");
      }
      try {
        const backup = await operations.stat(`${filePath}.backup`);
        if (!backup.isFile() || (backup.mode & 0o777) !== FILE_MODE) {
          throw new Error("unsafe backup permissions");
        }
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
      }
    } catch {
      throw storeError("BILLING_STORE_CORRUPT", "The billing store is corrupt.");
    }
  }

  async function backupExists() {
    try {
      await operations.stat(`${filePath}.backup`);
      return true;
    } catch (error) {
      if (error?.code === "ENOENT") return false;
      return true;
    }
  }

  async function readData({ allowMissing = false } = {}) {
    let text;
    try {
      text = await operations.readFile(filePath, "utf8");
    } catch (error) {
      if (error?.code === "ENOENT") {
        if (await backupExists()) {
          throw storeError("BILLING_STORE_CORRUPT", "The billing store is corrupt.");
        }
        if (allowMissing) return null;
        throw storeError(
          "BILLING_STORE_NOT_CONFIGURED",
          "The billing store is not configured.",
        );
      }
      throw storeError("BILLING_STORE_CORRUPT", "The billing store could not be read.");
    }
    await verifyStoredPermissions();
    try {
      return validateData(JSON.parse(text));
    } catch (error) {
      if (error instanceof BillingStoreError) throw error;
      throw storeError("BILLING_STORE_CORRUPT", "The billing store is corrupt.");
    }
  }

  async function committedDataMatches(expected) {
    try {
      return isDeepStrictEqual(await readData(), expected);
    } catch {
      return false;
    }
  }

  function enqueueMutation(mutator, { allowMissing = false } = {}) {
    const run = async () => {
      await prepareParentDirectory();
      const releaseLock = await acquireInterprocessMutationLock(filePath, operations);
      try {
        const current = await readData({ allowMissing });
        const hadPriorFile = current !== null;
        const working = clone(current || emptyData());
        const outcome = await mutator(working, nowDate(now));
        if (outcome.changed) {
          validateData(working);
          try {
            await persistAtomically(filePath, working, hadPriorFile, operations);
          } catch (error) {
            if (!(await committedDataMatches(working))) throw error;
          }
        }
        return outcome.result;
      } finally {
        await releaseLock();
      }
    };
    const result = mutationQueue.then(run, run);
    mutationQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  async function getByUid(uid) {
    const normalizedUid = requireUid(uid);
    const data = await readData();
    return viewRecord(data.learners[normalizedUid]);
  }

  async function getByCustomerId(customerId) {
    const normalizedCustomerId = requireIdentifier(customerId, CUSTOMER_ID_PATTERN);
    const data = await readData();
    const record = Object.values(data.learners).find(
      (candidate) => candidate.customerId === normalizedCustomerId,
    );
    return viewRecord(record);
  }

  function bindCustomer({ uid, customerId } = {}) {
    return enqueueMutation((data, currentDate) => {
      const normalizedUid = requireUid(uid);
      const normalizedCustomerId = requireIdentifier(customerId, CUSTOMER_ID_PATTERN);
      const existing = data.learners[normalizedUid];
      const owner = Object.values(data.learners).find(
        (candidate) => candidate.customerId === normalizedCustomerId,
      );
      if (
        (existing && existing.customerId !== normalizedCustomerId) ||
        (owner && owner.uid !== normalizedUid)
      ) {
        throw storeError(
          "BILLING_STORE_IDENTITY_CONFLICT",
          "The billing identity conflicts with another learner.",
        );
      }
      if (existing) return mutation(viewRecord(existing), false);
      const timestamp = currentDate.toISOString();
      const record = {
        uid: normalizedUid,
        customerId: normalizedCustomerId,
        subscriptionId: null,
        plan: null,
        status: "none",
        trialUsedAt: null,
        trialEndsAt: null,
        currentPeriodEndsAt: null,
        cancelAtPeriodEnd: false,
        lastEventCreated: null,
        lastEventId: null,
        updatedAt: timestamp,
      };
      data.learners[normalizedUid] = record;
      return mutation(viewRecord(record));
    }, { allowMissing: true });
  }

  function applySubscriptionSnapshot(snapshot = {}) {
    return enqueueMutation((data, currentDate) => {
      if (!isPlainObject(snapshot)) throw invalidInput();
      const eventId = requireIdentifier(snapshot.eventId, EVENT_ID_PATTERN);
      const created = requireEventCreated(snapshot.created);
      if (includesProcessedEvent(data, eventId)) {
        return mutation({ applied: false, reason: "duplicate" }, false);
      }

      const uid = requireUid(snapshot.uid);
      const customerId = requireIdentifier(snapshot.customerId, CUSTOMER_ID_PATTERN);
      const subscriptionId = requireIdentifier(
        snapshot.subscriptionId,
        SUBSCRIPTION_ID_PATTERN,
      );
      if (!PLANS.has(snapshot.plan) || !SUBSCRIPTION_STATUSES.has(snapshot.status)) {
        throw invalidInput();
      }
      if (snapshot.deleted !== undefined && typeof snapshot.deleted !== "boolean") {
        throw invalidInput();
      }
      if (typeof snapshot.cancelAtPeriodEnd !== "boolean") throw invalidInput();
      const trialEndsAt = normalizeOptionalTimestamp(snapshot.trialEndsAt);
      const currentPeriodEndsAt = normalizeOptionalTimestamp(snapshot.currentPeriodEndsAt);
      const record = data.learners[uid];
      if (!record || record.customerId !== customerId) {
        throw storeError(
          "BILLING_STORE_IDENTITY_CONFLICT",
          "The billing identity conflicts with another learner.",
        );
      }
      const customerOwner = Object.values(data.learners).find(
        (candidate) => candidate.customerId === customerId,
      );
      const subscriptionOwner = Object.values(data.learners).find(
        (candidate) => candidate.subscriptionId === subscriptionId,
      );
      if (
        customerOwner?.uid !== uid ||
        (subscriptionOwner && subscriptionOwner.uid !== uid)
      ) {
        throw storeError(
          "BILLING_STORE_IDENTITY_CONFLICT",
          "The billing identity conflicts with another learner.",
        );
      }

      addProcessedEvent(data, { id: eventId, created });
      if (!eventIsNewer(created, eventId, record)) {
        return mutation({ applied: false, reason: "stale" });
      }

      const status = snapshot.deleted === true ? "canceled" : snapshot.status;
      const timestamp = currentDate.toISOString();
      const trialUsedAt =
        record.trialUsedAt ||
        (status === "trialing" || trialEndsAt !== null ? timestamp : null);
      Object.assign(record, {
        subscriptionId,
        plan: snapshot.plan,
        status,
        trialUsedAt,
        trialEndsAt,
        currentPeriodEndsAt,
        cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd,
        lastEventCreated: created,
        lastEventId: eventId,
        updatedAt: timestamp,
      });
      return mutation({ applied: true, reason: "updated" });
    });
  }

  async function hasUsedTrial(uid) {
    const normalizedUid = requireUid(uid);
    const data = await readData();
    return data.learners[normalizedUid]?.trialUsedAt !== null &&
      data.learners[normalizedUid]?.trialUsedAt !== undefined;
  }

  function recordProcessedEvent({ eventId, created } = {}) {
    return enqueueMutation((data) => {
      const normalizedEventId = requireIdentifier(eventId, EVENT_ID_PATTERN);
      const normalizedCreated = requireEventCreated(created);
      if (includesProcessedEvent(data, normalizedEventId)) {
        return mutation({ recorded: false, reason: "duplicate" }, false);
      }
      addProcessedEvent(data, { id: normalizedEventId, created: normalizedCreated });
      return mutation({ recorded: true, reason: "recorded" });
    }, { allowMissing: true });
  }

  async function health() {
    try {
      const data = await readData({ allowMissing: true });
      return { configured: data !== null, healthy: data !== null };
    } catch {
      return { configured: true, healthy: false };
    }
  }

  return Object.freeze({
    health,
    getByUid,
    getByCustomerId,
    bindCustomer,
    applySubscriptionSnapshot,
    hasUsedTrial,
    recordProcessedEvent,
  });
}
