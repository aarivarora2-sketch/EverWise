// Simple, bold SVG icons. All pair with a text label so nothing depends on
// eyesight or color alone. They inherit color via `currentColor`.

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function CheckIcon({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}

export function LockIcon({ className = "w-7 h-7" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function FlameIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.2c.9 3-1.4 4.6-2.7 6C7.8 9.9 7 11.4 7 13.3 7 16.9 9.9 20 13 20s5.5-2.7 5.5-6.3c0-2.6-1.4-4.3-2.6-5.6-.6.9-1.3 1.4-2 1.5.6-2.4-.2-5-1.9-7.4Z"
      />
    </svg>
  );
}

export function StarIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3.2l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"
      />
    </svg>
  );
}

export function SpeakerIcon({ className = "w-7 h-7" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
      <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" />
      <path d="M16 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 6a8.5 8.5 0 0 1 0 12" />
    </svg>
  );
}

export function StopIcon({ className = "w-7 h-7" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="2.4" fill="currentColor" />
    </svg>
  );
}

export function ArrowLeftIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function ShieldIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
      <path d="M12 3l7 2.5v5.5c0 4.3-3 8-7 9.5-4-1.5-7-5.2-7-9.5V5.5z" />
      <path d="M9 12l2 2 4-4.5" />
    </svg>
  );
}

export function BookIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5A2.5 2.5 0 0 1 4 20.5z" />
    </svg>
  );
}

export function HomeIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
      <path d="m4 10 8-6 8 6v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M9.5 21v-7h5v7" />
    </svg>
  );
}

export function SettingsIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
    </svg>
  );
}

export function MessageSearchIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
      <path d="M5 5.5h14v10H9l-4 3z" />
      <circle cx="13.5" cy="10.5" r="2.5" />
      <path d="m15.4 12.4 2.1 2.1" />
    </svg>
  );
}

export function TrophyIcon({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
      <path d="M7 4h10v4a5 5 0 0 1-10 0z" />
      <path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" />
      <path d="M12 13v3M9 20h6M9.5 20l.5-4h4l.5 4" />
    </svg>
  );
}
