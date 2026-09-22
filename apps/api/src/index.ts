/**
 * Hono Server Entry Point
 *
 * This file creates the Hono HTTP server that:
 * 1. Serves static frontend assets from ../client/ (relative to server)
 * 2. Handles tRPC API requests at /trpc/*
 * 3. Captures frontend and backend error events
 * 4. Falls back to index.html for client-side routing
 *
 * Architecture:
 * - Hono handles HTTP routing and middleware
 * - tRPC provides type-safe API endpoints
 * - React Router handles client-side routing
 */

import "zod/compile";
import * as fs from "node:fs";
import * as path from "node:path";

import { serveStatic } from "@hono/node-server/serve-static";
import { trpcServer } from "@hono/trpc-server";
import { APP_NAME, type HealthResponse } from "@template-customware/shared";
import { Result } from "better-result";
import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";

import {
  installProcessErrorHandlers,
  logFrontendPayload,
  logServerPayload,
} from "./services/logging.js";
import { appRouter } from "./trpc/router.js";

const CLIENT_DIR = path.resolve(process.cwd(), "build", "client");
const SHORT_STATIC_CACHE = "max-age=120";
const IMMUTABLE_ASSET_CACHE = "public, max-age=31536000, immutable";

function getStaticCacheControl(filePath: string): string {
  const normalizedPath = filePath.split(path.sep).join("/");

  if (normalizedPath.includes("/assets/")) {
    return IMMUTABLE_ASSET_CACHE;
  }

  return SHORT_STATIC_CACHE;
}

function acceptsHtml(acceptHeader: string | undefined): boolean {
  return (
    acceptHeader
      ?.split(",")
      .some((value) => value.split(";", 1)[0]?.trim().toLowerCase() === "text/html") ?? false
  );
}

const app = new Hono();
/**
 * @critical
 * @description
 * Bootstraps process-level exception/rejection logging so server crashes
 * and unhandled promise failures are persisted to `.runtime.logs`.
 * @important
 * Do NOT remove this call. Without it, fatal backend failures bypass logging.
 */
installProcessErrorHandlers();

// ============================================================
// MIDDLEWARE
// ============================================================

app.use("/*", secureHeaders({ xFrameOptions: false }));

// ============================================================
// tRPC API ENDPOINT
// ============================================================

/**
 * Mount tRPC router at /trpc/*
 * All API calls will go through this endpoint
 */
app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
  }),
);

// ============================================================
// FRONTEND ERROR INGESTION
// ============================================================

/**
 * @critical
 * @description
 * Browser logs hit this endpoint directly.
 * Keep this route and body schema in place so frontend errors are persisted.
 * This is part of the central `.runtime.logs` capture pipeline.
 * @important
 * Do NOT remove this endpoint (`POST /logs`).
 */
app.post("/logs", async (c) => {
  const payload = await Result.tryPromise(() => c.req.json());
  if (payload.isErr()) {
    return c.json({ message: "Invalid JSON payload for /logs." }, 400);
  }

  const result = logFrontendPayload(payload.value);
  if (result.isErr()) {
    const status = result.error.type === "LOG_VALIDATION_ERROR" ? 400 : 500;
    return c.json({ message: result.error.message }, status);
  }

  return c.json({ ok: true });
});

// ============================================================
// HEALTH CHECK
// ============================================================

/** Health checks bypass static-file lookup. */
app.get("/health", (c) => {
  const response: HealthResponse = {
    name: APP_NAME,
    status: "ok",
    timestamp: new Date().toISOString(),
  };

  return c.json(response);
});

// ============================================================
// STATIC FILE SERVING
// ============================================================

/**
 * Serve built client files from the client directory.
 * This includes Vite assets, public files, images, fonts, favicon, etc.
 * Keep cache headers and precompressed asset support here: production apps
 * need hashed assets to be cacheable while HTML stays quickly refreshable.
 */
app.use(
  "/*",
  serveStatic({
    root: CLIENT_DIR,
    precompressed: true,
    onFound(filePath, c) {
      c.header("Cache-Control", getStaticCacheControl(filePath));
    },
  }),
);

// ============================================================
// GLOBAL ERROR HANDLING
// ============================================================

/**
 * Centralized server error handler for unhandled app exceptions.
 *
 * @critical
 * @description
 * Logs unhandled route/middleware-level server errors to `.runtime.logs`.
 * Removing this loses server-side exception visibility and breaks parity with
 * frontend logging.
 */
app.onError((error, c) => {
  logServerPayload({
    source: "server",
    level: "error",
    message: error instanceof Error ? error.message : "Unhandled server error.",
    context: {
      stack: error instanceof Error ? error.stack : undefined,
      path: c.req.path,
      method: c.req.method,
    },
    page_url: c.req.url,
  }).unwrapOr(undefined);

  return c.text("Internal Server Error", 500);
});

/**
 * Capture missing routes to keep routing gaps visible for debugging.
 *
 * @critical
 * @description
 * Logs not-found requests to `.runtime.logs` to keep traceability of
 * unexpected client calls and routing issues.
 * @important
 * Do NOT remove this handler; it is part of expected observability coverage.
 */
app.notFound((c) => {
  logServerPayload({
    source: "server",
    level: "warn",
    message: `No route handler found for ${c.req.method} ${c.req.path}`,
    context: {
      path: c.req.path,
      method: c.req.method,
      url: c.req.url,
    },
    page_url: c.req.url,
  }).unwrapOr(undefined);

  return c.text("Not Found", 404);
});

// ============================================================
// SPA FALLBACK
// ============================================================

/**
 * Catch-all route for client-side routing
 * Returns index.html for any route not matched above
 * This allows React Router to handle client-side navigation
 */
app.get("*", (c) => {
  if (!acceptsHtml(c.req.header("Accept"))) {
    return c.notFound();
  }

  const indexPath = path.join(CLIENT_DIR, "index.html");

  if (!fs.existsSync(indexPath)) {
    return c.text("Application not built. Run 'pnpm build' first.", 500);
  }

  c.header("Cache-Control", SHORT_STATIC_CACHE);
  const html = Result.try(() => fs.readFileSync(indexPath, "utf-8"));
  return html.match({
    ok: (content) => c.html(content),
    err: () => c.text("Unable to read the application entry point.", 500),
  });
});

export default app;
