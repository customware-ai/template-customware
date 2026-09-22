# Routes and Endpoints

## Browser Routes

`apps/app/app/routes.ts` is the authoritative React Router route tree. Route module paths are relative to `apps/app/app`.

The current template defines a shared layout with one index route. Follow the complete [React Router guide](../engineering/react-router.md) when adding layouts, routes, navigation, queries, or mutations.

The application runs in SPA mode. Hono serves `build/client/index.html` for unmatched browser navigations that accept HTML after API and static-file handling. Requests that do not accept HTML return `404`, so missing assets and API-like requests cannot accidentally receive browser HTML while valid route segments containing dots still work.

## API Endpoints

`apps/api/src/index.ts` owns the Hono application:

- `/trpc/*` is the typed tRPC boundary.
- `POST /logs` receives validated frontend diagnostic events.
- `/health` reports process health.
- static assets are served before the final SPA fallback.

The client Vite build emits fast Brotli sidecars for bundled text assets. Hono streams the matching sidecar when the client accepts Brotli. Hashed files under `/assets/` use one-year immutable caching; HTML and unhashed public files use a 120-second cache so deployments become visible quickly.

Hono applies its standard secure response headers except `X-Frame-Options`. Customware previews are embedded from the project's Daytona origin inside the platform Review iframe, so the template must not emit Hono's default `SAMEORIGIN` frame denial. The browser and API otherwise use the same origin in development through the Vite proxy and in production through the combined server, so the API does not expose unrestricted CORS. Process shutdown stops the HTTP server before closing SQLite so active requests can finish cleanly.

Add domain procedures to the tRPC router and keep Hono-specific endpoints for transport concerns that do not belong in tRPC.

The sample `listEstimates` procedure returns bounded cursor pages ordered by estimate number and row ID. Its input accepts a maximum page size of 100 and its output contains `items` plus `nextCursor`. `createEstimate` returns the authoritative created row so the browser can reconcile affected query caches.

## Route Ordering

Specific API routes must be registered before static handling, and static handling must remain before the SPA fallback. Otherwise browser HTML can hide missing API or asset routes. Keep not-found and error logging intact when changing route composition.
