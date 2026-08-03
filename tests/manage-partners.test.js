import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createPartnerStore } from "../server/partnerStore.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const cliPath = join(repositoryRoot, "scripts", "manage-partners.mjs");
const publicOrigin = "https://everwise.dexio-games.com";

async function setup(t) {
  const directory = await mkdtemp(join(tmpdir(), "everwise-manage-partners-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return {
    filePath: join(directory, "partners.json"),
    run(args, extraEnv = {}) {
      return spawnSync(process.execPath, [cliPath, ...args], {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          EVERWISE_PARTNER_STORE_PATH: join(directory, "partners.json"),
          ...extraEnv,
        },
      });
    },
  };
}

function expectSuccess(result) {
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, "");
}

function tokenFromUrl(output, fragmentName) {
  const match = output.match(
    new RegExp(`${publicOrigin.replaceAll(".", "\\.")}/#${fragmentName}=([A-Za-z0-9_-]{43})`),
  );
  assert.ok(match, `missing ${fragmentName} URL`);
  return match[1];
}

test("create emits each one-time URL once and persists hashes instead of tokens", async (t) => {
  const fixture = await setup(t);
  const result = fixture.run([
    "create",
    "--id",
    "community-pilot",
    "--name",
    "Community Partner",
    "--seats",
    "500",
  ]);

  expectSuccess(result);
  const inviteToken = tokenFromUrl(result.stdout, "partner");
  const adminToken = tokenFromUrl(result.stdout, "partner-admin");
  assert.equal(result.stdout.match(/https:\/\//g)?.length, 2);
  assert.equal(result.stdout.match(/#partner=/g)?.length, 1);
  assert.equal(result.stdout.match(/#partner-admin=/g)?.length, 1);

  const diskText = await readFile(fixture.filePath, "utf8");
  const disk = JSON.parse(diskText);
  assert.equal(diskText.includes(inviteToken), false);
  assert.equal(diskText.includes(adminToken), false);
  assert.match(disk.partners["community-pilot"].inviteTokenHash, /^[a-f0-9]{64}$/);
  assert.match(disk.partners["community-pilot"].adminTokenHash, /^[a-f0-9]{64}$/);
  assert.equal(disk.partners["community-pilot"].seatLimit, 500);
  assert.deepEqual(disk.partners["community-pilot"].branding, {
    name: "Community Partner",
    logoPath: null,
    accent: "#2F6B61",
  });
});

test("create accepts only the exact 500-seat contract and never accepts token input", async (t) => {
  const fixture = await setup(t);

  for (const seats of ["499", "501", "0500", "500.0", "not-a-number"]) {
    const result = fixture.run([
      "create",
      "--id",
      `pilot-${seats.replaceAll(".", "-")}`,
      "--name",
      "Community Partner",
      "--seats",
      seats,
    ]);
    assert.notEqual(result.status, 0, `unexpectedly accepted ${seats}`);
    assert.doesNotMatch(`${result.stdout}${result.stderr}`, /[A-Za-z0-9_-]{43}/);
  }

  const suppliedSecret = "A".repeat(43);
  const rejected = fixture.run([
    "create",
    "--id",
    "community-pilot",
    "--name",
    "Community Partner",
    "--seats",
    "500",
    "--invite-token",
    suppliedSecret,
  ]);
  assert.notEqual(rejected.status, 0);
  assert.equal(`${rejected.stdout}${rejected.stderr}`.includes(suppliedSecret), false);
});

test("create validates partner metadata and accessible same-origin branding", async (t) => {
  const fixture = await setup(t);
  const valid = fixture.run([
    "create",
    "--id",
    "community-pilot",
    "--name",
    "Community Partner",
    "--seats",
    "500",
    "--logo",
    "/partners/community%20logo.svg",
    "--accent",
    "#315A73",
  ]);
  expectSuccess(valid);
  const disk = JSON.parse(await readFile(fixture.filePath, "utf8"));
  assert.equal(
    disk.partners["community-pilot"].branding.logoPath,
    "/partners/community logo.svg",
  );
  assert.equal(disk.partners["community-pilot"].branding.accent, "#315A73");

  for (const args of [
    ["--id", "UPPERCASE", "--name", "Valid Name"],
    ["--id", "valid-id", "--name", "X"],
    ["--id", "valid-id", "--name", "Valid Name", "--logo", "/partners/../secret"],
    ["--id", "valid-id", "--name", "Valid Name", "--logo", "/partners/%2e%2e/secret"],
    ["--id", "valid-id", "--name", "Valid Name", "--logo", "/partners/%252e%252e/secret"],
    ["--id", "valid-id", "--name", "Valid Name", "--logo", "/partners/%252fsecret"],
    ["--id", "valid-id", "--name", "Valid Name", "--logo", "/partners/%255csecret"],
    ["--id", "valid-id", "--name", "Valid Name", "--logo", "https://example.com/logo.svg"],
    ["--id", "valid-id", "--name", "Valid Name", "--accent", "#FFFFFF"],
    ["--id", "valid-id", "--name", "Valid Name", "--accent", "315A73"],
    ["--id", "valid-name", "--name", "Unsafe\nName"],
  ]) {
    const result = fixture.run(["create", ...args, "--seats", "500"]);
    assert.notEqual(result.status, 0, `unexpectedly accepted ${args.join(" ")}`);
  }
});

test("list reports only non-sensitive partner capacity fields", async (t) => {
  const fixture = await setup(t);
  expectSuccess(
    fixture.run([
      "create",
      "--id",
      "community-pilot",
      "--name",
      "Community Partner",
      "--seats",
      "500",
    ]),
  );

  const result = fixture.run(["list"]);
  expectSuccess(result);
  assert.match(result.stdout, /community-pilot/);
  assert.match(result.stdout, /Community Partner/);
  assert.match(result.stdout, /active/);
  assert.match(result.stdout, /claimed(?: count)?: 0/i);
  assert.match(result.stdout, /limit: 500/i);
  assert.doesNotMatch(result.stdout, /token|hash|#partner/i);
});

test("invite rotation invalidates the old URL and reveals only the new URL once", async (t) => {
  const fixture = await setup(t);
  const created = fixture.run([
    "create",
    "--id",
    "community-pilot",
    "--name",
    "Community Partner",
    "--seats",
    "500",
  ]);
  expectSuccess(created);
  const oldToken = tokenFromUrl(created.stdout, "partner");

  const rotated = fixture.run(["rotate-invite", "--id", "community-pilot"]);
  expectSuccess(rotated);
  const newToken = tokenFromUrl(rotated.stdout, "partner");
  assert.notEqual(newToken, oldToken);
  assert.equal(rotated.stdout.match(/https:\/\//g)?.length, 1);
  assert.equal(rotated.stdout.includes(oldToken), false);

  const store = createPartnerStore({ filePath: fixture.filePath });
  await assert.rejects(
    () => store.previewInvite({ inviteToken: oldToken }),
    (error) => error.code === "INVALID_INVITE",
  );
  assert.equal(
    (await store.previewInvite({ inviteToken: newToken })).partnerId,
    "community-pilot",
  );
});

test("owner status, reconciliation, and disposable removal commands are guarded", async (t) => {
  const fixture = await setup(t);
  const created = fixture.run([
    "create",
    "--id",
    "community-pilot",
    "--name",
    "Community Partner",
    "--seats",
    "500",
  ]);
  expectSuccess(created);
  const inviteToken = tokenFromUrl(created.stdout, "partner");

  expectSuccess(fixture.run(["suspend", "--id", "community-pilot"]));
  assert.match(fixture.run(["list"]).stdout, /suspended/);
  expectSuccess(fixture.run(["reactivate", "--id", "community-pilot"]));
  assert.match(fixture.run(["list"]).stdout, /active/);

  const store = createPartnerStore({ filePath: fixture.filePath });
  await store.claimSeat({
    uid: "firebase-uid-1",
    inviteToken,
    researchConsent: false,
  });

  const missingUid = fixture.run([
    "reconcile-membership",
    "--id",
    "community-pilot",
  ]);
  assert.notEqual(missingUid.status, 0);
  const reconciled = fixture.run([
    "reconcile-membership",
    "--id",
    "community-pilot",
    "--uid",
    "firebase-uid-1",
  ]);
  expectSuccess(reconciled);
  assert.match(
    reconciled.stdout,
    /^Membership reconciliation: partner=community-pilot removed=true\n$/,
  );
  assert.equal(reconciled.stdout.includes("firebase-uid-1"), false);
  assert.doesNotMatch(reconciled.stdout, /token|hash|receipt/i);

  const unguarded = fixture.run(["remove", "--id", "community-pilot"]);
  assert.notEqual(unguarded.status, 0);
  const removed = fixture.run([
    "remove",
    "--id",
    "community-pilot",
    "--disposable-empty",
  ]);
  expectSuccess(removed);
  assert.match(removed.stdout, /community-pilot/);
  assert.equal((await store.listPartners()).length, 0);
});

test("remove refuses a non-empty partner even with the disposable-empty guard", async (t) => {
  const fixture = await setup(t);
  const created = fixture.run([
    "create",
    "--id",
    "community-pilot",
    "--name",
    "Community Partner",
    "--seats",
    "500",
  ]);
  expectSuccess(created);
  const store = createPartnerStore({ filePath: fixture.filePath });
  await store.claimSeat({
    uid: "firebase-uid-1",
    inviteToken: tokenFromUrl(created.stdout, "partner"),
    researchConsent: false,
  });

  const result = fixture.run([
    "remove",
    "--id",
    "community-pilot",
    "--disposable-empty",
  ]);
  assert.notEqual(result.status, 0);
  assert.equal((await store.listPartners())[0].claimedCount, 1);
});

test("admin rotation emits a single one-time admin URL without accepting an old token", async (t) => {
  const fixture = await setup(t);
  const created = fixture.run([
    "create",
    "--id",
    "community-pilot",
    "--name",
    "Community Partner",
    "--seats",
    "500",
  ]);
  expectSuccess(created);
  const oldToken = tokenFromUrl(created.stdout, "partner-admin");

  const result = fixture.run(["rotate-admin", "--id", "community-pilot"]);
  expectSuccess(result);
  const newToken = tokenFromUrl(result.stdout, "partner-admin");
  assert.notEqual(newToken, oldToken);
  assert.equal(result.stdout.match(/https:\/\//g)?.length, 1);
  assert.equal(result.stdout.includes(oldToken), false);
});

test("production CLI drops root privileges to the partner-store service account", () => {
  const probe = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      `
        const module = await import(${JSON.stringify(new URL("../scripts/manage-partners.mjs", import.meta.url).href)});
        const calls = [];
        module.prepareProductionIdentity("/var/lib/everwise/partners.json", {
          getuid: () => 0,
          setgroups: (value) => calls.push(["groups", value]),
          setgid: (value) => calls.push(["gid", value]),
          setuid: (value) => calls.push(["uid", value]),
        });
        module.prepareProductionIdentity("/var/lib/everwise/./partners.json", {
          getuid: () => 0,
          setgroups: (value) => calls.push(["groups", value]),
          setgid: (value) => calls.push(["gid", value]),
          setuid: (value) => calls.push(["uid", value]),
        });
        module.prepareProductionIdentity("/var/lib/everwise/archive/../partners.json", {
          getuid: () => 0,
          setgroups: (value) => calls.push(["groups", value]),
          setgid: (value) => calls.push(["gid", value]),
          setuid: (value) => calls.push(["uid", value]),
        });
        module.prepareProductionIdentity("/tmp/partners.json", {
          getuid: () => 0,
          setgroups: () => calls.push(["unexpected"]),
          setgid: () => calls.push(["unexpected"]),
          setuid: () => calls.push(["unexpected"]),
        });
        process.stdout.write(JSON.stringify(calls));
      `,
    ],
    { encoding: "utf8", cwd: repositoryRoot },
  );

  assert.equal(probe.status, 0, probe.stderr);
  assert.deepEqual(JSON.parse(probe.stdout), [
    ["groups", []],
    ["gid", "www-data"],
    ["uid", "www-data"],
    ["groups", []],
    ["gid", "www-data"],
    ["uid", "www-data"],
    ["groups", []],
    ["gid", "www-data"],
    ["uid", "www-data"],
  ]);
});
