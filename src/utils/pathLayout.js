const SCALE_BY_TEXT_SIZE = {
  "size-1": 0.95,
  "size-2": 1,
  "size-3": 1.07,
  "size-4": 1.14,
  "size-5": 1.22,
  "size-6": 1.3,
  "size-7": 1.38,
  "size-8": 1.46,
  "size-9": 1.54,
  "size-10": 1.62,
};

const scaled = (value, scale) => Math.round(value * scale);

export function pathLayoutForTextSize(textSize = "size-2") {
  const scale = SCALE_BY_TEXT_SIZE[textSize] ?? 1;
  const nodeScale = 1 + (scale - 1) * 0.45;

  return {
    scale,
    nodeScale,
    nodeSlot: scaled(340, scale),
    phaseTop: scaled(32, scale),
    phaseTopFirst: scaled(8, scale),
    phaseBand: scaled(160, scale),
    phaseBottom: scaled(32, scale),
    nodeBoxHeight: scaled(250, scale),
    pathBottomClearance: scaled(96, scale),
    offsetAmplitude: Math.max(42, Math.round(60 / nodeScale)),
  };
}
