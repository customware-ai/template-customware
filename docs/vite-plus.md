# Vite+

Vite+ is the repository's unified web toolchain. Its `vp` CLI brings Vite, Rolldown, Vitest, Oxlint, Oxfmt, TypeScript checking, workspace tasks, caching, and Git-hook integration under one configuration. pnpm still defines and installs the workspace.

The repository pins Vite+ `1.5.0`; its matching `@voidzero-dev/vite-plus-core` package supplies Vite.

## Commands

- `pnpm dev` starts the app and API development tasks in parallel.
- `pnpm build` asks Vite+ for the deployable build task.
- `pnpm lint` generates React Router types, then lints only application source under `apps/` and `packages/`; repository tests are verified by their own commands.
- `pnpm test` runs the existing tests.
- `pnpm prepare` refreshes Vite+ hooks and agent integration.

`vp <name>` runs a built-in command. `vp run <name>` runs a workspace script or configured task, so check `package.json` and `vite.config.ts` before choosing between them.

## Type Checking and Linting

`pnpm lint` performs type-aware linting and type checking using TSRS, an experimental Rust port of the TypeScript compiler and language server. The root Vite configuration selects the installed `tsrs-lint` launcher as Oxlint’s type-aware backend via `OXLINT_TSGOLINT_PATH`; this applies to `vp lint` and `vp check` when they load the root configuration. TSRS can differ from the reference compiler. Some third-party dependencies still install the `typescript` package as a peer, and Vite+ bundles a Go lint backend; neither is selected for the project’s checking or linting. Oxlint rule names retain their `typescript/` prefix because that is the linter’s public rule namespace.

## Build and Cache

Vite+ caches configured tasks by default. It fingerprints inputs and restores generated outputs on a cache hit. Automatic filesystem tracking discovers reads and writes; explicit output patterns keep ownership correct when tasks share a parent directory.

The build tasks have non-overlapping outputs:

- the app build owns `build/client/**`
- the API build owns `apps/api/dist/**`
- route type generation owns `apps/app/.react-router/**`

The API build depends on the app build in the Vite+ task graph. Therefore the single root build command runs or restores the client first, then runs or restores the server. React Router also creates `build/server/index.js` as a prerendering intermediate for the SPA; it is not the production API server.

Do not add `--no-cache`, make both tasks own the same outputs, run these production builds concurrently, or hide build work inside setup scripts. Define new generated work as an owning workspace task with non-overlapping outputs.

## Configuration and References

The root `vite.config.ts` owns formatting, linting, staged checks, and the repository cache policy. Workspace Vite configs own their tasks and builds. Do not add competing formatter, linter, or hook configuration.

The pnpm catalog centralizes versions shared by workspace manifests and the root TSRS version. Other dependencies used by only one workspace pin their versions in that workspace's `package.json`; catalog additions are explicit rather than automatic. Each importing workspace declares its own dependencies. The root declares the API workspace as a runtime dependency because it runs the built server.

The server entry point is `apps/api/dist/start.js`. Its third-party dependencies remain external, so Node resolves them from the API workspace's installed dependencies, including SQLite's native module. The shared TypeScript workspace source is compiled into the server. Runtime deployments must include the server output and the API workspace's production dependencies alongside `build/client`; installing the root workspace and its dependencies includes the API workspace.

For an isolated production API package, build first, then run `pnpm --filter @cw/api --prod deploy <target>`. The deployed package contains `dist/start.js`, the API source and its production dependencies. It does not include the client or the root migration command: supply `build/client` and a database migrated by the workspace's migration process before starting it from the target directory.

Task-specific `input` and `output` settings belong inside each task's `cache` object in Vite+ 1.5.

Only the project-root `task-workflow/` directory is excluded from lint, the root TypeScript configuration, Vitest discovery, and coverage. Nested directories with that name are not excluded. Application TypeScript projects and Playwright already limit their inputs to their own directories, so they need no additional exclusions.

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

`pnpm --filter @cw/app dev` runs only the browser app, with React Router owning development React transforms and Fast Refresh. The standalone React plugin and React Compiler run only for production builds; enabling both refresh implementations in development redeclares `RefreshRuntime` and prevents the app from loading. Production builds retain React Compiler optimization.

`ssr.noExternal` is build-only. Development leaves package dependencies external so the React Router dev server can load CommonJS packages such as React through Node rather than executing them as unconverted ES modules. Production prerender previews bind explicitly to `127.0.0.1` to keep their listener and requests on the same address family.

The full `pnpm dev` command additionally starts the API on 8080. The front-end-only command needs local mock data when no API is running. UI-only sandbox previews set `import.meta.env.VITE_UI_ONLY` to `"true"` in their runtime Vite configuration; the teaching catalog then omits its real API health probe and Todos example. Normal root development still runs these examples against the API. The runtime also mounts the shared frontend log listener before React Router, without launching the product API. A sandbox may select its own front-end host and port with `--host 0.0.0.0 --port 8080 --strictPort`; its public proxy must also configure the allowed hostname and WebSocket HMR origin.
