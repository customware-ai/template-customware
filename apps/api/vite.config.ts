import { resolve } from "node:path";

import { defineConfig } from "vite-plus";

export default defineConfig({
  envDir: resolve(import.meta.dirname, "../.."),
  publicDir: false,
  run: {
    tasks: {
      build: {
        command: "vp build",
        dependsOn: ["@cw/app#build"],
        cache: {
          input: [{ auto: true }, "!dist/**", { pattern: "!build/**", base: "workspace" }],
          output: ["dist/**"],
        },
      },
    },
  },
  build: {
    ssr: true,
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    minify: "oxc",
    rolldownOptions: {
      input: {
        start: "src/start.ts",
      },
      platform: "node",
      tsconfig: "./tsconfig.json",
      treeshake: true,
      external: /^(?!(?:@cw\/shared)(?:\/|$))[^./]/,
      output: {
        format: "esm",
        entryFileNames: "[name].js",
        chunkFileNames: "assets/[name]-[hash].js",
      },
    },
  },
  ssr: {
    target: "node",
  },
});
