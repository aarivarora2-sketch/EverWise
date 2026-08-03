import { createHash, randomBytes as cryptoRandomBytes, timingSafeEqual } from "node:crypto";
import {
  chmod,
  copyFile,
  open,
  readFile,
  rename,
  unlink,
} from "node:fs/promises";
import { dirname } from "node:path";
import { PartnerStoreError } from "./partnerErrors.mjs";
import {
  aggregateResearch,
  minimizeResearchSnapshot,
} from "./partnerResearch.mjs";

const SCHEMA_VERSION = 1;
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
  "research",
  "seatLimit",
  "status",
  "updatedAt",
];

let temporaryFileCounter = 0;

function storeError(code, message) {
  return new PartnerStoreError(code, message);
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

function validateData(data) {
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
    for (const [partnerId, partner] of Object.entries(data.partners)) {
      if (
        !isPlainObject(partner) ||
        !hasExactKeys(partner, PARTNER_KEYS) ||
        partner.partnerId !== partnerId ||
        typeof partner.name !== "string" ||
        !["active", "suspended"].includes(partner.status) ||
        !Number.isInteger(partner.seatLimit) ||
        partner.seatLimit < 1 ||
        partner.seatLimit > 5000 ||
        !validBranding(partner.branding) ||
        !HASH_PATTERN.test(partner.inviteTokenHash) ||
        !HASH_PATTERN.test(partner.adminTokenHash) ||
        !isPlainObject(partner.memberships) ||
        !isPlainObject(partner.research) ||
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
        if (
          !uid ||
          uid.length > 128 ||
          !isPlainObject(membership) ||
          !hasExactKeys(
            membership,
            membership.release === undefined
              ? ["claimedAt"]
              : ["claimedAt", "release"],
          ) ||
          !validIso(membership.claimedAt) ||
          (membership.release !== undefined && !validRelease(membership.release))
        ) {
          throw new Error("invalid membership");
        }
        if (seenUids.has(uid)) throw new Error("duplicate membership");
        seenUids.add(uid);
      }
      for (const [uid, snapshot] of Object.entries(partner.research)) {
        if (!Object.hasOwn(partner.memberships, uid)) throw new Error("orphan research");
        minimizeResearchSnapshot(snapshot);
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

function publicAccess(partner) {
  return {
    status: partner.status === "active" ? "active" : "suspended",
    partnerId: partner.partnerId,
    name: partner.name,
    branding: clone(partner.branding),
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

async function persistAtomically(filePath, data, hadPriorFile) {
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
    await chmod(temporaryPath, 0o600);

    if (hadPriorFile) {
      await copyFile(filePath, backupTemporaryPath);
      await chmod(backupTemporaryPath, 0o600);
      await syncFile(backupTemporaryPath);
      await rename(backupTemporaryPath, backupPath);
      await syncDirectory(filePath);
    }

    await rename(temporaryPath, filePath);
    await chmod(filePath, 0o600);
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
      return validateData(JSON.parse(text));
    } catch {
      throw storeError("STORE_CORRUPT", "The partner store is corrupt.");
    }
  }

  function enqueueMutation(mutator, { allowMissing = false } = {}) {
    const run = async () => {
      const current = await readData({ allowMissing });
      const hadPriorFile = current !== null;
      const working = clone(current || emptyData());
      const currentDate = nowDate(now);
      const normalized = normalizeExpired(working, currentDate);
      const outcome = await mutator(working, currentDate);
      if (outcome.changed || normalized) {
        validateData(working);
        await persistAtomically(filePath, working, hadPriorFile);
      }
      return outcome.result;
    };
    const result = mutationQueue.then(run, run);
    mutationQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  async function dataForQuery() {
    return (await readData({ allowMissing: true })) || emptyData();
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
        if (!Number.isInteger(seatLimit) || seatLimit < 1 || seatLimit > 5000) {
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
          research: {},
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
    const data = await dataForQuery();
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
      if (typeof researchConsent !== "boolean") {
        throw storeError("INVALID_RESEARCH", "A research consent choice is required.");
      }
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
        return mutation(publicAccess(partner), false);
      }
      if (Object.keys(partner.memberships).length >= partner.seatLimit) {
        throw storeError("PARTNER_FULL", "All sponsored places are in use.");
      }
      const minimized = researchConsent
        ? minimizeResearchSnapshot(researchSnapshot)
        : null;
      const timestamp = currentDate.toISOString();
      partner.memberships[uid] = { claimedAt: timestamp };
      if (minimized) partner.research[uid] = minimized;
      partner.updatedAt = timestamp;
      return mutation(publicAccess(partner));
    });
  }

  async function getAccess(uid) {
    requireUid(uid);
    const data = await dataForQuery();
    const partner = partnerForUid(data, uid);
    return partner ? publicAccess(partner) : { status: "none" };
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
            delete partner.research[uid];
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
    const consentedCount = Object.keys(partner.research).length;
    const distributions = aggregateResearch(partner.research);
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
      delete partner.research[uid];
      partner.updatedAt = currentDate.toISOString();
      return mutation({ removed: true });
    });
  }

  async function health() {
    try {
      const data = await readData({ allowMissing: true });
      return { configured: data !== null, healthy: true };
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
