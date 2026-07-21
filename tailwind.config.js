/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Warm editorial palette
        cream: {
          DEFAULT: "#EFE9DC", // calm cream background
          card: "#FBF9F4", // slightly lighter card / surface
          deep: "#E7DFCE", // subtle contrast surface
        },
        ink: {
          DEFAULT: "#22201C", // near-black text
          soft: "#4A463F", // muted body text
          faint: "#8A857A", // captions / locked
        },
        clay: {
          DEFAULT: "#B0512F", // clay / terracotta primary action
          dark: "#8F3F23", // pressed / hover
          soft: "#C97A5C",
        },
        sage: {
          DEFAULT: "#5E7B4E", // green = done / safe
          dark: "#4C6640",
          soft: "#7E9B6E",
        },
        alert: {
          DEFAULT: "#A63A2E", // muted red = scam warning
          soft: "#C86A5E",
        },
        locked: "#C9C3B6", // grey = locked
      },
      fontFamily: {
        serif: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Source Sans 3"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        node: "0 6px 0 rgba(0,0,0,0.12)",
        "node-sage": "0 6px 0 #4C6640",
        "node-clay": "0 7px 0 #8F3F23",
        "node-locked": "0 5px 0 #B4AE9F",
        card: "0 2px 10px rgba(34,32,28,0.06)",
        btn: "0 4px 0 #8F3F23",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.85)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", opacity: "0.7" },
          "70%": { transform: "scale(1.25)", opacity: "0" },
          "100%": { transform: "scale(1.25)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "pop-in": "pop-in 0.4s ease-out both",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
      },
    },
  },
  plugins: [],
};
