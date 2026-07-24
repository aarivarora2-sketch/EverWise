import { defineSecret } from "firebase-functions/params";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { generateNarration } from "./narration.js";

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

export const narrateLesson = onCall(
  {
    region: "us-central1",
    secrets: [OPENAI_API_KEY],
    timeoutSeconds: 60,
    memory: "256MiB",
    maxInstances: 10,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Please sign in before using natural narration."
      );
    }

    try {
      return await generateNarration({
        text: request.data?.text,
        apiKey: OPENAI_API_KEY.value(),
      });
    } catch (error) {
      if (error instanceof TypeError || error instanceof RangeError) {
        throw new HttpsError("invalid-argument", error.message);
      }
      console.error("[Everwise][narration] Speech generation failed.", {
        name: error?.name,
        message: error?.message,
      });
      throw new HttpsError(
        "internal",
        "Natural narration is temporarily unavailable."
      );
    }
  }
);
