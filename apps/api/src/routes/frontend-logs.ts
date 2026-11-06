import { getRequestListener } from "@hono/node-server";
import { Result } from "better-result";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";

import { logFrontendPayload } from "../services/logging.js";

/** Shared ingestion for the API and frontend-only development previews. */
export const frontendLogs: Hono = new Hono();

frontendLogs.post("/", bodyLimit({ maxSize: 16 * 1024 }), async (c) => {
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

export const frontendLogListener: ReturnType<typeof getRequestListener> = getRequestListener(
  frontendLogs.fetch,
);
