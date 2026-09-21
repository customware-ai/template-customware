# Template Customware

Template Customware is the reusable full-stack starting point for Customware projects. It combines the application and API foundation from `template-full-stack` with Customware's pnpm workspace, Vite+, and self-updating documentation model.

## Implemented Foundation

- React 19 SPA with React Router 8, TanStack Query, shadcn Base UI components, and Tailwind CSS v4
- Hono API with typed tRPC procedures
- SQLite persistence with Drizzle migrations
- pnpm workspaces for `apps/*` and `packages/*`
- source-level shared contracts under `packages/shared`
- BetterResult contracts and mapped failure handling across browser, shared, and API code
- Zod 4.6 contracts with lazy server compilation; browser schemas keep the standard parser to avoid an 8 KB gzipped compiler payload and `new Function` CSP requirement
- Vite+ formatting, linting, type checking, task orchestration, and hooks
- frontend and backend diagnostic logging to ignored `.runtime.logs`
- one deployable output containing `build/client` and `build/server`

## Repository Map

- `apps/app/` — browser routes, layouts, UI primitives, and frontend runtime
- `apps/api/` — Hono server, tRPC procedures, services, contracts, and database ownership
- `packages/shared/` — pure values and contracts shared by the applications
- `tests/` — the baseline's existing unit, integration, and isolated Playwright support
- `docs/` — current engineering, platform, and design guidance

## Documentation Index

### Engineering

- [Code Rules](./engineering/code-rules.md)
- [Application Design](./engineering/application-design.md)
- [React Router](./engineering/react-router.md)
- [Observability](./engineering/observability.md)
- [Vite+](./vite-plus.md)

### Platform

- [Routes and Endpoints](./platform/routes.md)

### Design

- [Design and User Experience](./design/design.md)

Create additional focused documents under `engineering/`, `platform/`, `design/`, or `agents/` only when the application gains a real subject that needs them. Do not add placeholder documents for systems that do not exist.

## Documentation Workflow

Documentation describes the current implementation, not an aspirational system. Task-maintained documents must remove obsolete values, add new behavior, and update changed behavior in the same task.

For dependency behavior, treat the installed version as the source of truth. Inspect its documentation, type declarations, and JavaScript implementation under `node_modules/` rather than guessing unfamiliar APIs, and use the package's official documentation for additional context.

`docs/engineering/code-rules.md` and `docs/engineering/application-design.md` are system-admin-owned and read-only for autonomous task agents. `AGENTS.md` remains the concise operational entry point and links here rather than duplicating detailed guidance.
