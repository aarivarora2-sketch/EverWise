const OPENAI_SPEECH_URL = "https://api.openai.com/v1/audio/speech";
export const MAX_NARRATION_CHARACTERS = 4096;

export function normalizeNarrationText(value) {
  if (typeof value !== "string") {
    throw new TypeError("Narration text must be a string.");
  }
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) throw new RangeError("Narration text cannot be empty.");
  if (text.length > MAX_NARRATION_CHARACTERS) {
    throw new RangeError(
      `Narration text cannot exceed ${MAX_NARRATION_CHARACTERS} characters.`
    );
  }
  return text;
}

export async function generateNarration({
  text,
  apiKey,
  fetchImpl = globalThis.fetch,
}) {
  const input = normalizeNarrationText(text);
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");
  if (typeof fetchImpl !== "function") {
    throw new TypeError("A fetch implementation is required.");
  }

  const response = await fetchImpl(OPENAI_SPEECH_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-tts",
      voice: "marin",
      input,
      instructions:
        "Speak warmly, clearly, and naturally for an older adult learner. " +
        "Use a calm conversational pace, gentle emphasis, and brief pauses " +
        "between ideas. Sound respectful and encouraging, never patronizing.",
      response_format: "mp3",
      speed: 0.95,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI speech request failed with status ${response.status}.`);
  }

  const audio = Buffer.from(await response.arrayBuffer());
  if (audio.length === 0) {
    throw new Error("OpenAI speech request returned empty audio.");
  }
  return {
    audio: audio.toString("base64"),
    contentType: response.headers.get("content-type") || "audio/mpeg",
  };
}
