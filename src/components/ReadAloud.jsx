import { useEffect, useRef, useState } from "react";
import { SpeakerIcon, StopIcon } from "./Icons";
import { getNaturalNarrationUrl } from "../services/narration";

function pickEnglishVoice(voices) {
  return (voices || []).find((voice) => voice.lang?.startsWith("en")) || null;
}

function cancelBrowserSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}

export default function ReadAloud({ text, label = "Read aloud" }) {
  const [status, setStatus] = useState("idle");
  const [announcement, setAnnouncement] = useState("");
  const voicesRef = useRef([]);
  const utteranceRef = useRef(null);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const requestIdRef = useRef(0);
  const previousTextRef = useRef(text);

  const browserSpeechSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;
  const naturalAudioSupported =
    typeof window !== "undefined" && typeof window.Audio === "function";
  const supported = browserSpeechSupported || naturalAudioSupported;

  useEffect(() => {
    if (!browserSpeechSupported) return undefined;
    const synth = window.speechSynthesis;
    const refreshVoices = () => {
      const voices = synth.getVoices() || [];
      if (voices.length > 0) voicesRef.current = voices;
    };
    refreshVoices();
    synth.addEventListener("voiceschanged", refreshVoices);
    return () => synth.removeEventListener("voiceschanged", refreshVoices);
  }, [browserSpeechSupported]);

  const releaseNaturalAudio = () => {
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  };

  const stop = () => {
    requestIdRef.current += 1;
    releaseNaturalAudio();
    cancelBrowserSpeech();
    utteranceRef.current = null;
    setStatus("idle");
    setAnnouncement("Reading stopped.");
  };

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      releaseNaturalAudio();
      cancelBrowserSpeech();
      utteranceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (previousTextRef.current === text) return;
    previousTextRef.current = text;
    stop();
  }, [text]);

  if (!supported) return null;

  const startBrowserVoice = (speakText) => {
    if (!browserSpeechSupported) {
      setStatus("idle");
      setAnnouncement("Read aloud is temporarily unavailable.");
      return;
    }

    const synth = window.speechSynthesis;
    const voices = voicesRef.current.length
      ? voicesRef.current
      : synth.getVoices() || [];
    const utterance = new SpeechSynthesisUtterance(speakText);
    utteranceRef.current = utterance;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.lang = "en-US";
    utterance.voice = pickEnglishVoice(voices);
    utterance.onstart = () => {
      setStatus("speaking");
      setAnnouncement("Reading aloud with your device voice.");
    };
    utterance.onend = () => {
      setStatus("idle");
      setAnnouncement("Reading finished.");
      utteranceRef.current = null;
    };
    utterance.onerror = () => {
      setStatus("idle");
      setAnnouncement("Read aloud is temporarily unavailable.");
      utteranceRef.current = null;
    };

    cancelBrowserSpeech();
    synth.speak(utterance);
    synth.resume();
  };

  const speak = async () => {
    const speakText =
      typeof text === "string" ? text.trim() : String(text ?? "").trim();
    if (!speakText) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setStatus("loading");
    setAnnouncement("Preparing a natural AI voice.");

    try {
      const audioUrl = await getNaturalNarrationUrl(speakText);
      if (requestId !== requestIdRef.current) {
        URL.revokeObjectURL(audioUrl);
        return;
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audioUrlRef.current = audioUrl;
      audio.onended = () => {
        releaseNaturalAudio();
        setStatus("idle");
        setAnnouncement("Reading finished.");
      };
      audio.onerror = () => {
        releaseNaturalAudio();
        startBrowserVoice(speakText);
      };

      await audio.play();
      setStatus("speaking");
      setAnnouncement("Reading aloud with a natural AI voice.");
    } catch {
      if (requestId === requestIdRef.current) {
        releaseNaturalAudio();
        startBrowserVoice(speakText);
      }
    }
  };

  const active = status !== "idle";
  const buttonLabel =
    status === "loading"
      ? "Preparing voice…"
      : status === "speaking"
        ? "Stop"
        : label;

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={active ? stop : speak}
        aria-pressed={status === "speaking"}
        aria-busy={status === "loading"}
        className={`inline-flex min-h-14 items-center gap-3 rounded-full border-2 px-5 py-3 text-lg font-semibold transition-colors ${
          active
            ? "border-clay bg-clay text-cream-card"
            : "border-clay/40 bg-cream-card text-clay hover:bg-clay/10"
        }`}
      >
        {active ? <StopIcon /> : <SpeakerIcon />}
        {buttonLabel}
      </button>
      <span className="pl-2 text-sm font-medium text-ink-faint">
        Natural voice generated with AI
      </span>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
