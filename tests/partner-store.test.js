import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import {
  access,
  chmod as fsChmod,
  mkdtemp,
  readFile,
  rename as fsRename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createPartnerStore } from "../server/partnerStore.mjs";

const partnerStoreUrl = new URL("../server/partnerStore.mjs", import.meta.url).href;
const managePartnersPath = new URL("../scripts/manage-partners.mjs", import.meta.url).pathname;

const START = Date.parse("2026-08-02T12:00:00.000Z");

function deterministicBytes() {
  let call = 0;
  return (size) => {
    call += 1;
    return Buffer.alloc(size, call % 256);
  };
}

async function setupStore(
  t,
  {
    start = START,
    testOnlyAllowCustomSeatLimits = true,
    testOnlyFileOperations,
  } = {},
) {
  const directory = await mkdtemp(join(tmpdir(), "everwise-partners-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  let timestamp = start;
  const filePath = join(directory, "partners.json");
  const store = createPartnerStore({
    filePath,
    now: () => new Date(timestamp),
    randomBytes: deterministicBytes(),
    testOnlyAllowCustomSeatLimits,
    testOnlyFileOperations,
  });
  return {
    directory,
    filePath,
    store,
    advance(milliseconds) {
      timestamp += milliseconds;
    },
  };
}

async function createPilot(store, overrides = {}) {
  return store.createPartner({
    partnerId: "pilot",
    name: "Community Partner",
    seatLimit: 500,
    branding: {
      name: "Community Partner",
      logoPath: null,
      accent: "#2F6B61",
    },
    ...overrides,
  });
}

function approvedSnapshot(overrides = {}) {
  return {
    assessmentVersion: "partner-assessment-v1",
    consentedAt: "2026-08-02T12:00:00.000Z",
    ageBand: "70-79",
    internetUse: "Every day",
    primaryDevice: "Tablet",
    confidence: "Sometimes I need help",
    scamFrequency: "few",
    concerns: ["Suspicious links"],
    safeBankChoice: true,
    aiExperience: "I’ve heard of it",
    accessibilityNeeds: ["Vision loss"],
    ...overrides,
  };
}

async function expectStoreError(operation, code) {
  await assert.rejects(operation, (error) => {
    assert.equal(error.name, "PartnerStoreError");
    assert.equal(error.code, code);
    return true;
  });
}

function spawnModule(source, args = [], env = process.env) {
  return spawn(
    process.execPath,
    ["--input-type=module", "--eval", source, ...args],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], env },
  );
}

function childResult(child) {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal, stdout, stderr }));
  });
}

async function waitForPath(path, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await access(path);
      return;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  assert.fail(`Timed out waiting for ${path}`);
}

test("createPartner persists schema v1 and returns one-time 32-byte tokens", async (t) => {
  const { filePath, store } = await setupStore(t);

  const created = await createPilot(store);

  assert.match(created.inviteToken, /^[A-Za-z0-9_-]{43}$/);
  assert.match(created.adminToken, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(created.inviteToken, created.adminToken);
  const diskText = await readFile(filePath, "utf8");
  const disk = JSON.parse(diskText);
  assert.equal(disk.version, 1);
  assert.equal(diskText.includes(created.inviteToken), false);
  assert.equal(diskText.includes(created.adminToken), false);
  assert.match(disk.partners.pilot.inviteTokenHash, /^[a-f0-9]{64}$/);
  assert.match(disk.partners.pilot.adminTokenHash, /^[a-f0-9]{64}$/);
  assert.equal((await stat(filePath)).mode & 0o777, 0o600);

  const listed = await store.listPartners();
  assert.deepEqual(listed, [
    {
      partnerId: "pilot",
      name: "Community Partner",
      status: "active",
      claimedCount: 0,
      seatLimit: 500,
      createdAt: "2026-08-02T12:00:00.000Z",
    },
  ]);
  assert.doesNotMatch(JSON.stringify(listed), /token|hash/i);
});

test("production stores accept exactly 500 seats", async (t) => {
  for (const seatLimit of [499, 501]) {
    const { store } = await setupStore(t, {
      testOnlyAllowCustomSeatLimits: false,
    });
    await expectStoreError(
      () => createPilot(store, { seatLimit }),
      "INVALID_INPUT",
    );
  }
  const { filePath, store } = await setupStore(t, {
    testOnlyAllowCustomSeatLimits: false,
  });
  assert.match((await createPilot(store)).inviteToken, /^[A-Za-z0-9_-]{43}$/);
  const disk = JSON.parse(await readFile(filePath, "utf8"));
  disk.partners.pilot.seatLimit = 499;
  await writeFile(filePath, JSON.stringify(disk), { mode: 0o600 });
  assert.deepEqual(await store.health(), { configured: true, healthy: false });
});

test("previewInvite validates and rotates invite tokens without exposing stored secrets", async (t) => {
  const { store } = await setupStore(t);
  const created = await createPilot(store);

  assert.deepEqual(await store.previewInvite({ inviteToken: created.inviteToken }), {
    partnerId: "pilot",
    branding: {
      name: "Community Partner",
      logoPath: null,
      accent: "#2F6B61",
    },
    seatAvailable: true,
  });
  await expectStoreError(
    () => store.previewInvite({ inviteToken: "not-a-valid-token" }),
    "INVALID_INVITE",
  );

  const rotated = await store.rotateInvite({ partnerId: "pilot" });
  assert.match(rotated.inviteToken, /^[A-Za-z0-9_-]{43}$/);
  await expectStoreError(
    () => store.previewInvite({ inviteToken: created.inviteToken }),
    "INVALID_INVITE",
  );
  assert.equal(
    (await store.previewInvite({ inviteToken: rotated.inviteToken })).partnerId,
    "pilot",
  );
});

test("serialized concurrent claims cannot exceed the 500-seat limit", async (t) => {
  const { store } = await setupStore(t);
  const { inviteToken } = await createPilot(store);
  for (let index = 1; index <= 499; index += 1) {
    await store.claimSeat({
      uid: `uid-${index}`,
      inviteToken,
      researchConsent: false,
    });
  }

  const contenders = await Promise.allSettled([
    store.claimSeat({ uid: "uid-500-a", inviteToken, researchConsent: false }),
    store.claimSeat({ uid: "uid-500-b", inviteToken, researchConsent: false }),
  ]);

  assert.equal(contenders.filter(({ status }) => status === "fulfilled").length, 1);
  const rejected = contenders.find(({ status }) => status === "rejected");
  assert.equal(rejected.reason.code, "PARTNER_FULL");
  const existing = await store.claimSeat({
    uid: "uid-1",
    inviteToken,
    researchConsent: false,
  });
  assert.equal(existing.status, "active");
  assert.equal((await store.getAccess("uid-1")).status, "active");
  assert.equal((await store.listPartners())[0].claimedCount, 500);
});

test("API and CLI processes serialize claim and rotation without losing either mutation", async (t) => {
  const { directory, filePath, store } = await setupStore(t, {
    testOnlyAllowCustomSeatLimits: false,
  });
  const created = await createPilot(store);
  const markerPath = join(directory, "claim-read.marker");
  const claimSource = `
    const { rename, writeFile } = await import("node:fs/promises");
    const { createPartnerStore } = await import(${JSON.stringify(partnerStoreUrl)});
    let delayed = false;
    const store = createPartnerStore({
      filePath: ${JSON.stringify(filePath)},
      testOnlyFileOperations: {
        rename: async (...args) => {
          if (!delayed) {
            delayed = true;
            await writeFile(${JSON.stringify(markerPath)}, "ready");
            await new Promise((resolve) => setTimeout(resolve, 600));
          }
          return rename(...args);
        },
      },
    });
    await store.claimSeat({
      uid: "uid-from-api-process",
      inviteToken: ${JSON.stringify(created.inviteToken)},
      researchConsent: false,
    });
  `;
  const claimChild = spawnModule(claimSource);
  const claimFinished = childResult(claimChild);
  t.after(() => {
    if (claimChild.exitCode === null) claimChild.kill("SIGKILL");
  });

  await waitForPath(markerPath);
  const cliChild = spawn(
    process.execPath,
    [managePartnersPath, "rotate-invite", "--id", "pilot"],
    {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, EVERWISE_PARTNER_STORE_PATH: filePath },
    },
  );
  const [claimResult, cliResult] = await Promise.all([
    claimFinished,
    childResult(cliChild),
  ]);
  assert.equal(claimResult.code, 0, claimResult.stderr);
  assert.equal(cliResult.code, 0, cliResult.stderr);
  const rotatedToken = cliResult.stdout.match(/#partner=([A-Za-z0-9_-]{43})/)?.[1];
  assert.ok(rotatedToken, cliResult.stdout);

  assert.equal((await store.listPartners())[0].claimedCount, 1);
  assert.equal(
    (await store.previewInvite({ inviteToken: rotatedToken })).partnerId,
    "pilot",
  );
});

test("interprocess mutation lock is released by the kernel after a writer crash", async (t) => {
  const { directory, filePath, store } = await setupStore(t, {
    testOnlyAllowCustomSeatLimits: false,
  });
  const created = await createPilot(store);
  const markerPath = join(directory, "crashing-writer.marker");
  const crashSource = `
    const { rename, writeFile } = await import("node:fs/promises");
    const { createPartnerStore } = await import(${JSON.stringify(partnerStoreUrl)});
    const store = createPartnerStore({
      filePath: ${JSON.stringify(filePath)},
      testOnlyFileOperations: {
        rename: async (...args) => {
          await writeFile(${JSON.stringify(markerPath)}, "ready");
          await new Promise(() => {});
          return rename(...args);
        },
      },
    });
    await store.claimSeat({
      uid: "uid-crashing-writer",
      inviteToken: ${JSON.stringify(created.inviteToken)},
      researchConsent: false,
    });
  `;
  const crashingChild = spawnModule(crashSource);
  const crashed = childResult(crashingChild);
  t.after(() => {
    if (crashingChild.exitCode === null) crashingChild.kill("SIGKILL");
  });

  await waitForPath(markerPath);
  await waitForPath(`${filePath}.lock`, 500);
  crashingChild.kill("SIGKILL");
  const crashResult = await crashed;
  assert.equal(crashResult.signal, "SIGKILL");

  const rotated = await Promise.race([
    store.rotateInvite({ partnerId: "pilot" }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("lock was not recovered after crash")), 3000),
    ),
  ]);
  assert.match(rotated.inviteToken, /^[A-Za-z0-9_-]{43}$/);
});

test("claim 501 fails after claims 1 through 500 succeed", async (t) => {
  const { store } = await setupStore(t);
  const { inviteToken } = await createPilot(store);
  for (let index = 1; index <= 500; index += 1) {
    const access = await store.claimSeat({
      uid: `capacity-${index}`,
      inviteToken,
      researchConsent: false,
    });
    assert.equal(access.status, "active");
  }

  await expectStoreError(
    () =>
      store.claimSeat({
        uid: "capacity-501",
        inviteToken,
        researchConsent: false,
      }),
    "PARTNER_FULL",
  );
});

test("a UID cannot join two partners and suspension blocks preview, claims, and access", async (t) => {
  const { store } = await setupStore(t);
  const first = await createPilot(store);
  const second = await createPilot(store, {
    partnerId: "other",
    name: "Other Partner",
    seatLimit: 5,
    branding: { name: "Other Partner", logoPath: null, accent: "#315A73" },
  });
  await store.claimSeat({
    uid: "shared-uid",
    inviteToken: first.inviteToken,
    researchConsent: false,
  });

  await expectStoreError(
    () =>
      store.claimSeat({
        uid: "shared-uid",
        inviteToken: second.inviteToken,
        researchConsent: false,
      }),
    "ALREADY_SPONSORED",
  );

  await store.setPartnerStatus({ partnerId: "pilot", status: "suspended" });
  await expectStoreError(
    () => store.previewInvite({ inviteToken: first.inviteToken }),
    "PARTNER_SUSPENDED",
  );
  await expectStoreError(
    () =>
      store.claimSeat({
        uid: "new-uid",
        inviteToken: first.inviteToken,
        researchConsent: false,
      }),
    "PARTNER_SUSPENDED",
  );
  assert.deepEqual(await store.getAccess("shared-uid"), {
    status: "suspended",
    partnerId: "pilot",
    name: "Community Partner",
    branding: {
      name: "Community Partner",
      logoPath: null,
      accent: "#2F6B61",
    },
  });
  await store.setPartnerStatus({ partnerId: "pilot", status: "active" });
  assert.equal((await store.getAccess("shared-uid")).status, "active");
});

test("research opt-out stores nothing and opt-in accepts only the approved minimized shape", async (t) => {
  const { filePath, store } = await setupStore(t);
  const { inviteToken } = await createPilot(store);
  await store.claimSeat({
    uid: "opt-out-uid",
    inviteToken,
    researchConsent: false,
    researchSnapshot: {
      name: "Must Not Persist",
      email: "private@example.com",
      age: 77,
    },
  });
  const snapshot = approvedSnapshot();
  await store.claimSeat({
    uid: "opt-in-uid",
    inviteToken,
    researchConsent: true,
    researchSnapshot: snapshot,
  });
  snapshot.concerns.push("Account hacking");

  const disk = JSON.parse(await readFile(filePath, "utf8"));
  assert.equal("research" in disk.partners.pilot, false);
  assert.equal("research" in disk.partners.pilot.memberships["opt-out-uid"], false);
  assert.deepEqual(
    disk.partners.pilot.memberships["opt-in-uid"].research,
    approvedSnapshot(),
  );
  assert.equal(JSON.stringify(disk).includes("private@example.com"), false);

  await expectStoreError(
    () =>
      store.claimSeat({
        uid: "extra-field-uid",
        inviteToken,
        researchConsent: true,
        researchSnapshot: approvedSnapshot({ email: "leak@example.com" }),
      }),
    "INVALID_RESEARCH",
  );
  await expectStoreError(
    () =>
      store.claimSeat({
        uid: "wrong-version-uid",
        inviteToken,
        researchConsent: true,
        researchSnapshot: approvedSnapshot({ assessmentVersion: "future-v2" }),
      }),
    "INVALID_RESEARCH",
  );
  assert.equal((await store.getAccess("extra-field-uid")).status, "none");
});

test("omitted optional research consent claims a seat without research", async (t) => {
  const { filePath, store } = await setupStore(t);
  const { inviteToken } = await createPilot(store);

  const access = await store.claimSeat({ uid: "default-opt-out", inviteToken });

  assert.equal(access.status, "active");
  const disk = JSON.parse(await readFile(filePath, "utf8"));
  assert.equal(
    "research" in disk.partners.pilot.memberships["default-opt-out"],
    false,
  );
});

test("reports suppress four records, aggregate five, and expose no learner-level data", async (t) => {
  const { store } = await setupStore(t);
  const { inviteToken, adminToken } = await createPilot(store);
  await store.claimSeat({ uid: "no-consent", inviteToken, researchConsent: false });
  for (let index = 1; index <= 4; index += 1) {
    await store.claimSeat({
      uid: `private-firebase-uid-${index}`,
      inviteToken,
      researchConsent: true,
      researchSnapshot: approvedSnapshot({
        primaryDevice: index % 2 === 0 ? "Computer" : "Tablet",
        concerns: index === 1 ? ["Suspicious links", "Account hacking"] : ["Suspicious links"],
      }),
    });
  }

  const suppressed = await store.getAdminReport({ adminToken });
  assert.equal(suppressed.research.consentedCount, 4);
  assert.equal(suppressed.research.suppressed, true);
  assert.equal(suppressed.research.distributions, null);

  await store.claimSeat({
    uid: "private-firebase-uid-5",
    inviteToken,
    researchConsent: true,
    researchSnapshot: approvedSnapshot({ primaryDevice: "Smartphone" }),
  });
  const report = await store.getAdminReport({ adminToken });
  assert.equal(report.seats.claimed, 6);
  assert.equal(report.seats.available, 494);
  assert.equal(report.research.consentedCount, 5);
  assert.equal(report.research.consentedPercentage, 83.3);
  assert.equal(report.research.suppressed, false);
  assert.deepEqual(report.research.distributions.primaryDevice, {
    Computer: 2,
    Smartphone: 1,
    Tablet: 2,
  });
  assert.deepEqual(report.research.distributions.concerns, {
    "Account hacking": 1,
    "Suspicious links": 5,
  });

  const reportText = JSON.stringify(report);
  for (const forbiddenValue of [
    "private-firebase-uid-1",
    "private-firebase-uid-5",
    "no-consent",
    "private@example.com",
    inviteToken,
    adminToken,
  ]) {
    assert.equal(reportText.includes(forbiddenValue), false);
  }
  const forbiddenKeys = [];
  function scan(value) {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      if (/uid|email|token|hash|submission|individual/i.test(key)) {
        forbiddenKeys.push(key);
      }
      scan(child);
    }
  }
  scan(report);
  assert.deepEqual(forbiddenKeys, []);
});

test("admin token rotation invalidates the prior token", async (t) => {
  const { store } = await setupStore(t);
  const created = await createPilot(store);

  const rotated = await store.rotateAdmin({ partnerId: "pilot" });

  assert.match(rotated.adminToken, /^[A-Za-z0-9_-]{43}$/);
  await expectStoreError(
    () => store.getAdminReport({ adminToken: created.adminToken }),
    "INVALID_ADMIN",
  );
  assert.equal(
    (await store.getAdminReport({ adminToken: rotated.adminToken })).partnerId,
    "pilot",
  );
});

test("release cancellation keeps access and confirmation is idempotent and frees a seat", async (t) => {
  const { store } = await setupStore(t);
  const { inviteToken } = await createPilot(store, { seatLimit: 1 });
  await store.claimSeat({ uid: "uid-1", inviteToken, researchConsent: true, researchSnapshot: approvedSnapshot() });

  const intent = await store.beginRelease({ uid: "uid-1" });
  assert.match(intent.receipt, /^[A-Za-z0-9_-]{43}$/);
  assert.equal((await store.getAccess("uid-1")).status, "active");
  await store.cancelRelease({ uid: "uid-1", receipt: intent.receipt });
  assert.equal((await store.getAccess("uid-1")).status, "active");

  const retryIntent = await store.beginRelease({ uid: "uid-1" });
  assert.notEqual(retryIntent.receipt, intent.receipt);
  assert.deepEqual(await store.confirmRelease({ receipt: retryIntent.receipt }), {
    released: true,
    idempotent: false,
  });
  assert.deepEqual(await store.confirmRelease({ receipt: retryIntent.receipt }), {
    released: true,
    idempotent: true,
  });
  assert.equal((await store.getAccess("uid-1")).status, "none");
  assert.equal((await store.listPartners())[0].claimedCount, 0);
  assert.equal(
    (
      await store.claimSeat({
        uid: "uid-2",
        inviteToken,
        researchConsent: false,
      })
    ).status,
    "active",
  );
});

test("pending releases normalize after 15 minutes and receipts expire after 24 hours", async (t) => {
  const { filePath, store, advance } = await setupStore(t);
  const { inviteToken } = await createPilot(store, { seatLimit: 2 });
  await store.claimSeat({ uid: "uid-1", inviteToken, researchConsent: false });
  await store.claimSeat({ uid: "uid-2", inviteToken, researchConsent: false });
  const first = await store.beginRelease({ uid: "uid-1" });
  const expiring = await store.beginRelease({ uid: "uid-2" });

  advance(16 * 60 * 1000);
  assert.equal((await store.getAccess("uid-1")).status, "active");
  await store.setPartnerStatus({ partnerId: "pilot", status: "active" });
  const normalized = JSON.parse(await readFile(filePath, "utf8"));
  assert.equal(normalized.partners.pilot.memberships["uid-1"].release.pendingUntil, null);
  assert.deepEqual(await store.confirmRelease({ receipt: first.receipt }), {
    released: true,
    idempotent: false,
  });

  advance(24 * 60 * 60 * 1000);
  await expectStoreError(
    () => store.confirmRelease({ receipt: expiring.receipt }),
    "INVALID_RECEIPT",
  );
  assert.equal((await store.getAccess("uid-2")).status, "active");
  assert.deepEqual(
    await store.reconcileMembership({ partnerId: "pilot", uid: "uid-2" }),
    { removed: true },
  );
  assert.equal((await store.getAccess("uid-2")).status, "none");
});

test("removePartner refuses occupied partners and removes an empty reconciled partner", async (t) => {
  const { store } = await setupStore(t);
  const { inviteToken } = await createPilot(store, { seatLimit: 1 });
  await store.claimSeat({ uid: "orphan", inviteToken, researchConsent: false });

  await expectStoreError(
    () => store.removePartner({ partnerId: "pilot" }),
    "PARTNER_NOT_EMPTY",
  );
  assert.deepEqual(
    await store.reconcileMembership({ partnerId: "pilot", uid: "orphan" }),
    { removed: true },
  );
  assert.deepEqual(await store.removePartner({ partnerId: "pilot" }), {
    removed: true,
  });
  assert.deepEqual(await store.listPartners(), []);
});

test("atomic mutations retain a valid backup and refuse to overwrite corrupt state", async (t) => {
  const { filePath, store } = await setupStore(t);
  await createPilot(store);
  const firstDisk = await readFile(filePath, "utf8");
  await store.setPartnerStatus({ partnerId: "pilot", status: "suspended" });
  const backupPath = `${filePath}.backup`;
  assert.deepEqual(JSON.parse(await readFile(backupPath, "utf8")), JSON.parse(firstDisk));
  assert.equal((await stat(backupPath)).mode & 0o777, 0o600);

  await writeFile(filePath, "{not valid json", { mode: 0o600 });
  assert.deepEqual(await store.health(), { configured: true, healthy: false });
  await expectStoreError(
    () => store.setPartnerStatus({ partnerId: "pilot", status: "active" }),
    "STORE_CORRUPT",
  );
  assert.equal(await readFile(filePath, "utf8"), "{not valid json");
  assert.deepEqual(JSON.parse(await readFile(backupPath, "utf8")), JSON.parse(firstDisk));
});

test("committed create recovers one-time tokens from ambiguous rename and post-rename errors", async (t) => {
  for (const failurePoint of ["rename", "chmod"]) {
    let filePath;
    let injected = false;
    const testOnlyFileOperations =
      failurePoint === "rename"
        ? {
            async rename(source, destination) {
              await fsRename(source, destination);
              if (destination === filePath) {
                injected = true;
                throw new Error("injected error after primary rename");
              }
            },
          }
        : {
            async chmod(path, mode) {
              if (path === filePath) {
                injected = true;
                throw new Error("injected post-rename chmod error");
              }
              await fsChmod(path, mode);
            },
          };
    const setup = await setupStore(t, { testOnlyFileOperations });
    filePath = setup.filePath;

    const created = await createPilot(setup.store);

    assert.equal(injected, true);
    assert.match(created.inviteToken, /^[A-Za-z0-9_-]{43}$/);
    assert.match(created.adminToken, /^[A-Za-z0-9_-]{43}$/);
    const diskText = await readFile(filePath, "utf8");
    assert.equal(diskText.includes(created.inviteToken), false);
    assert.equal(diskText.includes(created.adminToken), false);
    await expectStoreError(
      () => createPilot(setup.store),
      "PARTNER_EXISTS",
    );
  }
});

test("schema-version corruption is unhealthy and blocks mutation", async (t) => {
  const { filePath, store } = await setupStore(t);
  await writeFile(filePath, JSON.stringify({ version: 2, partners: {}, confirmedReceipts: {} }), {
    mode: 0o600,
  });

  assert.deepEqual(await store.health(), { configured: true, healthy: false });
  await expectStoreError(
    () => createPilot(store),
    "STORE_CORRUPT",
  );
});

test("unknown persisted fields are rejected instead of carrying secrets forward", async (t) => {
  const { filePath, store } = await setupStore(t);
  const { inviteToken } = await createPilot(store);
  const disk = JSON.parse(await readFile(filePath, "utf8"));
  disk.partners.pilot.inviteToken = inviteToken;
  await writeFile(filePath, JSON.stringify(disk), { mode: 0o600 });

  assert.deepEqual(await store.health(), { configured: true, healthy: false });
  await expectStoreError(
    () => store.setPartnerStatus({ partnerId: "pilot", status: "suspended" }),
    "STORE_CORRUPT",
  );
});

test("persisted seat-limit and one-partner-per-UID invariants are validated", async (t) => {
  const firstSetup = await setupStore(t);
  const first = await createPilot(firstSetup.store, { seatLimit: 1 });
  await firstSetup.store.claimSeat({
    uid: "uid-1",
    inviteToken: first.inviteToken,
    researchConsent: false,
  });
  const overCapacity = JSON.parse(await readFile(firstSetup.filePath, "utf8"));
  overCapacity.partners.pilot.memberships["uid-2"] = {
    claimedAt: "2026-08-02T12:00:00.000Z",
  };
  await writeFile(firstSetup.filePath, JSON.stringify(overCapacity), { mode: 0o600 });
  assert.deepEqual(await firstSetup.store.health(), {
    configured: true,
    healthy: false,
  });

  const secondSetup = await setupStore(t);
  const secondPilot = await createPilot(secondSetup.store);
  await createPilot(secondSetup.store, {
    partnerId: "other",
    name: "Other Partner",
    seatLimit: 5,
    branding: { name: "Other Partner", logoPath: null, accent: "#315A73" },
  });
  await secondSetup.store.claimSeat({
    uid: "duplicate-uid",
    inviteToken: secondPilot.inviteToken,
    researchConsent: false,
  });
  const duplicated = JSON.parse(await readFile(secondSetup.filePath, "utf8"));
  duplicated.partners.other.memberships["duplicate-uid"] = {
    claimedAt: "2026-08-02T12:00:00.000Z",
  };
  await writeFile(secondSetup.filePath, JSON.stringify(duplicated), { mode: 0o600 });
  assert.deepEqual(await secondSetup.store.health(), {
    configured: true,
    healthy: false,
  });
});
