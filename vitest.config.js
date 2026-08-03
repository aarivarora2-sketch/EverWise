import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup-dom.js"],
    include: ["tests/**/*.test.jsx"],
  },
});
