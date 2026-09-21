import { resolve } from "node:path";

import { defineConfig } from "vite-plus";

export default defineConfig({
  envDir: resolve(import.meta.dirname, "../.."),
  publicDir: false,
  run: {
    tasks: {
      build: {
        command: "vp build",
        dependsOn: ["@template-customware/app#build"],
        untrackedEnv: ["SHLVL"],
        input: [{ auto: true }, { pattern: "!build/**", base: "workspace" }],
        output: [{ pattern: "build/server/**", base: "workspace" }],
      },
    },
  },
  build: {
    ssr: true,
    outDir: "../../build/server",
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
      external: /^(?!(?:@template-customware\/shared)(?:\/|$))[^./]/,
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
