#!/usr/bin/env node

import { createPartnerStore } from "../server/partnerStore.mjs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_STORE_PATH = "/var/lib/everwise/partners.json";
const PUBLIC_ORIGIN = "https://everwise.dexio-games.com";
const DEFAULT_ACCENT = "#2F6B61";
const PARTNER_ID_PATTERN = /^[a-z0-9-]{3,50}$/;
const HEX_COLOR_PATTERN = /^#[A-Fa-f0-9]{6}$/;

const commandOptions = new Map([
  ["create", new Map([
    ["id", "value"],
    ["name", "value"],
    ["seats", "value"],
    ["logo", "value"],
    ["accent", "value"],
  ])],
  ["list", new Map()],
  ["rotate-invite", new Map([["id", "value"]])],
  ["rotate-admin", new Map([["id", "value"]])],
  ["suspend", new Map([["id", "value"]])],
  ["reactivate", new Map([["id", "value"]])],
  ["remove", new Map([
    ["id", "value"],
    ["disposable-empty", "boolean"],
  ])],
  ["reconcile-membership", new Map([
    ["id", "value"],
    ["uid", "value"],
  ])],
]);

class CliError extends Error {}

function fail(message) {
  throw new CliError(message);
}

function parseArguments(argv) {
  const [command, ...tokens] = argv;
  const allowed = commandOptions.get(command);
  if (!allowed) fail("A supported partner-management command is required.");

  const options = Object.create(null);
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith("--") || token === "--" || token.includes("=")) {
      fail("The command arguments are invalid.");
    }
    const name = token.slice(2);
    const optionType = allowed.get(name);
    if (!optionType || Object.hasOwn(options, name)) {
      fail("The command contains an unknown, disallowed, or duplicate option.");
    }
    if (optionType === "boolean") {
      options[name] = true;
      continue;
    }
    const value = tokens[index + 1];
    if (value === undefined || value.startsWith("--")) {
      fail("A required option value is missing.");
    }
    options[name] = value;
    index += 1;
  }
  return { command, options };
}

function requireOption(options, name) {
  const value = options[name];
  if (typeof value !== "string" || value.length === 0) {
    fail(`The --${name} option is required.`);
  }
  return value;
}

function requirePartnerId(options) {
  const partnerId = requireOption(options, "id");
  if (!PARTNER_ID_PATTERN.test(partnerId)) {
    fail("The partner ID must use 3-50 lowercase letters, numbers, or hyphens.");
  }
  return partnerId;
}

function hasControlCharacters(value) {
  return Array.from(value).some((character) => {
    const codePoint = character.codePointAt(0);
    return codePoint <= 31 || codePoint === 127;
  });
}

function normalizedName(options) {
  const name = requireOption(options, "name").trim();
  if (name.length < 2 || name.length > 100 || hasControlCharacters(name)) {
    fail("The partner name must contain 2-100 characters.");
  }
  return name;
}

function normalizedLogoPath(value) {
  if (value === undefined || value === "null") return null;
  let decoded = value;
  for (let pass = 0; pass < 10 && /%[A-Fa-f0-9]{2}/.test(decoded); pass += 1) {
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      fail("The logo must be a safe same-origin path below /partners/ or null.");
    }
  }
  if (/%[A-Fa-f0-9]{2}/.test(decoded)) {
    fail("The logo must be a safe same-origin path below /partners/ or null.");
  }
  if (
    !decoded.startsWith("/partners/") ||
    decoded.length === "/partners/".length ||
    decoded.includes("..") ||
    decoded.includes("\\") ||
    decoded.includes("//") ||
    /[?#]/.test(decoded) ||
    hasControlCharacters(decoded)
  ) {
    fail("The logo must be a safe same-origin path below /partners/ or null.");
  }
  return decoded;
}

function relativeLuminance(hex) {
  const channels = [1, 3, 5].map((offset) => {
    const channel = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function normalizedAccent(value = DEFAULT_ACCENT) {
  if (!HEX_COLOR_PATTERN.test(value)) {
    fail("The accent must be a six-digit hexadecimal color.");
  }
  const normalized = value.toUpperCase();
  const contrastAgainstWhite = 1.05 / (relativeLuminance(normalized) + 0.05);
  if (contrastAgainstWhite < 4.5) {
    fail("The accent does not meet the app's contrast requirement.");
  }
  return normalized;
}

function learnerUrl(token) {
  return `${PUBLIC_ORIGIN}/#partner=${token}`;
}

function adminUrl(token) {
  return `${PUBLIC_ORIGIN}/#partner-admin=${token}`;
}

export function prepareProductionIdentity(
  filePath,
  {
    getuid = process.getuid?.bind(process),
    setgroups = process.setgroups?.bind(process),
    setgid = process.setgid?.bind(process),
    setuid = process.setuid?.bind(process),
  } = {},
) {
  if (resolve(filePath) !== DEFAULT_STORE_PATH || getuid?.() !== 0) return false;
  if (!setgroups || !setgid || !setuid) {
    fail("The production partner store requires the www-data service account.");
  }
  setgroups([]);
  setgid("www-data");
  setuid("www-data");
  return true;
}

async function run(argv) {
  const { command, options } = parseArguments(argv);
  const filePath = resolve(
    process.env.EVERWISE_PARTNER_STORE_PATH || DEFAULT_STORE_PATH,
  );
  prepareProductionIdentity(filePath);
  const store = createPartnerStore({
    filePath,
  });

  switch (command) {
    case "create": {
      const partnerId = requirePartnerId(options);
      const name = normalizedName(options);
      if (requireOption(options, "seats") !== "500") {
        fail("The seat limit must be exactly 500.");
      }
      const created = await store.createPartner({
        partnerId,
        name,
        seatLimit: 500,
        branding: {
          name,
          logoPath: normalizedLogoPath(options.logo),
          accent: normalizedAccent(options.accent),
        },
      });
      process.stdout.write(`Learner URL: ${learnerUrl(created.inviteToken)}\n`);
      process.stdout.write(`Admin URL: ${adminUrl(created.adminToken)}\n`);
      return;
    }
    case "list": {
      const partners = await store.listPartners();
      if (partners.length === 0) {
        process.stdout.write("No partners configured.\n");
        return;
      }
      for (const partner of partners) {
        process.stdout.write(
          `${partner.partnerId} | ${partner.name} | ${partner.status} | claimed count: ${partner.claimedCount} | limit: ${partner.seatLimit}\n`,
        );
      }
      return;
    }
    case "rotate-invite": {
      const rotated = await store.rotateInvite({ partnerId: requirePartnerId(options) });
      process.stdout.write(`Learner URL: ${learnerUrl(rotated.inviteToken)}\n`);
      return;
    }
    case "rotate-admin": {
      const rotated = await store.rotateAdmin({ partnerId: requirePartnerId(options) });
      process.stdout.write(`Admin URL: ${adminUrl(rotated.adminToken)}\n`);
      return;
    }
    case "suspend": {
      const partnerId = requirePartnerId(options);
      await store.setPartnerStatus({ partnerId, status: "suspended" });
      process.stdout.write(`Partner ${partnerId} suspended.\n`);
      return;
    }
    case "reactivate": {
      const partnerId = requirePartnerId(options);
      await store.setPartnerStatus({ partnerId, status: "active" });
      process.stdout.write(`Partner ${partnerId} reactivated.\n`);
      return;
    }
    case "remove": {
      const partnerId = requirePartnerId(options);
      if (options["disposable-empty"] !== true) {
        fail("Removal requires the --disposable-empty guard.");
      }
      const partner = (await store.listPartners()).find(
        (candidate) => candidate.partnerId === partnerId,
      );
      if (!partner) fail("The partner was not found.");
      if (partner.claimedCount !== 0) {
        fail("Only an empty disposable partner can be removed.");
      }
      await store.removePartner({ partnerId });
      process.stdout.write(`Empty disposable partner ${partnerId} removed.\n`);
      return;
    }
    case "reconcile-membership": {
      const partnerId = requirePartnerId(options);
      const uid = requireOption(options, "uid");
      if (uid.length > 128) fail("The learner identifier is invalid.");
      const result = await store.reconcileMembership({ partnerId, uid });
      process.stdout.write(
        `Membership reconciliation: partner=${partnerId} removed=${result.removed}\n`,
      );
      return;
    }
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  run(process.argv.slice(2)).catch((error) => {
    const message = error instanceof CliError
      ? error.message
      : error?.name === "PartnerStoreError"
        ? error.message
        : "Partner management failed safely.";
    process.stderr.write(`Error: ${message}\n`);
    process.exitCode = 1;
  });
}
