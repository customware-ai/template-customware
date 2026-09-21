# Template Customware

A reusable full-stack starting point for building Customware applications.

Before working in this repository, read [AGENTS.md](./AGENTS.md) and [docs/main.md](./docs/main.md).

## Project

It includes a React 19 and React Router 8 browser app, a Hono and tRPC API, SQLite persistence through Drizzle, a shared package for code used by both applications, and a production build that serves the complete application from one Node process.

The browser foundation includes TanStack Query, Tailwind CSS v4, and shadcn components on Base UI. The repository also provides typed BetterResult error handling, Zod contracts, runtime diagnostics, database migrations, and Vite+ workspace tooling.

## Remove After the Task Is Done

Keep the reference UI available while implementing the task. At the very end of the task, make sure:

- The requested product experience is implemented and verified.
- The relevant documents under `docs/` describe the implemented application.
- The rest of this README describes the actual project instead of the template.
- The `<Demo />` mount, `apps/app/app/components/Demo.tsx`, and `apps/app/app/components/demo/` are removed.
- This temporary section is removed after the preceding cleanup is complete.
