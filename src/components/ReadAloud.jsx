import { useEffect, useRef, useState } from "react";
import { SpeakerIcon, StopIcon } from "./Icons";

function pickEnglishVoice(voices) {
  return (voices || []).find((v) => v.lang && v.lang.startsWith("en")) || null;
}

// Read-aloud button using the browser's built-in speech synthesis.
// Big, clearly labeled, and toggles between "Read aloud" and "Stop".
// Speech is only started from a direct click (never on mount).
export default function ReadAloud({ text, label = "Read aloud" }) {
  const [speaking, setSpeaking] = useState(false);
  const voicesRef = useRef([]);
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

  // Stop any speech if the text changes or the screen unmounts.
  // Never auto-speak here — browsers block speech without a user gesture.
  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [text, supported]);

  if (!supported) return null;

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const speak = () => {
    const synth = window.speechSynthesis;

    // Always clear any stuck/paused queue before speaking.
    synth.cancel();

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

    // Prefer cached voices from voiceschanged; fall back to a fresh getVoices().
    let voices = voicesRef.current;
    if (!voices.length) {
      voices = synth.getVoices() || [];
      if (voices.length) voicesRef.current = voices;
    }

    const utter = new SpeechSynthesisUtterance(speakText);
    utter.rate = 0.9; // a touch slower, easier to follow
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
    };
    utter.onerror = (event) => {
      console.log("[Everwise][speech] onerror", event?.error, event);
      setSpeaking(false);
    };

    setSpeaking(true);
    // Cancel again immediately before speak in case anything queued mid-setup.
    synth.cancel();
    synth.speak(utter);
    // Chrome sometimes starts in a paused state after cancel(); resume() fixes it.
    synth.resume();
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
