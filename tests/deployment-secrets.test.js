import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workflow = readFileSync(
  new URL("../.github/workflows/deploy-digitalocean.yml", import.meta.url),
  "utf8",
);
const pagesWorkflow = readFileSync(
  new URL("../.github/workflows/deploy-pages.yml", import.meta.url),
  "utf8",
);

test("deployment workflows install reproducibly and test before publishing", () => {
  for (const candidate of [workflow, pagesWorkflow]) {
    assert.match(candidate, /run: npm ci --no-audit --no-fund/);
    assert.match(candidate, /npm test/);
    assert.doesNotMatch(candidate, /run: npm install\b/);
  }
});

test("DigitalOcean deployment provisions API credentials from GitHub", () => {
  assert.match(
    workflow,
    /OPENAI_API_KEY: \$\{\{ secrets\.OPENAI_API_KEY \}\}/,
  );
  assert.match(
    workflow,
    /ELEVENLABS_API_KEY: \$\{\{ secrets\.ELEVENLABS_API_KEY \}\}/,
  );
  assert.match(
    workflow,
    /ELEVENLABS_VOICE_ID: \$\{\{ vars\.ELEVENLABS_VOICE_ID \}\}/,
  );
  assert.match(workflow, /configure-runtime/);
  assert.match(workflow, /< "\$credentials_file"/);
  assert.doesNotMatch(workflow, /\bscp\b/);
});

test("DigitalOcean deployment verifies both API integrations through the restricted deploy command", () => {
  assert.match(workflow, /verify-runtime/);
  assert.doesNotMatch(workflow, /systemctl restart everwise-api\.service/);
  assert.doesNotMatch(workflow, /root@143\.198\.64\.226\s+\\\s+"set -eu/);
});

test("DigitalOcean deployment archives only the built app and reviewed partner server tooling", () => {
  assert.match(
    workflow,
    /tar -czf "\$release_archive" dist server\.mjs server scripts\/manage-partners\.mjs/,
  );
  assert.doesNotMatch(workflow, /tar -czf -[^\n]*\bscripts\b(?!\/manage-partners\.mjs)/);
  assert.doesNotMatch(workflow, /tar -czf -[^\n]*(?:\.env|node_modules|partners\.json)/);
});

test("DigitalOcean deployment checks partner configuration and store health after release", () => {
  assert.match(workflow, /"partnerAccessConfigured":true/);
  assert.match(workflow, /"partnerStoreHealthy":true/);
  assert.match(workflow, /https:\/\/everwise\.dexio-games\.com\/healthz/);
});

test("DigitalOcean deployment preflights the built archive with the versioned allowlist", () => {
  assert.match(workflow, /release_archive="\$\(mktemp\)"/);
  assert.match(workflow, /validate_release_archive/);
  assert.match(workflow, /ops\/deploy-everwise/);
  assert.match(workflow, /< "\$release_archive"/);
  assert.doesNotMatch(workflow, /tar -czf -[^\n]*\|\s*\n\s*ssh/);
});
