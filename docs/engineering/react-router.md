# React Router v8

This application uses React Router's **Framework Mode** for a client-rendered SPA. React Router owns URLs, route hierarchy, navigation, route modules, and generated route types. tRPC with TanStack Query owns server data.

## From v6 to This Repository

React Router v6 training commonly assumes a JSX tree built with `BrowserRouter`, `Routes`, and `Route`. Do not add that second routing system here. Framework Mode instead uses:

- the React Router Vite plugin
- one route tree in `apps/app/app/routes.ts`
- route and layout modules under `apps/app/app/`
- generated route-specific types under `apps/app/.react-router/`
- automatic route-module code splitting

`apps/app/react-router.config.ts` sets `ssr: false`, so this remains a browser-rendered SPA. Framework Mode does not imply server rendering.

## Important v7 and v8 Changes

Version 7 consolidated the framework and browser APIs into `react-router`. Version 8 removes the `react-router-dom` compatibility package, is ESM-only, and targets ES2022. Import shared APIs from `react-router` and a DOM-only API from `react-router/dom` when necessary.

Version 8 also makes its former future flags standard behavior. Middleware, split route modules, and the Vite Environment API are enabled by default; request and trailing-slash behavior follow the v8 contracts. Do not add removed future flags or v6/v7 compatibility APIs.

## Repository Rules

- Define the route tree only in `apps/app/app/routes.ts` with helpers from `@react-router/dev/routes`.
- Use layout modules with `Outlet` for shared shells.
- Import route-generated types from the route's `./+types/...` module instead of duplicating parameter shapes.
- Use `Link` or `NavLink` for user navigation and `useNavigate` for navigation caused by application logic.
- Use tRPC TanStack Query hooks for API reads and writes; do not introduce React Router loaders or actions as a second server-state system.
- Keep `ssr: false` unless the rendering architecture is deliberately changed.
- Run `pnpm check` after changing routes so route types are regenerated.

## Authoritative References

Use the documentation for the installed version before relying on older training knowledge:

- local index: `node_modules/react-router/docs/index.md`
- modes: `node_modules/react-router/docs/start/modes.md`
- Framework Mode routing: `node_modules/react-router/docs/start/framework/routing.md`
- route modules: `node_modules/react-router/docs/start/framework/route-module.md`
- type safety: `node_modules/react-router/docs/explanation/type-safety.md`
- v8 upgrade notes: `node_modules/react-router/docs/upgrading/v7.md`
- official documentation: <https://reactrouter.com/>
