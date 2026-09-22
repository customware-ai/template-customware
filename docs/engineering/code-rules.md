# Code Rules

Read this before making, reviewing, or planning code changes. Also read [Application Design](./application-design.md) before designing or changing application behavior, APIs, persistence, queries, pagination, concurrency, or production reliability.

This file and `application-design.md` are system-admin-owned engineering guidelines. Autonomous task agents must not edit, rewrite, or remove them.

## Core Principles

- **Type safety first:** keep TypeScript strict, give functions explicit return types, never use `any`, and never disable TypeScript with `@ts-nocheck`.
- **Runtime contracts:** validate external and otherwise untrusted input with Zod and derive TypeScript types with `z.infer`; never duplicate a schema's shape as a handwritten type.
- **Clean architecture:** browser components call typed client operations, transport handlers call services, services orchestrate domain work, and database query modules own persistence.
- **Typed failures:** use BetterResult `Result` for expected failures. Fallible synchronous operations return `Result<...>` and fallible asynchronous operations return `Promise<Result<...>>`.
- **Single source of truth:** each contract, database operation, configuration value, and piece of state has one owner. Reuse it directly rather than adding normalization or parallel abstractions.
- **Least code:** use the smallest correct implementation and remove code, configuration, and compatibility paths that a change replaces.

## Application Boundaries

- Follow [Application Design](./application-design.md) for layer ownership and production feature design.
- Browser code calls typed client operations; transport calls services; services use contracts and query modules; query modules own persistence.
- Do not import API implementation or database modules into browser code, bypass query ownership, or let a shared package import either application. The browser's type-only import from the API package's public `./trpc` export is the deliberate exception that gives tRPC its end-to-end contract without bundling server code.

## TypeScript and Contracts

- Use exact types. Use `unknown` only at a real trust boundary and refine it immediately with the owning schema.
- Validate once at the boundary, then trust the typed value downstream.
- Define the Zod schema first and derive every corresponding TypeScript type with `z.infer`; do not maintain parallel handwritten shapes.
- Use `import type` for type-only imports.
- Prefer direct imports. Add a barrel only when it is a deliberate public module boundary.
- Use the `~/` alias for imports rooted at `apps/app/app`.
- Keep client-only and server-only imports inside their runtime boundary.
- Never weaken type generation, lint configuration, or compiler settings to hide a failure.

## BetterResult Error Handling

- Use `better-result` for owned fallible work: domain operations, orchestration, IO, parsing, validation, persistence, serialization, and state transitions. Pure total transforms and accessors do not need a `Result`.
- Wrap synchronous throw boundaries with `Result.try(...)` and Promise rejection boundaries with `Result.tryPromise(...)`. Every owned fallible helper exposes that Result contract itself; do not rely on one caller to wrap a raw throwing helper. Map `unknown` once into a meaningful tagged or structured error at the boundary that understands it.
- For an owned Zod boundary, call `Schema.parse(...)` inside `Result.try(...)` so parsing has the same Result contract as other fallible work. Do not also validate a value already parsed by tRPC or another owning framework boundary.
- Compose dependent work with `Result.gen(...)`, `yield*`, and `Result.await(...)`. Combine independent Result operations with `Result.all` or `Result.allAsync`; do not use `Promise.all` as a substitute for typed failure composition. Use `map`, `mapError`, `andThen`, or `andThenAsync` for short transformations. Never throw an expected failure from inside a Result flow.
- Use `Result.tryPromise` retry options only for idempotent operations that are safe to repeat. Keep retries bounded, use backoff, and pass its attempt `signal` to the underlying cancellation-aware API. Supplying a signal to BetterResult does not cancel active IO unless it is forwarded.
- Check `.isErr()` or `.isOk()` before accessing a branch, or use exhaustive `match`. Translate internal failures into actionable, non-technical UI messages and never expose database errors, stacks, credentials, or sensitive values.
- Treat `Panic` and invariant violations as defects, not expected error variants. Do not widen every Result error to `unknown` or `Error` merely because an underlying dependency can throw.

### Correct BetterResult Boundaries

- Do not wrap an API that already returns `Result`; compose or return that Result directly. Do not add `Result.try` around `safeParse`, since `safeParse` already returns an explicit failure. This repository uses `parse` inside `Result.try` at owned schema boundaries to keep one Result contract.
- Keep framework-required contracts intact. React lazy imports must return normal import Promises, React effects must return cleanup functions, and framework callbacks must retain their required signatures.
- Throw only when adapting a handled Result into a framework contract that requires throwing, such as a final `TRPCError`, or for an immediate programming invariant such as using a context hook outside its provider.
- `Result.unwrap` is for tests, executable entrypoints, and similarly terminal boundaries where failure must stop execution. Never unwrap inside normal domain, service, persistence, or UI flows.
- An isolated pre-hydration script cannot import application modules; keep its minimal local fallback handling rather than duplicating BetterResult inside serialized script text.
- Intentional UI fire-and-forget work may use `void` only at the React or browser callback boundary after the called operation owns its rejection and returns `Promise<Result<...>>`.

### BetterResult Patterns

Parse an owned Notes API boundary once and map the thrown library error into a stable application error:

```ts
const NoteSchema = z.object({ id: z.string().uuid(), title: z.string().min(1) });
type Note = z.infer<typeof NoteSchema>;

function parseNote(input: unknown): Result<Note, ValidationError> {
  return Result.try({
    try: () => NoteSchema.parse(input),
    catch: (cause) => ({
      type: "VALIDATION_ERROR",
      message: "Note data is invalid.",
      issues: cause instanceof z.ZodError ? cause.issues : [],
    }),
  });
}
```

Bound retries and forward BetterResult's attempt signal to the underlying request:

```ts
function loadNote(
  noteId: string,
  signal: AbortSignal,
): Promise<Result<Note, RequestError | ValidationError>> {
  return Result.gen(async function* () {
    const response = yield* Result.await(
      Result.tryPromise(
        {
          try: ({ signal: attemptSignal }) =>
            fetch(`/api/notes/${noteId}`, { signal: attemptSignal }),
          catch: (cause) => new RequestError({ cause }),
        },
        {
          signal,
          retry: { times: 2, delayMs: 150, backoff: "exponential" },
        },
      ),
    );
    const input = yield* Result.await(
      Result.tryPromise({
        try: () => response.json() as Promise<unknown>,
        catch: (cause) => new RequestError({ cause }),
      }),
    );

    return parseNote(input);
  });
}
```

Wrap independent fallible operations separately, then combine their Results concurrently. Do not hide raw rejecting promises inside `Promise.all`, and do not pass raw promises to `Result.allAsync` because a rejection there is a `Panic`:

```ts
function loadWorkspace(): Promise<Result<{ notes: Note[]; todos: Todo[] }, DatabaseError>> {
  return Result.gen(async function* () {
    const [notes, todos] = yield* Result.await(
      Result.allAsync([
        Result.tryPromise({
          try: () => db.select().from(noteTable),
          catch: (cause) => databaseError("Failed to load notes", cause),
        }),
        Result.tryPromise({
          try: () => db.select().from(todoTable),
          catch: (cause) => databaseError("Failed to load todos", cause),
        }),
      ] as const),
    );

    return Result.ok({ notes, todos });
  });
}
```

Use `Result.all` for synchronous Result collections when every item must be valid:

```ts
const todos = yield * Result.all(todoRows.map(parseTodo));
```

For the installed API, inspect `node_modules/better-result/README.md`, `dist/index.d.mts`, and `dist/index.mjs`. The official reference is <https://better-result.dev/reference/result>.

## Database and Migrations

- Follow [Application Design](./application-design.md) for relational modeling, constraints, indexes, queries, pagination, transactions, and migration design.
- Schema definitions belong in `apps/api/src/db/schemas.ts`; reads and writes belong in `apps/api/src/db/queries/`; initialization belongs in `apps/api/src/db/index.ts`.
- Generate, review, apply, and verify migrations. SQL, snapshots, and journal metadata must remain consistent with no subsequent schema drift.
- Never mutate `.dbs/database.db` during verification. Use `.dbs/e2e.db` or an isolated temporary database.

## Code Quality and Modules

- Use clear, descriptive names and keep functions focused on one responsibility.
- Prefer explicit, linear control flow over clever chains and invisible mutation.
- Use JSDoc before functions, classes, and non-obvious logic blocks. Inline comments explain why a constraint exists, not what plainly visible code does.
- Remove disabled code and stale comments.
- Do not add a wrapper, fallback, cache, retry loop, helper, or abstraction without a real boundary or repeated responsibility.
- Do not add barrel exports or aggregate re-export modules, especially `export *`; import from the defining module so tree-shaking and code splitting retain real boundaries.
- Never use `oxlint-disable`, weaken lint rules, expand ignore patterns, or change check scripts to hide a diagnostic. Fix its cause.
- Let Vite+ and Oxfmt own formatting; do not add a competing formatter configuration.
- Keep dependencies declared by the workspace that imports them. Root dependencies are for root-owned runtime or tooling only.
- Load a route, component, or dependency likely to add roughly 50 kB or more to a client chunk behind `import()` or `React.lazy` unless it is required for first paint. Examples include charting packages such as Recharts, data-grid and table engines such as TanStack Table, rich editors, maps, PDF viewers, analytics dashboards, and large demo or reference surfaces. Leave a short comment at the lazy boundary explaining why it must remain lazy.

```tsx
// Recharts is large and this todo activity chart is not required for first paint.
const TodoActivityChart = lazy(() => import("./todo-activity-chart"));

function TodoAnalyticsPanel(): ReactElement {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <TodoActivityChart />
    </Suspense>
  );
}
```

## Frontend

- Read [React Router](./react-router.md) before routing, navigation, query, or mutation work.
- Read the [design guide](../design/design.md) before UI work.
- Use React Router for route identity and navigation, TanStack Query through tRPC for server state, shadcn components on Base UI for accessible behavior, and Tailwind CSS v4 for styling.
- Use functional React components with typed props and explicit return types.
- Prefer composition over prop drilling and configuration-heavy components.
- Do not introduce another router, server-state cache, component system, or styling system.

## Performance and Cleanup

- Follow [Application Design](./application-design.md) for production performance, bounded work, caching, retries, concurrency, and reliability.
- Prefer direct transforms over avoidable copying and long collection chains.
- Clean up listeners, timers, child processes, temporary files, database handles, and object URLs in the scope that owns them.
- Preserve production static-serving behavior: hashed assets remain long-cacheable and HTML remains short-cacheable.

## Documentation

- Update the owning document when behavior, architecture, commands, or boundaries change.
- Keep documentation about the current implementation rather than speculative future systems.
- Put disposable local evidence under ignored root `tmp/`; never commit secrets or sensitive diagnostic payloads.
