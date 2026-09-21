import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
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
  },
  plugins: [tailwindcss(), reactRouter(), react({ compiler: true })],
  resolve: {
    tsconfigPaths: true,
  },
  ssr: {
    noExternal: true,
  },
});
