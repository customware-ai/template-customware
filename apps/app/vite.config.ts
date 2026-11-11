import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { brotliCompressSync, constants } from "node:zlib";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite-plus";

const COMPRESSIBLE_ASSET = /\.(?:css|html|js|json|mjs|svg|txt|xml)$/i;

/** Emit fast Brotli sidecars as part of the cacheable client build. */
function brotliAssets(): Plugin {
  return {
    name: "brotli-assets",
    enforce: "post",
    apply: "build",
    writeBundle(options, bundle): void {
      if (this.environment.config.consumer !== "client") {
        return;
      }

      for (const output of Object.values(bundle)) {
        if (
          !options.dir ||
          output.fileName.startsWith(".vite/") ||
          !COMPRESSIBLE_ASSET.test(output.fileName)
        ) {
          continue;
        }

        const filePath = resolve(import.meta.dirname, options.dir, output.fileName);
        const source = readFileSync(filePath);
        const compressed = brotliCompressSync(source, {
          params: {
            [constants.BROTLI_PARAM_QUALITY]: 5,
          },
        });

        if (compressed.byteLength < Buffer.byteLength(source)) {
          writeFileSync(`${filePath}.br`, compressed);
        }
      }
    },
  };
}

export default defineConfig(({ command }) => ({
  run: {
    tasks: {
      build: {
        command: "vp build",
        cache: {
          input: [{ auto: true }, "!dist/**"],
          output: ["dist/**"],
        },
      },
    },
  },
  server: {
    proxy: {
      "/health": "http://localhost:8080",
      "/logs": "http://localhost:8080",
      "/trpc": "http://localhost:8080",
    },
  },
  build: {
    chunkSizeWarningLimit: 200,
    emptyOutDir: true,
    outDir: "dist",
  },
  plugins: [tailwindcss(), react({ compiler: command === "build" }), brotliAssets()],
  resolve: {
    tsconfigPaths: true,
  },
  preview: { host: "127.0.0.1" },
}));
