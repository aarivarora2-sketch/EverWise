// Phase metadata for the Digital Literacy track.
// `color` is the biome hue used on path nodes, headers, and section tints.
export const phases = [
  {
    number: 1,
    title: "Foundations",
    biome: "Meadow",
    color: "#6B8E5A",
    accent: "#6B8E5A",
  },
  {
    number: 2,
    title: "Safe Internet Habits",
    biome: "Tidepool",
    color: "#2F7A85",
    accent: "#2F7A85",
  },
  {
    number: 3,
    title: "Communication",
    biome: "Lavender Fields",
    color: "#7D6193",
    accent: "#7D6193",
  },
  {
    number: 4,
    title: "Digital Finance",
    biome: "Savanna",
    color: "#B8862F",
    accent: "#B8862F",
  },
  {
    number: 5,
    title: "Health & Government",
    biome: "Alpine",
    color: "#4A6FA5",
    accent: "#4A6FA5",
  },
  {
    number: 6,
    title: "Social Media",
    biome: "Coral Reef",
    color: "#C4676B",
    accent: "#C4676B",
  },
  {
    number: 7,
    title: "Emergency Skills",
    biome: "Twilight",
    color: "#4E4A7D",
    accent: "#4E4A7D",
  },
];

// Scam Protection track. Numbered from 101 so the two tracks can never
// collide, while still reading as "Phase 1", "Phase 2"… to the learner.
export const scamPhases = [
  {
    number: 101,
    displayNumber: 1,
    track: "scam",
    title: "Becoming Scam-Proof",
    biome: "Sandstone",
    color: "#A65D3A",
    accent: "#A65D3A",
  },
  {
    number: 102,
    displayNumber: 2,
    track: "scam",
    title: "The Warning Signs",
    biome: "Canyon",
    color: "#8C4A3F",
    accent: "#8C4A3F",
  },
  {
    number: 103,
    displayNumber: 3,
    track: "scam",
    title: "The Masks Scammers Wear",
    biome: "Dusk",
    color: "#6B5B7B",
    accent: "#6B5B7B",
  },
  {
    number: 104,
    displayNumber: 4,
    track: "scam",
    title: "When AI Enters the Conversation",
    biome: "Aurora",
    color: "#3E7C8C",
    accent: "#3E7C8C",
  },
  {
    number: 105,
    displayNumber: 5,
    track: "scam",
    title: "Protecting Your Personal Information",
    biome: "Vault",
    color: "#5A6B8C",
    accent: "#5A6B8C",
  },
  {
    number: 106,
    displayNumber: 6,
    track: "scam",
    title: "Smart Communication",
    biome: "Signal",
    color: "#8C6239",
    accent: "#8C6239",
  },
  {
    number: 107,
    displayNumber: 7,
    track: "scam",
    title: "Safe Online Shopping & Money",
    biome: "Market",
    color: "#8A5A2B",
    accent: "#8A5A2B",
  },
  {
    number: 108,
    displayNumber: 8,
    track: "scam",
    title: "AI in Everyday Life",
    biome: "Beacon",
    color: "#4A7C74",
    accent: "#4A7C74",
  },
  {
    number: 109,
    displayNumber: 9,
    track: "scam",
    title: "Helping Others Stay Safe",
    biome: "Hearth",
    color: "#9E5B4A",
    accent: "#9E5B4A",
  },
  {
    number: 110,
    displayNumber: 10,
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

/** What the learner sees: "Phase 1" for both tracks, not "Phase 101". */
export function phaseLabel(phase) {
  return phase?.displayNumber ?? phase?.number ?? 1;
}
