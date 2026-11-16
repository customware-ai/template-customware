# App Template

A reusable full-stack starting point for apps built with Customware (CW). Customware is the building platform, not the app's identity; use the product's own name and branding.

Before working in this repository, read [AGENTS.md](./AGENTS.md) and [docs/main.md](./docs/main.md).

## Project

It includes a React 19 and Speedy Router browser app, a Hono and tRPC API, SQLite persistence through Drizzle, a shared package for code used by both applications, and a production build that serves the complete application from one Node process.

The browser foundation includes TanStack Query, Tailwind CSS v4, and shadcn components on Base UI. The repository also provides typed BetterResult error handling, Zod contracts, runtime diagnostics, database migrations, and Vite+ workspace tooling.

## Remove After the Task Is Done

The start page and Notes and Todos API are temporary examples. Replace them rather than extending their domain into the product.

### When implementing the product UI

- The start page Todos panel is a temporary end-to-end example of pagination, quick add, cache refresh, and error mapping; study it, then replace it. It has no sign-in or owner scoping, so real product queries must add the authorization the example leaves out.
- The start page (`apps/app/app/routes/index.tsx`) introduces reusable components in `apps/app/app/components/ui`, including a chart and theme control. Replace it with the product experience.
- Replace the placeholder favicon (`apps/app/public/favicon.svg`) and the `App` page title with the product's own name and mark.
- Do not leave sample copy, sample controls, decorative placeholder behavior, or disconnected screens in the finished UI.
- Remove only the start page's content. Never delete files in `components/ui`, even ones the product does not use yet; later tasks reuse them.

### When implementing application behavior and persistence

- Use the temporary Notes and Todos slice to understand the intended `contract -> query -> service -> tRPC -> TanStack Query` flow and BetterResult boundaries.
- Replace the example contracts, active tables, queries, services, procedures, browser calls, tests, E2E tests, and documentation with the real product domain. No `notes`, `todos`, `listTodos`, `createTodo`, sample records, or related runtime behavior should remain unless the product genuinely requires that exact behavior.
- The template ships no migrations. Design the complete initial product schema in `apps/api/src/db/schemas.ts`, replacing the Notes and Todos tables, then run `pnpm db:generate` once to create the app's first migration; do not generate partial work and stack corrective migrations during the same implementation.
- Records the app needs to open (for example its first site) go in a migration, so `pnpm db:migrate` inserts them everywhere. There is no seed command: the live app and its published copy only run `pnpm db:migrate`, `pnpm build` and `pnpm start`. End-to-end tests use a separate database and create their own test records.

### Before completing the task

- Search the repository for remaining demo, mock, fixture, placeholder, and hard-coded sample behavior and remove it.
- Update the relevant documents under `docs/` and rewrite the rest of this README to describe the implemented product.
- Verify the real product flow, then remove this temporary section itself.
