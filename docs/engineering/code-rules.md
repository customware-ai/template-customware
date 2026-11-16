# Code Rules

Read this before making, reviewing, or planning code changes, because it defines the implementation rules. Read [Application Design](./application-design.md) before designing or changing application behavior, APIs, persistence, queries, pagination, concurrency, or production reliability, because those decisions cross owning boundaries.

This file and `application-design.md` are system-admin-owned engineering guidelines. Autonomous task agents must not edit, rewrite, or remove them, because only the owner may change the engineering policy.

Examples use hypothetical task/project APIs, not the template's wired routers. Shared runtime contracts live in `packages/shared`; browser examples use the typed `~/lib/trpc` client. Blocks are focused fragments: surrounding imports, schema imports, UI components, and function/component scope may be omitted.

## Core Principles

### Type safety

- Keep TypeScript strict — because unchecked values otherwise cross module boundaries.
- Give functions explicit return types — because callers need a stable, reviewable contract.
- Never use `any` — because it bypasses type checking for downstream code.
- Never use `@ts-nocheck` — because it hides defects across the entire file.

### Contracts and ownership

- Define each runtime contract once in Zod — because duplicate validators drift.
- Derive each contract's TypeScript type from its schema — because handwritten types can disagree with runtime validation.
- Put runtime contracts consumed by both browser and API in `packages/shared` — because both boundaries must use the same definition.
- Give each contract, database operation, configuration value, and piece of state one owner — because competing authorities diverge.
- Reuse the owning definition directly instead of parallel abstractions or normalization — because extra representations create synchronization work.

### Minimal implementation

- Use the smallest correct implementation — because unnecessary code creates additional failure paths.
- Remove disabled code, stale comments, and replaced code, configuration, and compatibility paths — because obsolete paths obscure the active behavior.

## Application Boundaries

- Follow [Application Design](./application-design.md) for layer ownership, database design, pagination, concurrency, performance, and reliability — because SQL, services, and browser caches must enforce compatible behavior.
- Add packages only for genuine cross-workspace boundaries — because artificial packages obscure ownership.
- Never bypass query ownership — because database access needs one enforcement boundary.
- Never import API implementation or database modules into browser code, except a type-only import from the API package's public `./trpc` export — because that exception supplies the tRPC contract without bundling server code.
- Keep shared packages independent of app and API modules — because shared contracts must not depend on their consumers.

## TypeScript and Contracts

### Trust boundaries

- Treat URL parameters, form values, DOM values, transport, storage, network responses, environment values, and persistence reads as `unknown` at each distinct trust boundary — because their runtime shape is not proven by TypeScript.
- Parse untrusted values with the owning Zod schema inside `Result.try` at an owned boundary — because validation failures need the shared Result contract.
- Handle the parsing Result before passing its value inward — because invalid input must not enter domain logic.
- Do not reparse a validated value within the same boundary — because repeated validation duplicates work and ownership.
- Validate API inputs independently of browser validation, allowing framework-owned parsing such as tRPC `.input` — because clients can bypass the browser.

### Exact types and imports

- Use exact types — because broad shapes conceal contract mismatches.
- Never assert unvalidated input or incompatible types into another shape, including `as unknown as T` — because assertions provide no runtime proof.
- Allow `as const` only without claiming an unverified shape — because literal narrowing must preserve the data's proven contract.
- Allow other assertions only when required at a documented library boundary without claiming an unverified shape — because a library adaptation cannot supply missing runtime proof.
- Fix the owning contract, inference, or parser instead of concealing a type error — because callers otherwise inherit the mismatch.

### Module paths

- Use `import type` for type-only imports — because runtime dependencies must reflect actual execution needs.
- Import from the defining module without creating or retaining barrels or aggregate re-exports, including `export *` — because explicit dependency paths expose ownership.
- Use `~/` for imports rooted at `apps/app/app` — because stable root-relative paths survive file moves.

### Calendar dates

- Use the installed Zod ISO date schema instead of handwritten date validators — because library validation covers valid early years and calendar edge cases.

```ts
// Bad: this arbitrary cutoff rejects valid ISO dates before 0100.
const validDate = (value: string) => new Date(value).getFullYear() >= 100;
```

```ts
// Good: the shared schema accepts valid ISO dates, including early years.
const DateSchema = z.iso.date();
```

## BetterResult Error Handling

### Expected failures

- Use `better-result` for every expected browser and server failure, including domain work, IO, parsing, validation, persistence, serialization, state transitions, and external error mapping — because callers need one composable failure contract.
- Return `Result` from fallible synchronous functions — because callers must handle failure without catching exceptions.
- Return `Promise<Result>` from fallible asynchronous functions — because rejection alone cannot describe expected failure types.
- Omit Result only when failure is impossible for every value allowed by the input type — because the signature must describe all allowed executions.
- Give every owned fallible helper its own Result contract rather than relying on a caller's wrapper — because other callers need the same safety.

### Wrapping and composition

- Wrap synchronous throw boundaries with `Result.try` — because dependency exceptions must become structured failures.
- Wrap Promise rejection boundaries with `Result.tryPromise` — because rejected IO needs the same failure channel.
- Map `unknown` once to a meaningful tagged or structured error at the boundary that understands it — because later layers lack the original operation's context.
- Compose dependent work with `Result.gen`, `yield*`, and `Result.await` for asynchronous Results — because composition propagates typed failures without manual branching.
- Combine independent synchronous Results with `Result.all` — because every item must succeed without silently dropping failures.

### Asynchronous composition and retries

- Combine independent asynchronous Result operations with `Result.allAsync` — because their IO can run concurrently while preserving typed failures.
- Never substitute `Promise.all` for typed Result failure composition — because it does not propagate the Result error channel.
- Use `map`, `mapError`, `andThen`, or `andThenAsync` for short transformations — because small transformations need no extra generator flow.
- Never throw expected failures inside a Result flow — because that bypasses the declared error channel.
- Use `Result.tryPromise` retries only for safe idempotent operations — because repeating unsafe work can duplicate effects.

### Retry bounds and safe errors

- Bound retry attempts with backoff — because repeated failures must not create unbounded load.
- Forward each attempt's signal to cancellation-aware IO — because supplying a signal to BetterResult alone does not stop active IO.
- Check `.isErr()` or `.isOk()` before branch access, or use exhaustive `match` — because only the active branch contains the corresponding value.
- Show only explicitly mapped structured-code messages, using a fixed generic message otherwise — because unknown error text is not a safe UI contract.
- Never display raw errors, database messages, stacks, credentials, or sensitive values — because they can disclose internal or private data.

### Defects

- Treat `Panic` and invariant violations as defects rather than expected variants — because they indicate broken program assumptions.
- Do not widen Result errors to `unknown` or `Error` merely for dependency throws — because that erases actionable failure types.

### Correct BetterResult Boundaries

- Compose or return an existing Result directly — because wrapping it adds a redundant failure layer.
- Never wrap `safeParse` in `Result.try` — because `safeParse` already reports failure explicitly.
- Preserve framework signatures, including normal lazy-import Promises, effect cleanup functions, and callback signatures — because frameworks control those lifecycles.
- Throw only when adapting a handled Result to a framework requiring throws, such as `TRPCError`, or for an immediate programming invariant such as a context hook outside its provider — because ordinary application failures belong in Results.

### Terminal and callback boundaries

- Use `Result.unwrap` only at tests, executable entrypoints, and similarly terminal boundaries where failure must stop execution — because normal domain, service, persistence, and UI flows must handle the Result.
- Keep minimal local fallback handling in isolated pre-hydration scripts — because these scripts cannot import app modules and must not duplicate BetterResult in serialized text.
- Use `void` for intentional UI fire-and-forget only at a React or browser callback after the operation handles rejection and returns `Promise<Result>` — because discarded rejections otherwise escape their owner.
- Allow ordinary Promises for framework-managed UI operations such as `fetchNextPage` only when the framework handles failure and exposes error state — because the framework then owns the rejection channel.

### BetterResult Patterns

Parse owned boundaries once:

```ts
// Bad: unvalidated input crosses the boundary as a claimed type.
const task = unknownValue as Task;
```

```ts
// Good: parse once and map invalid input to a structured error.
const TaskIdSchema = z.number().int().positive();
const TaskSchema = z.object({ id: TaskIdSchema, title: z.string().min(1) });
type Task = z.infer<typeof TaskSchema>;

/** Parses untrusted task data and maps validation failures. */
function parseTask(input: unknown): Result<Task, ValidationError> {
  return Result.try({
    try: () => TaskSchema.parse(input),
    catch: (cause) => ({
      type: "VALIDATION_ERROR",
      message: "Task data is invalid.",
      issues: cause instanceof z.ZodError ? cause.issues.map((issue) => issue.message) : [],
    }),
  });
}
```

**Bounded request.**

```ts
// Bad: retrying without forwarding cancellation leaves IO running.
let response;
try {
  response = await fetch(`/api/tasks/${taskId}`);
} catch {
  response = await fetch(`/api/tasks/${taskId}`);
}
```

```ts
// Good: bound retries and forward each attempt signal.
/** Loads a task with bounded retries and cancellation. */
function loadTask(
  taskId: number,
  signal: AbortSignal,
): Promise<Result<Task, RequestError | ValidationError>> {
  const requestSignal = AbortSignal.any([signal, AbortSignal.timeout(10_000)]);
  return Result.gen(async function* () {
    const response = yield* Result.await(
      Result.tryPromise(
        {
          try: ({ signal: attemptSignal }) =>
            fetch(`/api/tasks/${taskId}`, { signal: attemptSignal }),
          catch: (cause) => new RequestError({ cause }),
        },
        {
          signal: requestSignal,
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

    return parseTask(input);
  });
}
```

- Validate and cap `pageSize` before calling the remote page helpers — because this composition helper assumes bounded, valid inputs.
- Require each remote page helper to return continuation — because a cap alone makes later records unreachable.
- Wrap each independent fallible operation in its own Result contract — because combining raw rejecting promises can turn an expected failure into a `Panic`.

```ts
// Bad: independent Result operations wait for each other.
const tasks = await fetchTasksPage({ cursor: taskCursor, pageSize });
const projects = await fetchProjectsPage({ cursor: projectCursor, pageSize });
```

```ts
// Good: independent Results run concurrently with typed failure composition.
/** Loads two independent remote pages. */
function loadWorkspace(
  taskCursor: number | undefined,
  projectCursor: number | undefined,
  pageSize: number,
): Promise<Result<{ tasks: TaskPage; projects: ProjectPage }, RequestError>> {
  return Result.gen(async function* () {
    const [tasks, projects] = yield* Result.await(
      Result.allAsync([
        fetchTasksPage({ cursor: taskCursor, pageSize }),
        fetchProjectsPage({ cursor: projectCursor, pageSize }),
      ] as const),
    );

    return Result.ok({ tasks, projects });
  });
}
```

See [pagination](./application-design.md#pagination-and-bounded-reads) for page continuation and caps.

**Synchronous collections.**

```ts
// Bad: dropping invalid rows silently loses data.
const parsedTasks = taskRows.flatMap((row) => {
  const parsed = parseTask(row);
  return parsed.isOk() ? [parsed.value] : [];
});
```

```ts
// Good: preserve a failure if any row is invalid.
const parsedTasks = Result.all(taskRows.map(parseTask));
```

- Inspect installed `node_modules/better-result/README.md`, `dist/index.d.mts`, and `dist/index.mjs` before relying on its API — because the [reference](https://better-result.dev/reference/result) may describe a different version.

### Frontend Boundary Examples

**Search parameters.**

- Parse URL representations into the shared domain schema — because transport syntax does not prove the domain invariant.

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

/** Parses URL search parameters. */
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

**Select values.**

- Parse select values with the shared API schema — because DOM strings are not proven domain values.

```tsx
// Bad: asserting the DOM string bypasses the contract.
<select onChange={(event) => update({ status: event.currentTarget.value as TaskStatus })} />
```

```tsx
// Good: TaskStatusSchema is the shared API contract.
<select
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
/>
```

**Mutation errors.**

- Map user messages from a structured code only when the mutation contract guarantees its meaning — because one code can represent different failures in different operations.

```ts
// Bad: arbitrary server or network messages can disclose internals.
const save = trpc.tasks.create.useMutation({ onError: (error) => setError(error.message) });
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

## Code Quality and Modules

### Readable code

- Use clear, descriptive names — because readers must identify intent without tracing implementation.
- Keep each function focused on one responsibility — because unrelated work hides coupling and complicates testing.
- Use explicit, linear control flow instead of clever chains or invisible mutation — because execution and state changes must be easy to follow.
- Put JSDoc before functions, classes, and non-obvious logic blocks — because their contracts and intent need local explanation.
- Make inline comments explain why a constraint exists rather than restating visible code — because reasoning is the information code alone cannot supply.

### Abstractions and diagnostics

- Add wrappers, fallbacks, caches, retry loops, helpers, or abstractions only for a real boundary or repeated responsibility — because unnecessary layers obscure the implementation.
- Never hide diagnostics with `oxlint-disable` or weaker type generation, compiler settings, lint rules, ignores, or check scripts — because suppression leaves the underlying defect intact.
- Fix the cause of each diagnostic — because callers still encounter defects hidden from tooling.
- Let Vite+ and Oxfmt own formatting without competing formatter configuration — because multiple formatting authorities produce inconsistent output.

### Dependencies

- Pin each dependency to an exact version — because floating resolutions make builds inconsistent.
- Declare server imports in root `dependencies` using `pnpm add -w <package>` — because the root runs the built server and its build requires those packages there.
- Declare browser imports in `apps/app/package.json` using `pnpm --filter @cw/app add <package>` — because Vite resolves browser imports from that workspace.
- Put dependencies used by multiple workspaces and version-matched families such as tRPC, Drizzle, React, and Vite+ in one exact-version `pnpm-workspace.yaml` catalog entry — because mismatched versions can break shared types and runtime behavior.
- Reference that shared version as `catalog:` from every consuming workspace — because a direct version can bypass catalog consistency.
- Declare test, configuration, and script tools in root `devDependencies` — because root checks and scripts must resolve the tools they execute.

## Frontend

### Required guides

- Read [Speedy Router](../main.md#routing) before routing, navigation, query, or mutation work — because integration rules determine route and data lifecycles.
- Read the [design guide](../design/design.md) before UI work — because loading, errors, accessibility, and responsive behavior must follow the existing interaction rules.

### UI ownership

- Use Speedy Router for route identity and navigation — because a second route authority creates conflicting navigation state.
- Use TanStack Query through tRPC for server state, following [browser state](./application-design.md#browser-server-state) and [pagination](./application-design.md#pagination-and-bounded-reads) — because one cache must own fetching and reconciliation.
- Use shadcn on Base UI for accessible component behavior — because the established component system supplies consistent interaction semantics.
- Use Tailwind CSS v4 for styling — because existing theme tokens and component styles use its utility pipeline.
- Do not introduce another router, server-state cache, component system, or styling system — because parallel systems duplicate ownership.

### Components and loading

- Use functional React components with typed props — because component inputs need explicit contracts.
- Use composition instead of prop drilling and configuration-heavy components — because composed children keep dependencies local.
- Lazy-load routes, components, or dependencies adding roughly 50 kB or more to a client chunk unless required for first paint — because unnecessary initial code delays startup.
- Comment why each large-feature boundary must remain lazy — because later eager imports can silently regress startup performance.

Large-feature examples include TanStack Charts, TanStack Table, editors, maps, PDF viewers, dashboards, and large demo or reference surfaces.

```tsx
// Bad: an eager import adds the chart to the initial chunk.
import TaskActivityChart from "./task-activity-chart";
```

```tsx
// Good: this large chart is not required for first paint.
const TaskActivityChart = lazy(() => import("./task-activity-chart"));

/** Renders the lazy-loaded analytics panel. */
function TaskAnalyticsPanel(): ReactElement {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <TaskActivityChart />
    </Suspense>
  );
}
```

## Performance and Cleanup

- Use direct transforms instead of avoidable copies or long collection chains — because intermediate collections add allocation and traversal work.

## Tests

### Coverage and isolation

- Review changed input boundaries, error displays, cache effects, and lists — because cross-boundary regressions can escape local checks.
- Verify invalid input at each changed boundary — because runtime callers can bypass static types.
- Verify affected and unaffected cache entries after mutations — because reconciliation must update relevant data without disturbing unrelated queries.
- Verify access beyond page one — because a correct first page does not prove continuation.
- Give each test its own records rather than depending on another test's data — because execution order must not affect results.

### Cleanup

- Expose cleanup failures rather than swallowing them — because hidden residue contaminates later tests.
- Unwrap Result-based test setup, assertions, and cleanup at the test boundary — because these failures must fail the test.

```ts
// Bad: another test owns the record and cleanup failures disappear.
await deleteTask(sharedTaskId).catch(() => {});
```

```ts
// Good: this test owns its data and each Result failure stops the test.
const task = Result.unwrap(await createTask());
try {
  Result.unwrap(await verifyTask(task.id));
} finally {
  Result.unwrap(await deleteTask(task.id));
}
```

## Secrets and Diagnostics

- Keep secrets in environment variables rather than source, committed configuration, URLs, or logs — because those surfaces expose values beyond the runtime owner.
- Never commit `.env` files, credentials, database files, or sensitive logs — because repository history preserves their contents.
- Write sanitized runtime diagnostics to ignored root `.runtime.logs` — because one excluded destination keeps operational output out of source history.
- Include operational context needed to diagnose failures — because an error without its operation and scope is difficult to investigate.
- Exclude credentials and sensitive payloads from diagnostics — because ignored files can still be read or shared.
