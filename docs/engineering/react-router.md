# React Router v8

This application uses React Router's **Framework Mode** for a client-rendered SPA. React Router owns URLs, route hierarchy, navigation, route modules, and generated route types. tRPC with TanStack Query owns server data.

## Current v8 Repository Model

This is not an upgrade guide: the repository already uses React Router 8. The comparison exists only because agents may know the older v6 APIs better. React Router v6 training commonly assumes a JSX tree built with `BrowserRouter`, `Routes`, and `Route`; do not add that second routing system here. Framework Mode instead uses:

- the React Router Vite plugin
- one route tree in `apps/app/app/routes.ts`
- route and layout modules under `apps/app/app/`
- generated route-specific types under `apps/app/.react-router/`
- automatic route-module code splitting

`apps/app/react-router.config.ts` sets `ssr: false`, so this remains a browser-rendered SPA. Framework Mode does not imply server rendering.

## Current v8 Behavior

These are current repository constraints, not migration instructions. Framework and browser APIs come from `react-router`; React Router 8 does not use the `react-router-dom` compatibility package, is ESM-only, and targets ES2022. Import shared APIs from `react-router` and a DOM-only API from `react-router/dom` when necessary.

Version 8 also makes its former future flags standard behavior. Middleware, split route modules, and the Vite Environment API are enabled by default; request and trailing-slash behavior follow the v8 contracts. Do not add removed future flags or v6/v7 compatibility APIs.

## Repository Rules

- Define the route tree only in `apps/app/app/routes.ts` with helpers from `@react-router/dev/routes`.
- Use layout modules with `Outlet` for shared shells.
- Import route-generated types from the route's `./+types/...` module instead of duplicating parameter shapes.
- Use `Link` or `NavLink` for user navigation and `useNavigate` for navigation caused by application logic.
- Use the installed `@trpc/react-query` hooks for API work: `useQuery` for bounded reads, `useInfiniteQuery` for cursor pages, `useMutation` for writes, `useUtils` for cache updates, and prefetch hooks for likely navigation.
- Let TanStack Query own server-state caching, background refresh, pagination, optimistic updates, and invalidation. Do not mirror its data into component state or introduce React Router loaders, actions, or manual fetch-and-refresh flows as a second server-state system.
- Keep `ssr: false` unless the rendering architecture is deliberately changed.
- Run `pnpm check` after changing routes so route types are regenerated.

## Authoritative References

Use the documentation for the installed version before relying on older training knowledge:

- local index: `node_modules/react-router/docs/index.md`
- modes: `node_modules/react-router/docs/start/modes.md`
- Framework Mode routing: `node_modules/react-router/docs/start/framework/routing.md`
- route modules: `node_modules/react-router/docs/start/framework/route-module.md`
- type safety: `node_modules/react-router/docs/explanation/type-safety.md`
- installed tRPC React Query API: `node_modules/@trpc/react-query/README.md` and its shipped type declarations
- official documentation: <https://reactrouter.com/>
