import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workflow = readFileSync(
  new URL("../.github/workflows/deploy-digitalocean.yml", import.meta.url),
  "utf8",
);

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
