import { spawn } from "node:child_process";
import { constants as fsConstants } from "node:fs";
import * as fsPromises from "node:fs/promises";
import { dirname, join, parse, resolve, sep } from "node:path";

const SCHEMA_VERSION = 1;
const MAX_PROCESSED_EVENTS = 2000;
const DIRECTORY_MODE = 0o750;
const FILE_MODE = 0o600;
const NO_FOLLOW = fsConstants.O_NOFOLLOW || 0;
const DIRECTORY_FLAG = fsConstants.O_DIRECTORY || 0;
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
  const learners = Object.create(null);
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
      learners[uid] = record;
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
  return {
    version: SCHEMA_VERSION,
    learners,
    processedEvents: data.processedEvents,
  };
}

function emptyData() {
  return {
    version: SCHEMA_VERSION,
    learners: Object.create(null),
    processedEvents: [],
  };
}

function clone(value) {
  return structuredClone(value);
}

function cloneData(data) {
  const learners = Object.create(null);
  for (const [uid, record] of Object.entries(data.learners)) {
    learners[uid] = clone(record);
  }
  return {
    version: SCHEMA_VERSION,
    learners,
    processedEvents: clone(data.processedEvents),
  };
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

function unsafePathError() {
  return storeError(
    "BILLING_STORE_UNSAFE_PATH",
    "The billing store path is unsafe.",
  );
}

async function allowedSystemRootAlias(path, operations) {
  if (process.platform !== "darwin") return false;
  const expectedTargets = new Map([
    ["/etc", "/private/etc"],
    ["/tmp", "/private/tmp"],
    ["/var", "/private/var"],
  ]);
  const expected = expectedTargets.get(path);
  if (!expected) return false;
  try {
    return await operations.realpath(path) === expected;
  } catch {
    return false;
  }
}

async function assertSafeDirectoryComponents(path, operations) {
  const absolutePath = resolve(path);
  const root = parse(absolutePath).root;
  let current = root;
  const components = absolutePath.slice(root.length).split(sep).filter(Boolean);
  for (const component of components) {
    current = join(current, component);
    let details;
    try {
      details = await operations.lstat(current);
    } catch (error) {
      if (error?.code === "ENOENT") return;
      throw unsafePathError();
    }
    if (details.isSymbolicLink()) {
      if (await allowedSystemRootAlias(current, operations)) continue;
      throw unsafePathError();
    }
    if (!details.isDirectory()) throw unsafePathError();
  }
}

async function lstatOrNull(path, operations) {
  try {
    return await operations.lstat(path);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw unsafePathError();
  }
}

function requireSafeRegular(details) {
  if (details?.isSymbolicLink()) throw unsafePathError();
  if (!details?.isFile()) {
    throw storeError("BILLING_STORE_CORRUPT", "The billing store is corrupt.");
  }
}

async function openExistingRegular(path, flags, operations) {
  const before = await lstatOrNull(path, operations);
  if (!before) {
    const error = new Error("File does not exist");
    error.code = "ENOENT";
    throw error;
  }
  requireSafeRegular(before);
  let handle;
  try {
    handle = await operations.open(path, flags | NO_FOLLOW);
    const opened = await handle.stat();
    const after = await operations.lstat(path);
    requireSafeRegular(after);
    if (
      !opened.isFile() ||
      opened.dev !== before.dev ||
      opened.ino !== before.ino ||
      after.dev !== before.dev ||
      after.ino !== before.ino
    ) {
      throw unsafePathError();
    }
    return handle;
  } catch (error) {
    if (handle) await handle.close().catch(() => {});
    if (error instanceof BillingStoreError) throw error;
    throw unsafePathError();
  }
}

async function openNewRegular(path, operations) {
  if (await lstatOrNull(path, operations)) throw unsafePathError();
  let handle;
  try {
    handle = await operations.open(
      path,
      fsConstants.O_WRONLY |
        fsConstants.O_CREAT |
        fsConstants.O_EXCL |
        NO_FOLLOW,
      FILE_MODE,
    );
    const opened = await handle.stat();
    const created = await operations.lstat(path);
    requireSafeRegular(created);
    if (!opened.isFile() || opened.dev !== created.dev || opened.ino !== created.ino) {
      throw unsafePathError();
    }
    return handle;
  } catch (error) {
    if (handle) await handle.close().catch(() => {});
    if (error instanceof BillingStoreError) throw error;
    throw unsafePathError();
  }
}

async function readTextSafely(path, operations) {
  const handle = await openExistingRegular(path, fsConstants.O_RDONLY, operations);
  try {
    return await handle.readFile("utf8");
  } finally {
    await handle.close();
  }
}

async function copyRegularFileSafely(source, destination, operations) {
  const sourceHandle = await openExistingRegular(source, fsConstants.O_RDONLY, operations);
  let destinationHandle;
  try {
    const contents = await sourceHandle.readFile();
    destinationHandle = await openNewRegular(destination, operations);
    await destinationHandle.writeFile(contents);
    await destinationHandle.sync();
    await destinationHandle.chmod(FILE_MODE);
  } finally {
    await sourceHandle.close().catch(() => {});
    if (destinationHandle) await destinationHandle.close().catch(() => {});
  }
}

async function chmodRegularSafely(path, operations) {
  const handle = await openExistingRegular(path, fsConstants.O_RDWR, operations);
  try {
    await handle.chmod(FILE_MODE);
  } finally {
    await handle.close();
  }
}

async function chmodDirectorySafely(path, mode, operations) {
  await assertSafeDirectoryComponents(path, operations);
  let handle;
  try {
    handle = await operations.open(
      path,
      fsConstants.O_RDONLY | DIRECTORY_FLAG | NO_FOLLOW,
    );
    const details = await handle.stat();
    if (!details.isDirectory()) throw unsafePathError();
    await handle.chmod(mode);
  } finally {
    if (handle) await handle.close().catch(() => {});
  }
}

async function syncDirectorySafely(path, operations) {
  await assertSafeDirectoryComponents(path, operations);
  let handle;
  try {
    handle = await operations.open(
      path,
      fsConstants.O_RDONLY | DIRECTORY_FLAG | NO_FOLLOW,
    );
    const details = await handle.stat();
    if (!details.isDirectory()) throw unsafePathError();
    await handle.sync();
  } catch (error) {
    if (error instanceof BillingStoreError) throw error;
    throw error;
  } finally {
    if (handle) await handle.close().catch(() => {});
  }
}

async function acquireInterprocessMutationLock(filePath, operations) {
  const lockPath = `${filePath}.lock`;
  let lockHandle;
  try {
    const before = await lstatOrNull(lockPath, operations);
    if (before) requireSafeRegular(before);
    lockHandle = await operations.open(
      lockPath,
      fsConstants.O_RDWR |
        fsConstants.O_APPEND |
        fsConstants.O_CREAT |
        NO_FOLLOW,
      FILE_MODE,
    );
    const opened = await lockHandle.stat();
    const after = await operations.lstat(lockPath);
    requireSafeRegular(after);
    if (
      !opened.isFile() ||
      (before && (opened.dev !== before.dev || opened.ino !== before.ino)) ||
      opened.dev !== after.dev ||
      opened.ino !== after.ino
    ) {
      throw unsafePathError();
    }
    await lockHandle.chmod(FILE_MODE);
  } catch (error) {
    if (lockHandle) await lockHandle.close().catch(() => {});
    if (error instanceof BillingStoreError) throw error;
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

async function persistAtomically(filePath, data, hadPriorFile, operations) {
  temporaryFileCounter += 1;
  const suffix = `${process.pid}-${temporaryFileCounter}`;
  const temporaryPath = `${filePath}.tmp-${suffix}`;
  const backupPath = `${filePath}.backup`;
  const backupTemporaryPath = `${backupPath}.tmp-${suffix}`;
  const recoveryTemporaryPath = `${filePath}.recovery-${suffix}`;
  let handle;
  try {
    handle = await openNewRegular(temporaryPath, operations);
    await handle.writeFile(`${JSON.stringify(data, null, 2)}\n`, "utf8");
    await handle.sync();
    await handle.chmod(FILE_MODE);
    await handle.close();
    handle = null;

    if (hadPriorFile) {
      await copyRegularFileSafely(filePath, backupTemporaryPath, operations);
      const existingBackup = await lstatOrNull(backupPath, operations);
      if (existingBackup) requireSafeRegular(existingBackup);
      await operations.rename(backupTemporaryPath, backupPath);
      await syncDirectorySafely(dirname(filePath), operations);
    }

    const existingPrimary = await lstatOrNull(filePath, operations);
    if (existingPrimary) requireSafeRegular(existingPrimary);
    await operations.rename(temporaryPath, filePath);
    try {
      await chmodRegularSafely(filePath, operations);
      await syncDirectorySafely(dirname(filePath), operations);
    } catch {
      try {
        if (hadPriorFile) {
          await copyRegularFileSafely(backupPath, recoveryTemporaryPath, operations);
          const currentPrimary = await lstatOrNull(filePath, operations);
          if (currentPrimary) requireSafeRegular(currentPrimary);
          await operations.rename(recoveryTemporaryPath, filePath);
          await chmodRegularSafely(filePath, operations);
        } else {
          const currentPrimary = await lstatOrNull(filePath, operations);
          requireSafeRegular(currentPrimary);
          await operations.unlink(filePath);
        }
        await syncDirectorySafely(dirname(filePath), operations);
      } catch {
        throw storeError(
          "BILLING_STORE_DURABILITY_FAILED",
          "The billing store could not confirm a durable update.",
        );
      }
      throw storeError(
        "BILLING_STORE_DURABILITY_FAILED",
        "The billing store could not confirm a durable update.",
      );
    }
  } finally {
    if (handle) await handle.close().catch(() => {});
    await operations.unlink(temporaryPath).catch(() => {});
    await operations.unlink(backupTemporaryPath).catch(() => {});
    await operations.unlink(recoveryTemporaryPath).catch(() => {});
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
  filePath = resolve(filePath);
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
    await assertSafeDirectoryComponents(parentPath, operations);
    try {
      const parent = await operations.lstat(parentPath);
      if (!parent.isDirectory() || !secureDirectoryMode(parent.mode)) {
        throw storeError("BILLING_STORE_CORRUPT", "The billing store is corrupt.");
      }
    } catch (error) {
      if (error instanceof BillingStoreError) throw error;
      if (error?.code !== "ENOENT") {
        throw storeError("BILLING_STORE_CORRUPT", "The billing store is corrupt.");
      }
      await operations.mkdir(parentPath, { recursive: true, mode: DIRECTORY_MODE });
      await assertSafeDirectoryComponents(parentPath, operations);
    }
    await chmodDirectorySafely(parentPath, DIRECTORY_MODE, operations);
  }

  async function verifyStoredPermissions(primary) {
    try {
      await assertSafeDirectoryComponents(dirname(filePath), operations);
      const parent = await operations.lstat(dirname(filePath));
      requireSafeRegular(primary);
      if (
        !parent.isDirectory() ||
        !secureDirectoryMode(parent.mode) ||
        (primary.mode & 0o777) !== FILE_MODE
      ) {
        throw new Error("unsafe permissions");
      }
      for (const optionalPath of [`${filePath}.backup`, `${filePath}.lock`]) {
        const optional = await lstatOrNull(optionalPath, operations);
        if (!optional) continue;
        requireSafeRegular(optional);
        if ((optional.mode & 0o777) !== FILE_MODE) {
          throw new Error("unsafe permissions");
        }
      }
    } catch (error) {
      if (error instanceof BillingStoreError) throw error;
      throw storeError("BILLING_STORE_CORRUPT", "The billing store is corrupt.");
    }
  }

  async function backupExists() {
    const backup = await lstatOrNull(`${filePath}.backup`, operations);
    if (!backup) return false;
    requireSafeRegular(backup);
    return true;
  }

  async function readData({ allowMissing = false } = {}) {
    await assertSafeDirectoryComponents(dirname(filePath), operations);
    const primary = await lstatOrNull(filePath, operations);
    if (!primary) {
      if (await backupExists()) {
        throw storeError("BILLING_STORE_CORRUPT", "The billing store is corrupt.");
      }
      if (allowMissing) return null;
      throw storeError(
        "BILLING_STORE_NOT_CONFIGURED",
        "The billing store is not configured.",
      );
    }
    requireSafeRegular(primary);
    await verifyStoredPermissions(primary);
    let text;
    try {
      text = await readTextSafely(filePath, operations);
    } catch (error) {
      if (error instanceof BillingStoreError) throw error;
      throw storeError("BILLING_STORE_CORRUPT", "The billing store could not be read.");
    }
    try {
      return validateData(JSON.parse(text));
    } catch (error) {
      if (error instanceof BillingStoreError) throw error;
      throw storeError("BILLING_STORE_CORRUPT", "The billing store is corrupt.");
    }
  }

  function enqueueMutation(mutator, { allowMissing = false } = {}) {
    const run = async () => {
      await prepareParentDirectory();
      const releaseLock = await acquireInterprocessMutationLock(filePath, operations);
      try {
        const current = await readData({ allowMissing });
        const hadPriorFile = current !== null;
        const working = cloneData(current || emptyData());
        const outcome = await mutator(working, nowDate(now));
        if (outcome.changed) {
          validateData(working);
          await persistAtomically(filePath, working, hadPriorFile, operations);
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
    return viewRecord(
      Object.hasOwn(data.learners, normalizedUid)
        ? data.learners[normalizedUid]
        : null,
    );
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
      const existing = Object.hasOwn(data.learners, normalizedUid)
        ? data.learners[normalizedUid]
        : null;
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
      const record = Object.hasOwn(data.learners, uid) ? data.learners[uid] : null;
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
    if (!Object.hasOwn(data.learners, normalizedUid)) return false;
    return data.learners[normalizedUid].trialUsedAt !== null;
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
