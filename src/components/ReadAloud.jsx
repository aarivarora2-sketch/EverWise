import { useEffect, useState } from "react";
import { SpeakerIcon, StopIcon } from "./Icons";

// Read-aloud button using the browser's built-in speech synthesis.
// Big, clearly labeled, and toggles between "Read aloud" and "Stop".
export default function ReadAloud({ text, label = "Read aloud" }) {
  const [speaking, setSpeaking] = useState(false);
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // Some browsers load the list of voices asynchronously. Nudge them to load
  // so the first tap has a voice ready to go.
  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    synth.getVoices();
    const onVoices = () => synth.getVoices();
    synth.addEventListener?.("voiceschanged", onVoices);
    return () => synth.removeEventListener?.("voiceschanged", onVoices);
  }, [supported]);

  // Stop any speech if the text changes or the screen unmounts.
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
    // Clear anything queued or left in a stuck/paused state first.
    synth.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9; // a touch slower, easier to follow
    utter.pitch = 1;
    utter.lang = "en-US";

    const voices = synth.getVoices();
    const enVoice = voices.find((v) => v.lang && v.lang.startsWith("en"));
    if (enVoice) utter.voice = enVoice;

    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);

    setSpeaking(true);
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
