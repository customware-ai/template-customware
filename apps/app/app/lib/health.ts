import {
  type HealthResponse,
  type HealthResponseParseError,
  parseHealthResponse,
} from "@template-customware/shared";
import { Result, TaggedError } from "better-result";

export class HealthRequestError extends TaggedError("HealthRequestError")<{
  cause: unknown;
  message: string;
  retryable: boolean;
}> {}

function toHealthRequestError(cause: unknown): HealthRequestError {
  if (cause instanceof HealthRequestError) {
    return cause;
  }

  return new HealthRequestError({
    cause,
    message: cause instanceof Error ? cause.message : "Health request failed.",
    retryable: cause instanceof TypeError,
  });
}

/**
 * Demonstrates a cancellable, bounded retry for an idempotent request.
 */
export function fetchHealth(
  signal: AbortSignal,
): Promise<Result<HealthResponse, HealthRequestError | HealthResponseParseError>> {
  return Result.tryPromise(
    {
      try: async ({ signal: attemptSignal }) => {
        const response = await fetch("/health", { signal: attemptSignal });
        if (!response.ok) {
          throw new HealthRequestError({
            cause: response.status,
            message: `Health request failed with status ${response.status}.`,
            retryable: response.status === 429 || response.status >= 500,
          });
        }

        return response.json() as Promise<unknown>;
      },
      catch: toHealthRequestError,
    },
    {
      signal,
      retry: {
        times: 2,
        delayMs: 150,
        backoff: "exponential",
        jitter: true,
        shouldRetry: (error) => error.retryable,
      },
    },
  ).then(Result.andThen((payload: unknown) => parseHealthResponse(payload)));
}
