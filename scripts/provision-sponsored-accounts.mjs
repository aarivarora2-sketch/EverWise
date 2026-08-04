#!/usr/bin/env node

import { isAbsolute } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createFirebaseIdentityClient } from "./firebaseIdentityClient.mjs";
import {
  buildSponsoredRoster,
  createRosterFile,
  readRosterFile,
  writeRosterFile,
} from "./sponsoredRoster.mjs";
import {
  preflightSponsoredProvisioning,
  provisionSponsoredRoster,
} from "./sponsoredProvisioner.mjs";
import * as partnerOperations from "../src/services/partnerAccess.js";

const PRODUCTION_API_ORIGIN = "https://everwise.dexio-games.com";
const REPOSITORY_ROOT = fileURLToPath(new URL("../", import.meta.url));
const REQUIRED_ENVIRONMENT = [
  "EVERWISE_FIREBASE_WEB_API_KEY",
  "EVERWISE_PARTNER_INVITE_TOKEN",
  "EVERWISE_PARTNER_ADMIN_TOKEN",
];
const FIXED_VALUES = Object.freeze({
  "api-origin": PRODUCTION_API_ORIGIN,
  count: "500",
  prefix: "EverWise",
  start: "1",
  end: "500",
});
const VALUE_OPTIONS = new Set([...Object.keys(FIXED_VALUES), "output"]);
const COMMAND_OPTIONS = new Map([
  ["preflight", new Map([...VALUE_OPTIONS].map((name) => [name, "value"]))],
  [
    "create",
    new Map([
      ...[...VALUE_OPTIONS].map((name) => [name, "value"]),
      ["confirm-production", "boolean"],
    ]),
  ],
  [
    "resume",
    new Map([
      ...[...VALUE_OPTIONS].map((name) => [name, "value"]),
      ["confirm-production", "boolean"],
    ]),
  ],
]);
const SAFE_ERROR_CODES = new Set([
  "ALREADY_SPONSORED",
  "EMAIL_EXISTS",
  "INVALID_ADMIN",
  "INVALID_INPUT",
  "INVALID_INVITE",
  "INVALID_LOGIN_CREDENTIALS",
  "INVALID_RESPONSE",
  "OPERATION_NOT_ALLOWED",
  "PARTNER_FULL",
  "PARTNER_SUSPENDED",
  "PARTNER_UNAVAILABLE",
  "RATE_LIMITED",
  "RECENT_AUTH_REQUIRED",
  "UNAUTHENTICATED",
  "UNAVAILABLE",
]);

const defaultDependencies = Object.freeze({
  buildSponsoredRoster,
  createFirebaseIdentityClient,
  createRosterFile,
  readRosterFile,
  writeRosterFile,
  preflightSponsoredProvisioning,
  provisionSponsoredRoster,
  partnerOperations,
  backoff: (attempt) =>
    new Promise((resolve) => {
      setTimeout(resolve, attempt * 1_000);
    }),
});

class SponsoredAccountsCliError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "SponsoredAccountsCliError";
    this.code = code;
  }
}

function fail(code, message) {
  throw new SponsoredAccountsCliError(code, message);
}

function parseArguments(argv) {
  if (!Array.isArray(argv)) {
    fail("CLI_ARGUMENTS", "A supported provisioning command is required.");
  }
  const [command, ...tokens] = argv;
  const allowed = COMMAND_OPTIONS.get(command);
  if (!allowed) {
    fail("CLI_ARGUMENTS", "A supported provisioning command is required.");
  }

  const options = Object.create(null);
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (
      typeof token !== "string" ||
      !token.startsWith("--") ||
      token === "--" ||
      token.includes("=")
    ) {
      fail("CLI_ARGUMENTS", "The command arguments are invalid.");
    }
    const name = token.slice(2);
    const optionType = allowed.get(name);
    if (!optionType || Object.hasOwn(options, name)) {
      fail(
        "CLI_ARGUMENTS",
        "The command contains an unknown, disallowed, or duplicate option.",
      );
    }
    if (optionType === "boolean") {
      options[name] = true;
      continue;
    }
    const value = tokens[index + 1];
    if (
      typeof value !== "string" ||
      value.length === 0 ||
      value.startsWith("--")
    ) {
      fail("CLI_ARGUMENTS", "A required option value is missing.");
    }
    options[name] = value;
    index += 1;
  }

  for (const name of VALUE_OPTIONS) {
    if (!Object.hasOwn(options, name)) {
      fail("CLI_ARGUMENTS", `The --${name} option is required.`);
    }
  }
  for (const [name, expected] of Object.entries(FIXED_VALUES)) {
    if (options[name] !== expected) {
      fail("PRODUCTION_TARGET", "The fixed production target is required.");
    }
  }
  if (!isAbsolute(options.output)) {
    fail("OUTPUT_PATH", "The roster output path must be absolute.");
  }

  return { command, options };
}

function readEnvironment(env) {
  if (!env || typeof env !== "object") {
    fail("ENVIRONMENT", "The required provisioning environment is unavailable.");
  }
  for (const name of REQUIRED_ENVIRONMENT) {
    if (typeof env[name] !== "string" || env[name].length === 0) {
      fail("ENVIRONMENT", "All required provisioning secrets must be set in the environment.");
    }
  }
  return {
    apiKey: env.EVERWISE_FIREBASE_WEB_API_KEY,
    inviteToken: env.EVERWISE_PARTNER_INVITE_TOKEN,
    adminToken: env.EVERWISE_PARTNER_ADMIN_TOKEN,
  };
}

function requireDependencies(dependencies) {
  const functionNames = [
    "buildSponsoredRoster",
    "createFirebaseIdentityClient",
    "createRosterFile",
    "readRosterFile",
    "writeRosterFile",
    "preflightSponsoredProvisioning",
    "provisionSponsoredRoster",
    "backoff",
  ];
  if (
    !dependencies ||
    typeof dependencies !== "object" ||
    functionNames.some((name) => typeof dependencies[name] !== "function") ||
    !dependencies.partnerOperations ||
    typeof dependencies.partnerOperations !== "object"
  ) {
    fail("DEPENDENCIES", "Provisioning dependencies are unavailable.");
  }
  return dependencies;
}

function writePreflight(stdout, preflight) {
  stdout.write("Production preflight passed.\n");
  stdout.write(`Partner: ${preflight.partnerName} (${preflight.partnerId})\n`);
  stdout.write(`Firebase project: ${preflight.firebaseProjectId}\n`);
  stdout.write(
    `Seats: ${preflight.seats.claimed} claimed, ${preflight.seats.available} available, ${preflight.seats.limit} total\n`,
  );
  stdout.write("No accounts or credential files were created.\n");
}

function safeExternalError(error) {
  const code = SAFE_ERROR_CODES.has(error?.code)
    ? error.code
    : "OPERATION_FAILED";
  const message = typeof error?.message === "string" ? error.message : "";
  const accountMatch = message.match(
    /Sponsored account ([1-9]\d{0,2}) \((EverWise(?:00[1-9]|0[1-9]\d|[1-4]\d{2}|500))\)/,
  );
  return accountMatch
    ? `Error [${code}] account ${accountMatch[1]} (${accountMatch[2]}).\n`
    : `Error [${code}].\n`;
}

function writeSafeError(stderr, error) {
  if (error instanceof SponsoredAccountsCliError) {
    stderr.write(`Error [${error.code}]: ${error.message}\n`);
    return;
  }
  stderr.write(safeExternalError(error));
}

function validSummary(summary) {
  return Boolean(
    summary &&
      typeof summary === "object" &&
      [summary.active, summary.pending, summary.failed].every(
        (count) => Number.isSafeInteger(count) && count >= 0,
      ) &&
      summary.active + summary.pending + summary.failed === 500
  );
}

export async function runSponsoredAccountsCli({
  argv,
  env,
  dependencies = defaultDependencies,
  stdout = process.stdout,
  stderr = process.stderr,
} = {}) {
  try {
    const { command, options } = parseArguments(argv);
    const { apiKey, inviteToken, adminToken } = readEnvironment(env);
    const resolvedDependencies = requireDependencies(dependencies);
    const firebaseClient = resolvedDependencies.createFirebaseIdentityClient({ apiKey });
    const preflight = await resolvedDependencies.preflightSponsoredProvisioning({
      apiOrigin: options["api-origin"],
      inviteToken,
      adminToken,
      firebaseClient,
      partnerOperations: resolvedDependencies.partnerOperations,
    });

    writePreflight(stdout, preflight);
    if (command === "preflight") return 0;
    if (options["confirm-production"] !== true) {
      stdout.write(
        "Re-run with --confirm-production only after reviewing this target.\n",
      );
      return 0;
    }

    const output = options.output;
    const rows = command === "create"
      ? resolvedDependencies.buildSponsoredRoster()
      : await resolvedDependencies.readRosterFile({
        filePath: output,
        repositoryRoot: REPOSITORY_ROOT,
      });

    if (command === "create") {
      await resolvedDependencies.createRosterFile({
        filePath: output,
        repositoryRoot: REPOSITORY_ROOT,
        rows,
      });
    }

    const summary = await resolvedDependencies.provisionSponsoredRoster({
      rows,
      apiOrigin: options["api-origin"],
      preflight,
      inviteToken,
      firebaseClient,
      partnerOperations: resolvedDependencies.partnerOperations,
      persistRows: (nextRows) =>
        resolvedDependencies.writeRosterFile({
          filePath: output,
          repositoryRoot: REPOSITORY_ROOT,
          rows: nextRows,
        }),
      onProgress: ({ accountNumber, username, status }) =>
        stdout.write(`Account ${accountNumber}/500 ${username}: ${status}\n`),
      backoff: resolvedDependencies.backoff,
    });
    if (!validSummary(summary)) {
      fail("INVALID_SUMMARY", "Provisioning returned an invalid count summary.");
    }

    stdout.write(
      `Provisioning complete: ${summary.active} active, ${summary.pending} pending, ${summary.failed} failed.\n`,
    );
    stdout.write("Private roster saved to the approved output path.\n");
    return 0;
  } catch (error) {
    writeSafeError(stderr, error);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const exitCode = await runSponsoredAccountsCli({
    argv: process.argv.slice(2),
    env: process.env,
  });
  process.exitCode = exitCode;
}
