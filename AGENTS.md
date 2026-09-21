# Repository Guidelines

These are the main instructions that autonomous agents must follow when working in this repository.

## Documentation

See `docs/` for engineering and system documentation.

Start with `docs/main.md` for the implemented foundation, repository map, and documentation index.

**IMPORTANT: ALWAYS read `docs/engineering/code-rules.md` before making, reviewing, or planning code changes. Re-read it after conversation compaction before continuing work.**

Quick pointers:

- Repository-wide implementation rules: `docs/engineering/code-rules.md`.
- Production application, API, query, and data design: `docs/engineering/application-design.md`.
- React Router structure and APIs: `docs/engineering/react-router.md`.
- Vite+ commands, hooks, and monorepo behavior: `docs/vite-plus.md`.
- UI and interaction rules: `docs/design/design.md`.
- Current browser routes and API endpoints: `docs/platform/routes.md`.
- Runtime logging and diagnostics: `docs/engineering/observability.md`.

**IMPORTANT: Before starting a change or planning, read the relevant documents from `docs/` to understand the current implementation and affected systems.**

Task-maintained documentation must always match the current implementation. Remove superseded values, add newly introduced behavior, and update anything changed by the task. Add a focused document only when the subject cannot remain clear in an existing one.

The following system-admin-owned engineering guidelines are read-only for task agents and **MUST NOT be edited, rewritten, or removed**:

- `docs/engineering/code-rules.md`
- `docs/engineering/application-design.md`

If a task appears to require changing either protected document, complete the application work without modifying it and report the documentation conflict through the task workflow.

## Installed Dependency References

When using an installed package, verify unfamiliar or uncertain behavior from the installed version instead of guessing its API. Inspect the package under `node_modules/` for its shipped documentation, type declarations, and actual JavaScript source code. These files are the closest reference for how that exact version works in this application; use the package's official documentation when broader explanation is needed.

## Project Structure & Module Organization

- `apps/app/` – React 19 SPA using React Router, TanStack Query, Radix primitives, and Tailwind. Route configuration is in `apps/app/app/routes.ts`; route modules, layouts, components, and browser utilities live under `apps/app/app/`. The client build outputs to `build/client`.
- `apps/api/` – Hono + tRPC API with SQLite persistence through Drizzle. Contracts live in `apps/api/src/contracts`, business orchestration in `apps/api/src/services`, database ownership under `apps/api/src/db`, and tRPC procedures in `apps/api/src/trpc`. The server build outputs to `build/server/start.js`.
- `packages/shared/` – Source-level values and contracts genuinely consumed by both applications. Shared packages must not import app or API modules.
- `tests/` – Existing unit, integration, and isolated Playwright infrastructure. The autonomous task workflow decides what verification a task requires.
- `build/` – Generated client and server artifacts. Never edit generated output directly; rebuild it.

Add a package only for a real cross-workspace boundary. Keep browser-only and server-only code in their owning application.

## Build and Development Commands

For Vite+ behavior and pitfalls, read `docs/vite-plus.md`.

- `pnpm dev` – Starts the app and API development tasks.
- `pnpm build` – Builds `build/client` and `build/server`.
- `pnpm start` – Runs the built Hono server.
- `pnpm check` – Runs React Router type generation plus Vite+ formatting, linting, and type diagnostics.
- `pnpm format` – Applies Vite+ formatting.
- `pnpm test` – Runs the existing unit and integration suite through Vite+.
- `pnpm db:generate` – Generates Drizzle migrations from schema changes.
- `pnpm db:migrate` – Applies SQLite migrations.
- `pnpm e2e` – Builds and runs Playwright with its isolated E2E database lifecycle.
- `pnpm prepare` – Refreshes Vite+ hooks and agent integration.

## Autonomous Task Workflow

**THIS SECTION IS NON-NEGOTIABLE. Work autonomously on the current task until it is complete and always finish through the task completion system.**

### Context Management

Re-read files whenever needed, especially after conversation compaction:

- `README.md` for the project overview and repository conventions.
- `AGENTS.md` for operational instructions.
- `docs/main.md`, `docs/engineering/code-rules.md`, and the focused documents relevant to the task.
- The current task file for its authoritative requirements.
- Project-local skills under `.agents/skills/<skill-name>/SKILL.md` when task instructions reference a skill by name.

### Rules

- Follow every skill referenced by the task instructions.
- **ALWAYS call `task_complete`. A task is not complete until the script succeeds.**
- Never delete, rename, or manually mark task files to simulate completion.
- Call `task_complete` only after every required implementation, documentation, review, and verification phase has finished.
- Run the checks and behavioral verification required by the active task workflow near the end of the task.
- Documentation-only changes do not require executable checks unless the task workflow says otherwise.
- If context is compacted or the conversation becomes long, re-read the task and instructions and continue executing. Do not summarize and stop.

Example:

```bash
node /workspace/builder/task_complete.mjs \
  --projectId "xyz" \
  --taskId "123" \
  --taskFilePath "/workspace/development/.tasks/task.md" \
  --status completed \
  --summary "Implemented feature X with Y approach"
```

Use `--status failed` only when completion is demonstrably impossible with the available task environment. Include a precise summary of the blocker and the work already completed.

## Security & Configuration

- Keep secrets in environment variables. Never commit `.env` files, credentials, database files, or sensitive logs.
- Validate untrusted transport, persistence, environment, and external input once at the owning Zod boundary.
- Keep authorization and persistence decisions in server services and database boundaries, not browser components.
- Runtime diagnostics belong in the ignored repository-root `.runtime.logs`; keep logs free of credentials and sensitive payloads.
