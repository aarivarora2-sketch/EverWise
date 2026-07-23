import { useEffect, useRef, useState } from "react";
import { SpeakerIcon, StopIcon } from "./Icons";

function pickEnglishVoice(voices) {
  return (voices || []).find((v) => v.lang && v.lang.startsWith("en")) || null;
}

function cancelSpeech(reason) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  console.log(
    "[Everwise][speech] cancel()",
    reason,
    "\n",
    new Error("cancel stack").stack
  );
  window.speechSynthesis.cancel();
}

// Read-aloud button using the browser's built-in speech synthesis.
// Big, clearly labeled, and toggles between "Read aloud" and "Stop".
// Speech is only started from a direct click (never on mount).
export default function ReadAloud({ text, label = "Read aloud" }) {
  const [speaking, setSpeaking] = useState(false);
  const voicesRef = useRef([]);
  const utteranceRef = useRef(null);
  const speakTimerRef = useRef(null);
  const prevTextRef = useRef(text);
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // Load voices asynchronously — getVoices() is often [] on the first call.
  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;

    const refreshVoices = () => {
      const list = synth.getVoices() || [];
      if (list.length > 0) {
        voicesRef.current = list;
        console.log(
          "[Everwise][speech] voices loaded:",
          list.length,
          list.map((v) => `${v.name} (${v.lang})`)
        );
      }
      return list;
    };

    refreshVoices();
    const onVoices = () => refreshVoices();
    synth.addEventListener("voiceschanged", onVoices);
    return () => synth.removeEventListener("voiceschanged", onVoices);
  }, [supported]);

  // Cancel ONLY on true unmount. Do not depend on `text` — that re-ran cleanup
  // on re-renders/navigation churn and cancelled utterances right after speak().
  useEffect(() => {
    return () => {
      if (speakTimerRef.current) {
        clearTimeout(speakTimerRef.current);
        speakTimerRef.current = null;
      }
      cancelSpeech("unmount cleanup");
      utteranceRef.current = null;
    };
  }, []);

  // If the lesson text actually changes (new block/question), stop current speech.
  // Skip the first run so mount / StrictMode remount doesn't cancel needlessly.
  useEffect(() => {
    if (prevTextRef.current === text) return;
    prevTextRef.current = text;

    if (speakTimerRef.current) {
      clearTimeout(speakTimerRef.current);
      speakTimerRef.current = null;
    }

    const synth = supported ? window.speechSynthesis : null;
    if (synth && (synth.speaking || synth.pending)) {
      cancelSpeech("text changed while speaking");
    }
    setSpeaking(false);
    utteranceRef.current = null;
  }, [text, supported]);

  if (!supported) return null;

  const clearSpeakTimer = () => {
    if (speakTimerRef.current) {
      clearTimeout(speakTimerRef.current);
      speakTimerRef.current = null;
    }
  };

  const stop = () => {
    clearSpeakTimer();
    cancelSpeech("user stop");
    setSpeaking(false);
    utteranceRef.current = null;
  };

  const startUtterance = (speakText) => {
    const synth = window.speechSynthesis;

    let voices = voicesRef.current;
    if (!voices.length) {
      voices = synth.getVoices() || [];
      if (voices.length) voicesRef.current = voices;
    }

    // Keep the utterance in a ref so it isn't garbage-collected mid-speech.
    const utter = new SpeechSynthesisUtterance(speakText);
    utteranceRef.current = utter;
    utter.rate = 0.9;
    utter.pitch = 1;
    utter.lang = "en-US";

    if (voices.length > 0) {
      const enVoice = pickEnglishVoice(voices);
      if (enVoice) {
        utter.voice = enVoice;
        console.log(
          "[Everwise][speech] selected voice:",
          enVoice.name,
          enVoice.lang
        );
      } else {
        console.log(
          "[Everwise][speech] no English voice in list; using default"
        );
      }
    } else {
      console.log(
        "[Everwise][speech] voices still empty; speaking with default voice"
      );
    }

    utter.onstart = (event) => {
      console.log("[Everwise][speech] onstart", event);
      setSpeaking(true);
    };
    utter.onend = () => {
      console.log("[Everwise][speech] onend");
      setSpeaking(false);
      utteranceRef.current = null;
    };
    utter.onerror = (event) => {
      console.log("[Everwise][speech] onerror", event?.error, event);
      setSpeaking(false);
      utteranceRef.current = null;
    };

    console.log("[Everwise][speech] calling speak()");
    synth.speak(utter);
    // Chrome sometimes starts paused after a prior cancel(); resume() unsticks it.
    synth.resume();
  };

  const speak = () => {
    const synth = window.speechSynthesis;
    clearSpeakTimer();

    const speakText =
      typeof text === "string" ? text.trim() : String(text ?? "").trim();

    console.log(
      "[Everwise][speech] speak clicked; raw text:",
      text,
      "| utterance string:",
      JSON.stringify(speakText)
    );

    if (!speakText) {
      console.warn(
        "[Everwise][speech] empty or undefined text — not speaking"
      );
      return;
    }

    const wasActive = synth.speaking || synth.pending;
    if (wasActive) {
      // Only cancel when something is actually queued/playing, then wait briefly
      // so Chrome doesn't immediately cancel the new utterance.
      cancelSpeech("before speak (queue was active)");
      setSpeaking(true);
      speakTimerRef.current = setTimeout(() => {
        speakTimerRef.current = null;
        startUtterance(speakText);
      }, 100);
      return;
    }

    setSpeaking(true);
    startUtterance(speakText);
  };

  return (
    <button
      type="button"
      onClick={speaking ? stop : speak}
      aria-pressed={speaking}
      className={`inline-flex items-center gap-3 rounded-full border-2 px-5 py-3 text-lg font-semibold transition-colors ${
        speaking
          ? "border-clay bg-clay text-cream-card"
          : "border-clay/40 bg-cream-card text-clay hover:bg-clay/10"
      }`}
    >
      {speaking ? <StopIcon /> : <SpeakerIcon />}
      {speaking ? "Stop" : label}
    </button>
  );
}
