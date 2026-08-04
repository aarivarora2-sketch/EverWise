import test from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runSponsoredAccountsCli } from "../scripts/provision-sponsored-accounts.mjs";

const API_ORIGIN = "https://everwise.dexio-games.com";
const OUTPUT = join(tmpdir(), "everwise-sponsored-accounts.csv");
const ENV = Object.freeze({
  EVERWISE_FIREBASE_WEB_API_KEY: "firebase-api-secret",
  EVERWISE_PARTNER_INVITE_TOKEN: "partner-invite-secret",
  EVERWISE_PARTNER_ADMIN_TOKEN: "partner-admin-secret",
});
const PREFLIGHT = Object.freeze({
  partnerId: "community-partner",
  partnerName: "Community Partner",
  firebaseProjectId: "games-caf0e",
  seats: Object.freeze({ claimed: 0, available: 500, limit: 500 }),
});
const PREFLIGHT_OUTPUT = [
  "Production preflight passed.",
  "Partner: Community Partner (community-partner)",
  "Firebase project: games-caf0e",
  "Seats: 0 claimed, 500 available, 500 total",
  "No accounts or credential files were created.",
  "",
].join("\n");

function validArgs(command, { confirmed = false, output = OUTPUT } = {}) {
  return [
    command,
    "--api-origin",
    API_ORIGIN,
    "--count",
    "500",
    "--prefix",
    "EverWise",
    "--start",
    "1",
    "--end",
    "500",
    "--output",
    output,
    ...(confirmed ? ["--confirm-production"] : []),
  ];
}

function pendingRows() {
  return Array.from({ length: 500 }, (_, index) => ({
    accountNumber: index + 1,
    username: `EverWise${String(index + 1).padStart(3, "0")}`,
    password: `Password-${String(index + 1).padStart(3, "0")}-Safe!A1`,
    status: "pending",
  }));
}

function makeFixture(overrides = {}) {
  const calls = [];
  const firebaseClient = Object.freeze({ kind: "firebase-client" });
  const partnerOperations = Object.freeze({ kind: "partner-operations" });
  const rows = pendingRows();
  const dependencies = {
    createFirebaseIdentityClient({ apiKey }) {
      calls.push(["createFirebaseIdentityClient", apiKey]);
      return firebaseClient;
    },
    async preflightSponsoredProvisioning(options) {
      calls.push(["preflightSponsoredProvisioning", options]);
      return PREFLIGHT;
    },
    buildSponsoredRoster() {
      calls.push(["buildSponsoredRoster"]);
      return rows;
    },
    async createRosterFile(options) {
      calls.push(["createRosterFile", options]);
    },
    async readRosterFile(options) {
      calls.push(["readRosterFile", options]);
      return rows;
    },
    async writeRosterFile(options) {
      calls.push(["writeRosterFile", options]);
    },
    async provisionSponsoredRoster(options) {
      calls.push(["provisionSponsoredRoster", options]);
      return { active: 500, pending: 0, failed: 0 };
    },
    partnerOperations,
    backoff: async () => {},
    ...overrides,
  };
  let stdout = "";
  let stderr = "";
  return {
    calls,
    rows,
    firebaseClient,
    partnerOperations,
    dependencies,
    stdout: { write(value) { stdout += value; } },
    stderr: { write(value) { stderr += value; } },
    get stdoutText() { return stdout; },
    get stderrText() { return stderr; },
  };
}

async function run(fixture, argv, env = ENV) {
  return runSponsoredAccountsCli({
    argv,
    env,
    dependencies: fixture.dependencies,
    stdout: fixture.stdout,
    stderr: fixture.stderr,
  });
}

test("rejects malformed or non-production arguments before constructing dependencies", async () => {
  const invalidArgumentSets = [
    [],
    ["destroy"],
    [...validArgs("preflight"), "--unknown", "value"],
    [...validArgs("preflight"), "--count", "500"],
    validArgs("preflight").map((value) => value === "--count" ? "--count=500" : value),
    validArgs("preflight").filter((value) => value !== "500"),
    validArgs("preflight", { output: "relative.csv" }),
    validArgs("preflight").map((value) => value === API_ORIGIN ? "http://everwise.dexio-games.com" : value),
    validArgs("preflight").map((value) => value === "500" ? "499" : value),
    validArgs("preflight").map((value) => value === "EverWise" ? "everwise" : value),
    validArgs("preflight").map((value) => value === "1" ? "0" : value),
    validArgs("preflight").map((value, index) => index === 10 ? "499" : value),
    [...validArgs("preflight"), "--confirm-production"],
    [...validArgs("create"), "--invite-token", ENV.EVERWISE_PARTNER_INVITE_TOKEN],
  ];

  for (const argv of invalidArgumentSets) {
    const fixture = makeFixture();
    assert.equal(await run(fixture, argv), 1, argv.join(" "));
    assert.deepEqual(fixture.calls, [], argv.join(" "));
    assert.equal(fixture.stdoutText, "");
    for (const secret of Object.values(ENV)) {
      assert.equal(fixture.stderrText.includes(secret), false);
    }
  }
});

test("requires all three environment-only secrets without echoing their values", async () => {
  for (const name of Object.keys(ENV)) {
    const fixture = makeFixture();
    const env = { ...ENV };
    delete env[name];
    assert.equal(await run(fixture, validArgs("preflight"), env), 1);
    assert.deepEqual(fixture.calls, []);
    assert.equal(fixture.stdoutText, "");
    for (const secret of Object.values(ENV)) {
      assert.equal(fixture.stderrText.includes(secret), false);
    }
  }
});

test("preflight performs only the read-only preflight and prints its redacted target", async () => {
  const fixture = makeFixture();

  assert.equal(await run(fixture, validArgs("preflight")), 0);

  assert.deepEqual(fixture.calls.map(([name]) => name), [
    "createFirebaseIdentityClient",
    "preflightSponsoredProvisioning",
  ]);
  assert.equal(fixture.calls[0][1], ENV.EVERWISE_FIREBASE_WEB_API_KEY);
  assert.deepEqual(fixture.calls[1][1], {
    apiOrigin: API_ORIGIN,
    inviteToken: ENV.EVERWISE_PARTNER_INVITE_TOKEN,
    adminToken: ENV.EVERWISE_PARTNER_ADMIN_TOKEN,
    firebaseClient: fixture.firebaseClient,
    partnerOperations: fixture.partnerOperations,
  });
  assert.equal(fixture.stdoutText, PREFLIGHT_OUTPUT);
  assert.equal(fixture.stderrText, "");
  for (const secret of Object.values(ENV)) {
    assert.equal(fixture.stdoutText.includes(secret), false);
  }
});

test("unconfirmed create and resume stop after the same read-only preflight", async () => {
  for (const command of ["create", "resume"]) {
    const fixture = makeFixture();

    assert.equal(await run(fixture, validArgs(command)), 0);

    assert.deepEqual(fixture.calls.map(([name]) => name), [
      "createFirebaseIdentityClient",
      "preflightSponsoredProvisioning",
    ]);
    assert.equal(
      fixture.stdoutText,
      `${PREFLIGHT_OUTPUT}Re-run with --confirm-production only after reviewing this target.\n`,
    );
    assert.equal(fixture.stderrText, "");
  }
});

test("confirmed create saves a pending roster before provisioning and persists updates", async () => {
  const fixture = makeFixture({
    async provisionSponsoredRoster(options) {
      fixture.calls.push(["provisionSponsoredRoster", options]);
      assert.ok(options.rows.every(({ status }) => status === "pending"));
      await options.persistRows(options.rows.map((row) => ({ ...row, status: "active" })));
      await options.onProgress({
        accountNumber: 1,
        username: "EverWise001",
        status: "active",
      });
      return { active: 500, pending: 0, failed: 0 };
    },
  });

  assert.equal(await run(fixture, validArgs("create", { confirmed: true })), 0);

  assert.deepEqual(fixture.calls.map(([name]) => name), [
    "createFirebaseIdentityClient",
    "preflightSponsoredProvisioning",
    "buildSponsoredRoster",
    "createRosterFile",
    "provisionSponsoredRoster",
    "writeRosterFile",
  ]);
  const createOptions = fixture.calls[3][1];
  const provisionOptions = fixture.calls[4][1];
  const writeOptions = fixture.calls[5][1];
  assert.equal(createOptions.filePath, OUTPUT);
  assert.equal(typeof createOptions.repositoryRoot, "string");
  assert.equal(createOptions.rows, fixture.rows);
  assert.equal(provisionOptions.rows, fixture.rows);
  assert.equal(provisionOptions.apiOrigin, API_ORIGIN);
  assert.equal(provisionOptions.preflight, PREFLIGHT);
  assert.equal(provisionOptions.inviteToken, ENV.EVERWISE_PARTNER_INVITE_TOKEN);
  assert.equal(provisionOptions.firebaseClient, fixture.firebaseClient);
  assert.equal(provisionOptions.partnerOperations, fixture.partnerOperations);
  assert.equal(provisionOptions.backoff, fixture.dependencies.backoff);
  assert.equal(writeOptions.filePath, OUTPUT);
  assert.equal(writeOptions.repositoryRoot, createOptions.repositoryRoot);
  assert.ok(writeOptions.rows.every(({ status }) => status === "active"));
  assert.equal(
    fixture.stdoutText,
    `${PREFLIGHT_OUTPUT}Account 1/500 EverWise001: active\n` +
      "Provisioning complete: 500 active, 0 pending, 0 failed.\n" +
      "Private roster saved to the approved output path.\n",
  );
  assert.equal(fixture.stderrText, "");
});

test("confirmed resume reads the validated roster without regenerating passwords", async () => {
  const fixture = makeFixture();
  const originalPasswords = fixture.rows.map(({ password }) => password);

  assert.equal(await run(fixture, validArgs("resume", { confirmed: true })), 0);

  assert.deepEqual(fixture.calls.map(([name]) => name), [
    "createFirebaseIdentityClient",
    "preflightSponsoredProvisioning",
    "readRosterFile",
    "provisionSponsoredRoster",
  ]);
  const readOptions = fixture.calls[2][1];
  const provisionOptions = fixture.calls[3][1];
  assert.equal(readOptions.filePath, OUTPUT);
  assert.equal(typeof readOptions.repositoryRoot, "string");
  assert.equal(provisionOptions.rows, fixture.rows);
  assert.deepEqual(provisionOptions.rows.map(({ password }) => password), originalPasswords);
  assert.equal(
    fixture.stdoutText,
    `${PREFLIGHT_OUTPUT}Provisioning complete: 500 active, 0 pending, 0 failed.\n` +
      "Private roster saved to the approved output path.\n",
  );
  assert.equal(fixture.stderrText, "");
});

test("dependency failures expose only a safe code and safe account context", async () => {
  const rawSecrets = Object.values(ENV).join(" ");
  const fixture = makeFixture({
    async provisionSponsoredRoster() {
      const error = new Error(
        `Sponsored account 7 (EverWise007) leaked ${rawSecrets}`,
      );
      error.code = "UNAVAILABLE";
      throw error;
    },
  });

  assert.equal(await run(fixture, validArgs("resume", { confirmed: true })), 1);

  assert.equal(fixture.stderrText, "Error [UNAVAILABLE] account 7 (EverWise007).\n");
  for (const secret of Object.values(ENV)) {
    assert.equal(fixture.stderrText.includes(secret), false);
    assert.equal(fixture.stdoutText.includes(secret), false);
  }
});
