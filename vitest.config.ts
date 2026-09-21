import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus/test/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/unit/setup.ts"],
    include: ["tests/unit/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "build", ".react-router"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules", "tests", "build", ".react-router", "*.config.ts", "*.config.js"],
    },
  },
  resolve: {
    alias: {
      "~": resolve(import.meta.dirname, "./apps/app/app"),
    },
  },
});
