const TEXT_SCALE_BY_SIZE = {
  "size-1": 0.89,
  "size-2": 1,
  "size-3": 1.11,
  "size-4": 1.22,
  "size-5": 1.33,
  "size-6": 1.44,
  "size-7": 1.56,
  "size-8": 1.67,
  "size-9": 1.78,
  "size-10": 1.89,
};

export function getPathLayoutMetrics(textSize) {
  const textScale = TEXT_SCALE_BY_SIZE[textSize] ?? 1;
  const growth = Math.max(0, textScale - 1);
  const nodeBoxHeight = Math.round(182 + growth * 120);

  return {
    nodeBoxHeight,
    nodeSlot: Math.max(340, nodeBoxHeight + 96),
    phaseBandHeight: Math.round(88 + growth * 75),
    phaseBottom: Math.round(32 + growth * 8),
    pathBottomClearance: Math.round(96 + growth * 60),
  };
}
