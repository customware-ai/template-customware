/**
 * Node.js Server Startup Script
 *
 * This file starts the Hono server using @hono/node-server.
 * It binds to the specified port and handles graceful shutdown.
 */

import "dotenv/config";
import { serve } from "@hono/node-server";

import { resetDatabaseConnection } from "./db/index.js";
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
const server = serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`✅ Server running at http://localhost:${info.port}`);
  },
);

/**
 * Stops accepting requests, lets active requests finish, then closes SQLite.
 */
let isShuttingDown = false;
function shutdown(signal: NodeJS.Signals): void {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`\n👋 ${signal} received. Shutting down gracefully...`);

  server.close(() => {
    const databaseClose = resetDatabaseConnection();
    if (databaseClose.isErr()) {
      console.error("Failed to close SQLite cleanly:", databaseClose.error);
      process.exitCode = 1;
    }
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
