import { createHash, randomBytes as cryptoRandomBytes, timingSafeEqual } from "node:crypto";
import { spawn } from "node:child_process";
import {
  chmod,
  copyFile,
  open,
  readFile,
  rename,
  unlink,
} from "node:fs/promises";
import { dirname } from "node:path";
import { isDeepStrictEqual } from "node:util";
import {
  isProvisionedSponsoredAuthEmail,
  isReservedSponsoredUsername,
  normalizeEmail,
  normalizeUsername,
} from "../src/utils/validation.js";
import { PartnerStoreError } from "./partnerErrors.mjs";
import {
  aggregateResearch,
  minimizeResearchSnapshot,
} from "./partnerResearch.mjs";

const SCHEMA_VERSION = 1;
const PARTNER_SEAT_LIMIT = 500;
const RELEASE_PENDING_MS = 15 * 60 * 1000;
const RECEIPT_LIFETIME_MS = 24 * 60 * 60 * 1000;
const HASH_PATTERN = /^[a-f0-9]{64}$/;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const ROOT_KEYS = ["confirmedReceipts", "partners", "version"];
const PARTNER_KEYS = [
  "adminRotatedAt",
  "adminTokenHash",
  "branding",
  "createdAt",
  "inviteRotatedAt",
  "inviteTokenHash",
  "memberships",
  "name",
  "partnerId",
  "seatLimit",
  "status",
  "updatedAt",
];

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

function storeError(code, message) {
  return new PartnerStoreError(code, message);
}

async function acquireInterprocessMutationLock(filePath) {
  let lockHandle;
  try {
    lockHandle = await open(`${filePath}.lock`, "a+", 0o600);
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw storeError("STORE_NOT_CONFIGURED", "The partner store is not configured.");
    }
    throw storeError("STORE_LOCK_FAILED", "The partner store lock could not open.");
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
    let ready = false;
    let settled = false;
    let stdout = "";
    let stderr = "";

    helper.stdout.setEncoding("utf8");
    helper.stderr.setEncoding("utf8");
    helper.stderr.on("data", (chunk) => {
      stderr = `${stderr}${chunk}`.slice(-1000);
    });

    helper.once("error", () => {
      if (settled) return;
      settled = true;
      closeLockHandle().then(
        () => reject(storeError(
          "STORE_LOCK_FAILED",
          "The partner store lock could not start.",
        )),
        reject,
      );
    });
    helper.stdout.on("data", (chunk) => {
      stdout += chunk;
      ready = stdout === "LOCKED\n";
    });
    helper.once("close", (code, signal) => {
      if (settled) return;
      settled = true;
      if (code === 0 && signal === null && ready) {
        resolve(closeLockHandle);
        return;
      }
      closeLockHandle().then(
        () => reject(storeError(
          "STORE_LOCK_FAILED",
          stderr
            ? "The partner store lock ended unexpectedly."
            : "The partner store lock failed.",
        )),
        reject,
      );
    });
  });
}

function emptyData() {
  return { version: SCHEMA_VERSION, partners: {}, confirmedReceipts: {} };
}

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function validIso(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function validSeatLimit(value, testOnlyAllowCustomSeatLimits) {
  return (
    value === PARTNER_SEAT_LIMIT ||
    (testOnlyAllowCustomSeatLimits === true &&
      Number.isInteger(value) &&
      value >= 1 &&
      value <= PARTNER_SEAT_LIMIT)
  );
}

function hasExactKeys(value, expected) {
  const keys = Object.keys(value).sort();
  return (
    keys.length === expected.length &&
    keys.every((key, index) => key === expected[index])
  );
}

function validBranding(branding) {
  return (
    isPlainObject(branding) &&
    hasExactKeys(branding, ["accent", "logoPath", "name"]) &&
    typeof branding.name === "string" &&
    branding.name.length >= 2 &&
    branding.name.length <= 100 &&
    (branding.logoPath === null ||
      (typeof branding.logoPath === "string" &&
        branding.logoPath.startsWith("/partners/") &&
        !branding.logoPath.includes(".."))) &&
    typeof branding.accent === "string" &&
    /^#[A-Fa-f0-9]{6}$/.test(branding.accent)
  );
}

function validRelease(release) {
  return (
    isPlainObject(release) &&
    hasExactKeys(release, ["createdAt", "expiresAt", "pendingUntil", "receiptHash"]) &&
    HASH_PATTERN.test(release.receiptHash) &&
    (release.pendingUntil === null || validIso(release.pendingUntil)) &&
    validIso(release.expiresAt) &&
    validIso(release.createdAt)
  );
}

function validProvisionedLogin(login) {
  return (
    isPlainObject(login) &&
    hasExactKeys(login, ["authEmail", "username"]) &&
    isReservedSponsoredUsername(login.username) &&
    login.username === normalizeUsername(login.username) &&
    isProvisionedSponsoredAuthEmail(login.authEmail) &&
    login.authEmail === normalizeEmail(login.authEmail)
  );
}

function validateData(data, { testOnlyAllowCustomSeatLimits = false } = {}) {
  if (
    !isPlainObject(data) ||
    !hasExactKeys(data, ROOT_KEYS) ||
    data.version !== SCHEMA_VERSION ||
    !isPlainObject(data.partners) ||
    !isPlainObject(data.confirmedReceipts)
  ) {
    throw storeError("STORE_CORRUPT", "The partner store is corrupt.");
  }
  try {
    const seenUids = new Set();
    const seenLoginUsernames = new Set();
    const seenLoginEmails = new Set();
    for (const [partnerId, partner] of Object.entries(data.partners)) {
      if (
        !isPlainObject(partner) ||
        !hasExactKeys(partner, PARTNER_KEYS) ||
        partner.partnerId !== partnerId ||
        typeof partner.name !== "string" ||
        !["active", "suspended"].includes(partner.status) ||
        !validSeatLimit(partner.seatLimit, testOnlyAllowCustomSeatLimits) ||
        !validBranding(partner.branding) ||
        !HASH_PATTERN.test(partner.inviteTokenHash) ||
        !HASH_PATTERN.test(partner.adminTokenHash) ||
        !isPlainObject(partner.memberships) ||
        !validIso(partner.createdAt) ||
        !validIso(partner.inviteRotatedAt) ||
        !validIso(partner.adminRotatedAt) ||
        !validIso(partner.updatedAt)
      ) {
        throw new Error("invalid partner");
      }
      if (Object.keys(partner.memberships).length > partner.seatLimit) {
        throw new Error("partner over capacity");
      }
      for (const [uid, membership] of Object.entries(partner.memberships)) {
        const membershipKeys = ["claimedAt"];
        if (Object.hasOwn(membership, "release")) membershipKeys.push("release");
        if (Object.hasOwn(membership, "research")) membershipKeys.push("research");
        if (Object.hasOwn(membership, "provisionedLogin")) {
          membershipKeys.push("provisionedLogin");
        }
        membershipKeys.sort();
        if (
          !uid ||
          uid.length > 128 ||
          !isPlainObject(membership) ||
          !hasExactKeys(membership, membershipKeys) ||
          !validIso(membership.claimedAt) ||
          (Object.hasOwn(membership, "release") &&
            !validRelease(membership.release))
        ) {
          throw new Error("invalid membership");
        }
        if (Object.hasOwn(membership, "research")) {
          minimizeResearchSnapshot(membership.research);
        }
        if (Object.hasOwn(membership, "provisionedLogin")) {
          if (!validProvisionedLogin(membership.provisionedLogin)) {
            throw new Error("invalid provisioned login");
          }
          if (
            seenLoginUsernames.has(membership.provisionedLogin.username) ||
            seenLoginEmails.has(membership.provisionedLogin.authEmail)
          ) {
            throw new Error("duplicate provisioned login");
          }
          seenLoginUsernames.add(membership.provisionedLogin.username);
          seenLoginEmails.add(membership.provisionedLogin.authEmail);
        }
        if (seenUids.has(uid)) throw new Error("duplicate membership");
        seenUids.add(uid);
      }
    }
    for (const [receiptHash, tombstone] of Object.entries(data.confirmedReceipts)) {
      if (
        !HASH_PATTERN.test(receiptHash) ||
        !isPlainObject(tombstone) ||
        !hasExactKeys(tombstone, ["expiresAt"]) ||
        !validIso(tombstone.expiresAt)
      ) {
        throw new Error("invalid receipt tombstone");
      }
    }
  } catch (error) {
    if (error instanceof PartnerStoreError && error.code === "STORE_CORRUPT") throw error;
    throw storeError("STORE_CORRUPT", "The partner store is corrupt.");
  }
  return data;
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

export function hashToken(token) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

function tokenMatches(token, storedHash) {
  if (typeof token !== "string" || !TOKEN_PATTERN.test(token) || !HASH_PATTERN.test(storedHash)) {
    return false;
  }
  const candidate = Buffer.from(hashToken(token), "hex");
  const expected = Buffer.from(storedHash, "hex");
  return timingSafeEqual(candidate, expected);
}

function generateToken(randomBytes) {
  const bytes = randomBytes(32);
  if (!(bytes instanceof Uint8Array) || bytes.byteLength !== 32) {
    throw new TypeError("randomBytes must return 32 bytes");
  }
  return Buffer.from(bytes).toString("base64url");
}

function requireUid(uid) {
  if (typeof uid !== "string" || uid.length < 1 || uid.length > 128) {
    throw storeError("INVALID_INPUT", "A valid learner identifier is required.");
  }
  return uid;
}

function requirePartner(data, partnerId) {
  const partner = data.partners[partnerId];
  if (!partner) throw storeError("PARTNER_NOT_FOUND", "The partner was not found.");
  return partner;
}

function partnerByToken(data, token, field) {
  for (const partner of Object.values(data.partners)) {
    if (tokenMatches(token, partner[field])) return partner;
  }
  return null;
}

function partnerForUid(data, uid) {
  for (const partner of Object.values(data.partners)) {
    if (Object.hasOwn(partner.memberships, uid)) return partner;
  }
  return null;
}

function publicAccess(partner, membership = null) {
  return {
    status: partner.status === "active" ? "active" : "suspended",
    partnerId: partner.partnerId,
    name: partner.name,
    branding: clone(partner.branding),
    ...(membership?.provisionedLogin
      ? { username: membership.provisionedLogin.username }
      : {}),
  };
}

function normalizeExpired(data, currentDate) {
  const currentTime = currentDate.getTime();
  let changed = false;
  for (const [receiptHash, tombstone] of Object.entries(data.confirmedReceipts)) {
    if (Date.parse(tombstone.expiresAt) <= currentTime) {
      delete data.confirmedReceipts[receiptHash];
      changed = true;
    }
  }
  for (const partner of Object.values(data.partners)) {
    for (const membership of Object.values(partner.memberships)) {
      const release = membership.release;
      if (!release) continue;
      if (Date.parse(release.expiresAt) <= currentTime) {
        delete membership.release;
        changed = true;
      } else if (
        release.pendingUntil !== null &&
        Date.parse(release.pendingUntil) <= currentTime
      ) {
        release.pendingUntil = null;
        changed = true;
      }
    }
  }
  return changed;
}

async function syncDirectory(path) {
  const handle = await open(dirname(path), "r");
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function syncFile(path) {
  const handle = await open(path, "r+");
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function persistAtomically(
  filePath,
  data,
  hadPriorFile,
  testOnlyFileOperations = {},
) {
  const chmodFile = testOnlyFileOperations.chmod || chmod;
  const renameFile = testOnlyFileOperations.rename || rename;
  temporaryFileCounter += 1;
  const suffix = `${process.pid}-${temporaryFileCounter}`;
  const temporaryPath = `${filePath}.tmp-${suffix}`;
  const backupPath = `${filePath}.backup`;
  const backupTemporaryPath = `${backupPath}.tmp-${suffix}`;
  let handle;
  try {
    handle = await open(temporaryPath, "wx", 0o600);
    await handle.writeFile(`${JSON.stringify(data, null, 2)}\n`, "utf8");
    await handle.sync();
    await handle.close();
    handle = null;
    await chmodFile(temporaryPath, 0o600);

    if (hadPriorFile) {
      await copyFile(filePath, backupTemporaryPath);
      await chmodFile(backupTemporaryPath, 0o600);
      await syncFile(backupTemporaryPath);
      await renameFile(backupTemporaryPath, backupPath);
      await syncDirectory(filePath);
    }

    await renameFile(temporaryPath, filePath);
    await chmodFile(filePath, 0o600);
    await syncDirectory(filePath);
  } finally {
    if (handle) await handle.close().catch(() => {});
    await unlink(temporaryPath).catch(() => {});
    await unlink(backupTemporaryPath).catch(() => {});
  }
}

function mutation(result, changed = true) {
  return { result, changed };
}

export function createPartnerStore({
  filePath,
  now = () => new Date(),
  randomBytes = cryptoRandomBytes,
  testOnlyAllowCustomSeatLimits = false,
  testOnlyFileOperations,
}) {
  if (typeof filePath !== "string" || !filePath) {
    throw new TypeError("filePath is required");
  }
  let mutationQueue = Promise.resolve();

  async function readData({ allowMissing = false } = {}) {
    let text;
    try {
      text = await readFile(filePath, "utf8");
    } catch (error) {
      if (error.code === "ENOENT" && allowMissing) return null;
      if (error.code === "ENOENT") {
        throw storeError("STORE_NOT_CONFIGURED", "The partner store is not configured.");
      }
      throw storeError("STORE_CORRUPT", "The partner store could not be read.");
    }
    try {
      return validateData(JSON.parse(text), { testOnlyAllowCustomSeatLimits });
    } catch {
      throw storeError("STORE_CORRUPT", "The partner store is corrupt.");
    }
  }

  function enqueueMutation(mutator, { allowMissing = false } = {}) {
    const run = async () => {
      const releaseLock = await acquireInterprocessMutationLock(filePath);
      try {
        const current = await readData({ allowMissing });
        const hadPriorFile = current !== null;
        const working = clone(current || emptyData());
        const currentDate = nowDate(now);
        const normalized = normalizeExpired(working, currentDate);
        const outcome = await mutator(working, currentDate);
        if (outcome.changed || normalized) {
          validateData(working, { testOnlyAllowCustomSeatLimits });
          try {
            await persistAtomically(
              filePath,
              working,
              hadPriorFile,
              testOnlyFileOperations,
            );
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

  async function dataForQuery() {
    return readData();
  }

  async function committedDataMatches(expected) {
    try {
      return isDeepStrictEqual(await readData(), expected);
    } catch {
      return false;
    }
  }

  function resolveManagedPartner(data, { partnerId, adminToken } = {}) {
    if (adminToken !== undefined) {
      const partner = partnerByToken(data, adminToken, "adminTokenHash");
      if (!partner) throw storeError("INVALID_ADMIN", "The admin link is invalid.");
      return partner;
    }
    return requirePartner(data, partnerId);
  }

  function createPartner({ partnerId, name, seatLimit, branding }) {
    return enqueueMutation(
      (data, currentDate) => {
        if (typeof partnerId !== "string" || !/^[a-z0-9-]{3,50}$/.test(partnerId)) {
          throw storeError("INVALID_INPUT", "The partner ID is invalid.");
        }
        const normalizedName = typeof name === "string" ? name.trim() : "";
        if (normalizedName.length < 2 || normalizedName.length > 100) {
          throw storeError("INVALID_INPUT", "The partner name is invalid.");
        }
        if (!validSeatLimit(seatLimit, testOnlyAllowCustomSeatLimits)) {
          throw storeError("INVALID_INPUT", "The seat limit is invalid.");
        }
        if (!validBranding(branding)) {
          throw storeError("INVALID_INPUT", "The partner branding is invalid.");
        }
        if (data.partners[partnerId]) {
          throw storeError("PARTNER_EXISTS", "The partner already exists.");
        }
        const inviteToken = generateToken(randomBytes);
        const adminToken = generateToken(randomBytes);
        const timestamp = currentDate.toISOString();
        data.partners[partnerId] = {
          partnerId,
          name: normalizedName,
          status: "active",
          seatLimit,
          branding: clone(branding),
          inviteTokenHash: hashToken(inviteToken),
          adminTokenHash: hashToken(adminToken),
          memberships: {},
          createdAt: timestamp,
          inviteRotatedAt: timestamp,
          adminRotatedAt: timestamp,
          updatedAt: timestamp,
        };
        return mutation({ partnerId, inviteToken, adminToken });
      },
      { allowMissing: true },
    );
  }

  async function listPartners() {
    const data = (await readData({ allowMissing: true })) || emptyData();
    return Object.values(data.partners)
      .map((partner) => ({
        partnerId: partner.partnerId,
        name: partner.name,
        status: partner.status,
        claimedCount: Object.keys(partner.memberships).length,
        seatLimit: partner.seatLimit,
        createdAt: partner.createdAt,
      }))
      .sort(({ partnerId: left }, { partnerId: right }) => left.localeCompare(right));
  }

  async function previewInvite({ inviteToken } = {}) {
    const data = await dataForQuery();
    const partner = partnerByToken(data, inviteToken, "inviteTokenHash");
    if (!partner) throw storeError("INVALID_INVITE", "The invitation is invalid.");
    if (partner.status !== "active") {
      throw storeError("PARTNER_SUSPENDED", "Sponsored access is suspended.");
    }
    return {
      partnerId: partner.partnerId,
      branding: clone(partner.branding),
      seatAvailable: Object.keys(partner.memberships).length < partner.seatLimit,
    };
  }

  function claimSeat({ uid, inviteToken, researchConsent, researchSnapshot } = {}) {
    return enqueueMutation((data, currentDate) => {
      requireUid(uid);
      const partner = partnerByToken(data, inviteToken, "inviteTokenHash");
      if (!partner) throw storeError("INVALID_INVITE", "The invitation is invalid.");
      if (partner.status !== "active") {
        throw storeError("PARTNER_SUSPENDED", "Sponsored access is suspended.");
      }
      const existingPartner = partnerForUid(data, uid);
      if (existingPartner) {
        if (existingPartner.partnerId !== partner.partnerId) {
          throw storeError("ALREADY_SPONSORED", "The learner already has sponsored access.");
        }
        return mutation(publicAccess(
          partner,
          partner.memberships[uid],
        ), false);
      }
      if (Object.keys(partner.memberships).length >= partner.seatLimit) {
        throw storeError("PARTNER_FULL", "All sponsored places are in use.");
      }
      const minimized = researchConsent === true
        ? minimizeResearchSnapshot(researchSnapshot)
        : null;
      const timestamp = currentDate.toISOString();
      partner.memberships[uid] = {
        claimedAt: timestamp,
        ...(minimized ? { research: minimized } : {}),
      };
      partner.updatedAt = timestamp;
      return mutation(publicAccess(partner));
    });
  }

  async function getAccess(uid) {
    requireUid(uid);
    const data = await dataForQuery();
    const partner = partnerForUid(data, uid);
    return partner
      ? publicAccess(partner, partner.memberships[uid])
      : { status: "none" };
  }

  function registerProvisionedLogin({ uid, username, authEmail, adminToken } = {}) {
    return enqueueMutation((data, currentDate) => {
      requireUid(uid);
      const partner = partnerByToken(data, adminToken, "adminTokenHash");
      if (!partner) throw storeError("INVALID_ADMIN", "The admin link is invalid.");
      const membership = partner.memberships[uid];
      if (!membership) {
        throw storeError("MEMBERSHIP_NOT_FOUND", "Sponsored access was not found.");
      }
      const provisionedLogin = {
        username: normalizeUsername(username),
        authEmail: normalizeEmail(authEmail),
      };
      if (!validProvisionedLogin(provisionedLogin)) {
        throw storeError("INVALID_INPUT", "The request is invalid.");
      }
      for (const candidatePartner of Object.values(data.partners)) {
        for (const [candidateUid, candidateMembership] of Object.entries(
          candidatePartner.memberships,
        )) {
          const candidate = candidateMembership.provisionedLogin;
          if (!candidate || candidateUid === uid) continue;
          if (
            candidate.username === provisionedLogin.username ||
            candidate.authEmail === provisionedLogin.authEmail
          ) {
            throw storeError("LOGIN_CONFLICT", "The provisioned login conflicts.");
          }
        }
      }
      if (membership.provisionedLogin) {
        if (!isDeepStrictEqual(membership.provisionedLogin, provisionedLogin)) {
          throw storeError("LOGIN_CONFLICT", "The provisioned login conflicts.");
        }
        return mutation(publicAccess(partner, membership), false);
      }
      membership.provisionedLogin = provisionedLogin;
      partner.updatedAt = currentDate.toISOString();
      return mutation(publicAccess(partner, membership));
    });
  }

  async function resolveProvisionedLogin({ username } = {}) {
    const normalized = normalizeUsername(username);
    if (!isReservedSponsoredUsername(normalized)) {
      throw storeError("INVALID_INPUT", "The request is invalid.");
    }
    const data = await dataForQuery();
    for (const partner of Object.values(data.partners)) {
      for (const membership of Object.values(partner.memberships)) {
        if (membership.provisionedLogin?.username === normalized) {
          return { authEmail: membership.provisionedLogin.authEmail };
        }
      }
    }
    throw storeError("LOGIN_NOT_FOUND", "The provisioned login was not found.");
  }

  function beginRelease({ uid } = {}) {
    return enqueueMutation((data, currentDate) => {
      requireUid(uid);
      const partner = partnerForUid(data, uid);
      if (!partner) throw storeError("MEMBERSHIP_NOT_FOUND", "Sponsored access was not found.");
      const receipt = generateToken(randomBytes);
      partner.memberships[uid].release = {
        receiptHash: hashToken(receipt),
        createdAt: currentDate.toISOString(),
        pendingUntil: new Date(currentDate.getTime() + RELEASE_PENDING_MS).toISOString(),
        expiresAt: new Date(currentDate.getTime() + RECEIPT_LIFETIME_MS).toISOString(),
      };
      partner.updatedAt = currentDate.toISOString();
      return mutation({ receipt, expiresAt: partner.memberships[uid].release.expiresAt });
    });
  }

  function cancelRelease({ uid, receipt } = {}) {
    return enqueueMutation((data, currentDate) => {
      requireUid(uid);
      const partner = partnerForUid(data, uid);
      const release = partner?.memberships[uid]?.release;
      if (!release || !tokenMatches(receipt, release.receiptHash)) {
        throw storeError("INVALID_RECEIPT", "The release receipt is invalid.");
      }
      delete partner.memberships[uid].release;
      partner.updatedAt = currentDate.toISOString();
      return mutation({ cancelled: true });
    });
  }

  function confirmRelease({ receipt } = {}) {
    return enqueueMutation((data, currentDate) => {
      if (typeof receipt !== "string" || !TOKEN_PATTERN.test(receipt)) {
        throw storeError("INVALID_RECEIPT", "The release receipt is invalid.");
      }
      const receiptHash = hashToken(receipt);
      for (const [storedHash] of Object.entries(data.confirmedReceipts)) {
        if (timingSafeEqual(Buffer.from(receiptHash, "hex"), Buffer.from(storedHash, "hex"))) {
          return mutation({ released: true, idempotent: true }, false);
        }
      }
      for (const partner of Object.values(data.partners)) {
        for (const [uid, membership] of Object.entries(partner.memberships)) {
          if (membership.release && tokenMatches(receipt, membership.release.receiptHash)) {
            delete partner.memberships[uid];
            partner.updatedAt = currentDate.toISOString();
            data.confirmedReceipts[receiptHash] = {
              expiresAt: new Date(
                currentDate.getTime() + RECEIPT_LIFETIME_MS,
              ).toISOString(),
            };
            return mutation({ released: true, idempotent: false });
          }
        }
      }
      throw storeError("INVALID_RECEIPT", "The release receipt is invalid.");
    });
  }

  async function getAdminReport({ adminToken } = {}) {
    const data = await dataForQuery();
    const partner = partnerByToken(data, adminToken, "adminTokenHash");
    if (!partner) throw storeError("INVALID_ADMIN", "The admin link is invalid.");
    const claimed = Object.keys(partner.memberships).length;
    const research = Object.values(partner.memberships).flatMap((membership) =>
      membership.research ? [membership.research] : [],
    );
    const consentedCount = research.length;
    const distributions = aggregateResearch(research);
    return {
      partnerId: partner.partnerId,
      name: partner.name,
      status: partner.status,
      branding: clone(partner.branding),
      seats: {
        claimed,
        available: Math.max(0, partner.seatLimit - claimed),
        limit: partner.seatLimit,
      },
      invitation: { status: partner.status },
      research: {
        consentedCount,
        consentedPercentage: claimed === 0 ? 0 : Math.round((consentedCount / claimed) * 1000) / 10,
        suppressed: distributions === null,
        distributions,
      },
      updatedAt: partner.updatedAt,
    };
  }

  function rotateInvite(locator = {}) {
    return enqueueMutation((data, currentDate) => {
      const partner = resolveManagedPartner(data, locator);
      const inviteToken = generateToken(randomBytes);
      partner.inviteTokenHash = hashToken(inviteToken);
      partner.inviteRotatedAt = currentDate.toISOString();
      partner.updatedAt = currentDate.toISOString();
      return mutation({ partnerId: partner.partnerId, inviteToken });
    });
  }

  function rotateAdmin(locator = {}) {
    return enqueueMutation((data, currentDate) => {
      const partner = resolveManagedPartner(data, locator);
      const adminToken = generateToken(randomBytes);
      partner.adminTokenHash = hashToken(adminToken);
      partner.adminRotatedAt = currentDate.toISOString();
      partner.updatedAt = currentDate.toISOString();
      return mutation({ partnerId: partner.partnerId, adminToken });
    });
  }

  function setPartnerStatus({ partnerId, status } = {}) {
    return enqueueMutation((data, currentDate) => {
      if (!["active", "suspended"].includes(status)) {
        throw storeError("INVALID_INPUT", "The partner status is invalid.");
      }
      const partner = requirePartner(data, partnerId);
      if (partner.status === status) return mutation({ partnerId, status }, false);
      partner.status = status;
      partner.updatedAt = currentDate.toISOString();
      return mutation({ partnerId, status });
    });
  }

  function removePartner({ partnerId } = {}) {
    return enqueueMutation((data) => {
      const partner = requirePartner(data, partnerId);
      if (Object.keys(partner.memberships).length > 0) {
        throw storeError("PARTNER_NOT_EMPTY", "The partner still has active memberships.");
      }
      delete data.partners[partnerId];
      return mutation({ removed: true });
    });
  }

  function reconcileMembership({ partnerId, uid } = {}) {
    return enqueueMutation((data, currentDate) => {
      requireUid(uid);
      const partner = requirePartner(data, partnerId);
      if (!Object.hasOwn(partner.memberships, uid)) {
        return mutation({ removed: false }, false);
      }
      delete partner.memberships[uid];
      partner.updatedAt = currentDate.toISOString();
      return mutation({ removed: true });
    });
  }

  async function health() {
    try {
      const data = await readData({ allowMissing: true });
      return { configured: data !== null, healthy: data !== null };
    } catch {
      return { configured: true, healthy: false };
    }
  }

  return {
    createPartner,
    listPartners,
    previewInvite,
    claimSeat,
    getAccess,
    registerProvisionedLogin,
    resolveProvisionedLogin,
    beginRelease,
    cancelRelease,
    confirmRelease,
    getAdminReport,
    rotateInvite,
    rotateAdmin,
    setPartnerStatus,
    removePartner,
    reconcileMembership,
    health,
  };
}
