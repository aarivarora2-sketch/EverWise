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
    // Fits a two-line phase title ("Protecting Your Personal Information")
    // without leaving dead space above the first lesson.
    phaseBand: scaled(112, scale),
    phaseBottom: scaled(32, scale),
    // Where a node's reserved block ends — and therefore where the trail dots
    // begin. Keep this close to the real height of a circle plus its label:
    // inflating it pushes the dots down into a cluster against the next node
    // and leaves a visible gap under each label.
    nodeBoxHeight: scaled(182, scale),
    pathBottomClearance: scaled(96, scale),
    offsetAmplitude: Math.max(42, Math.round(60 / nodeScale)),
  };
}
