// Soft, low-contrast scenery behind each phase band so every biome feels
// like a different landscape. Purely decorative — never sits over text, and
// drifts slowly enough to read as ambient rather than distracting.

function Meadow({ c }) {
  return (
    <>
      <path d="M0 190 q20-46 34-2 M22 190 q16-52 30-4 M48 188 q14-40 28-2" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="72" cy="150" r="5" fill={c} />
      <circle cx="18" cy="128" r="4" fill={c} />
      <path d="M150 192 q18-44 32-2 M176 190 q16-50 30-4" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="196" cy="146" r="5" fill={c} />
    </>
  );
}

function Tidepool({ c }) {
  return (
    <>
      <path d="M-10 60 q30-16 60 0 t60 0 t60 0 t60 0" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M-10 96 q30-16 60 0 t60 0 t60 0 t60 0" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M-10 132 q30-16 60 0 t60 0 t60 0 t60 0" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="40" cy="172" r="6" fill={c} />
      <circle cx="170" cy="182" r="4" fill={c} />
    </>
  );
}

function Lavender({ c }) {
  return (
    <>
      <path d="M30 190 v-52 M30 138 l-9-12 M30 150 l9-12 M30 162 l-9-12" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M70 192 v-44 M70 148 l-8-11 M70 160 l8-11" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M170 190 v-56 M170 134 l-9-12 M170 148 l9-12 M170 162 l-9-12" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M205 192 v-40 M205 152 l-8-10" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  );
}

function Savanna({ c }) {
  return (
    <>
      <path d="M40 195 v-40" stroke={c} strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="40" cy="145" rx="34" ry="13" fill={c} />
      <path d="M186 196 v-30" stroke={c} strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="186" cy="158" rx="26" ry="10" fill={c} />
      <path d="M100 196 q10-24 20-2 M118 196 q8-20 16-2" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  );
}

function Alpine({ c }) {
  return (
    <>
      <path d="M-10 190 l58-84 40 56 30-38 62 66z" fill={c} />
      <path d="M48 106 l16 23 -32 0z" fill="#FBF9F4" opacity="0.55" />
      <circle cx="196" cy="52" r="13" fill={c} />
    </>
  );
}

function CoralReef({ c }) {
  return (
    <>
      <path d="M44 196 v-40 M44 168 l-14-14 M44 178 l14-16" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M180 196 v-32 M180 174 l-12-12 M180 182 l12-13" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="110" cy="96" r="5" fill={c} />
      <circle cx="132" cy="66" r="3.5" fill={c} />
      <circle cx="92" cy="58" r="3" fill={c} />
    </>
  );
}

function Twilight({ c }) {
  const stars = [
    [28, 40, 3],
    [86, 22, 2.2],
    [148, 52, 3.2],
    [200, 30, 2.4],
    [58, 92, 2.4],
    [176, 108, 2.8],
    [116, 140, 2.2],
    [36, 158, 2.6],
  ];
  return (
    <>
      {stars.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={c} />
      ))}
      <path d="M-10 196 q60-40 110-8 t130-14" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  );
}

const BY_BIOME = {
  Meadow,
  Tidepool,
  "Lavender Fields": Lavender,
  Savanna,
  Alpine,
  "Coral Reef": CoralReef,
  Twilight,
};

export default function BiomeScenery({ biome, color, className = "" }) {
  const Art = BY_BIOME[biome];
  if (!Art) return null;
  return (
    <svg
      viewBox="0 0 230 200"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 ${className}`}
      style={{ opacity: 0.18 }}
    >
      <Art c={color} />
    </svg>
  );
}
