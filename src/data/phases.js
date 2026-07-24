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

export function getPhase(number) {
  return phases.find((p) => p.number === number) || phases[0];
}
