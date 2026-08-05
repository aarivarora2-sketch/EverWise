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

// Gap between one node box and the next at the default text size. The trail
// dots are spread across this gap, so it is what makes the path read as a
// continuous run rather than a cluster next to one node.
const CONNECTOR_GAP = 158;

export function getPathLayoutMetrics(textSize) {
  const textScale = TEXT_SCALE_BY_SIZE[textSize] ?? 1;
  const growth = Math.max(0, textScale - 1);
  const nodeBoxHeight = Math.round(182 + growth * 120);
  // The gap has to grow with the text, not merely survive it. It used to be
  // `max(340, nodeBoxHeight + 96)`, which meant the node box grew faster than
  // the slot: the space left for the trail shrank from 158px to 96px at the
  // largest size, bunching both dots against the following node while the
  // preceding one drifted far away. Scaling the gap keeps the spacing even at
  // every text size, and matches the previous geometry exactly at size-2.
  const connectorGap = Math.round(CONNECTOR_GAP * textScale);

  return {
    nodeBoxHeight,
    nodeSlot: nodeBoxHeight + connectorGap,
    connectorGap,
    textScale,
    phaseBandHeight: Math.round(88 + growth * 75),
    phaseBottom: Math.round(32 + growth * 8),
    pathBottomClearance: Math.round(96 + growth * 60),
  };
}
