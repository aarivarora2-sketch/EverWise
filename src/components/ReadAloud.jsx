import { useEffect, useRef, useState } from "react";
import { SpeakerIcon, StopIcon } from "./Icons";

const READ_ALOUD_ENDPOINT =
  import.meta.env.VITE_READ_ALOUD_ENDPOINT || "/api/read-aloud";
const AUDIO_PROFILE_VERSION = "older-adult-v1";
const audioCache = new Map();

async function getAudioBlob(text, signal) {
  const cacheKey = `${AUDIO_PROFILE_VERSION}:${text}`;
  if (audioCache.has(cacheKey)) return audioCache.get(cacheKey);

  const request = fetch(READ_ALOUD_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    signal,
  }).then(async (response) => {
    if (!response.ok) throw new Error("ElevenLabs audio was unavailable");
    return response.blob();
  });

  audioCache.set(cacheKey, request);
  try {
    const blob = await request;
    if (audioCache.size > 20) {
      audioCache.delete(audioCache.keys().next().value);
    }
    return blob;
  } catch (error) {
    audioCache.delete(cacheKey);
    throw error;
  }
}

export default function ReadAloud({ text, label = "Read aloud" }) {
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      audioRef.current?.pause();
      if (audioRef.current?.src) URL.revokeObjectURL(audioRef.current.src);
      window.speechSynthesis?.cancel();
    };
  }, [text]);

  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    audioRef.current?.pause();
    if (audioRef.current?.src) URL.revokeObjectURL(audioRef.current.src);
    audioRef.current = null;
    window.speechSynthesis?.cancel();
    setLoading(false);
    setSpeaking(false);
  };

  const speakWithDeviceVoice = (speakText) => {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const speak = async () => {
    const speakText = (text ?? "").toString().trim();
    if (!speakText) return;

    stop();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    try {
      const audioUrl = URL.createObjectURL(
        await getAudioBlob(speakText, controller.signal),
      );
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = stop;
      audio.onerror = () => {
        stop();
        speakWithDeviceVoice(speakText);
      };

      setLoading(false);
      setSpeaking(true);
      await audio.play();
    } catch (error) {
      if (error.name === "AbortError") return;
      setLoading(false);
      speakWithDeviceVoice(speakText);
    }
  };

  return (
    <button
      type="button"
      onClick={speaking || loading ? stop : speak}
      aria-pressed={speaking}
      aria-busy={loading}
      className={`inline-flex items-center gap-3 rounded-full border-2 px-5 py-3 text-lg font-semibold transition-colors ${
        speaking || loading
          ? "border-clay bg-clay text-cream-card"
          : "border-clay/40 bg-cream-card text-clay hover:bg-clay/10"
      }`}
    >
      {speaking || loading ? <StopIcon /> : <SpeakerIcon />}
      {loading ? "Starting…" : speaking ? "Stop" : label}
    </button>
  );
}
