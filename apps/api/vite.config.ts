import { existsSync } from "node:fs";
import { isBuiltin } from "node:module";
import { resolve } from "node:path";

import { defineConfig } from "vite-plus";

const ROOT = resolve(import.meta.dirname, "../..");

/** Keep packages external; fail the build if the root, which runs the server, cannot load one. */
function external(id: string): boolean {
  if (isBuiltin(id)) return true;
  if (!/^[^./\0]/.test(id) || /^@cw\/shared(?:\/|$)/.test(id)) return false;
  const name = id.split("/").slice(0, id.startsWith("@") ? 2 : 1).join("/");
  if (!existsSync(resolve(ROOT, "node_modules", name))) {
    throw new Error(`Server package ${name} is not installed at the root. Run: pnpm add -w ${name}`);
  }
  return true;
}

export default defineConfig({
  envDir: resolve(import.meta.dirname, "../.."),
  publicDir: false,
  run: {
    tasks: {
      build: {
        command: "vp build",
        dependsOn: ["@cw/app#build"],
        cache: {
          input: [{ auto: true }, { pattern: "!build/**", base: "workspace" }],
          output: [{ pattern: "build/server/**", base: "workspace" }],
        },
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
      external,
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
