# Vite+

Vite+ is the repository's unified web toolchain. Its `vp` CLI brings Vite, Rolldown, Vitest, Oxlint, Oxfmt, TypeScript checking, workspace tasks, caching, and Git-hook integration under one configuration. pnpm still defines and installs the workspace.

The repository pins Vite+ `1.7.0` and its matching Vite core alias in the pnpm catalog.

## Commands

- `pnpm dev` starts the app and API development tasks in parallel.
- `pnpm build` asks Vite+ for the deployable build task.
- `pnpm run check` lints and type-checks only application source under `apps/` and `packages/`; repository tests are verified by their own commands.
- `pnpm test` runs the existing tests.
- `pnpm prepare` refreshes Vite+ hooks and agent integration.

`vp <name>` runs a built-in command. `vp run <name>` runs a workspace script or configured task, so check `package.json` and `vite.config.ts` before choosing between them.

## Type Checking and Linting

`pnpm run check` uses the TSRS backend bundled with Vite+. The root Vite configuration enables type-aware linting and compiler diagnostics for the files Oxlint lints. No separate TSRS dependency or backend override is needed.

## Build and Cache

Vite+ caches configured tasks by default. It fingerprints inputs and restores generated outputs on a cache hit. Automatic filesystem tracking discovers reads and writes; explicit output patterns keep ownership correct when tasks share a parent directory.

The build tasks have non-overlapping outputs:

- the app build owns `build/client/**`
- the API build owns `build/server/**`

The API build depends on the app build in the Vite+ task graph. Therefore the single root build command runs or restores the client first, then runs or restores the server.

Do not add `--no-cache`, make both tasks own the same outputs, run these production builds concurrently, or hide build work inside setup scripts. Define new generated work as an owning workspace task with non-overlapping outputs.

## Configuration and References

The root `vite.config.ts` owns formatting and linting. Workspace Vite configs own their build tasks and cache settings. Do not add competing formatter, linter, or hook configuration.

Package placement follows the dependency rule in [code rules](engineering/code-rules.md#code-quality-and-modules).

The server entry point is `build/server/start.js`, started from the repository root by `pnpm start`. Only the shared workspace source is bundled; every other package stays external and Node loads it from the root `node_modules`. The root therefore owns the server's runtime packages, and the API workspace declares only build-time links. Runtime deployments include `build/client`, `build/server`, and the installed production dependencies; install with the frozen lockfile on the target platform so SQLite's native addon matches the runtime, and migrate the database with the root migration command.

Task-specific `input` and `output` settings belong inside each task's `cache` object.

The root `tests/` directory is excluded from linting and type checking, but remains included in formatting and test runs. The project-root `task-workflow/` directory is excluded from lint, the root TypeScript configuration, Vitest discovery, and coverage. Nested directories with that name are not excluded. Application TypeScript projects and Playwright already limit their inputs to their own directories.

Formatting uses Vite+'s defaults. The root formatting block only excludes generated and temporary paths; it does not override style rules.

Verify Vite+ APIs and behavior against the installed-version documentation:

- concise tool overview: `node_modules/vite-plus/AGENTS.md`
- local guide: `node_modules/vite-plus/docs/index.md`
- tasks: `node_modules/vite-plus/docs/guide/run.md`
- caching: `node_modules/vite-plus/docs/guide/cache.md`
- automatic tracking: `node_modules/vite-plus/docs/guide/automatic-data-tracking.md`
- task configuration: `node_modules/vite-plus/docs/config/run.md`
- official documentation: <https://viteplus.dev/guide/>

## Front-end Development

`pnpm --filter @cw/app dev` starts the Vite SPA with React Fast Refresh. `pnpm dev` also starts the API on port 8080; Vite proxies `/health`, `/logs`, and `/trpc` to it. The production build writes the client to `build/client`, where Hono serves it with the SPA fallback.
