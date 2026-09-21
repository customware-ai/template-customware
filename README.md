# Template Customware

A reusable full-stack Customware template built as a Vite+ monorepo. It preserves the working React Router, Hono, tRPC, Drizzle, SQLite, and component showcase foundation from `template-full-stack` while adopting Customware's workspace and documentation model.

## Stack

- React 19 and React Router 7 in SPA mode
- Tailwind 4 with reusable Radix-based UI primitives
- Hono and tRPC API
- Drizzle with SQLite
- pnpm workspaces and Vite+ 0.3.3
- Vite+ test runtime and Playwright

## Repository Structure

```text
apps/
├── app/                 React Router browser application
└── api/                 Hono, tRPC, services, and SQLite
packages/
└── shared/              source-level shared values and contracts
tests/
├── unit/                focused unit and integration tests
└── e2e/                 isolated Playwright setup
docs/                    current engineering guidance
```

The production build is written to:

```text
build/
├── client/              static SPA files
└── server/              executable Node server
```

## Quick Start

```bash
pnpm install
pnpm db:migrate
pnpm build
pnpm start
```

The default server runs at `http://localhost:8080`.

For development:

```bash
pnpm dev
```

## Commands

| Command            | Purpose                                   |
| ------------------ | ----------------------------------------- |
| `pnpm dev`         | Start app and API development tasks       |
| `pnpm check`       | Generate route types and run Vite+ checks |
| `pnpm format`      | Apply Vite+ formatting                    |
| `pnpm test`        | Run unit and integration tests            |
| `pnpm build`       | Build client and server                   |
| `pnpm start`       | Start the built server                    |
| `pnpm db:generate` | Generate Drizzle migrations               |
| `pnpm db:migrate`  | Apply local SQLite migrations             |
| `pnpm e2e`         | Build and run isolated Playwright tests   |

## Example Application

The root route renders the same component showcase foundation as `template-full-stack`. It demonstrates the shared UI primitives, responsive layouts, themes, forms, overlays, tables, charts, loading states, and navigation patterns that new projects can reuse or replace.

## Documentation Workflow

Read [AGENTS.md](./AGENTS.md) before working in the repository. It is the operational guide and points to the detailed, self-updating documentation under [docs/](./docs/main.md).
