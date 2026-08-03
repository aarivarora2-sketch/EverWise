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
  assert.match(workflow, /install -m 600 .*\/etc\/everwise\/runtime\.env/);
  assert.match(workflow, /EnvironmentFile=\/etc\/everwise\/runtime\.env/);
});

test("DigitalOcean deployment verifies both API integrations after restart", () => {
  assert.match(workflow, /systemctl restart everwise-api\.service/);
  assert.match(workflow, /http:\/\/127\.0\.0\.1:8787\/healthz/);
  assert.match(workflow, /readAloudConfigured.*true/);
  assert.match(workflow, /scamCheckerConfigured.*true/);
});
