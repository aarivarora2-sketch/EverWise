import { useEffect, useState } from "react";
import { SpeakerIcon, StopIcon } from "./Icons";

// Read-aloud button using the browser's built-in speech synthesis.
// Big, clearly labeled, and toggles between "Read aloud" and "Stop".
export default function ReadAloud({ text, label = "Read aloud" }) {
  const [speaking, setSpeaking] = useState(false);
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // Stop speaking if the underlying text changes (new block/question) or
  // this component unmounts (navigating away mid-speech).
  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
      setSpeaking(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, supported]);

  if (!supported) return null;

  const speak = () => {
    const speakText = (text ?? "").toString().trim();
    if (!speakText) return;

    // Always start clean — a stale queued/paused utterance is the most
    // common reason speak() silently does nothing.
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(speakText);
    utter.rate = 0.9;
    utter.pitch = 1;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
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
