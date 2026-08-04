import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { runSponsoredAccountsCli } from "../scripts/provision-sponsored-accounts.mjs";

const API_ORIGIN = "https://everwise.dexio-games.com";
const OUTPUT = join(tmpdir(), "everwise-sponsored-accounts.csv");
const REPOSITORY_ROOT = fileURLToPath(new URL("..", import.meta.url));
const CLI_PATH = join(REPOSITORY_ROOT, "scripts", "provision-sponsored-accounts.mjs");
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
  const passwordAlphabet = "23456789abcdefghijkmnopqrstuvwxyz";
  return Array.from({ length: 500 }, (_, index) => ({
    accountNumber: index + 1,
    username: `EverWise${String(index + 1).padStart(3, "0")}`,
    authEmail: `ewp-${String(index + 1).padStart(48, "0")}@accounts.everwise.app`,
    password: `SafePassword-A2!${passwordAlphabet[Math.floor(index / passwordAlphabet.length)]}${passwordAlphabet[index % passwordAlphabet.length]}`,
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
    validArgs("preflight").slice(0, -1),
    validArgs("preflight", { output: "relative.csv" }),
    validArgs("preflight").map((value) => value === API_ORIGIN ? "http://everwise.dexio-games.com" : value),
    validArgs("preflight").map((value, index) => index === 4 ? "499" : value),
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

    assert.deepEqual(
      fixture.calls.map(([name]) => name),
      command === "resume"
        ? [
          "createFirebaseIdentityClient",
          "readRosterFile",
          "preflightSponsoredProvisioning",
        ]
        : ["createFirebaseIdentityClient", "preflightSponsoredProvisioning"],
    );
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
  assert.deepEqual(provisionOptions.preflight, PREFLIGHT);
  assert.equal(provisionOptions.inviteToken, ENV.EVERWISE_PARTNER_INVITE_TOKEN);
  assert.equal(provisionOptions.adminToken, ENV.EVERWISE_PARTNER_ADMIN_TOKEN);
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
  const fixture = makeFixture({
    async provisionSponsoredRoster(options) {
      fixture.calls.push(["provisionSponsoredRoster", options]);
      const changedRows = options.rows.map((row, index) =>
        index === 0 ? { ...row, status: "active" } : row,
      );
      await options.persistRows(changedRows);
      return { active: 500, pending: 0, failed: 0 };
    },
  });
  const originalPasswords = fixture.rows.map(({ password }) => password);

  assert.equal(await run(fixture, validArgs("resume", { confirmed: true })), 0);

  assert.deepEqual(fixture.calls.map(([name]) => name), [
    "createFirebaseIdentityClient",
    "readRosterFile",
    "preflightSponsoredProvisioning",
    "provisionSponsoredRoster",
    "writeRosterFile",
  ]);
  const readOptions = fixture.calls[1][1];
  const provisionOptions = fixture.calls[3][1];
  const writeOptions = fixture.calls[4][1];
  assert.equal(readOptions.filePath, OUTPUT);
  assert.equal(typeof readOptions.repositoryRoot, "string");
  assert.equal(provisionOptions.rows, fixture.rows);
  assert.deepEqual(provisionOptions.rows.map(({ password }) => password), originalPasswords);
  assert.deepEqual(writeOptions, {
    filePath: OUTPUT,
    repositoryRoot: readOptions.repositoryRoot,
    rows: [
      { ...fixture.rows[0], status: "active" },
      ...fixture.rows.slice(1),
    ],
  });
  assert.deepEqual(writeOptions.rows.map(({ password }) => password), originalPasswords);
  assert.equal(
    fixture.stdoutText,
    `${PREFLIGHT_OUTPUT}Provisioning complete: 500 active, 0 pending, 0 failed.\n` +
      "Private roster saved to the approved output path.\n",
  );
  assert.equal(fixture.stderrText, "");
});

test("incomplete provisioning preserves the roster, exits nonzero, and gives resume guidance", async () => {
  const fixture = makeFixture({
    async provisionSponsoredRoster(options) {
      fixture.calls.push(["provisionSponsoredRoster", options]);
      await options.persistRows(options.rows);
      return { active: 499, pending: 0, failed: 1 };
    },
  });

  assert.equal(await run(fixture, validArgs("resume", { confirmed: true })), 1);
  assert.match(
    fixture.stdoutText,
    /Provisioning incomplete: 499 active, 0 pending, 1 failed\./,
  );
  assert.match(fixture.stdoutText, /resume with the same private roster/i);
  assert.equal(fixture.stdoutText.includes("Provisioning complete"), false);
  assert.equal(fixture.stderrText, "");
});

test("partial resume validates the saved roster before accepting its matching occupied seats", async () => {
  const claimed = 237;
  const resumeRows = pendingRows().map((row, index) => ({
    ...row,
    status: index < claimed ? "active" : "pending",
  }));
  const resumePreflight = {
    ...PREFLIGHT,
    seats: { claimed, available: 500 - claimed, limit: 500 },
  };
  const originalPasswords = resumeRows.map(({ password }) => password);
  const fixture = makeFixture({
    async readRosterFile(options) {
      fixture.calls.push(["readRosterFile", options]);
      return resumeRows;
    },
    async preflightSponsoredProvisioning(options) {
      fixture.calls.push(["preflightSponsoredProvisioning", options]);
      assert.deepEqual(options.resumeSummary, {
        total: 500,
        active: claimed,
        pending: 500 - claimed,
      });
      return resumePreflight;
    },
    async provisionSponsoredRoster(options) {
      fixture.calls.push(["provisionSponsoredRoster", options]);
      assert.equal(options.rows, resumeRows);
      assert.deepEqual(
        options.rows.map(({ password }) => password),
        originalPasswords,
      );
      assert.deepEqual(options.preflight, resumePreflight);
      return { active: claimed, pending: 500 - claimed, failed: 0 };
    },
  });

  assert.equal(await run(fixture, validArgs("resume", { confirmed: true })), 1);

  assert.deepEqual(fixture.calls.map(([name]) => name), [
    "createFirebaseIdentityClient",
    "readRosterFile",
    "preflightSponsoredProvisioning",
    "provisionSponsoredRoster",
  ]);
  assert.match(
    fixture.stdoutText,
    /Seats: 237 claimed, 263 available, 500 total/,
  );
  assert.match(
    fixture.stdoutText,
    /Provisioning incomplete: 237 active, 263 pending, 0 failed/,
  );
  assert.match(fixture.stdoutText, /resume with the same private roster/i);
  assert.equal(fixture.stderrText, "");
});

test("resume rejects a roster with the wrong fixed identity before remote preflight", async () => {
  const fixture = makeFixture({
    async readRosterFile(options) {
      fixture.calls.push(["readRosterFile", options]);
      return fixture.rows.map((row, index) =>
        index === 0 ? { ...row, username: "EverWise999" } : row,
      );
    },
  });

  assert.equal(await run(fixture, validArgs("resume", { confirmed: true })), 1);
  assert.deepEqual(fixture.calls.map(([name]) => name), [
    "createFirebaseIdentityClient",
    "readRosterFile",
  ]);
  assert.equal(fixture.stdoutText, "");
  assert.equal(fixture.stderrText, "Error [OPERATION_FAILED].\n");
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

test("stateful dependency error getters are snapshotted once and cannot reveal secrets", async () => {
  const password = "Password-Like-Detail!A1";
  const idToken = "firebase-id-token-like-detail";
  let codeReads = 0;
  let messageReads = 0;
  const fixture = makeFixture({
    async provisionSponsoredRoster() {
      throw {
        get code() {
          codeReads += 1;
          return codeReads === 1
            ? "UNAVAILABLE"
            : `${ENV.EVERWISE_FIREBASE_WEB_API_KEY}-${password}`;
        },
        get message() {
          messageReads += 1;
          return messageReads === 1
            ? `Sponsored account 7 (EverWise007) ${ENV.EVERWISE_PARTNER_INVITE_TOKEN} ${ENV.EVERWISE_PARTNER_ADMIN_TOKEN} ${idToken}`
            : `${password} ${idToken}`;
        },
      };
    },
  });

  assert.equal(await run(fixture, validArgs("resume", { confirmed: true })), 1);

  assert.equal(codeReads, 1);
  assert.equal(messageReads, 1);
  assert.equal(fixture.stderrText, "Error [UNAVAILABLE] account 7 (EverWise007).\n");
  for (const secret of [...Object.values(ENV), password, idToken]) {
    assert.equal(`${fixture.stdoutText}${fixture.stderrText}`.includes(secret), false);
  }
});

test("throwing dependency error getters and a throwing error stream cannot escape", async () => {
  const password = "Password-Like-Detail!A1";
  const idToken = "firebase-id-token-like-detail";
  const fixture = makeFixture({
    async provisionSponsoredRoster() {
      throw {
        get code() {
          throw new Error(`${ENV.EVERWISE_FIREBASE_WEB_API_KEY} ${password}`);
        },
        get message() {
          throw new Error(
            `${ENV.EVERWISE_PARTNER_INVITE_TOKEN} ${ENV.EVERWISE_PARTNER_ADMIN_TOKEN} ${idToken}`,
          );
        },
      };
    },
  });

  assert.equal(await run(fixture, validArgs("resume", { confirmed: true })), 1);
  assert.equal(fixture.stderrText, "Error [OPERATION_FAILED].\n");

  const streamFailure = `${Object.values(ENV).join(" ")} ${password} ${idToken}`;
  const result = await runSponsoredAccountsCli({
    argv: [],
    env: ENV,
    dependencies: fixture.dependencies,
    stdout: fixture.stdout,
    stderr: {
      write() {
        throw new Error(streamFailure);
      },
    },
  });
  assert.equal(result, 1);
});

test("hostile progress payloads fail without writing dependency-controlled fields", async () => {
  const password = "Password-Like-Detail!A1";
  const idToken = "firebase-id-token-like-detail";
  const leakedUsername = `${ENV.EVERWISE_FIREBASE_WEB_API_KEY}-${password}`;
  const fixture = makeFixture({
    async provisionSponsoredRoster(options) {
      await options.onProgress({
        accountNumber: 1,
        get username() {
          return leakedUsername;
        },
        status: `${ENV.EVERWISE_PARTNER_INVITE_TOKEN}-${ENV.EVERWISE_PARTNER_ADMIN_TOKEN}-${idToken}`,
      });
      return { active: 500, pending: 0, failed: 0 };
    },
  });

  assert.equal(await run(fixture, validArgs("resume", { confirmed: true })), 1);
  assert.equal(fixture.stderrText, "Error [INVALID_PROGRESS]: Provisioning progress was invalid.\n");
  for (const secret of [...Object.values(ENV), password, idToken]) {
    assert.equal(`${fixture.stdoutText}${fixture.stderrText}`.includes(secret), false);
  }
});

test("progress rejects a non-integer account even when its empty username would otherwise match", async () => {
  const fixture = makeFixture({
    async provisionSponsoredRoster(options) {
      await options.onProgress({
        accountNumber: 1.5,
        username: "",
        status: "active",
      });
      return { active: 500, pending: 0, failed: 0 };
    },
  });

  assert.equal(await run(fixture, validArgs("resume", { confirmed: true })), 1);
  assert.equal(fixture.stderrText, "Error [INVALID_PROGRESS]: Provisioning progress was invalid.\n");
  assert.equal(fixture.stdoutText.includes("Account 1.5"), false);
});

test("hostile preflight getters fail before any dynamic target output", async () => {
  const password = "Password-Like-Detail!A1";
  const idToken = "firebase-id-token-like-detail";
  const fixture = makeFixture({
    async preflightSponsoredProvisioning() {
      return {
        partnerId: "community-partner",
        get partnerName() {
          return `${ENV.EVERWISE_FIREBASE_WEB_API_KEY} ${password}`;
        },
        get firebaseProjectId() {
          return `${ENV.EVERWISE_PARTNER_INVITE_TOKEN} ${idToken}`;
        },
        get seats() {
          throw new Error(ENV.EVERWISE_PARTNER_ADMIN_TOKEN);
        },
      };
    },
  });

  assert.equal(await run(fixture, validArgs("preflight")), 1);
  assert.equal(fixture.stdoutText, "");
  assert.equal(fixture.stderrText, "Error [INVALID_PREFLIGHT]: Provisioning preflight was invalid.\n");
  for (const secret of [...Object.values(ENV), password, idToken]) {
    assert.equal(`${fixture.stdoutText}${fixture.stderrText}`.includes(secret), false);
  }
});

test("stateful completion getters are read once and rejected without secret output", async () => {
  const password = "Password-Like-Detail!A1";
  const idToken = "firebase-id-token-like-detail";
  const reads = { active: 0, pending: 0, failed: 0 };
  const values = {
    active: [500, 500, `${ENV.EVERWISE_FIREBASE_WEB_API_KEY} ${password}`],
    pending: [0, 0, `${ENV.EVERWISE_PARTNER_INVITE_TOKEN} ${idToken}`],
    failed: [0, 0, ENV.EVERWISE_PARTNER_ADMIN_TOKEN],
  };
  const fixture = makeFixture({
    async provisionSponsoredRoster() {
      return {
        get active() {
          const value = values.active[reads.active] ?? values.active.at(-1);
          reads.active += 1;
          return value;
        },
        get pending() {
          const value = values.pending[reads.pending] ?? values.pending.at(-1);
          reads.pending += 1;
          return value;
        },
        get failed() {
          const value = values.failed[reads.failed] ?? values.failed.at(-1);
          reads.failed += 1;
          return value;
        },
      };
    },
  });

  assert.equal(await run(fixture, validArgs("resume", { confirmed: true })), 1);
  assert.deepEqual(reads, { active: 1, pending: 1, failed: 1 });
  assert.equal(fixture.stderrText, "Error [INVALID_SUMMARY]: Provisioning returned an invalid count summary.\n");
  assert.equal(fixture.stdoutText.includes("Private roster saved"), false);
  for (const secret of [...Object.values(ENV), password, idToken]) {
    assert.equal(`${fixture.stdoutText}${fixture.stderrText}`.includes(secret), false);
  }
});

test("throwing completion getters become a static summary error", async () => {
  const password = "Password-Like-Detail!A1";
  const idToken = "firebase-id-token-like-detail";
  const rawDetail = `${Object.values(ENV).join(" ")} ${password} ${idToken}`;
  const fixture = makeFixture({
    async provisionSponsoredRoster() {
      return {
        get active() {
          throw new Error(rawDetail);
        },
        pending: 0,
        failed: 0,
      };
    },
  });

  assert.equal(await run(fixture, validArgs("resume", { confirmed: true })), 1);
  assert.equal(fixture.stderrText, "Error [INVALID_SUMMARY]: Provisioning returned an invalid count summary.\n");
  assert.equal(fixture.stdoutText.includes("Private roster saved"), false);
  for (const secret of [...Object.values(ENV), password, idToken]) {
    assert.equal(`${fixture.stdoutText}${fixture.stderrText}`.includes(secret), false);
  }
});

test("completion summary requires exact nonnegative integer counts totaling 500", async () => {
  const invalidSummaries = [
    { active: 500, pending: 0, failed: 0, extra: 0 },
    { active: 500, pending: 0 },
    { active: 499.5, pending: 0.5, failed: 0 },
    { active: 501, pending: -1, failed: 0 },
    { active: 499, pending: 0, failed: 0 },
  ];

  for (const summary of invalidSummaries) {
    const fixture = makeFixture({
      async provisionSponsoredRoster() {
        return summary;
      },
    });

    assert.equal(await run(fixture, validArgs("resume", { confirmed: true })), 1);
    assert.equal(fixture.stderrText, "Error [INVALID_SUMMARY]: Provisioning returned an invalid count summary.\n");
    assert.equal(fixture.stdoutText.includes("Provisioning complete"), false);
    assert.equal(fixture.stdoutText.includes("Private roster saved"), false);
  }
});

test("process import is inert and invalid direct execution exits safely without network", () => {
  const imported = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      `await import(${JSON.stringify(new URL("../scripts/provision-sponsored-accounts.mjs", import.meta.url).href)}); process.stdout.write("imported\\n");`,
    ],
    { cwd: REPOSITORY_ROOT, encoding: "utf8" },
  );
  assert.equal(imported.status, 0, imported.stderr);
  assert.equal(imported.stdout, "imported\n");
  assert.equal(imported.stderr, "");

  const direct = spawnSync(process.execPath, [CLI_PATH, "not-a-command"], {
    cwd: REPOSITORY_ROOT,
    encoding: "utf8",
    env: { ...process.env, ...ENV },
  });
  assert.equal(direct.status, 1);
  assert.equal(direct.stdout, "");
  assert.equal(
    direct.stderr,
    "Error [CLI_ARGUMENTS]: A supported provisioning command is required.\n",
  );
  for (const secret of Object.values(ENV)) {
    assert.equal(direct.stderr.includes(secret), false);
  }
});
