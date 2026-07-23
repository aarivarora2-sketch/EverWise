// Phase metadata for the Digital Literacy track.
// `color` tints the path header band and section background.
// `accent` is the current START node color (Phase 1 keeps clay).
export const phases = [
  {
    number: 1,
    title: "Foundations",
    biome: "Meadow",
    color: "#5E7B4E", // existing sage header
    accent: "#B5502E", // existing clay START node
  },
  {
    number: 2,
    title: "Safe Internet Habits",
    biome: "Forest",
    color: "#3F5E45",
    accent: "#3F5E45",
  },
  {
    number: 3,
    title: "Communication",
    biome: "Coast",
    color: "#4A6FA5",
    accent: "#4A6FA5",
  },
];

export function getPhase(number) {
  return phases.find((p) => p.number === number) || phases[0];
}
