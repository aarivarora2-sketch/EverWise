// Shared text-size scale. Kept out of the component file so React Fast
// Refresh keeps working (a component file should only export components).

export const TEXT_SIZES = Array.from(
  { length: 10 },
  (_, index) => `size-${index + 1}`,
);

// Steps the current size up (+1) or down (-1), clamped to the scale.
export function textSizeStep(textSize, direction) {
  const index = Math.max(0, TEXT_SIZES.indexOf(textSize));
  const next = Math.min(TEXT_SIZES.length - 1, Math.max(0, index + direction));
  return TEXT_SIZES[next];
}
