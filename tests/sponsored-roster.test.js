import assert from "node:assert/strict";
import { chmod, mkdir, mkdtemp, readFile, rm, stat, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  SPONSORED_ACCOUNT_COUNT,
  buildSponsoredRoster,
  createRosterFile,
  markRosterActive,
  readRosterFile,
  summarizeRoster,
  writeRosterFile,
} from "../scripts/sponsoredRoster.mjs";
import { normalizeUsername, usernameToAuthEmail } from "../src/utils/validation.js";

function deterministicBytesFactory() {
  let state = 0x6d2b79f5;
  return (size) =>
    Buffer.from(
      Array.from({ length: size }, () => {
        state ^= state << 13;
        state ^= state >>> 17;
        state ^= state << 5;
        return state & 0xff;
      }),
    );
}

async function temporaryDirectory(t) {
  const directory = await mkdtemp(join(tmpdir(), "everwise-sponsored-roster-"));
  t.after(() => rm(directory, { force: true, recursive: true }));
  return directory;
}

function rosterRows() {
  return buildSponsoredRoster({ randomBytesImpl: deterministicBytesFactory() });
}

test("buildSponsoredRoster creates 500 distinct pending EverWise accounts", () => {
  const rows = buildSponsoredRoster({ randomBytesImpl: deterministicBytesFactory() });

  assert.equal(SPONSORED_ACCOUNT_COUNT, 500);
  assert.equal(rows.length, 500);
  assert.deepEqual(
    [rows[0].username, rows[99].username, rows[499].username],
    ["EverWise001", "EverWise100", "EverWise500"],
  );
  assert.equal(new Set(rows.map(({ password }) => password)).size, 500);
  assert.ok(rows.every(({ status }) => status === "pending"));
  assert.equal(normalizeUsername(rows[0].username), "everwise001");
  assert.equal(
    usernameToAuthEmail(rows[0].username),
    "everwise001@accounts.everwise.app",
  );
});

test("buildSponsoredRoster passwords are safe and include every required class", () => {
  const rows = buildSponsoredRoster({ randomBytesImpl: deterministicBytesFactory() });

  for (const { password } of rows) {
    assert.ok(password.length >= 16);
    assert.match(password, /[A-Z]/);
    assert.match(password, /[a-z]/);
    assert.match(password, /[0-9]/);
    assert.match(password, /[!@#$%*_-]/);
    assert.doesNotMatch(password, /[0O1Il,\"'\s]/);
  }
});

test("createRosterFile writes a private roster outside the repository", async (t) => {
  const directory = await temporaryDirectory(t);
  const filePath = join(directory, "everwise-sponsored-accounts.csv");
  const rows = rosterRows();

  await createRosterFile({
    filePath,
    repositoryRoot: process.cwd(),
    rows,
  });

  assert.equal((await stat(filePath)).mode & 0o777, 0o600);
  assert.deepEqual(
    await readRosterFile({ filePath, repositoryRoot: process.cwd() }),
    rows,
  );
});

test("createRosterFile refuses repository and symlink destinations", async (t) => {
  const directory = await temporaryDirectory(t);
  const rows = rosterRows();
  const repositoryRoot = join(directory, "repository");
  const outsideDirectory = join(directory, "outside");
  await Promise.all([mkdir(repositoryRoot), mkdir(outsideDirectory)]);
  await symlink(outsideDirectory, join(repositoryRoot, "linked-output"));

  await assert.rejects(
    createRosterFile({
      filePath: join(repositoryRoot, "roster.csv"),
      repositoryRoot,
      rows,
    }),
    /outside the repository/i,
  );
  await assert.rejects(
    createRosterFile({
      filePath: join(repositoryRoot, "linked-output", "roster.csv"),
      repositoryRoot,
      rows,
    }),
    /symlink/i,
  );
});

test("createRosterFile will not replace an existing file or symlink", async (t) => {
  const directory = await temporaryDirectory(t);
  const existingPath = join(directory, "existing.csv");
  const symlinkPath = join(directory, "linked.csv");
  const targetPath = join(directory, "target.csv");
  const rows = rosterRows();
  await writeFile(existingPath, "keep me");
  await writeFile(targetPath, "keep target");
  await symlink(targetPath, symlinkPath);

  await assert.rejects(
    createRosterFile({ filePath: existingPath, repositoryRoot: process.cwd(), rows }),
    /already exists/i,
  );
  await assert.rejects(
    createRosterFile({ filePath: symlinkPath, repositoryRoot: process.cwd(), rows }),
    /already exists|symlink/i,
  );
  assert.equal(await readFile(existingPath, "utf8"), "keep me");
  assert.equal(await readFile(targetPath, "utf8"), "keep target");
});

test("readRosterFile rejects malformed or unsafe roster CSV", async (t) => {
  const directory = await temporaryDirectory(t);
  const filePath = join(directory, "malformed.csv");
  const rows = rosterRows();
  const csv = [
    "account_number,username,password,status",
    ...rows.map(({ accountNumber, username, password, status }) =>
      `${accountNumber},${username},${password},${status}`,
    ),
  ].join("\n");

  const invalidVariants = [
    csv.replace("account_number,username,password,status", "wrong,header"),
    csv.replace("EverWise002", "EverWise001"),
    csv.replace(rows[1].password, rows[0].password),
    csv.replace("2,EverWise002", "1,EverWise002"),
    csv.replace(",pending", ",unknown"),
    csv.split("\n").slice(0, -1).join("\n"),
    `${csv}\n501,EverWise501,SafePassword2!,pending`,
    csv.replace("EverWise002", "EverWise002\r\nmalicious"),
  ];

  for (const contents of invalidVariants) {
    await writeFile(filePath, contents, { mode: 0o600 });
    await assert.rejects(
      readRosterFile({ filePath, repositoryRoot: process.cwd() }),
      /roster|CSV|header|row|invalid/i,
    );
  }
});

test("writeRosterFile atomically updates one active row and keeps it private", async (t) => {
  const directory = await temporaryDirectory(t);
  const filePath = join(directory, "everwise-sponsored-accounts.csv");
  const rows = rosterRows();
  await createRosterFile({ filePath, repositoryRoot: process.cwd(), rows });

  const activeRows = markRosterActive(rows, 100);
  await writeRosterFile({ filePath, rows: activeRows });

  assert.equal((await stat(filePath)).mode & 0o777, 0o600);
  assert.equal(
    (await readRosterFile({ filePath, repositoryRoot: process.cwd() }))[99]
      .status,
    "active",
  );
  assert.deepEqual(summarizeRoster(activeRows), {
    total: 500,
    pending: 499,
    active: 1,
  });
});

test("writeRosterFile rejects a destination through a symlinked parent", async (t) => {
  const directory = await temporaryDirectory(t);
  const actualDirectory = join(directory, "actual");
  const linkedDirectory = join(directory, "linked");
  const actualPath = join(actualDirectory, "everwise-sponsored-accounts.csv");
  const rows = rosterRows();
  await mkdir(actualDirectory);
  await createRosterFile({
    filePath: actualPath,
    repositoryRoot: process.cwd(),
    rows,
  });
  await symlink(actualDirectory, linkedDirectory);

  await assert.rejects(
    writeRosterFile({
      filePath: join(linkedDirectory, "everwise-sponsored-accounts.csv"),
      rows: markRosterActive(rows, 1),
    }),
    /symlink/i,
  );
});

test("writeRosterFile leaves an existing roster byte-identical when the update fails", async (t) => {
  const directory = await temporaryDirectory(t);
  const filePath = join(directory, "everwise-sponsored-accounts.csv");
  const rows = rosterRows();
  await createRosterFile({ filePath, repositoryRoot: process.cwd(), rows });
  const before = await readFile(filePath);
  await chmod(directory, 0o500);
  try {
    await assert.rejects(
      writeRosterFile({ filePath, rows: markRosterActive(rows, 1) }),
    );
  } finally {
    await chmod(directory, 0o700);
  }
  assert.deepEqual(await readFile(filePath), before);
});
