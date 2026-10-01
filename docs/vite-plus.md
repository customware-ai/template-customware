# Vite+

Vite+ is the repository's unified web toolchain. Its `vp` CLI brings Vite, Rolldown, Vitest, Oxlint, Oxfmt, TypeScript checking, workspace tasks, caching, and Git-hook integration under one configuration. pnpm still defines and installs the workspace.

The repository pins Vite+ `0.3.3`; its matching `@voidzero-dev/vite-plus-core` package supplies Vite.

## Commands

- `pnpm dev` starts the app and API development tasks in parallel.
- `pnpm build` asks Vite+ for the deployable build task.
- `pnpm lint` generates React Router types, then lints only application source under `apps/` and `packages/`; repository tests are verified by their own commands.
- `pnpm test` runs the existing tests.
- `pnpm prepare` refreshes Vite+ hooks and agent integration.

`vp <name>` runs a built-in command. `vp run <name>` runs a workspace script or configured task, so check `package.json` and `vite.config.ts` before choosing between them.

## Build and Cache

Vite+ caches configured tasks by default. It fingerprints inputs and restores generated outputs on a cache hit. Automatic filesystem tracking discovers reads and writes; explicit output patterns keep ownership correct when tasks share a parent directory.

The deployable paths are a stable external contract:

- the app build owns `build/client/**`
- the API build owns `build/server/**`
- route type generation owns `apps/app/.react-router/**`

The API build depends on the app build in the Vite+ task graph. Therefore the single root build command runs or restores the client first, then runs or restores the server. This keeps both outputs synchronized without a shell orchestration script and without moving the `build/` directory.

Do not add `--no-cache`, make both tasks own all of `build/**`, run these production builds concurrently, or hide build work inside setup scripts. Define new generated work as an owning workspace task with non-overlapping outputs.

## Configuration and References

The root `vite.config.ts` owns formatting, linting, staged checks, and the repository cache policy. Workspace Vite configs own their tasks and builds. Do not add competing formatter, linter, or hook configuration.

Formatting uses Vite+'s defaults. The root formatting block only excludes generated and temporary paths; it does not override style rules.

Use the installed-version documentation before relying on memory:

- concise tool overview: `node_modules/vite-plus/AGENTS.md`
- local guide: `node_modules/vite-plus/docs/index.md`
- tasks: `node_modules/vite-plus/docs/guide/run.md`
- caching: `node_modules/vite-plus/docs/guide/cache.md`
- automatic tracking: `node_modules/vite-plus/docs/guide/automatic-data-tracking.md`
- task configuration: `node_modules/vite-plus/docs/config/run.md`
- official documentation: <https://viteplus.dev/guide/>

## Front-end Development

`pnpm --filter @template-customware/app dev` runs only the browser app, with React Router owning development React transforms and Fast Refresh. The standalone React plugin and React Compiler run only for production builds; enabling both refresh implementations in development redeclares `RefreshRuntime` and prevents the app from loading. Production builds retain React Compiler optimization.

`ssr.noExternal` is build-only. Development leaves package dependencies external so the React Router dev server can load CommonJS packages such as React through Node rather than executing them as unconverted ES modules. Production prerender previews bind explicitly to `127.0.0.1` to keep their listener and requests on the same address family.

The full `pnpm dev` command additionally starts the API on 8080. The front-end-only command needs local mock data when no API is running. UI-only sandbox previews set `import.meta.env.VITE_UI_ONLY` to `"true"` in their runtime Vite configuration; the teaching catalog then omits its real API health probe and Todos example. Normal root development still runs these examples against the API. The runtime also mounts the shared frontend log listener before React Router, without launching the product API. A sandbox may select its own front-end host and port with `--host 0.0.0.0 --port 8080 --strictPort`; its public proxy must also configure the allowed hostname and WebSocket HMR origin.
