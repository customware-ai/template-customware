/**
 * Node.js Server Startup Script
 *
 * This file starts the Hono server using @hono/node-server.
 * It binds to the specified port and handles graceful shutdown.
 */

import "dotenv/config";
import { serve } from "@hono/node-server";

import app from "./index.js";
import { resolveServerPort } from "./utils/env.js";

/**
 * Port resolution stays centralized so runtime env behavior is consistent in
 * local development, production startup, and tests.
 */
const PORT = resolveServerPort(process.env);

console.log(`📡 tRPC endpoint: http://localhost:${PORT}/trpc`);
console.log(`🏥 Health check: http://localhost:${PORT}/health`);

/**
 * Start the Hono server
 */
serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`✅ Server running at http://localhost:${info.port}`);
  },
);

/**
 * Graceful shutdown on SIGINT/SIGTERM
 */
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n👋 Shutting down gracefully...");
  process.exit(0);
});
