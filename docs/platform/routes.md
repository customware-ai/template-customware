# Routes and Endpoints

## Browser Routes

`apps/app/app/routes.ts` is the authoritative React Router route tree. Route module paths are relative to `apps/app/app`.

The current template defines a shared layout with one index route. Follow the complete [React Router guide](../engineering/react-router.md) when adding layouts, routes, navigation, queries, or mutations.

The application runs in SPA mode. Hono serves `build/client/index.html` for unmatched browser routes after API and static-file handling.

## API Endpoints

`apps/api/src/index.ts` owns the Hono application:

- `/trpc/*` is the typed tRPC boundary.
- `POST /logs` receives validated frontend diagnostic events.
- `/health` reports process health.
- static assets are served before the final SPA fallback.

Add domain procedures to the tRPC router and keep Hono-specific endpoints for transport concerns that do not belong in tRPC.

## Route Ordering

Specific API and static routes must be registered before the SPA fallback. Otherwise browser HTML can hide missing API routes. Keep not-found and error logging intact when changing route composition.
