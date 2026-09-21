# Observability

The template keeps local frontend and backend failures in the ignored root `.runtime.logs` file.

## Frontend

`apps/app/app/utils/error-logger.ts` attaches global browser error and unhandled-rejection listeners. It sends structured events to `POST /logs`.

## Backend

`apps/api/src/services/logging.ts` validates, formats, and bounds the local log file. `apps/api/src/index.ts` installs process handlers and records route-level errors and missing endpoints.

## Debugging Workflow

1. Reproduce the issue once.
2. Read `.runtime.logs` before adding diagnostics.
3. Use the request path, source, timestamp, and stack metadata to isolate the owning boundary.
4. Remove temporary instrumentation after verifying the root-cause fix.

Never write credentials or sensitive payloads to logs. Keep `.runtime.logs` ignored.
