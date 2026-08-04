import { spawn } from "node:child_process";
import * as fsPromises from "node:fs/promises";
import { createInterface } from "node:readline";
import { basename, dirname, join, parse, resolve, sep } from "node:path";

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
const PENDING_TRIAL_CHECKOUT_KEYS = [
  "attemptId",
  "expiresAt",
  "plan",
  "reservedAt",
  "sessionId",
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
const CHECKOUT_SESSION_ID_PATTERN = /^cs_[A-Za-z0-9_]+$/u;
const CHECKOUT_ATTEMPT_PATTERN = /^[A-Za-z0-9._:-]{1,64}$/u;

let temporaryFileCounter = 0;

const DIRECTORY_ANCHOR_HELPER_SOURCE = String.raw`
import { spawn } from "node:child_process";
import { constants } from "node:fs";
import * as fs from "node:fs/promises";
import { createInterface } from "node:readline";

const FILE_MODE = 0o600;
const NO_FOLLOW = constants.O_NOFOLLOW || 0;
const DIRECTORY_FLAG = constants.O_DIRECTORY || 0;
let directoryHandle;
let lockHandle;

function unsafe() {
  const error = new Error("unsafe path");
  error.code = "UNSAFE";
  return error;
}

function leafName(value) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value === "." ||
    value === ".." ||
    value.includes("/") ||
    value.includes("\\\\")
  ) throw unsafe();
  return value;
}

function metadata(details) {
  return {
    dev: String(details.dev),
    ino: String(details.ino),
    mode: details.mode,
    file: details.isFile(),
    directory: details.isDirectory(),
    symlink: details.isSymbolicLink(),
  };
}

async function lstatOrNull(name) {
  try {
    return await fs.lstat(leafName(name));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function requireRegular(details) {
  if (!details || details.isSymbolicLink() || !details.isFile()) throw unsafe();
}

async function openExisting(name, flags) {
  const safeName = leafName(name);
  const before = await lstatOrNull(safeName);
  requireRegular(before);
  let handle;
  try {
    handle = await fs.open(safeName, flags | NO_FOLLOW);
    const opened = await handle.stat();
    const after = await fs.lstat(safeName);
    requireRegular(after);
    if (
      !opened.isFile() ||
      opened.dev !== before.dev ||
      opened.ino !== before.ino ||
      after.dev !== before.dev ||
      after.ino !== before.ino
    ) throw unsafe();
    return handle;
  } catch (error) {
    await handle?.close().catch(() => {});
    throw error;
  }
}

async function openNew(name) {
  const safeName = leafName(name);
  if (await lstatOrNull(safeName)) throw unsafe();
  let handle;
  try {
    handle = await fs.open(
      safeName,
      constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | NO_FOLLOW,
      FILE_MODE,
    );
    const opened = await handle.stat();
    const created = await fs.lstat(safeName);
    requireRegular(created);
    if (!opened.isFile() || opened.dev !== created.dev || opened.ino !== created.ino) {
      throw unsafe();
    }
    return handle;
  } catch (error) {
    await handle?.close().catch(() => {});
    if (error?.code === "EEXIST" || error?.code === "ELOOP") throw unsafe();
    throw error;
  }
}

async function copyRegular(source, destination) {
  const sourceHandle = await openExisting(source, constants.O_RDONLY);
  let destinationHandle;
  try {
    const contents = await sourceHandle.readFile();
    destinationHandle = await openNew(destination);
    await destinationHandle.writeFile(contents);
    await destinationHandle.sync();
    await destinationHandle.chmod(FILE_MODE);
  } finally {
    await sourceHandle.close().catch(() => {});
    await destinationHandle?.close().catch(() => {});
  }
}

async function acquireLock(name) {
  if (lockHandle) throw unsafe();
  const safeName = leafName(name);
  const before = await lstatOrNull(safeName);
  if (before) requireRegular(before);
  let handle;
  try {
    handle = await fs.open(
      safeName,
      constants.O_RDWR | constants.O_APPEND | constants.O_CREAT | NO_FOLLOW,
      FILE_MODE,
    );
    const opened = await handle.stat();
    const after = await fs.lstat(safeName);
    requireRegular(after);
    if (
      !opened.isFile() ||
      (before && (opened.dev !== before.dev || opened.ino !== before.ino)) ||
      opened.dev !== after.dev ||
      opened.ino !== after.ino
    ) throw unsafe();
    await handle.chmod(FILE_MODE);
    await new Promise((resolve, reject) => {
      const perl = spawn("/usr/bin/perl", [
        "-e",
        "use strict; use warnings; use Fcntl qw(:flock); flock(STDIN, LOCK_EX) or die qq(lock failed\\n); print qq(LOCKED\\n);",
      ], { stdio: [handle.fd, "pipe", "pipe"] });
      let output = "";
      perl.stdout.setEncoding("utf8");
      perl.stdout.on("data", (chunk) => { output += chunk; });
      perl.once("error", reject);
      perl.once("close", (code, signal) => {
        if (code === 0 && signal === null && output === "LOCKED\n") resolve();
        else reject(new Error("lock acquisition failed"));
      });
    });
    lockHandle = handle;
  } catch (error) {
    await handle?.close().catch(() => {});
    throw error;
  }
}

async function execute(command) {
  switch (command.op) {
    case "metadata": {
      const details = await lstatOrNull(command.name);
      return details ? metadata(details) : null;
    }
    case "readText": {
      const handle = await openExisting(command.name, constants.O_RDONLY);
      try { return await handle.readFile("utf8"); }
      finally { await handle.close(); }
    }
    case "writeNew": {
      const handle = await openNew(command.name);
      try {
        await handle.writeFile(command.contents, "utf8");
        await handle.sync();
        await handle.chmod(FILE_MODE);
      } finally { await handle.close(); }
      return null;
    }
    case "copy":
      await copyRegular(command.source, command.destination);
      return null;
    case "chmodFile": {
      const handle = await openExisting(command.name, constants.O_RDWR);
      try { await handle.chmod(FILE_MODE); }
      finally { await handle.close(); }
      return null;
    }
    case "rename": {
      const sourceName = leafName(command.source);
      const destinationName = leafName(command.destination);
      const source = await lstatOrNull(sourceName);
      requireRegular(source);
      const destination = await lstatOrNull(destinationName);
      if (destination) requireRegular(destination);
      await fs.rename(sourceName, destinationName);
      const renamed = await fs.lstat(destinationName);
      requireRegular(renamed);
      if (renamed.dev !== source.dev || renamed.ino !== source.ino) throw unsafe();
      return null;
    }
    case "unlink": {
      try { await fs.unlink(leafName(command.name)); }
      catch (error) { if (error?.code !== "ENOENT") throw error; }
      return null;
    }
    case "syncDirectory":
      await directoryHandle.sync();
      return null;
    case "chmodDirectory":
      await directoryHandle.chmod(command.mode);
      return null;
    case "acquireLock":
      await acquireLock(command.name);
      return null;
    case "releaseLock":
      await lockHandle?.close();
      lockHandle = undefined;
      return null;
    default:
      throw unsafe();
  }
}

async function start() {
  directoryHandle = await fs.open(".", constants.O_RDONLY | DIRECTORY_FLAG | NO_FOLLOW);
  const descriptor = await directoryHandle.stat();
  const pathname = await fs.lstat(".");
  if (
    !descriptor.isDirectory() ||
    !pathname.isDirectory() ||
    descriptor.dev !== pathname.dev ||
    descriptor.ino !== pathname.ino
  ) throw unsafe();
  process.stdout.write(JSON.stringify({
    id: 0,
    ok: true,
    result: { ...metadata(descriptor), canonical: await fs.realpath(".") },
  }) + "\n");
  const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
  let chain = Promise.resolve();
  input.on("line", (line) => {
    chain = chain.then(async () => {
      let request;
      try {
        request = JSON.parse(line);
        const result = await execute(request.command);
        process.stdout.write(JSON.stringify({ id: request.id, ok: true, result }) + "\n");
      } catch (error) {
        process.stdout.write(JSON.stringify({
          id: request?.id ?? -1,
          ok: false,
          error: { code: error?.code || "FAILED", message: String(error?.message || error) },
        }) + "\n");
      }
    });
  });
  await new Promise((resolve) => input.once("close", resolve));
  await chain;
  await lockHandle?.close().catch(() => {});
  await directoryHandle.close();
}

start().catch((error) => {
  process.stderr.write(String(error?.stack || error));
  process.exitCode = 1;
});
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

function validatePendingTrialCheckout(value) {
  if (
    !isPlainObject(value) ||
    !hasExactKeys(value, PENDING_TRIAL_CHECKOUT_KEYS) ||
    !PLANS.has(value.plan) ||
    typeof value.attemptId !== "string" ||
    !CHECKOUT_ATTEMPT_PATTERN.test(value.attemptId) ||
    !canonicalIso(value.reservedAt)
  ) {
    return false;
  }
  if (value.sessionId === null || value.expiresAt === null) {
    return value.sessionId === null && value.expiresAt === null;
  }
  return (
    typeof value.sessionId === "string" &&
    CHECKOUT_SESSION_ID_PATTERN.test(value.sessionId) &&
    canonicalIso(value.expiresAt) &&
    Date.parse(value.expiresAt) > Date.parse(value.reservedAt)
  );
}

function validateRecord(uid, record) {
  const hasPendingTrialCheckout = Object.hasOwn(record || {}, "pendingTrialCheckout");
  const allowedKeys = hasPendingTrialCheckout
    ? [...RECORD_KEYS, "pendingTrialCheckout"]
    : RECORD_KEYS;
  if (
    !isPlainObject(record) ||
    !hasExactKeys(record, allowedKeys) ||
    record.uid !== uid ||
    !validUid(record.uid) ||
    !CUSTOMER_ID_PATTERN.test(record.customerId) ||
    !validOptionalIso(record.trialUsedAt) ||
    !validOptionalIso(record.trialEndsAt) ||
    !validOptionalIso(record.currentPeriodEndsAt) ||
    typeof record.cancelAtPeriodEnd !== "boolean" ||
    !canonicalIso(record.updatedAt) ||
    (hasPendingTrialCheckout &&
      (!validatePendingTrialCheckout(record.pendingTrialCheckout) ||
        record.trialUsedAt !== null))
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

function requireCheckoutAttempt(value) {
  return requireIdentifier(value, CHECKOUT_ATTEMPT_PATTERN);
}

function reservationConflict() {
  return storeError(
    "BILLING_STORE_RESERVATION_CONFLICT",
    "The pending billing reservation conflicts with stored state.",
  );
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

function sameIdentity(left, right) {
  return String(left.dev) === String(right.dev) && String(left.ino) === String(right.ino);
}

async function inspectParentDirectory(parentPath, operations) {
  await assertSafeDirectoryComponents(parentPath, operations);
  try {
    const details = await operations.lstat(parentPath);
    if (!details.isDirectory() || details.isSymbolicLink()) throw unsafePathError();
    return {
      dev: String(details.dev),
      ino: String(details.ino),
      mode: details.mode,
      canonical: await operations.realpath(parentPath),
    };
  } catch (error) {
    if (error instanceof BillingStoreError) throw error;
    if (error?.code === "ENOENT") {
      throw storeError(
        "BILLING_STORE_NOT_CONFIGURED",
        "The billing store is not configured.",
      );
    }
    throw unsafePathError();
  }
}

async function openDirectoryAnchor(parentPath, operations) {
  const expected = await inspectParentDirectory(parentPath, operations);
  await operations.beforeParentAnchor?.({ parentPath, ...expected });
  const helper = spawn(
    process.execPath,
    ["--input-type=module", "--eval", DIRECTORY_ANCHOR_HELPER_SOURCE],
    { cwd: parentPath, stdio: ["pipe", "pipe", "pipe"] },
  );
  helper.stdout.setEncoding("utf8");
  helper.stderr.setEncoding("utf8");
  let stderr = "";
  helper.stderr.on("data", (chunk) => { stderr = `${stderr}${chunk}`.slice(-2000); });
  const output = createInterface({ input: helper.stdout, crlfDelay: Infinity });
  let nextId = 1;
  const pending = new Map();
  let closed = false;

  function rejectPending(error) {
    for (const { reject } of pending.values()) reject(error);
    pending.clear();
  }

  helper.once("error", () => rejectPending(unsafePathError()));
  helper.once("close", () => {
    closed = true;
    rejectPending(unsafePathError());
  });

  const ready = await new Promise((resolveReady, rejectReady) => {
    const fail = () => rejectReady(unsafePathError());
    helper.once("error", fail);
    helper.once("close", fail);
    output.once("line", (line) => {
      helper.off("error", fail);
      helper.off("close", fail);
      try {
        const response = JSON.parse(line);
        if (!response.ok || response.id !== 0) throw new Error("invalid anchor response");
        resolveReady(response.result);
      } catch {
        rejectReady(unsafePathError());
      }
    });
  }).catch(async (error) => {
    helper.stdin.destroy();
    helper.kill();
    await new Promise((resolveClose) => helper.once("close", resolveClose)).catch(() => {});
    throw error;
  });

  if (
    !ready.directory ||
    !sameIdentity(ready, expected) ||
    ready.canonical !== expected.canonical
  ) {
    helper.stdin.end();
    throw unsafePathError();
  }

  output.on("line", (line) => {
    let response;
    try { response = JSON.parse(line); }
    catch { rejectPending(unsafePathError()); return; }
    const waiter = pending.get(response.id);
    if (!waiter) return;
    pending.delete(response.id);
    if (response.ok) waiter.resolve(response.result);
    else if (response.error?.code === "UNSAFE" || response.error?.code === "ELOOP") {
      waiter.reject(unsafePathError());
    } else {
      const error = new Error(response.error?.message || "Directory anchor operation failed");
      error.code = response.error?.code;
      waiter.reject(error);
    }
  });

  async function verifyPathIdentity() {
    const current = await inspectParentDirectory(parentPath, operations);
    if (!sameIdentity(current, expected) || current.canonical !== expected.canonical) {
      throw unsafePathError();
    }
  }

  async function requestRaw(command) {
    if (closed || !helper.stdin.writable) throw unsafePathError();
    const id = nextId;
    nextId += 1;
    return new Promise((resolveRequest, rejectRequest) => {
      pending.set(id, { resolve: resolveRequest, reject: rejectRequest });
      helper.stdin.write(`${JSON.stringify({ id, command })}\n`, (error) => {
        if (!error) return;
        pending.delete(id);
        rejectRequest(unsafePathError());
      });
    });
  }

  const anchor = {
    parent: expected,
    async run(command) {
      await verifyPathIdentity();
      await operations.beforeAnchorCommand?.(command);
      await verifyPathIdentity();
      const result = await requestRaw(command);
      await operations.afterAnchorCommand?.(command);
      await verifyPathIdentity();
      return result;
    },
    async close() {
      if (closed) return;
      helper.stdin.end();
      await new Promise((resolveClose) => helper.once("close", resolveClose));
      if (helper.exitCode !== 0 && stderr) throw unsafePathError();
    },
  };

  try {
    await operations.afterParentAnchor?.({ parentPath, ...expected });
    await verifyPathIdentity();
    return anchor;
  } catch (error) {
    await anchor.close().catch(() => {});
    throw error;
  }
}

function requireSafeRegular(details) {
  if (details?.symlink) throw unsafePathError();
  if (!details?.file) {
    throw storeError("BILLING_STORE_CORRUPT", "The billing store is corrupt.");
  }
}

async function persistAtomically(fileName, data, hadPriorFile, anchor) {
  temporaryFileCounter += 1;
  const suffix = `${process.pid}-${temporaryFileCounter}`;
  const temporaryName = `${fileName}.tmp-${suffix}`;
  const backupName = `${fileName}.backup`;
  const backupTemporaryName = `${backupName}.tmp-${suffix}`;
  const recoveryTemporaryName = `${fileName}.recovery-${suffix}`;
  try {
    await anchor.run({
      op: "writeNew",
      name: temporaryName,
      contents: `${JSON.stringify(data, null, 2)}\n`,
    });

    if (hadPriorFile) {
      await anchor.run({ op: "copy", source: fileName, destination: backupTemporaryName });
      const existingBackup = await anchor.run({ op: "metadata", name: backupName });
      if (existingBackup) requireSafeRegular(existingBackup);
      await anchor.run({ op: "rename", source: backupTemporaryName, destination: backupName });
      await anchor.run({ op: "syncDirectory" });
    }

    const existingPrimary = await anchor.run({ op: "metadata", name: fileName });
    if (existingPrimary) requireSafeRegular(existingPrimary);
    await anchor.run({ op: "rename", source: temporaryName, destination: fileName });
    try {
      await anchor.run({ op: "chmodFile", name: fileName });
      await anchor.run({ op: "syncDirectory" });
    } catch {
      try {
        if (hadPriorFile) {
          await anchor.run({ op: "copy", source: backupName, destination: recoveryTemporaryName });
          const currentPrimary = await anchor.run({ op: "metadata", name: fileName });
          if (currentPrimary) requireSafeRegular(currentPrimary);
          await anchor.run({ op: "rename", source: recoveryTemporaryName, destination: fileName });
          await anchor.run({ op: "chmodFile", name: fileName });
        } else {
          const currentPrimary = await anchor.run({ op: "metadata", name: fileName });
          requireSafeRegular(currentPrimary);
          await anchor.run({ op: "unlink", name: fileName });
        }
        await anchor.run({ op: "syncDirectory" });
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
    await anchor.run({ op: "unlink", name: temporaryName }).catch(() => {});
    await anchor.run({ op: "unlink", name: backupTemporaryName }).catch(() => {});
    await anchor.run({ op: "unlink", name: recoveryTemporaryName }).catch(() => {});
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

  const parentPath = dirname(filePath);
  const fileName = basename(filePath);

  async function openStoreAnchor({ normalizeMode = false } = {}) {
    const anchor = await openDirectoryAnchor(parentPath, operations);
    if (!secureDirectoryMode(anchor.parent.mode)) {
      await anchor.close().catch(() => {});
      throw storeError("BILLING_STORE_CORRUPT", "The billing store is corrupt.");
    }
    if (normalizeMode) await anchor.run({ op: "chmodDirectory", mode: DIRECTORY_MODE });
    return anchor;
  }

  async function verifyStoredPermissions(anchor, primary) {
    try {
      requireSafeRegular(primary);
      if (
        !secureDirectoryMode(anchor.parent.mode) ||
        (primary.mode & 0o777) !== FILE_MODE
      ) {
        throw new Error("unsafe permissions");
      }
      for (const optionalName of [`${fileName}.backup`, `${fileName}.lock`]) {
        const optional = await anchor.run({ op: "metadata", name: optionalName });
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

  async function backupExists(anchor) {
    const backup = await anchor.run({ op: "metadata", name: `${fileName}.backup` });
    if (!backup) return false;
    requireSafeRegular(backup);
    return true;
  }

  async function readData(anchor, { allowMissing = false } = {}) {
    const primary = await anchor.run({ op: "metadata", name: fileName });
    if (!primary) {
      if (await backupExists(anchor)) {
        throw storeError("BILLING_STORE_CORRUPT", "The billing store is corrupt.");
      }
      if (allowMissing) return null;
      throw storeError(
        "BILLING_STORE_NOT_CONFIGURED",
        "The billing store is not configured.",
      );
    }
    requireSafeRegular(primary);
    await verifyStoredPermissions(anchor, primary);
    let text;
    try {
      text = await anchor.run({ op: "readText", name: fileName });
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
      const anchor = await openStoreAnchor({ normalizeMode: true });
      let lockAcquired = false;
      try {
        try {
          await anchor.run({ op: "acquireLock", name: `${fileName}.lock` });
          lockAcquired = true;
        } catch (error) {
          if (error instanceof BillingStoreError) throw error;
          throw storeError(
            "BILLING_STORE_LOCK_FAILED",
            "The billing store lock could not open.",
          );
        }
        const current = await readData(anchor, { allowMissing });
        const hadPriorFile = current !== null;
        const working = cloneData(current || emptyData());
        const outcome = await mutator(working, nowDate(now));
        if (outcome.changed) {
          validateData(working);
          await persistAtomically(fileName, working, hadPriorFile, anchor);
        }
        return outcome.result;
      } finally {
        if (lockAcquired) {
          await anchor.run({ op: "releaseLock" }).catch(() => {});
        }
        await anchor.close().catch(() => {});
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
    const anchor = await openStoreAnchor();
    try {
      const data = await readData(anchor);
      return viewRecord(
        Object.hasOwn(data.learners, normalizedUid)
          ? data.learners[normalizedUid]
          : null,
      );
    } finally {
      await anchor.close().catch(() => {});
    }
  }

  async function getByCustomerId(customerId) {
    const normalizedCustomerId = requireIdentifier(customerId, CUSTOMER_ID_PATTERN);
    const anchor = await openStoreAnchor();
    try {
      const data = await readData(anchor);
      const record = Object.values(data.learners).find(
        (candidate) => candidate.customerId === normalizedCustomerId,
      );
      return viewRecord(record);
    } finally {
      await anchor.close().catch(() => {});
    }
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

  async function getPendingTrialCheckout(uid) {
    const normalizedUid = requireUid(uid);
    const anchor = await openStoreAnchor();
    try {
      const data = await readData(anchor);
      const record = Object.hasOwn(data.learners, normalizedUid)
        ? data.learners[normalizedUid]
        : null;
      return record?.pendingTrialCheckout
        ? clone(record.pendingTrialCheckout)
        : null;
    } finally {
      await anchor.close().catch(() => {});
    }
  }

  function reservePendingTrialCheckout({ uid, plan, attemptId } = {}) {
    return enqueueMutation((data, currentDate) => {
      const normalizedUid = requireUid(uid);
      if (!PLANS.has(plan)) throw invalidInput();
      const normalizedAttemptId = requireCheckoutAttempt(attemptId);
      const record = Object.hasOwn(data.learners, normalizedUid)
        ? data.learners[normalizedUid]
        : null;
      if (!record) throw invalidInput();
      if (record.trialUsedAt !== null) {
        const hadPending = Object.hasOwn(record, "pendingTrialCheckout");
        if (hadPending) {
          delete record.pendingTrialCheckout;
          record.updatedAt = currentDate.toISOString();
        }
        return mutation({ reserved: false, reason: "trial-used" }, hadPending);
      }
      if (record.pendingTrialCheckout) {
        return mutation(clone(record.pendingTrialCheckout), false);
      }
      const timestamp = currentDate.toISOString();
      record.pendingTrialCheckout = {
        plan,
        attemptId: normalizedAttemptId,
        sessionId: null,
        reservedAt: timestamp,
        expiresAt: null,
      };
      record.updatedAt = timestamp;
      return mutation(clone(record.pendingTrialCheckout));
    });
  }

  function attachPendingTrialCheckout({
    uid,
    attemptId,
    sessionId,
    expiresAt,
  } = {}) {
    return enqueueMutation((data, currentDate) => {
      const normalizedUid = requireUid(uid);
      const normalizedAttemptId = requireCheckoutAttempt(attemptId);
      const normalizedSessionId = requireIdentifier(
        sessionId,
        CHECKOUT_SESSION_ID_PATTERN,
      );
      if (!canonicalIso(expiresAt)) throw invalidInput();
      const record = Object.hasOwn(data.learners, normalizedUid)
        ? data.learners[normalizedUid]
        : null;
      if (!record) throw invalidInput();
      const pending = record.pendingTrialCheckout;
      if (!pending || pending.attemptId !== normalizedAttemptId) {
        throw reservationConflict();
      }
      if (Date.parse(expiresAt) <= Date.parse(pending.reservedAt)) {
        throw invalidInput();
      }
      if (pending.sessionId !== null || pending.expiresAt !== null) {
        if (
          pending.sessionId !== normalizedSessionId ||
          pending.expiresAt !== expiresAt
        ) {
          throw reservationConflict();
        }
        return mutation(clone(pending), false);
      }
      pending.sessionId = normalizedSessionId;
      pending.expiresAt = expiresAt;
      record.updatedAt = currentDate.toISOString();
      return mutation(clone(pending));
    });
  }

  function clearPendingTrialCheckout({ uid, attemptId } = {}) {
    return enqueueMutation((data, currentDate) => {
      const normalizedUid = requireUid(uid);
      const normalizedAttemptId = requireCheckoutAttempt(attemptId);
      const record = Object.hasOwn(data.learners, normalizedUid)
        ? data.learners[normalizedUid]
        : null;
      if (!record) throw invalidInput();
      const pending = record.pendingTrialCheckout;
      if (!pending) return mutation({ cleared: false }, false);
      if (pending.attemptId !== normalizedAttemptId) throw reservationConflict();
      delete record.pendingTrialCheckout;
      record.updatedAt = currentDate.toISOString();
      return mutation({ cleared: true });
    });
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
      if (trialUsedAt !== null) delete record.pendingTrialCheckout;
      return mutation({ applied: true, reason: "updated" });
    });
  }

  function beginSubscriptionReconciliation({
    uid,
    customerId,
    expectedSubscriptionId,
    eventId,
  } = {}) {
    return enqueueMutation((data, currentDate) => {
      const normalizedEventId = requireIdentifier(eventId, EVENT_ID_PATTERN);
      const normalizedUid = requireUid(uid);
      const normalizedCustomerId = requireIdentifier(customerId, CUSTOMER_ID_PATTERN);
      const normalizedExpected = expectedSubscriptionId === null
        ? null
        : requireIdentifier(expectedSubscriptionId, SUBSCRIPTION_ID_PATTERN);
      const record = Object.hasOwn(data.learners, normalizedUid)
        ? data.learners[normalizedUid]
        : null;
      if (
        !record ||
        record.customerId !== normalizedCustomerId ||
        record.subscriptionId !== normalizedExpected
      ) {
        throw storeError(
          "BILLING_STORE_RECONCILIATION_CONFLICT",
          "The billing reconciliation conflicts with stored state.",
        );
      }
      if (includesProcessedEvent(data, normalizedEventId)) {
        return mutation({ held: false, reason: "duplicate" }, false);
      }
      if (!ACCESS_STATUSES.has(record.status)) {
        return mutation({ held: false, reason: "not_granting" }, false);
      }
      record.status = "incomplete";
      record.updatedAt = currentDate.toISOString();
      return mutation({ held: true, reason: "held" });
    });
  }

  function reconcileSubscriptionSnapshot({ expectedSubscriptionId, snapshot } = {}) {
    return enqueueMutation((data, currentDate) => {
      if (!isPlainObject(snapshot)) throw invalidInput();
      const eventId = requireIdentifier(snapshot.eventId, EVENT_ID_PATTERN);
      const created = requireEventCreated(snapshot.created);
      if (includesProcessedEvent(data, eventId)) {
        return mutation({ applied: false, reason: "duplicate" }, false);
      }
      const normalizedExpected = expectedSubscriptionId === null
        ? null
        : requireIdentifier(expectedSubscriptionId, SUBSCRIPTION_ID_PATTERN);
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
      if (
        !record ||
        record.customerId !== customerId ||
        (record.subscriptionId !== normalizedExpected && record.subscriptionId !== subscriptionId)
      ) {
        throw storeError(
          "BILLING_STORE_RECONCILIATION_CONFLICT",
          "The billing reconciliation conflicts with stored state.",
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
      const status = snapshot.deleted === true ? "canceled" : snapshot.status;
      const timestamp = currentDate.toISOString();
      const advanceEventWatermark = eventIsNewer(created, eventId, record);
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
        lastEventCreated: advanceEventWatermark ? created : record.lastEventCreated,
        lastEventId: advanceEventWatermark ? eventId : record.lastEventId,
        updatedAt: timestamp,
      });
      if (trialUsedAt !== null) delete record.pendingTrialCheckout;
      return mutation({ applied: true, reason: "reconciled" });
    });
  }

  async function hasUsedTrial(uid) {
    const normalizedUid = requireUid(uid);
    const anchor = await openStoreAnchor();
    try {
      const data = await readData(anchor);
      if (!Object.hasOwn(data.learners, normalizedUid)) return false;
      return data.learners[normalizedUid].trialUsedAt !== null;
    } finally {
      await anchor.close().catch(() => {});
    }
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
    let anchor;
    try {
      anchor = await openStoreAnchor();
      const data = await readData(anchor, { allowMissing: true });
      return { configured: data !== null, healthy: data !== null };
    } catch (error) {
      if (error?.code === "BILLING_STORE_NOT_CONFIGURED") {
        return { configured: false, healthy: false };
      }
      return { configured: true, healthy: false };
    } finally {
      await anchor?.close().catch(() => {});
    }
  }

  return Object.freeze({
    health,
    getByUid,
    getByCustomerId,
    bindCustomer,
    getPendingTrialCheckout,
    reservePendingTrialCheckout,
    attachPendingTrialCheckout,
    clearPendingTrialCheckout,
    applySubscriptionSnapshot,
    beginSubscriptionReconciliation,
    reconcileSubscriptionSnapshot,
    hasUsedTrial,
    recordProcessedEvent,
  });
}
