// Phase metadata for both tracks in one continuous sequence (1–17).
// `color` is the biome hue used on path nodes, headers, and section tints.
export const phases = [
  {
    number: 1,
    track: "literacy",
    title: "Foundations",
    biome: "Meadow",
    color: "#6B8E5A",
    accent: "#6B8E5A",
  },
  {
    number: 2,
    track: "literacy",
    title: "Safe Internet Habits",
    biome: "Tidepool",
    color: "#2F7A85",
    accent: "#2F7A85",
  },
  {
    number: 3,
    track: "literacy",
    title: "Communication",
    biome: "Lavender Fields",
    color: "#7D6193",
    accent: "#7D6193",
  },
  {
    number: 4,
    track: "literacy",
    title: "Digital Finance",
    biome: "Savanna",
    color: "#B8862F",
    accent: "#B8862F",
  },
  {
    number: 5,
    track: "literacy",
    title: "Health & Government",
    biome: "Alpine",
    color: "#4A6FA5",
    accent: "#4A6FA5",
  },
  {
    number: 6,
    track: "literacy",
    title: "Social Media",
    biome: "Coral Reef",
    color: "#C4676B",
    accent: "#C4676B",
  },
  {
    number: 7,
    track: "literacy",
    title: "Emergency Skills",
    biome: "Twilight",
    color: "#4E4A7D",
    accent: "#4E4A7D",
  },
];

// Scam Protection track continues the global phase sequence after Foundations.
export const scamPhases = [
  {
    number: 8,
    track: "scam",
    title: "Becoming Scam-Proof",
    biome: "Sandstone",
    color: "#A65D3A",
    accent: "#A65D3A",
  },
  {
    number: 9,
    track: "scam",
    title: "The Warning Signs",
    biome: "Canyon",
    color: "#8C4A3F",
    accent: "#8C4A3F",
  },
  {
    number: 10,
    track: "scam",
    title: "The Masks Scammers Wear",
    biome: "Dusk",
    color: "#6B5B7B",
    accent: "#6B5B7B",
  },
  {
    number: 11,
    track: "scam",
    title: "When AI Enters the Conversation",
    biome: "Aurora",
    color: "#3E7C8C",
    accent: "#3E7C8C",
  },
  {
    number: 12,
    track: "scam",
    title: "Protecting Your Personal Information",
    biome: "Vault",
    color: "#5A6B8C",
    accent: "#5A6B8C",
  },
  {
    number: 13,
    track: "scam",
    title: "Smart Communication",
    biome: "Signal",
    color: "#8C6239",
    accent: "#8C6239",
  },
  {
    number: 14,
    track: "scam",
    title: "Safe Online Shopping & Money",
    biome: "Market",
    color: "#8A5A2B",
    accent: "#8A5A2B",
  },
  {
    number: 15,
    track: "scam",
    title: "AI in Everyday Life",
    biome: "Beacon",
    color: "#4A7C74",
    accent: "#4A7C74",
  },
  {
    number: 16,
    track: "scam",
    title: "Helping Others Stay Safe",
    biome: "Hearth",
    color: "#9E5B4A",
    accent: "#9E5B4A",
  },
  {
    number: 17,
    track: "scam",
    title: "Living Confidently Online",
    biome: "Summit",
    color: "#5F7A94",
    accent: "#5F7A94",
  },
];

export const allPhases = [...phases, ...scamPhases];

export function getPhase(number) {
  return allPhases.find((p) => p.number === number) || phases[0];
}

/** Learner-facing phase number (1–17 across both tracks). */
export function phaseLabel(phase) {
  return phase?.number ?? 1;
}
