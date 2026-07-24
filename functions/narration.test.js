import assert from "node:assert/strict";
import test from "node:test";
import {
  generateNarration,
  MAX_NARRATION_CHARACTERS,
  normalizeNarrationText,
} from "./narration.js";

test("normalizes whitespace and rejects invalid narration text", () => {
  assert.equal(normalizeNarrationText("  Hello\n there.  "), "Hello there.");
  assert.throws(() => normalizeNarrationText("  "), /cannot be empty/i);
  assert.throws(
    () => normalizeNarrationText("a".repeat(MAX_NARRATION_CHARACTERS + 1)),
    /cannot exceed/i
  );
});

test("requests expressive GPT-4o mini speech without exposing the key", async () => {
  let capturedUrl;
  let capturedRequest;
  const fetchImpl = async (url, request) => {
    capturedUrl = url;
    capturedRequest = request;
    return new Response(new Uint8Array([73, 68, 51]), {
      status: 200,
      headers: { "content-type": "audio/mpeg" },
    });
  };

  const result = await generateNarration({
    text: "Stay calm and check the sender.",
    apiKey: "test-key",
    fetchImpl,
  });
  const body = JSON.parse(capturedRequest.body);

  assert.equal(capturedUrl, "https://api.openai.com/v1/audio/speech");
  assert.equal(capturedRequest.method, "POST");
  assert.equal(capturedRequest.headers.Authorization, "Bearer test-key");
  assert.equal(body.model, "gpt-4o-mini-tts");
  assert.equal(body.voice, "marin");
  assert.match(body.instructions, /warmly, clearly, and naturally/i);
  assert.equal(body.response_format, "mp3");
  assert.equal(result.contentType, "audio/mpeg");
  assert.equal(result.audio, "SUQz");
  assert.doesNotMatch(JSON.stringify(result), /test-key/);
});

test("rejects unsuccessful OpenAI responses", async () => {
  await assert.rejects(
    generateNarration({
      text: "Hello",
      apiKey: "test-key",
      fetchImpl: async () => new Response("", { status: 429 }),
    }),
    /status 429/
  );
});
