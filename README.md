# Template Customware

A reusable full-stack starting point for building Customware applications.

Before working in this repository, read [AGENTS.md](./AGENTS.md) and [docs/main.md](./docs/main.md).

## Project

It includes a React 19 and React Router 8 browser app, a Hono and tRPC API, SQLite persistence through Drizzle, a shared package for code used by both applications, and a production build that serves the complete application from one Node process.

The browser foundation includes TanStack Query, Tailwind CSS v4, and shadcn components on Base UI. The repository also provides typed BetterResult error handling, Zod contracts, runtime diagnostics, database migrations, and Vite+ workspace tooling.

## Remove After the Task Is Done

The shipped UI catalog and Notes and Todos API are temporary examples. Study their patterns, then replace them rather than extending their domain into the product.

### When implementing the product UI

- Use `apps/app/app/components/Demo.tsx` and `components/demo/` to understand the available UI components, loading states, lazy boundaries, and interaction patterns.
- Replace the `<Demo />` route mount with the approved product experience after that understanding is established.
- Remove `Demo.tsx`, `components/demo/`, and unused demo-only imports. Keep reusable files under `components/ui/` that the product actually uses.
- Do not leave sample copy, sample controls, decorative placeholder behavior, or disconnected screens in the finished UI.

### When implementing application behavior and persistence

- Use the temporary Notes and Todos slice to understand the intended `contract -> query -> service -> tRPC -> TanStack Query` flow and BetterResult boundaries.
- Replace the example contracts, active tables, queries, services, procedures, browser calls, tests, E2E seed, and documentation with the real product domain. No `notes`, `todos`, `listTodos`, `createTodo`, sample records, or related runtime behavior should remain unless the product genuinely requires that exact behavior.
- Design the complete initial product schema before generating its migration. Generate one coherent forward product migration that creates the final schema and drops the temporary Notes and Todos tables; do not generate partial work and stack corrective migrations during the same implementation.
- Keep bootstrap, seed, and fixture records outside schema migrations. Do not rewrite or remove an already-applied template migration: migration history must remain reproducible even though its temporary tables are removed by the product migration.

### Before completing the task

- Search the repository for remaining demo, mock, fixture, placeholder, and hard-coded sample behavior and remove it.
- Update the relevant documents under `docs/` and rewrite the rest of this README to describe the implemented product.
- Verify the real product flow, then remove this temporary section itself.
