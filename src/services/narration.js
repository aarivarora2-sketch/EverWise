import app from "../firebase";

const CACHE_LIMIT = 8;
const narrationCache = new Map();
let narrateLessonPromise;

async function getNarrateLesson() {
  if (!narrateLessonPromise) {
    narrateLessonPromise = import("firebase/functions").then(
      ({ getFunctions, httpsCallable }) =>
        httpsCallable(getFunctions(app, "us-central1"), "narrateLesson", {
          timeout: 45_000,
        })
    );
  }
  return narrateLessonPromise;
}

function remember(text, narration) {
  narrationCache.delete(text);
  narrationCache.set(text, narration);
  if (narrationCache.size > CACHE_LIMIT) {
    narrationCache.delete(narrationCache.keys().next().value);
  }
}

function audioUrlFromBase64(base64Audio, contentType) {
  const binary = window.atob(base64Audio);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return URL.createObjectURL(
    new Blob([bytes], { type: contentType || "audio/mpeg" })
  );
}

export async function getNaturalNarrationUrl(text) {
  const cached = narrationCache.get(text);
  if (cached) {
    remember(text, cached);
    return audioUrlFromBase64(cached.audio, cached.contentType);
  }

  const narrateLesson = await getNarrateLesson();
  const response = await narrateLesson({ text });
  const narration = response?.data;
  if (typeof narration?.audio !== "string" || narration.audio.length === 0) {
    throw new Error("The narration service returned no audio.");
  }

  remember(text, narration);
  return audioUrlFromBase64(narration.audio, narration.contentType);
}
