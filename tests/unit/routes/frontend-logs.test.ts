import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import app from "../../../apps/api/src/index.js";
import { frontendLogs } from "../../../apps/api/src/routes/frontend-logs.js";

let directory: string;
let logFile: string;

beforeEach(() => {
  directory = mkdtempSync(path.join(tmpdir(), "frontend-logs-test-"));
  logFile = path.join(directory, "runtime.log");
  vi.stubEnv("RUNTIME_LOG_FILE_PATH", logFile);
});

afterEach(() => {
  vi.unstubAllEnvs();
  rmSync(directory, { recursive: true, force: true });
});

/** Sends a JSON log request to the shared route. */
function post(body: string): Promise<Response> {
  return app.request("/logs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": String(Buffer.byteLength(body)),
    },
    body,
  });
}

describe("frontend log limits", () => {
  it("accepts and persists a message at the character limit", async () => {
    const response = await post(JSON.stringify({ source: "app", message: "x".repeat(4096) }));

    expect(response.status).toBe(200);
    expect(readFileSync(logFile, "utf8")).toContain("x".repeat(4096));
  });

  it("rejects a message longer than the character limit", async () => {
    const response = await post(JSON.stringify({ source: "app", message: "x".repeat(4097) }));

    expect(response.status).toBe(400);
    expect(existsSync(logFile)).toBe(false);
  });

  it("accepts a request exactly at the byte limit", async () => {
    const base = { source: "app", message: "ok", context: { padding: "" } };
    base.context.padding = "x".repeat(16 * 1024 - Buffer.byteLength(JSON.stringify(base)));
    const body = JSON.stringify(base);

    expect(Buffer.byteLength(body)).toBe(16 * 1024);
    expect((await post(body)).status).toBe(200);
  });

  it("rejects a request over the byte limit before parsing", async () => {
    const response = await post("x".repeat(16 * 1024 + 1));

    expect(response.status).toBe(413);
    expect(existsSync(logFile)).toBe(false);
  });

  it("rejects oversized requests when the shared route runs independently", async () => {
    const response = await frontendLogs.request("/", {
      method: "POST",
      body: "x".repeat(16 * 1024 + 1),
    });

    expect(response.status).toBe(413);
    expect(existsSync(logFile)).toBe(false);
  });

  it("rejects an oversized stream without a content-length header", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(16 * 1024));
        controller.enqueue(new Uint8Array(1));
        controller.close();
      },
    });
    const request = new Request("http://localhost/logs", {
      method: "POST",
      body: stream,
      duplex: "half",
    } as RequestInit & { duplex: "half" });
    const response = await app.request(request);

    expect(response.status).toBe(413);
    expect(existsSync(logFile)).toBe(false);
  });
});
