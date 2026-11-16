# Application Design

Read this before designing or changing application behavior, APIs, persistence, queries, pagination, concurrency, or production reliability, because correctness spans these boundaries. This guideline is system-admin-owned; autonomous task agents must not edit, rewrite, or remove it, because only the owner may change engineering policy.

Examples use the same hypothetical task/project domain as [Code Rules](./code-rules.md#betterresult-patterns), not the template's wired routers. Focused fragments omit surrounding imports and function/component scope.

- Keep production behavior correct as volume, concurrency, uptime, and failures grow — because demonstration workloads do not exercise those conditions.
- Design these guarantees into their owning boundaries before shipping — because callers cannot consistently enforce another layer's invariants.

## Ownership and Flow

A normal operation follows one direction:

```text
React route or component
  -> tRPC React Query client
  -> Hono tRPC endpoint
  -> tRPC procedure
  -> service
  -> database query
  -> Drizzle client
  -> SQLite
```

- Let `apps/app/app/routes.ts` own the browser route tree — because route identity needs one definition.
- Keep presentation and interaction in browser routes, layouts, and components — because rendering must not own authorization or persistence.
- Let `apps/api/src/trpc/` own typed procedures and transport mapping — because transport details must not leak into services.
- Put server-only input and output schemas in `apps/api/src/contracts/` — because API-private contracts need an explicit owner.
- Put runtime contracts consumed by both applications in `packages/shared/` — because independent definitions can drift.

### Service and database ownership

- Let `apps/api/src/services/` own business rules, authorization decisions, and orchestration — because transport and persistence must not decide product policy.
- Let `apps/api/src/db/queries/` own reads and writes — because SQL scope and execution belong at one boundary.
- Let `schemas.ts` own table definitions — because migrations need one schema source.
- Let the database `index.ts` own initialization — because connection policy must be consistent.
- Limit `packages/shared/` to pure values and contracts genuinely consumed by both applications — because shared code must not depend on application side effects.

Zod validates at trust boundaries rather than at a separate downstream layer.

### Boundary discipline

- Follow [boundary validation](./code-rules.md#typescript-and-contracts) at each trust boundary — because validation must precede use of untrusted data.
- Keep transport, business rules, persistence, and rendering separate — because each layer has a different authority.
- Never bypass an owning layer for convenience — because bypasses skip its validation and enforcement.

## Relational Data Modeling

### Entities and relationships

- Give every durable entity a stable primary key — because references must survive edits to display fields.
- Represent real relationships with foreign keys rather than duplicated identifiers or application-only assumptions — because every writer must preserve referential integrity.
- Define relationship cardinality deliberately — because one-to-one and one-to-many relationships allow different data.
- Use a junction table for many-to-many relationships — because neither side can own a single foreign key for every pairing.
- Constrain junction rows that carry state — because relationship state has its own invariants.

### Constraints and deletion

- Use `NOT NULL` for required values — because every writer must supply them.
- Enforce writer-independent invariants with `UNIQUE`, `CHECK`, and foreign keys — because application checks alone race or can be bypassed.
- Choose each foreign key's deletion behavior explicitly — because the database default may not match the relationship's lifecycle.
- Use cascade deletion only when a child has no independent meaning — because deletion must not destroy independently valuable data.
- Use restrict deletion for independently valuable children — because their continued existence must block parent deletion.
- Use set-null deletion only for optional relationships — because a null reference must remain a valid state.

### Authoritative data

- Normalize authoritative data first — because duplicated facts can disagree.
- Denormalize only after measurement proves the need — because duplication adds writes and consistency work.
- Give denormalized copies one consistency owner — because competing writers can leave duplicated facts out of sync.
- Do not persist cheaply and reliably derived values unless the snapshot itself is a product requirement — because otherwise stored and derived values can diverge.
- Model lifecycle states explicitly rather than with boolean combinations permitting impossible states — because invalid combinations should not be representable.

### Timestamp ownership

- Store timestamps in one canonical UTC representation — because mixed formats break comparison and ordering.

- Define which boundary creates and updates timestamps — because competing writers can disagree about event time.

## Indexes and Query Shape

### Index selection

- Design indexes for actual lookup, filter, join, uniqueness, and ordering needs — because unused indexes add maintenance without serving queries.
- Index foreign-key columns used for joins or parent-scoped reads — because otherwise relationship access can scan growing tables.
- Order compound index columns by equality filters followed by the query's range or ordering fields — because the index must match its access pattern.
- Never add speculative indexes — because every index increases write work and storage.
- Inspect generated SQL and query plans for changed collection queries and indexes — because source-level intent does not prove the database uses the expected plan.

### Bounded query shape

- Select only fields needed by the operation — because unused columns increase transfer and decoding work.
- Avoid unbounded related collections — because one parent can otherwise expand into unlimited work.
- Apply collection-reducing lifecycle, authorization, search, ownership, and other filters in SQL rather than after fetching a full or unbounded collection — because late filtering breaks bounds and can expose unauthorized data.
- Filter loaded pages in the browser only for transient presentation that cannot affect authorization, pagination, counts, or result correctness — because the browser holds only a partial collection.
- Return display-ready rows using joins or bounded batch hydration, authorization, lock, and relationship checks rather than per-row lookups — because per-row work multiplies database calls.

The fragments import their owning shared schemas: `TaskSchema` for task identity/title, `ProjectSchema` for project identity/name, and `TaskWriteSchema` for the returned task identity/title, priority, and version.

**Per-row lookup.**

```ts
// Bad: querying each task's project repeats database work.
const rows = page.map((task) => ({ task, project: findProject(task.projectId) }));
```

The complete scoped [cursor page](#pagination-and-bounded-reads) below joins display data within the page bound.

### Synchronous SQLite and Constraint Errors

- Keep related better-sqlite3 reads in one synchronous function or transaction — because queries execute on the calling thread and `await` or `Promise.all` adds no concurrency.
- Execute synchronous Drizzle queries with `.all()`, `.get()`, or `.run()` inside `Result.try` — because execution can throw database errors.

#### Connection defaults

- Keep foreign-key enforcement enabled unless measured behavior justifies a deliberate change — because every connection must enforce relationships.
- Keep WAL mode unless measured behavior justifies a deliberate change — because it lets readers coexist with a writer.
- Keep `NORMAL` synchronization unless measured behavior justifies a deliberate change — because WAL with `NORMAL` avoids syncing every commit, while accepting possible loss of the most recent commits after a power failure or system crash.
- Keep the ten-second busy timeout unless measured behavior justifies a deliberate change — because transient writer contention needs a bounded wait.

```ts
// Bad: awaiting a synchronous query does not free the calling thread.
const rows = await db.select().from(tasks);
```

```ts
// Good: execute both related reads synchronously at the database boundary.
const result = Result.try({
  try: () => ({
    task: TaskSummarySchema.optional().parse(
      db
        .select({ id: tasks.id, title: tasks.title })
        .from(tasks)
        .where(and(eq(tasks.ownerId, ownerId), eq(tasks.id, taskId)))
        .get(),
    ),
    project: ProjectSummarySchema.optional().parse(
      db
        .select({ id: projects.id, name: projects.name })
        .from(projects)
        .where(and(eq(projects.ownerId, ownerId), eq(projects.id, projectId)))
        .get(),
    ),
  }),
  catch: (cause) => databaseError("Read failed", cause),
});
```

- Unwrap `DrizzleError` and `DrizzleQueryError` causes when classifying SQLite failures — because installed Drizzle uses both wrappers.
- Map constraint failures at the database boundary according to the operation's meaning — because a missing parent on insert may be `NOT_FOUND` while deleting a referenced parent is `CONFLICT`.
- Map other database failures to a generic internal error — because callers must not receive database internals.

```ts
// Bad: another writer can insert the same name after this check.
if (!findProjectByName(name)) insertProject(name);
```

```ts
// Good: the constraint arbitrates concurrent writes.
const saved = Result.try({
  try: () => ProjectSchema.parse(db.insert(projects).values({ ownerId, name }).returning().get()),
  catch: (cause) => {
    const sqlite =
      cause instanceof DrizzleError || cause instanceof DrizzleQueryError ? cause.cause : cause;
    if (sqlite instanceof Database.SqliteError && sqlite.code === "SQLITE_CONSTRAINT_UNIQUE")
      return { type: "CONFLICT" as const };
    return { type: "DATABASE_ERROR" as const };
  },
});
```

## Pagination and Bounded Reads

### Continuation

- Use cursor pagination with continuation for every database list — because a limit or a larger page alone makes later matches unreachable.
- Never return a list whole because it seems small, personal, or single-user — because every stored collection grows with use and the contract cannot be paged later without changing every caller.
- Use deterministic total ordering with a unique tie-breaker for non-unique sorts — because ambiguous order skips or repeats tied rows.
- Include all ordering values in the cursor rather than a timestamp alone — because continuation must identify an exact position.
- Keep filters, authorization scope, and ordering consistent within a page sequence — because changing the result set invalidates its cursor.
- Start a new sequence when filters, scope, or ordering change — because the old cursor describes a different collection.

### Bounds and consistency

- Enforce a server maximum page size — because client-supplied bounds cannot protect database resources.
- Return page items plus only the metadata needed to continue — because unused counts and metadata add work.
- Return at most `pageSize` items — because the page contract must match the requested bound.
- Use the extra fetched row only to detect a next page — because returning it would exceed the bound or make continuation overlap.
- Calculate expensive counts only when displayed or required — because counting all matches can dominate a bounded page query.

### Integration

- Prevent skipped or duplicated records under ordinary inserts or updates for the chosen consistency model — because every matching record must remain reachable according to that model.
- Connect server continuation to [client Load more](#browser-server-state) — because a server cursor alone does not make later rows accessible to users.
- Never load all IDs into an unbounded `IN` query — because SQLite limits parameters and collection growth must not expand request work.
- Validate `ListInput` with tRPC `.input(ListInput)` before `listTasks` — because the query helper assumes a validated cursor and capped page size.
- Keep `createdAt` immutable in this keyset ordering — because moving rows across an active cursor can skip or repeat them.

```ts
// Bad: reading the entire owner collection is unbounded.
const rows = db.select().from(tasks).where(eq(tasks.ownerId, ownerId)).all();
```

```ts
// Good: one shared contract defines the cursor, page bound, and stored display shape.
// These schemas live in packages/shared; query and client consumers import them.
import { TaskIdSchema, TaskSchema } from "@cw/shared/tasks";
const CreatedAtSchema = z.iso.datetime({ precision: 3 });
const TaskSummarySchema = TaskSchema.extend({
  createdAt: CreatedAtSchema,
  project: z.string().nullable(),
});
const ListInput = z.object({
  limit: z.number().int().min(1).max(100),
  cursor: z.object({ createdAt: CreatedAtSchema, id: TaskIdSchema }).optional(),
});
type TaskCursor = NonNullable<z.infer<typeof ListInput>["cursor"]>;
type TaskSummary = z.infer<typeof TaskSummarySchema>;

/** Returns one authorized page and its continuation. */
function listTasks(
  input: z.infer<typeof ListInput>,
  ownerId: number,
): Result<{ items: TaskSummary[]; nextCursor: TaskCursor | undefined }, DatabaseError> {
  return Result.try({
    try: () => {
      const { cursor, limit } = input;
      const after =
        cursor &&
        or(
          gt(tasks.createdAt, cursor.createdAt),
          and(eq(tasks.createdAt, cursor.createdAt), gt(tasks.id, cursor.id)),
        );
      const rows = db
        .select({
          id: tasks.id,
          title: tasks.title,
          createdAt: tasks.createdAt,
          project: projects.name,
        })
        .from(tasks)
        .leftJoin(projects, and(eq(tasks.projectId, projects.id), eq(projects.ownerId, ownerId)))
        .where(and(eq(tasks.ownerId, ownerId), after))
        .orderBy(asc(tasks.createdAt), asc(tasks.id))
        .limit(limit + 1)
        .all();
      const items = z.array(TaskSummarySchema).parse(rows.slice(0, limit));
      const last = items.at(-1);
      const nextCursor =
        rows.length > limit && last ? { createdAt: last.createdAt, id: last.id } : undefined;
      return { items, nextCursor };
    },
    catch: (cause) => databaseError("Failed to list tasks", cause),
  });
}
```

## Transactions and Concurrency

### Atomic work

- Put changes that must succeed or fail together in one transaction — because partial commits leave inconsistent business state.
- Keep transactions short — because long transactions prolong locks and contention.
- Keep network calls and unrelated computation outside transactions — because slow external work must not hold database locks.
- Let database constraints decide uniqueness and relationships, using preflight checks only for UX — because concurrent writers can invalidate preflight checks.
- Protect read-modify-write with an atomic statement, transaction, version, or explicit concurrency strategy — because stale reads otherwise overwrite newer work.

### Durable coordination

- Make retryable writes idempotent when duplicate execution is possible — because retries must not repeat effects.
- Persist an idempotency key when memory cannot guarantee deduplication — because process restarts erase in-memory history.
- Define ownership for background work, locks, leases, and cleanup — because abandoned or competing work needs an accountable lifecycle.
- Never use an in-memory flag for durable exclusivity — because another process or restart bypasses it.

Keep atomic business changes in their owning transaction:

```ts
// Bad: a failure between writes leaves an incomplete project.
const project = db.insert(projects).values(projectInput).returning().get();
db.insert(tasks)
  .values(taskInputs.map((task) => ({ ...task, projectId: project.id })))
  .run();
```

```ts
// Good: the project and tasks succeed or fail together.
const result = Result.try({
  try: () =>
    database.transaction((tx) => {
      const project = ProjectSchema.parse(
        tx.insert(projects).values(projectInput).returning().get(),
      );
      tx.insert(tasks)
        .values(taskInputs.map((task) => ({ ...task, projectId: project.id })))
        .run();
      return project;
    }),
  catch: (cause) => databaseError("Failed to create project and tasks", cause),
});
```

### Partial Updates and Authoritative Writes

- Send only changed fields — because stale unchanged fields can overwrite another editor's work.
- Condition same-field-sensitive writes on a version or `updated_at` — because concurrent edits need an explicit conflict decision.
- Return `CONFLICT` when a version-conditioned write matches no row — because silently succeeding would hide a stale update.
- Use `.returning()` when it supplies the authoritative mutation result without an avoidable second read — because unnecessary rereads add work and a race window.
- Read again when needed for AFTER-trigger effects or other authoritative response data — because SQLite `RETURNING` does not include subsequent trigger changes.

```ts
// Bad: a stale snapshot can overwrite another editor's status.
updateTask({ id, title, status, priority });
```

```ts
// Good: write only the changed priority and reject a stale version.
return Result.try({
  try: () =>
    TaskWriteSchema.optional().parse(
      db
        .update(tasks)
        .set({ priority, version: version + 1 })
        .where(and(eq(tasks.ownerId, ownerId), eq(tasks.id, id), eq(tasks.version, version)))
        .returning()
        .get(),
    ),
  catch: (cause) => databaseError("Failed to update task", cause),
}).andThen((saved) => (saved ? Result.ok(saved) : Result.err({ type: "CONFLICT" as const })));
```

## API and State Contracts

### Inputs and failures

- Follow [Code Rules](./code-rules.md#typescript-and-contracts) for validation at each trust boundary — because static types cannot validate runtime data.
- Expose explicit input and output contracts rather than raw database rows or implementation exceptions — because storage changes must not silently change the API.
- Return structured expected failures rather than message-parsing contracts — because text changes must not break client decisions.

### Evolution and authority

- Evolve field meanings intentionally rather than silently — because existing callers rely on established semantics.
- Remove superseded forms when compatibility is unnecessary — because unused compatibility creates competing contracts.
- Reconcile cached predictions and retained state with the single server-state authority — because client snapshots can become stale.
- Return authoritative mutation data sufficient for the client without an avoidable second read — because a second request adds latency and can observe another writer's changes.

### Persistence Validation

- Classify invalid client input as `BAD_REQUEST` — because the caller supplied the invalid value.
- Classify invalid stored data as an internal persistence error rather than `BAD_REQUEST` — because storage corruption is not the client's fault.
- Parse returned persistence values with the owning runtime schema inside the query's Result boundary — because database column types do not prove domain validity.

```ts
// Bad: a corrupt stored row is not the client's fault.
const stored = Result.try({
  try: () => TaskSchema.parse(row),
  catch: () => ({ type: "BAD_REQUEST" as const }),
});
```

```ts
// Good: classify errors at the boundary that owns the data.
const stored = Result.try({
  try: () => TaskSchema.parse(row),
  catch: () => ({ type: "PERSISTENCE_ERROR" as const }),
});
```

## Browser Server State

### Cache ownership

- Use TanStack Query through `@trpc/react-query` as the sole browser server-state owner rather than mirroring results into component state or another fetch cache — because parallel copies diverge.
- Include client filters, ordering, and pagination in tRPC input — because TanStack Query uses input to identify distinct result sets.
- Set freshness, `staleTime`, `gcTime`, refetch triggers, polling, and bounded read retries per query's data and failure needs — because unrelated queries need different policies.
- Never automatically retry unsafe mutations — because repeating a write can duplicate effects.

### Typed operations

- Use typed tRPC `useQuery` for non-list reads — because its contract models a single response.
- Use typed tRPC `useInfiniteQuery` for cursor pages — because continuation and page ownership belong to the query cache.
- Use typed tRPC `useMutation` for writes — because it owns mutation state and lifecycle callbacks.
- Use typed tRPC `useUtils` for cache work — because typed procedure keys prevent mismatched cache operations.
- Use prefetch hooks for likely navigation or pages — because useful predictions can hide request latency.

### Reconciliation and cancellation

- Preserve usable cached data during refetches and page changes, using placeholder data only when continuity is correct — because loading must not hide still-valid content.
- Show the initial loader only without usable data — because background work is not an initial load.
- Reconcile authoritative mutation responses when sufficient — because cached predictions must converge on server truth.
- Invalidate only affected keys and input variants, including lists, ordering, membership, and counts, without whole-cache or unscoped `invalidateQueries()` — because unrelated queries must remain undisturbed.
- Use tRPC cancellation rather than parallel request plumbing — because the integration owns request and cache lifecycles.
- Abort work that is no longer useful — because obsolete requests consume resources and can race newer state.
- Allow useful prefetches to finish populating the cache — because their results can serve upcoming navigation.

Invalidate only affected procedures:

```ts
// Bad: invalidates unrelated queries.
const update = trpc.tasks.update.useMutation({ onSuccess: () => queryClient.invalidateQueries() });
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

### Cursor-page UI

- Render cursor pages with Load more using the server's `{ items, nextCursor }` and optional input cursor — because a first-page limit cannot reach later matches.
- Disable Load more while any fetch for the list is running, and pass `{ cancelRefetch: false }` — because the default `fetchNextPage` cancels an in-flight refresh and can hide a just-saved record.

```tsx
// Bad: records after the first 500 cannot be reached.
const tasks = trpc.tasks.list.useQuery({ limit: 500 });
```

```tsx
// Good: continue until the server reports there is no next page.
const tasks = trpc.tasks.list.useInfiniteQuery(
  { limit: 25 },
  { getNextPageParam: (page) => page.nextCursor ?? undefined },
);
const items = tasks.data?.pages.flatMap((page) => page.items) ?? [];
return (
  <>
    <TaskList items={items} />
    {tasks.hasNextPage && (
      <button
        disabled={tasks.isFetching}
        onClick={() => void tasks.fetchNextPage({ cancelRefetch: false })}
      >
        {tasks.isFetchingNextPage ? "Loading…" : "Load more"}
      </button>
    )}
  </>
);
```

- Handle initial loading, empty, and error states in the owning UI — because each state requires a usable response.
- Preserve loaded pages after later page failures — because a failed continuation must not erase usable results.
- Follow the [test checklist](./code-rules.md#tests) for changed boundaries, cache effects, and lists — because first-page success does not cover failure and reconciliation behavior.

### Optimistic updates

- Make every predictable change optimistic, including create, complete or toggle, edit, and delete — because the user should see the result at once instead of waiting for a round trip.
- Leave a change pessimistic only when its result cannot be predicted locally, such as a server-computed value — because a speculative result must have a valid local meaning.
- Keep the triggering control disabled with a `Spinner` while the write is in flight, even though the result already shows — because the prediction is not saved yet and a repeat click would send the write twice.
- Prefer rendering the prediction from the mutation's `variables` over writing it into the cache — because cached pages stay untouched, so a refetch cannot erase it and a failure needs no rollback.
- When a prediction must be written into the cache, cancel affected queries before taking the rollback snapshot — because an in-flight response can overwrite the prediction.
- Restore that snapshot when the mutation fails — because rejected predictions must not remain visible.
- Reconcile authoritative success data — because the server may return a different result.

#### Overlapping mutations

- Snapshot and roll back only the item the mutation changed, never a whole list — because restoring a whole-list snapshot can erase another mutation's successful edit.
- Disable editing an item while its own save is pending — because two overlapping saves of the same item can roll back each other's prediction.
- Invalidate all affected list variants after settlement — because a write can change membership and ordering in several filtered lists.

```tsx
// Bad: whole-list rollback can erase a different mutation's successful edit.
utils.tasks.list.setInfiniteData(input, previousList);
```

```tsx
// Good: predict and roll back only this task; refresh every list variant afterwards.
const utils = trpc.useUtils();
const update = trpc.tasks.update.useMutation({
  onMutate: async (change) => {
    await utils.tasks.byId.cancel({ id: change.id });
    const previous = utils.tasks.byId.getData({ id: change.id });
    utils.tasks.byId.setData({ id: change.id }, (current) =>
      current ? { ...current, ...change } : current,
    );
    return { previous };
  },
  onError: (_error, change, context) => {
    if (context?.previous) utils.tasks.byId.setData({ id: change.id }, context.previous);
    setError("Could not save. Please try again.");
  },
  onSuccess: (saved) => utils.tasks.byId.setData({ id: saved.id }, saved),
  onSettled: () => utils.tasks.list.invalidate(),
});
// The edit form passes disabled={update.isPending} to its Save control.
```

#### Optimistic creates

- Show a pending create from the mutation's `variables` instead of inserting a temporary row into list caches — because any background refetch replaces cached pages and erases a temporary row.
- Return the invalidation promise from `onSettled` — because the mutation then stays pending until the refreshed list contains the saved row, so the pending row never flickers away.

```tsx
// Bad: a focus or polling refetch during the save replaces the pages and drops the temporary row.
onMutate: () => utils.tasks.list.setInfiniteData(input, (data) => withTemporaryRow(data)),
```

```tsx
// Good: the pending row comes from the mutation itself until the refreshed list includes the saved row.
const create = trpc.tasks.create.useMutation({ onSettled: () => utils.tasks.list.invalidate() });
// In the list:
{
  create.isPending && <li aria-busy="true">{create.variables.title} · Saving…</li>;
}
```

#### Optimistic row changes

- Give each row its own mutation and render its pending toggle, edit, or delete from that mutation's `variables` — because a shared mutation exposes only the latest call's variables.

```tsx
// Good: the row shows its predicted state until the refreshed list arrives.
const update = trpc.tasks.update.useMutation({ onSettled: () => utils.tasks.list.invalidate() });
const remove = trpc.tasks.delete.useMutation({ onSettled: () => utils.tasks.list.invalidate() });
const shown = update.isPending ? { ...task, ...update.variables } : task;
if (remove.isPending) return null;
```

### Browser Concurrency and State

- Run independent default tRPC invalidations concurrently with `Promise.all` — because refetch failures stay in query state rather than a typed Result error channel.
- Pass only Results or promises resolving to Results to `Result.allAsync` — because ordinary non-Result inputs violate its installed signature.

```ts
// Bad: independent invalidations wait for each other.
await utils.tasks.list.invalidate();
await utils.projects.list.invalidate();
await utils.tags.list.invalidate();
```

```ts
// Good: all three invalidations start together.
await Promise.all([
  utils.tasks.list.invalidate(),
  utils.projects.list.invalidate(),
  utils.tags.list.invalidate(),
]);
```

**Background refetch errors.**

- Show full errors only without usable cached data — because background failure must not hide loaded content.
- Show a stale/retry notice after background errors — because users need to know that displayed data may be outdated.

```tsx
// Bad: a failed background refetch hides usable data.
if (query.isError) return <ErrorScreen />;
```

```tsx
// Good: cached data remains usable while the user retries.
if (!query.data) return query.isError ? <ErrorScreen /> : <Loading />;
return (
  <>
    {query.isError && <RetryNotice onRetry={() => void query.refetch()} />}
    <TaskList items={query.data} />
  </>
);
```

**Preserve edits during submit.**

- Clear submitted input only if it still matches the submitted value, or disable editing during submit — because success must not erase newer input.

```ts
// Bad: this erases text entered while the request was pending.
const quickAdd = trpc.tasks.create.useMutation({ onSuccess: () => setTitle("") });
```

```ts
// Good: retain any newer input.
const quickAdd = trpc.tasks.create.useMutation({
  onSuccess: (_saved, submitted) =>
    setTitle((current) => (current === submitted.title ? "" : current)),
});
```

**Wait for dependent creates.**

- Disable Save while dependent creates are pending — because the saved record must reference a completed create.

```tsx
// Bad: Save can race a pending dependent project creation.
<button onClick={save}>Save</button>
```

```tsx
// Good: wait for the dependent create before allowing Save.
<button disabled={createProject.isPending} onClick={save}>
  Save
</button>
```

**Stable grouping keys.**

- Group and key records by stable ID rather than display label — because labels can change or collide.
- Give unassigned records a distinct key — because a real record can have the same label as the unassigned display text.

```ts
// Bad: a project named "No project" collides with unassigned tasks.
const key = task.projectName ?? "No project";
```

```ts
// Good: stable IDs cannot collide with the unassigned sentinel.
const key = task.projectId === null ? "unassigned" : `project:${task.projectId}`;
```

## Migrations and Data Evolution

### Generation

- Finish schema, relationships, constraints, indexes, and ownership before generating migrations rather than stacking corrections for the same unshipped implementation — because migration history must describe a complete design.
- Change the Drizzle schema before running `pnpm db:generate` — because generated SQL must come from the schema authority.
- Review generated SQL — because generated operations can still lose data or encode unintended changes.
- Keep SQL, snapshot metadata, and journal consistent — because migration tooling relies on their agreement.
- Treat unexpected follow-up generation as schema drift to resolve before completion — because a second generation should not reveal an unfinished schema.

### Application and correction

- Apply schema changes with `pnpm db:migrate` rather than manual production edits — because all environments need reproducible schema history.
- Consolidate corrections before a migration is applied anywhere — because unapplied mistakes need no permanent corrective history.
- Never rewrite applied migrations unless the owning environment explicitly recreates its database — because durable environments have already recorded and executed them.
- Append one deliberate forward migration for corrections to applied migrations when the environment does not explicitly recreate its database — because existing databases need an upgrade path.
- Preserve durable or deployed data — because deployment must not discard users' records.

### Data evolution

- Preserve existing data when changing required columns, relationships, identifiers, or representations — because schema evolution must not silently destroy meaning.
- Use explicit backfills and staged constraints when one atomic migration is unsafe — because existing rows must satisfy new invariants before enforcement.
- Keep unrelated schema changes in separate migrations — because each migration needs a coherent review and recovery scope.
- Put required startup records, such as the first site, in migrations — because every migrated environment must be able to open the app.
- Use only `pnpm db:migrate`, `pnpm build`, and `pnpm start` for live and published startup, without a seed command — because required records already belong to migrations.

### Verification databases

- Run end-to-end tests against a separately migrated database — because tests must not modify user data.
- Create end-to-end test records through the API — because setup must exercise application contracts.
- Inspect `.dbs/database.db` only read-only during verification, never migrating, seeding, resetting, truncating, deleting, or otherwise mutating it — because it is the application's database.
- Use `.dbs/e2e.db` through `E2E_DATABASE_FILE_PATH` or a clearly isolated temporary database for writable verification — because verification must not alter application data.
- Commit required code changes rather than relying on sandbox database changes — because a task sandbox's `.dbs/database.db` is deleted and only committed code reaches preview.
- Follow [Code Rules tests](./code-rules.md#tests) for isolation and cleanup — because shared records and hidden cleanup failures make verification unreliable.

## Performance and Resource Bounds

### Measurement and bounds

- Measure before adding performance-specific complexity — because assumptions can select the wrong optimization.
- Record the measured workload — because results without workload evidence cannot be reproduced.
- Compare relevant alternatives under identical conditions — because differing conditions invalidate the comparison.
- Bound database reads, request and response size, concurrency, queues, retained client state, logs, and generated output — because each can grow without limit under sustained load.
- Window or paginate growing history rather than retaining it all in memory or the DOM — because uptime must not cause unlimited resource use.

### Caches and delivery

- Give each cache one clear owner — because invalidation must have an accountable boundary.
- Add a cache only for a measurable benefit — because caching introduces consistency and memory obligations.
- Define each cache's invalidation or expiry rule — because stale data and retained memory otherwise have no lifecycle.
- Follow [Code Rules frontend](./code-rules.md#frontend) for lazy-loading large features unless needed for first paint — because startup must not load unnecessary code.
- Keep hashed static assets long-cacheable — because content hashes make immutable asset reuse safe.
- Keep HTML short-cacheable — because navigation must discover current asset versions.

## Reliability and Failure Handling

### External work

- Set timeouts at external IO boundaries — because a dependency may never finish.
- Propagate cancellation to underlying work — because cancelling a wrapper alone leaves IO running.
- Retry only transient failures — because permanent failures will not recover by repeating the operation.
- Bound retry attempts and delay — because retries must not amplify load indefinitely.
- Retry non-idempotent operations only when duplicate execution is prevented — because retrying otherwise repeats side effects.

### Recovery and diagnostics

- Separate required changes from best-effort follow-up work — because optional failure must not ambiguously undo committed work.
- Specify partial-failure behavior — because callers need to know which effects survived.
- Close listeners, timers, database handles, child processes, temporary files, object URLs, and other resources in their owning scope — because abandoned resources accumulate over uptime.
- Persist state needed after process restart rather than relying on memory — because process memory is not durable.
- Follow [Secrets and Diagnostics](./code-rules.md#secrets-and-diagnostics) for useful sanitized operational context — because diagnosis must not expose credentials or sensitive payloads.

## Security and Data Safety

### Access and inputs

- Authenticate at the transport boundary — because each request needs a verified identity.
- Authorize each operation against its target resource at the service boundary — because permission to view does not imply permission to change or delete.
- Include authorized ownership scope in database operations rather than trusting supplied identifiers — because a valid ID can belong to another tenant.
- Accept only contract fields intended for the operation rather than spreading arbitrary request objects into writes — because callers must not choose protected fields.
- Use Drizzle or parameterized SQL rather than concatenating untrusted values — because parameters prevent input from becoming executable SQL.

### Secrets and destruction

- Follow [Secrets and Diagnostics](./code-rules.md#secrets-and-diagnostics) for secret handling — because sensitive values must stay outside source, committed configuration, URLs, and logs.
- Make destructive actions explicit — because accidental deletion must not look like a harmless action.
- Authorize destructive actions — because read access alone does not permit destruction.
- Scope destructive actions to their intended targets — because broad predicates can delete unrelated records.
- Preserve recoverability when the product requires it — because authorized destruction can still require undo or audit.
