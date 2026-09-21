# Routes and Endpoints

## Browser Routes

`apps/app/app/routes.ts` is the authoritative React Router route tree. Route module paths are relative to `apps/app/app`.

The current template defines a shared layout with one index route. Follow the complete [React Router guide](../engineering/react-router.md) when adding layouts, routes, navigation, queries, or mutations.

The application runs in SPA mode. Hono serves `build/client/index.html` for unmatched browser routes after API and static-file handling. Missing `/assets` paths and extension-bearing file paths return `404` instead of falling through to browser HTML.

## API Endpoints

`apps/api/src/index.ts` owns the Hono application:

- `/trpc/*` is the typed tRPC boundary.
- `POST /logs` receives validated frontend diagnostic events.
- `/health` reports process health.
- static assets are served before the final SPA fallback.

The client Vite build emits fast Brotli sidecars for bundled text assets. Hono streams the matching sidecar when the client accepts Brotli. Hashed files under `/assets/` use one-year immutable caching; HTML and unhashed public files use a 120-second cache so deployments become visible quickly.

Hono applies its standard secure response headers. The browser and API use the same origin in development through the Vite proxy and in production through the combined server, so the API does not expose unrestricted CORS. Process shutdown stops the HTTP server before closing SQLite so active requests can finish cleanly.

Add domain procedures to the tRPC router and keep Hono-specific endpoints for transport concerns that do not belong in tRPC.

## Route Ordering

Specific API routes must be registered before static handling, and static handling must remain before the SPA fallback. Otherwise browser HTML can hide missing API or asset routes. Keep not-found and error logging intact when changing route composition.
