# Code Rules

Read this before making, reviewing, or planning code changes. Also read [Application Design](./application-design.md) before designing or changing application behavior, APIs, persistence, queries, pagination, concurrency, or production reliability.

This file and `application-design.md` are system-admin-owned engineering guidelines. Autonomous task agents must not edit, rewrite, or remove them.

## Core Principles

- **Type safety first:** keep TypeScript strict, give functions explicit return types, never use `any`, and never disable TypeScript with `@ts-nocheck`.
- **Runtime contracts:** define each contract once in Zod and derive its TypeScript type; put contracts used at runtime by both browser and API in `packages/shared`.
- **Single source of truth:** each contract, database operation, configuration value, and piece of state has one owner. Reuse it directly rather than adding normalization or parallel abstractions.
- **Least code:** use the smallest correct implementation and remove disabled code, stale comments, and code, configuration, and compatibility paths that a change replaces.

## Application Boundaries

- Follow [Application Design](./application-design.md) for layer ownership and production feature design. Add a package only for a genuine cross-workspace boundary.
- Do not import API implementation or database modules into browser code or bypass query ownership. The browser's type-only import from the API package's public `./trpc` export is the deliberate exception that gives tRPC its end-to-end contract without bundling server code.
- Shared packages must not import app or API modules.

## TypeScript and Contracts

- Treat URL parameters, form and DOM values, transport, storage, network responses, environment values, and persistence reads as untrusted at each distinct boundary. Parse with the owning Zod schema inside `Result.try`, handle the Result, and pass parsed values inward without re-parsing within that boundary. The API validates independently of the browser; a framework-owned boundary such as tRPC may perform its own parsing.
- Use exact types; use `unknown` at trust boundaries and refine it with the owning schema. Never use a type assertion to convert unvalidated input or conceal incompatible types, including `as unknown as T`. Fix the contract, inference, or parser instead. `as const` and assertions required at a documented library boundary are allowed only when they do not claim unverified data has another shape.
- Use `import type` for type-only imports.
- Import from the defining module; never create or retain barrel files or aggregate re-export modules, including `export *`.
- Use the `~/` alias for imports rooted at `apps/app/app`.

## BetterResult Error Handling

- Use `better-result` for every expected failure in browser and server code, including domain operations, IO, parsing, validation, persistence, serialization, state transitions, and external error mapping. Fallible synchronous operations return `Result<...>` and fallible asynchronous operations return `Promise<Result<...>>`; a function needs no `Result` only if it cannot fail for any value allowed by its input type.
- Wrap synchronous throw boundaries with `Result.try(...)` and Promise rejection boundaries with `Result.tryPromise(...)`. Every owned fallible helper exposes that Result contract itself; do not rely on one caller to wrap a raw throwing helper. Map `unknown` once into a meaningful tagged or structured error at the boundary that understands it.
- Compose dependent work with `Result.gen(...)`, `yield*`, and `Result.await(...)`. Combine independent Result operations with `Result.all` or `Result.allAsync`; do not use `Promise.all` as a substitute for typed failure composition. Use `map`, `mapError`, `andThen`, or `andThenAsync` for short transformations. Never throw an expected failure from inside a Result flow.
- Use `Result.tryPromise` retry options only for idempotent operations that are safe to repeat. Keep retries bounded, use backoff, and pass its attempt `signal` to the underlying cancellation-aware API. Supplying a signal to BetterResult does not cancel active IO unless it is forwarded.
- Check `.isErr()` or `.isOk()` before accessing a branch, or use exhaustive `match`. Show only messages explicitly mapped from structured error codes; use a fixed generic message for unknown failures. Never show raw `error.message`, database errors, stacks, credentials, or sensitive values.
- Treat `Panic` and invariant violations as defects, not expected error variants. Do not widen every Result error to `unknown` or `Error` merely because an underlying dependency can throw.

### Correct BetterResult Boundaries

- Do not wrap an API that already returns `Result`; compose or return that Result directly. Do not add `Result.try` around `safeParse`, since `safeParse` already returns an explicit failure. This repository uses `parse` inside `Result.try` at owned schema boundaries to keep one Result contract.
- Keep framework-required contracts intact. React lazy imports must return normal import Promises, React effects must return cleanup functions, and framework callbacks must retain their required signatures.
- Throw only when adapting a handled Result into a framework contract that requires throwing, such as a final `TRPCError`, or for an immediate programming invariant such as using a context hook outside its provider.
- `Result.unwrap` is for tests, executable entrypoints, and similarly terminal boundaries where failure must stop execution. Never unwrap inside normal domain, service, persistence, or UI flows.
- An isolated pre-hydration script cannot import application modules; keep its minimal local fallback handling rather than duplicating BetterResult inside serialized script text.
- Intentional UI fire-and-forget work may use `void` only at the React or browser callback boundary after the operation owns its rejection and returns `Promise<Result<...>>`. A framework-owned operation is also allowed when the framework handles failures and exposes error state, as TanStack Query does for `fetchNextPage`.

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
      issues: cause instanceof z.ZodError ? cause.issues.map((issue) => issue.message) : [],
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
    if (!response.ok) {
      return Result.err(new RequestError({ cause: `HTTP ${response.status}` }));
    }
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
function loadWorkspace(
  noteCursor: number | undefined,
  todoCursor: number | undefined,
  pageSize: number,
): Promise<Result<{ notes: NotePage; todos: TodoPage }, DatabaseError>> {
  return Result.gen(async function* () {
    const [notes, todos] = yield* Result.await(
      Result.allAsync([
        listNotesPage({ cursor: noteCursor, pageSize }),
        listTodosPage({ cursor: todoCursor, pageSize }),
      ] as const),
    );

    return Result.ok({ notes, todos });
  });
}
```

Each owning query returns a page with continuation. Validate and cap `pageSize` before this helper.

Use `Result.all` for synchronous Result collections when every item must be valid:

```ts
const todos = yield * Result.all(todoRows.map(parseTodo));
```

For the installed API, inspect `node_modules/better-result/README.md`, `dist/index.d.mts`, and `dist/index.mjs`. The official reference is <https://better-result.dev/reference/result>.

### Frontend Boundary Examples

These examples illustrate a task domain whose runtime schemas are shared in `packages/shared`. The API independently validates the same request contract. Imports use the template's typed `~/lib/trpc` client.

**Search parameters.** The shared positive ID schema owns the invariant.

```ts
// Bad: duplicates the contract and accepts zero.
const projectId = /^\d+$/.test(raw) ? Number(raw) : undefined;
```

```tsx
// Good: parse the URL representation and the shared domain contract together.
import { Result } from "better-result";
import { z } from "zod";
import { PositiveIdSchema } from "@cw/shared/tasks";

const SearchSchema = z.object({
  project: z
    .string()
    .regex(/^[1-9]\d*$/)
    .transform(Number)
    .pipe(PositiveIdSchema)
    .optional(),
});

function parseSearch(
  search: string,
): Result<z.infer<typeof SearchSchema>, { type: "INVALID_SEARCH" }> {
  return Result.try({
    try: () => SearchSchema.parse(Object.fromEntries(new URLSearchParams(search))),
    catch: () => ({ type: "INVALID_SEARCH" as const }),
  });
}

const filter = parseSearch(location.search);
if (filter.isErr()) {
  return <p role="alert">This filter link is invalid.</p>;
}
return <TaskList filter={filter.value} />;
```

**Select values.** DOM values are strings, not proven domain values.

```tsx
// Bad
onChange={(event) => update({ status: event.currentTarget.value as TaskStatus })}
```

```tsx
// Good: TaskStatusSchema is the shared API contract.
onChange={(event) => {
  const status = Result.try({
    try: () => TaskStatusSchema.parse(event.currentTarget.value),
    catch: () => ({ type: "INVALID_STATUS" as const }),
  });
  if (status.isErr()) {
    setError("Choose a valid status.");
    return;
  }
  update({ status: status.value });
}}
```

**Mutation errors.** Map a code only when the mutation contract guarantees its meaning; otherwise use the generic message.

```ts
// Bad: arbitrary server or network messages can disclose internals.
onError: (error) => setError(error.message),
```

```ts
// Good: this example's contract guarantees CONFLICT means a duplicate name.
const save = trpc.tasks.create.useMutation({
  onError: (error) =>
    setError(
      error.data?.code === "CONFLICT"
        ? "That name is already in use."
        : "Could not save. Please try again.",
    ),
});
```

**Mutation cache.** Update authoritative detail data and invalidate only affected list variants; include other affected procedures such as counts.

```ts
// Bad: invalidates unrelated queries.
onSuccess: () => queryClient.invalidateQueries(),
```

```ts
// Good: an update can change task-list membership and ordering.
const utils = trpc.useUtils();
const update = trpc.tasks.update.useMutation({
  onSuccess: async (saved) => {
    utils.tasks.byId.setData({ id: saved.id }, saved);
    await utils.tasks.list.invalidate();
  },
});
```

**Paginated list.** The server returns `{ items, nextCursor }` and accepts an optional `cursor`; a limit without continuation is not pagination.

```tsx
// Bad: records after the first 500 cannot be reached.
const tasks = trpc.tasks.list.useQuery({ limit: 500 });
```

```tsx
// Good: continue until the server reports there is no next page.
const tasks = trpc.tasks.list.useInfiniteQuery(
  { limit: 25 },
  {
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  },
);
const items = tasks.data?.pages.flatMap((page) => page.items) ?? [];
return (
  <>
    <TaskList items={items} />
    {tasks.hasNextPage && (
      <button disabled={tasks.isFetchingNextPage} onClick={() => void tasks.fetchNextPage()}>
        {tasks.isFetchingNextPage ? "Loading…" : "Load more"}
      </button>
    )}
  </>
);
```

Handle initial loading, empty, and error states in the owning UI; preserve already loaded pages when a later page fails. Review changed input boundaries, error displays, cache effects, and lists; verify invalid input, affected and unaffected cache entries, and access beyond the first page.

## Database and Migrations

- Follow [Application Design](./application-design.md) for relational modeling, constraints, indexes, queries, pagination, transactions, and migration design.

## Code Quality and Modules

- Use clear, descriptive names and keep functions focused on one responsibility.
- Use explicit, linear control flow instead of clever chains and invisible mutation.
- Use JSDoc before functions, classes, and non-obvious logic blocks. Inline comments explain why a constraint exists, not what plainly visible code does.
- Do not add a wrapper, fallback, cache, retry loop, helper, or abstraction without a real boundary or repeated responsibility.
- Never use `oxlint-disable` or weaken type generation, compiler settings, lint rules, ignore patterns, or check scripts to hide a diagnostic. Fix its cause.
- Let Vite+ and Oxfmt own formatting; do not add a competing formatter configuration.
- Declare each package where it runs, pinned to an exact version:
  - Server packages imported by `apps/api`: root `dependencies`, added with `pnpm add -w <package>`. The root runs the built server, and the server build fails if a package it imports is not installed there.
  - Browser packages: `apps/app/package.json`, added with `pnpm --filter @cw/app add <package>`.
  - Packages used by more than one workspace, and families whose versions must match (tRPC, Drizzle, React, Vite+): a `catalog:` entry in `pnpm-workspace.yaml`, referenced as `catalog:` by every workspace that uses them.
  - Tests, configs, and script tools: root `devDependencies`.
- Load a route, component, or dependency likely to add roughly 50 kB or more to a client chunk behind `import()` or `React.lazy` unless it is required for first paint. Examples include charting packages such as TanStack Charts, data-grid and table engines such as TanStack Table, rich editors, maps, PDF viewers, analytics dashboards, and large demo or reference surfaces. Leave a short comment at the lazy boundary explaining why it must remain lazy.

```tsx
// This chart is large and is not required for first paint.
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

- Read [Speedy Router](../main.md#routing) before routing, navigation, query, or mutation work.
- Read the [design guide](../design/design.md) before UI work.
- Use Speedy Router for route identity and navigation, TanStack Query through tRPC for server state, shadcn components on Base UI for accessible behavior, and Tailwind CSS v4 for styling. Follow [Application Design](./application-design.md#browser-server-state) for mutation cache updates and [pagination](./application-design.md#pagination-and-bounded-reads).
- Use functional React components with typed props and explicit return types.
- Use composition instead of prop drilling and configuration-heavy components.
- Do not introduce another router, server-state cache, component system, or styling system.

## Performance and Cleanup

- Follow [Application Design](./application-design.md) for production performance, bounded work, caching, retries, concurrency, and reliability.
- Use direct transforms instead of avoidable copying and long collection chains.

## Documentation

- Keep secrets in environment variables; never commit `.env` files, credentials, database files, or sensitive logs. Put runtime diagnostics in the ignored repository-root `.runtime.logs` without credentials or sensitive payloads.
