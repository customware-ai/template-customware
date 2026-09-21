# Vite+

This repository uses Vite+ as the unified toolchain on top of pnpm workspaces. The repository currently pins Vite+ `0.3.3`; Vite is supplied through the matching `@voidzero-dev/vite-plus-core` package.

## Common Commands

- `vp install` installs workspace dependencies with the configured package manager.
- `vp config` refreshes Vite+ hooks and agent integration.
- `vp staged` checks staged files through the configured hook.
- `vp check` runs formatting, linting, and TypeScript diagnostics.
- `vp fmt` applies formatting.
- `vp test` runs tests using the Vite+ test runtime.
- `vp run <script>` runs scripts across the workspace task graph.

Use `vp run <script>` when a package script has the same name as a Vite+ built-in command.

## Monorepo Ownership

pnpm defines the workspace graph. Vite+ executes and caches tasks in that graph. Root scripts use filters so frontend and backend tasks run in their owning workspace:

```bash
vp run --no-cache --filter ./apps/app build
vp run --no-cache --filter ./apps/api build
```

Build and route-type generation deliberately disable task-result caching because they own generated files. A successful command must materialize those files even if another build cleaned the shared output directory. Do not duplicate a workspace task at the root when a small filtered root script can expose it.

## Formatting and Linting

The root `vite.config.ts` is the single formatting and linting configuration. Do not add separate Oxlint, Oxfmt, lint-staged, Husky, or commitlint configuration.

Generated output, nested `node_modules`, React Router type output, and local `tmp/` evidence are excluded. Source workspaces and tests remain checked.

## Hooks

`pnpm prepare` runs `vp config`. The generated Vite+ hooks use the root `staged` configuration. Refresh hooks after changing Vite+ configuration.
