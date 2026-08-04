import { randomBytes } from "node:crypto";
import {
  chmod,
  lstat,
  open,
  readFile,
  realpath,
  rename,
  stat,
  unlink,
} from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";

export const SPONSORED_ACCOUNT_COUNT = 500;

const PASSWORD_LENGTH = 20;
const PASSWORD_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*-_";
const MAX_PASSWORD_ATTEMPTS = 10_000;
const BYTE_ACCEPTANCE_LIMIT =
  256 - (256 % PASSWORD_ALPHABET.length);
const CSV_HEADER = "account_number,username,auth_email,password,status";
const AUTH_EMAIL_RANDOM_BYTES = 24;
const DARWIN_SYSTEM_ROOT_ALIASES = new Map([
  ["/etc", "/private/etc"],
  ["/tmp", "/private/tmp"],
  ["/var", "/private/var"],
]);

function generatePassword(randomBytesImpl, length) {
  let password = "";

  while (password.length < length) {
    const bytes = randomBytesImpl(length - password.length);
    for (const byte of bytes) {
      if (byte >= BYTE_ACCEPTANCE_LIMIT) continue;
      password += PASSWORD_ALPHABET[byte % PASSWORD_ALPHABET.length];
      if (password.length === length) break;
    }
  }

  return password;
}

function hasRequiredPasswordClasses(password) {
  return (
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%*_-]/.test(password)
  );
}

export function buildSponsoredRoster({ randomBytesImpl = randomBytes } = {}) {
  const rows = [];
  const passwords = new Set();
  const authEmails = new Set();

  for (
    let accountNumber = 1;
    accountNumber <= SPONSORED_ACCOUNT_COUNT;
    accountNumber += 1
  ) {
    let password;
    let attempts = 0;
    do {
      if (attempts >= MAX_PASSWORD_ATTEMPTS) {
        throw new Error("Unable to generate a qualifying sponsored password");
      }
      password = generatePassword(randomBytesImpl, PASSWORD_LENGTH);
      attempts += 1;
    } while (passwords.has(password) || !hasRequiredPasswordClasses(password));

    passwords.add(password);
    let authEmail;
    do {
      const bytes = randomBytesImpl(AUTH_EMAIL_RANDOM_BYTES);
      if (!(bytes instanceof Uint8Array) || bytes.byteLength !== AUTH_EMAIL_RANDOM_BYTES) {
        throw new Error("Unable to generate a sponsored authentication address");
      }
      authEmail = `ewp-${Buffer.from(bytes).toString("hex")}@accounts.everwise.app`;
    } while (authEmails.has(authEmail));
    authEmails.add(authEmail);
    rows.push({
      accountNumber,
      username: `EverWise${String(accountNumber).padStart(3, "0")}`,
      authEmail,
      password,
      status: "pending",
    });
  }

  return rows;
}

function isWithin(childPath, parentPath) {
  const pathRelative = relative(parentPath, childPath);
  return pathRelative === "" || (!pathRelative.startsWith("..") && !isAbsolute(pathRelative));
}

async function assertSafeRosterPath({ filePath, repositoryRoot, mustExist = false }) {
  if (!repositoryRoot) throw new Error("A repository root is required");

  const absolutePath = resolve(filePath);
  await assertNoSymlinkComponents(absolutePath);
  const repositoryPath = await realpath(repositoryRoot);
  let segment = absolutePath;
  const segments = [];
  while (true) {
    segments.push(segment);
    const parent = dirname(segment);
    if (parent === segment) break;
    segment = parent;
  }

  let existingParent;
  for (const candidate of segments) {
    try {
      const candidateStat = await lstat(candidate);
      if (candidateStat.isSymbolicLink()) {
        throw new Error("Roster paths may not use symlinks");
      }
      existingParent = candidate;
      break;
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }

  if (!existingParent) {
    throw new Error("Roster output parent does not exist");
  }
  const parentPath = await realpath(existingParent);
  if (isWithin(parentPath, repositoryPath)) {
    throw new Error("Roster files must be stored outside the repository");
  }

  if (mustExist) {
    const fileStat = await lstat(absolutePath);
    if (!fileStat.isFile()) throw new Error("Roster file must be a regular file");
  } else {
    try {
      await lstat(absolutePath);
      throw new Error("Roster file already exists");
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }

  return absolutePath;
}

async function assertNoSymlinkComponents(path) {
  try {
    if ((await lstat(path)).isSymbolicLink()) {
      throw new Error("Roster paths may not use symlinks");
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  let candidate = dirname(path);
  let foundExistingParent = false;
  while (true) {
    try {
      const candidateStat = await lstat(candidate);
      if (candidateStat.isSymbolicLink()) {
        const expectedSystemTarget =
          process.platform === "darwin"
            ? DARWIN_SYSTEM_ROOT_ALIASES.get(candidate)
            : null;
        if (
          !expectedSystemTarget ||
          (await realpath(candidate)) !== expectedSystemTarget
        ) {
          throw new Error("Roster paths may not use symlinks");
        }
      }
      foundExistingParent = true;
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
    const parent = dirname(candidate);
    if (parent === candidate) {
      if (!foundExistingParent) throw new Error("Roster output parent does not exist");
      return;
    }
    candidate = parent;
  }
}

function quoteCsvField(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function serializeRoster(rows) {
  return `${CSV_HEADER}\n${rows
    .map(({ accountNumber, username, authEmail, password, status }) =>
      [accountNumber, username, authEmail, password, status]
        .map(quoteCsvField)
        .join(","),
    )
    .join("\n")}\n`;
}

function parseCsv(contents) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  let afterQuote = false;

  const finishField = () => {
    row.push(field);
    field = "";
    quoted = false;
    afterQuote = false;
  };
  const finishRow = () => {
    finishField();
    rows.push(row);
    row = [];
  };

  for (let index = 0; index < contents.length; index += 1) {
    const character = contents[index];
    if (quoted) {
      if (character === '"') {
        if (contents[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
          afterQuote = true;
        }
      } else {
        field += character;
      }
      continue;
    }
    if (afterQuote) {
      if (character === ",") {
        finishField();
      } else if (character === "\n") {
        finishRow();
      } else if (character === "\r" && contents[index + 1] === "\n") {
        index += 1;
        finishRow();
      } else {
        throw new Error("Invalid roster CSV quoting");
      }
      continue;
    }
    if (character === '"' && field === "") {
      quoted = true;
    } else if (character === ",") {
      finishField();
    } else if (character === "\n") {
      finishRow();
    } else if (character === "\r" && contents[index + 1] === "\n") {
      index += 1;
      finishRow();
    } else if (character === "\r") {
      throw new Error("Invalid roster CSV line ending");
    } else {
      field += character;
    }
  }
  if (quoted) throw new Error("Invalid roster CSV quoting");
  if (field !== "" || row.length > 0 || afterQuote) finishRow();
  return rows;
}

function validatePassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 16 &&
    !/[0O1Il,"'\s]/.test(password) &&
    /^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*_-]+$/.test(
      password,
    ) &&
    hasRequiredPasswordClasses(password)
  );
}

function validateRoster(rows) {
  if (!Array.isArray(rows) || rows.length !== SPONSORED_ACCOUNT_COUNT) {
    throw new Error(`Roster must contain exactly ${SPONSORED_ACCOUNT_COUNT} rows`);
  }
  const usernames = new Set();
  const authEmails = new Set();
  const passwords = new Set();
  const accountNumbers = new Set();

  for (const [index, row] of rows.entries()) {
    const accountNumber = index + 1;
    const expectedUsername = `EverWise${String(accountNumber).padStart(3, "0")}`;
    if (
      !row ||
      row.accountNumber !== accountNumber ||
      row.username !== expectedUsername ||
      typeof row.authEmail !== "string" ||
      !/^ewp-[a-f0-9]{48}@accounts\.everwise\.app$/.test(row.authEmail) ||
      !validatePassword(row.password) ||
      !["pending", "active"].includes(row.status) ||
      usernames.has(row.username) ||
      authEmails.has(row.authEmail) ||
      passwords.has(row.password) ||
      accountNumbers.has(row.accountNumber)
    ) {
      throw new Error(`Invalid roster row ${accountNumber}`);
    }
    usernames.add(row.username);
    authEmails.add(row.authEmail);
    passwords.add(row.password);
    accountNumbers.add(row.accountNumber);
  }
  return rows;
}

function parseRoster(contents) {
  const records = parseCsv(contents);
  const [header, ...dataRows] = records;
  if (!header || header.join(",") !== CSV_HEADER || header.length !== 5) {
    throw new Error("Invalid roster CSV header");
  }
  const rows = dataRows.map((record) => {
    if (record.length !== 5 || !/^\d+$/.test(record[0])) {
      throw new Error("Invalid roster CSV row");
    }
    return {
      accountNumber: Number(record[0]),
      username: record[1],
      authEmail: record[2],
      password: record[3],
      status: record[4],
    };
  });
  return validateRoster(rows);
}

async function setPrivateMode(filePath) {
  await chmod(filePath, 0o600);
  if (((await stat(filePath)).mode & 0o777) !== 0o600) {
    throw new Error("Roster file permissions must be 0600");
  }
}

export async function createRosterFile({ filePath, repositoryRoot, rows }) {
  validateRoster(rows);
  const safePath = await assertSafeRosterPath({ filePath, repositoryRoot });
  const handle = await open(safePath, "wx", 0o600);
  try {
    await handle.writeFile(serializeRoster(rows), "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  await setPrivateMode(safePath);
}

export async function readRosterFile({ filePath, repositoryRoot }) {
  const safePath = await assertSafeRosterPath({
    filePath,
    repositoryRoot,
    mustExist: true,
  });
  if (((await lstat(safePath)).mode & 0o777) !== 0o600) {
    throw new Error("Roster file permissions must be 0600");
  }
  return parseRoster(await readFile(safePath, "utf8"));
}

export async function writeRosterFile({
  filePath,
  repositoryRoot,
  rows,
  renameImpl = rename,
}) {
  validateRoster(rows);
  const safePath = await assertSafeRosterPath({
    filePath,
    repositoryRoot,
    mustExist: true,
  });
  const temporaryPath = `${safePath}.tmp-${randomBytes(12).toString("hex")}`;
  let handle;
  try {
    handle = await open(temporaryPath, "wx", 0o600);
    await handle.writeFile(serializeRoster(rows), "utf8");
    await handle.sync();
    await handle.close();
    handle = undefined;
    await renameImpl(temporaryPath, safePath);
    await setPrivateMode(safePath);
  } catch (error) {
    if (handle) await handle.close();
    await unlink(temporaryPath).catch((unlinkError) => {
      if (unlinkError.code !== "ENOENT") throw unlinkError;
    });
    throw error;
  }
}

export function markRosterActive(rows, accountNumber) {
  validateRoster(rows);
  if (!Number.isInteger(accountNumber) || accountNumber < 1 || accountNumber > rows.length) {
    throw new Error("Invalid sponsored account number");
  }
  return rows.map((row) =>
    row.accountNumber === accountNumber ? { ...row, status: "active" } : { ...row },
  );
}

export function summarizeRoster(rows) {
  validateRoster(rows);
  const active = rows.filter(({ status }) => status === "active").length;
  return { total: rows.length, pending: rows.length - active, active };
}
