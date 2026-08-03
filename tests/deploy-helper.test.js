import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const helperUrl = new URL("../ops/deploy-everwise", import.meta.url);

function writeTarString(header, offset, length, value) {
  header.write(value, offset, Math.min(length, Buffer.byteLength(value)), "utf8");
}

function writeTarOctal(header, offset, length, value) {
  const digits = value.toString(8).padStart(length - 1, "0");
  writeTarString(header, offset, length, `${digits}\0`);
}

function tarEntry({ name, type = "0", body = "", link = "" }) {
  const payload = Buffer.from(body);
  const header = Buffer.alloc(512);
  writeTarString(header, 0, 100, name);
  writeTarOctal(header, 100, 8, type === "5" ? 0o755 : 0o644);
  writeTarOctal(header, 108, 8, 0);
  writeTarOctal(header, 116, 8, 0);
  writeTarOctal(header, 124, 12, type === "0" ? payload.length : 0);
  writeTarOctal(header, 136, 12, 0);
  header.fill(0x20, 148, 156);
  header.write(type, 156, 1, "ascii");
  writeTarString(header, 157, 100, link);
  writeTarString(header, 257, 6, "ustar");
  writeTarString(header, 263, 2, "00");
  const checksum = header.reduce((total, byte) => total + byte, 0);
  writeTarString(header, 148, 8, `${checksum.toString(8).padStart(6, "0")}\0 `);
  const padding = Buffer.alloc((512 - (payload.length % 512)) % 512);
  return Buffer.concat([header, payload, padding]);
}

async function createArchive(path, entries) {
  const tar = Buffer.concat([
    ...entries.map(tarEntry),
    Buffer.alloc(1024),
  ]);
  await writeFile(path, gzipSync(tar));
}

async function setup(t) {
  const directory = await mkdtemp(join(tmpdir(), "everwise-deploy-helper-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

function validateArchive(archivePath) {
  return spawnSync(
    "bash",
    [
      "-c",
      'source "$1"; validate_release_archive "$2"',
      "validate-archive",
      new URL(helperUrl).pathname,
      archivePath,
    ],
    { encoding: "utf8" },
  );
}

const allowedEntries = [
  { name: "server.mjs", body: "export {};\n" },
  { name: "server/", type: "5" },
  { name: "server/partnerStore.mjs", body: "export {};\n" },
  { name: "server/partnerApi.mjs", body: "export {};\n" },
  { name: "scripts/", type: "5" },
  { name: "scripts/manage-partners.mjs", body: "export {};\n" },
  { name: "dist/", type: "5" },
  { name: "dist/index.html", body: "<!doctype html>" },
  { name: "dist/assets/app.js", body: "export {};\n" },
];

test("archive validation accepts only the reviewed release allowlist", async (t) => {
  const directory = await setup(t);
  const archivePath = join(directory, "valid.tgz");
  await createArchive(archivePath, allowedEntries);

  const result = validateArchive(archivePath);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "");
});

test("archive validation rejects traversal, secrets, arbitrary code, dependencies, and partner data", async (t) => {
  const directory = await setup(t);
  const rejectedEntries = [
    { name: "/absolute/server.mjs", body: "export {};\n" },
    { name: "../server.mjs", body: "export {};\n" },
    { name: "dist/../../escape", body: "no" },
    { name: "dist\\..\\escape", body: "no" },
    { name: ".env", body: "SECRET=value" },
    { name: "dist/.env.production", body: "SECRET=value" },
    { name: "dist/.npmrc", body: "token=value" },
    { name: "dist/credentials.json", body: "{}" },
    { name: "dist/id_ed25519", body: "private" },
    { name: "dist/OPENAI_SECRET", body: "private" },
    { name: "dist/private_key", body: "private" },
    { name: "dist/api-key", body: "private" },
    { name: "dist/APIKEY.txt", body: "private" },
    { name: "dist/partner-data.json", body: "{}" },
    { name: "dist/PARTNER_STORE.csv", body: "private" },
    { name: "dist/private.txt", body: "private" },
    { name: "dist/API_KEYS/config.json", body: "private" },
    { name: "dist/Partners.json", body: "{}" },
    { name: "server/OPENAI_SECRET.mjs", body: "export {};\n" },
    { name: "server/private_key.mjs", body: "export {};\n" },
    { name: "scripts/other.mjs", body: "export {};\n" },
    { name: "server/nested/other.mjs", body: "export {};\n" },
    { name: "node_modules/package/index.js", body: "export {};\n" },
    { name: "dist/node_modules/package/index.js", body: "export {};\n" },
    { name: "partners.json", body: "{}" },
    { name: "server/partners.json", body: "{}" },
    { name: "dist/partners.json.backup", body: "{}" },
    { name: "dist/private.pem", body: "private" },
    { name: "dist/signing.key", body: "private" },
    {
      name: "scripts/manage-partners.mjs",
      type: "2",
      link: "/var/lib/everwise/partners.json",
    },
  ];

  for (const [index, rejectedEntry] of rejectedEntries.entries()) {
    const archivePath = join(directory, `rejected-${index}.tgz`);
    await createArchive(archivePath, [...allowedEntries, rejectedEntry]);
    const result = validateArchive(archivePath);
    assert.notEqual(
      result.status,
      0,
      `unexpectedly accepted ${rejectedEntry.name}`,
    );
  }
});

test("versioned helper preserves restricted commands, rollback, health, and Nginx checks", async () => {
  const helper = await readFile(helperUrl, "utf8");
  assert.match(helper, /configure-runtime/);
  assert.match(helper, /verify-runtime/);
  assert.match(helper, /\^deploy\\ \(\[0-9a-f\]\{40\}\)\$/);
  assert.match(helper, /previous_release=/);
  assert.match(helper, /prior release was restored/);
  assert.match(helper, /systemctl restart everwise-api\.service/);
  assert.match(helper, /curl -fsS --max-time 5 http:\/\/127\.0\.0\.1:8787\/healthz/);
  assert.match(helper, /nginx -t/);
  assert.match(helper, /systemctl reload nginx/);
  assert.match(helper, /"partnerAccessConfigured":true/);
  assert.match(helper, /"partnerStoreHealthy":true/);
});

test("release directories are immutable and an active-SHA retry reuses the existing release", async () => {
  const helper = await readFile(helperUrl, "utf8");
  assert.doesNotMatch(helper, /rm -rf "\$release_path"/);
  assert.match(helper, /previous_release=.*readlink[^\n]*everwise-current/);
  assert.match(
    helper,
    /if \[\[ -e "\$release_path" \]\]; then[\s\S]*reuse_existing_release=true/,
  );
  assert.match(helper, /mv -Tn "\$staging_path" "\$release_path"/);
  assert.match(
    helper,
    /\[\[ "\$previous_release" == "\$release_path" \]\]/,
  );
});

test("partner storage is installed outside releases without replacing partner data", async () => {
  const helper = await readFile(helperUrl, "utf8");
  assert.match(
    helper,
    /install -d -o www-data -g www-data -m 750 \/var\/lib\/everwise/,
  );
  assert.match(helper, /test ! -e \/var\/lib\/everwise\/partners\.json/);
  assert.match(helper, /bootstrap_path=/);
  assert.match(
    helper,
    /ln "\$bootstrap_path" \/var\/lib\/everwise\/partners\.json/,
  );
  assert.doesNotMatch(
    helper,
    /\b(?:rm|mv|cp|install)\b[^\n]*\/var\/lib\/everwise\/partners\.json/,
  );
  assert.doesNotMatch(helper, />[^\n]*\/var\/lib\/everwise\/partners\.json/);
  assert.doesNotMatch(
    helper,
    /release_(?:root|path)=[^\n]*\/var\/lib\/everwise/,
  );
});
