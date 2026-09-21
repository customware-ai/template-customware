"use client";

import { Result } from "better-result";

type FrontendLogLevel = "debug" | "info" | "warn" | "error";

interface ErrorLoggerOptions {
  endpoint?: string;
  fetchImpl?: typeof fetch;
}

interface ErrorContext {
  eventType: "window-error" | "document-error" | "unhandled-rejection";
  filename?: string;
  line?: number;
  column?: number;
  target?: string;
  stack?: string;
  reason?: unknown;
}

interface FrontendLogPayload {
  source: "app";
  level: FrontendLogLevel;
  message: string;
  timestamp: string;
  page_url: string;
  context: Record<string, unknown>;
}

const defaultLoggerOptions: Required<Pick<ErrorLoggerOptions, "endpoint">> = {
  endpoint: "/logs",
};

function normalizeErrorContext(event: Event, eventType: ErrorContext["eventType"]): ErrorContext {
  const eventTarget = event.target;
  const targetNodeName = eventTarget instanceof Element ? eventTarget.nodeName : undefined;
  const errorEvent = event instanceof ErrorEvent ? event : undefined;

  return {
    eventType,
    filename: errorEvent?.filename,
    line: errorEvent?.lineno,
    column: errorEvent?.colno,
    target: targetNodeName,
    stack: errorEvent?.error instanceof Error ? errorEvent.error.stack : undefined,
  };
}

function normalizeRejectionContext(reason: unknown): ErrorContext {
  if (reason instanceof Error) {
    return {
      eventType: "unhandled-rejection",
      reason: {
        name: reason.name,
        message: reason.message,
        stack: reason.stack,
      },
    };
  }

  return {
    eventType: "unhandled-rejection",
    reason,
  };
}

function buildLogPayload(message: string, context: ErrorContext): FrontendLogPayload {
  return {
    source: "app",
    level: "error",
    message,
    timestamp: new Date().toISOString(),
    page_url: window.location.href,
    context: context as unknown as Record<string, unknown>,
  };
}

/**
 * Sends a single app error payload to backend logging endpoint.
 */
export function sendFrontendLog(
  payload: FrontendLogPayload,
  fetchImpl: typeof fetch,
  endpoint: string,
): Promise<Result<void, Error>> {
  return Result.tryPromise({
    try: () =>
      fetchImpl(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        keepalive: true,
      }),
    catch: (cause) => (cause instanceof Error ? cause : new Error(String(cause))),
  }).then(
    Result.andThen((response) =>
      response.ok
        ? Result.ok(undefined)
        : Result.err(new Error(`Frontend log request failed with status ${response.status}.`)),
    ),
  );
}

function dispatchFrontendLog(
  payload: FrontendLogPayload,
  fetchImpl: typeof fetch,
  endpoint: string,
): void {
  void sendFrontendLog(payload, fetchImpl, endpoint).then((result): void => {
    if (result.isErr()) {
      console.warn("Failed to forward frontend log.", { error: result.error });
    }
  });
}

/**
 * Converts untyped error input into a typed payload and dispatches to backend.
 */
export function logFrontendError(
  message: string,
  context: Record<string, unknown>,
  options?: ErrorLoggerOptions,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedContext: ErrorContext = {
    eventType: "window-error",
    reason: context,
  };

  const payload = buildLogPayload(message, normalizedContext);
  const finalOptions = {
    endpoint: options?.endpoint ?? defaultLoggerOptions.endpoint,
    fetchImpl: options?.fetchImpl ?? window.fetch,
  };

  dispatchFrontendLog(payload, finalOptions.fetchImpl, finalOptions.endpoint);
}

/**
 * Attach browser error handlers to window + document and async rejection hook.
 * Returns a cleanup function for predictable listener lifecycle.
 */
export function attachGlobalFrontendErrorHandlers(options: ErrorLoggerOptions = {}): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const finalOptions = {
    endpoint: options.endpoint ?? defaultLoggerOptions.endpoint,
    fetchImpl: options.fetchImpl ?? window.fetch,
  };

  const errorHandler = (event: Event): void => {
    const isScriptError = event instanceof ErrorEvent;
    const context = normalizeErrorContext(event, isScriptError ? "window-error" : "document-error");
    const message = isScriptError
      ? event.message || `Window error: ${context.filename ?? "unknown source"}`
      : `Document error: ${context.target ?? "unknown target"}`;
    dispatchFrontendLog(
      buildLogPayload(message, context),
      finalOptions.fetchImpl,
      finalOptions.endpoint,
    );
  };

  const rejectionHandler = (event: PromiseRejectionEvent): void => {
    const context = normalizeRejectionContext(event.reason);
    const message =
      event.reason instanceof Error
        ? event.reason.message
        : `Unhandled promise rejection: ${String(event.reason)}`;

    dispatchFrontendLog(
      buildLogPayload(message, context),
      finalOptions.fetchImpl,
      finalOptions.endpoint,
    );
  };

  // Capture handles both script errors and resource-load failures without a
  // duplicate document listener.
  window.addEventListener("error", errorHandler, true);
  window.addEventListener("unhandledrejection", rejectionHandler);

  return () => {
    window.removeEventListener("error", errorHandler, true);
    window.removeEventListener("unhandledrejection", rejectionHandler);
  };
}
