# Application Design

This is a system-admin-owned engineering guideline. Autonomous task agents must read it before designing or changing application behavior, APIs, persistence, queries, pagination, concurrency, or production reliability. They must not edit, rewrite, or remove it.

Production features must remain correct as data volume, concurrency, runtime duration, and failure frequency grow. Design those properties into the owning boundary rather than adding them after a failure.

## Ownership and Flow

A normal operation follows one direction:

```text
React route or component
  -> tRPC React Query client
  -> Hono tRPC endpoint
  -> tRPC procedure
  -> service
  -> Zod contract
  -> database query
  -> Drizzle client
  -> SQLite
```

- `apps/app/app/routes.ts` owns the browser route tree.
- Browser routes, layouts, and components own presentation and interaction, not authorization or persistence.
- `apps/api/src/trpc/` owns typed procedures and transport mapping.
- `apps/api/src/contracts/` owns server input and output schemas.
- `apps/api/src/services/` owns business rules, authorization decisions, and orchestration.
- `apps/api/src/db/queries/` owns reads and writes; `schemas.ts` owns tables; `index.ts` owns database initialization.
- `packages/shared/` contains only pure values and contracts genuinely consumed by both applications.

Keep transport, business rules, persistence, and rendering separate. Do not bypass an owning layer for convenience.

## Relational Data Modeling

- Give every durable entity a stable primary key.
- Represent real relationships with foreign keys rather than duplicated identifiers or application-only assumptions.
- Define cardinality deliberately. Use a junction table for many-to-many relationships and give that relationship its own constraints when it carries state.
- Make required values `NOT NULL`. Use `UNIQUE`, `CHECK`, and foreign-key constraints to enforce invariants that must hold regardless of the writer.
- Choose foreign-key deletion behavior explicitly. Use cascade only when the child has no meaning without its parent; use restrict when deletion would destroy independently valuable data; use set-null only when the relationship is genuinely optional.
- Normalize authoritative data first. Duplicate or denormalize only after measurement proves a need and one owner is responsible for keeping it consistent.
- Do not persist values that can be derived cheaply and reliably unless the persisted snapshot is itself a product requirement.
- Model lifecycle state explicitly. Avoid combinations of booleans that permit impossible states.
- Store timestamps in one consistent UTC representation and define which boundary creates or updates them.

## Indexes and Query Shape

- Design indexes from actual lookup, filter, join, uniqueness, and ordering requirements.
- Index foreign-key columns used for joins or parent-scoped reads.
- For compound indexes, order columns to match equality filters first and then range or ordering fields used by the query.
- Do not add speculative indexes. Every index increases write work and storage.
- Select only the fields the operation needs and avoid loading unbounded related collections.
- Apply filters that materially reduce a collection—such as lifecycle state, authorization scope, search, and ownership—in the database query. Never fetch a full or unbounded collection and then filter it on the server or in the browser.
- Filtering a small, already bounded result in the browser is acceptable for transient presentation when it does not affect authorization, pagination, counts, or result correctness.
- Return display-ready rows from the query boundary. Never hydrate records or perform authorization, lock, or relationship lookups once per returned row; join or batch that work instead.
- Inspect generated SQL and query plans when query cost or index use is uncertain.

Prefer one joined or batched query over per-row work:

```ts
// Good: the database returns the display shape in one bounded operation.
const rows = await db
  .select({ taskId: tasks.id, title: tasks.title, assigneeName: users.name })
  .from(tasks)
  .leftJoin(users, eq(tasks.assigneeId, users.id))
  .where(and(eq(tasks.projectId, projectId), eq(tasks.status, "open")))
  .limit(pageSize + 1);

// Avoid: list tasks, then query the assignee once for every task.
```

## Pagination and Bounded Reads

- Every collection that can grow without a small hard product limit must be paginated or otherwise bounded.
- Prefer cursor pagination for mutable or growing collections. Offset pagination is acceptable only for small, stable data or when exact page-number navigation is a real requirement.
- Use a deterministic total order. Add a unique tie-breaker such as the primary key when the visible sort field is not unique.
- A cursor must contain every value needed to continue that exact ordering; never use an ambiguous timestamp-only cursor.
- Keep filters, authorization scope, and ordering consistent across pages. Changing them starts a new pagination sequence.
- Enforce a server-side maximum page size and return only enough metadata to continue.
- Do not calculate an expensive total count unless the product actually displays or requires it.
- Pagination must not skip or duplicate records under ordinary inserts or updates for the chosen consistency model.

A cursor must mirror the complete deterministic ordering:

```ts
const afterCursor = cursor
  ? or(
      gt(records.createdAt, cursor.createdAt),
      and(eq(records.createdAt, cursor.createdAt), gt(records.id, cursor.id)),
    )
  : undefined;

const rows = await db
  .select()
  .from(records)
  .where(and(scopeFilter, afterCursor))
  .orderBy(asc(records.createdAt), asc(records.id))
  .limit(pageSize + 1);
```

Return at most `pageSize` rows. Use the extra row only to determine whether a next cursor exists.

## Transactions and Concurrency

- Put changes that must succeed or fail together in one database transaction.
- Keep transactions short and exclude network calls or unrelated computation.
- Let database constraints be the final authority for uniqueness and relational invariants; preflight checks exist only for better UX.
- Protect read-modify-write flows from lost updates with an atomic statement, transaction, version field, or another explicit concurrency strategy.
- Make retried write operations idempotent when duplicate execution is possible. Persist an idempotency key when process memory cannot provide that guarantee.
- Define ownership for background work, locks, leases, and cleanup. Never rely on an in-memory flag for durable exclusivity.

Keep one atomic business change inside its owning transaction:

```ts
const result = database.transaction((tx) => {
  const order = tx.insert(orders).values(orderInput).returning().get();
  tx.insert(orderItems)
    .values(items.map((item) => ({ ...item, orderId: order.id })))
    .run();
  return order;
});
```

Network calls and other retryable IO stay outside the transaction.

## API and State Contracts

- Validate untrusted input once with the owning Zod schema and pass the resulting typed value inward.
- Expose explicit input and output contracts rather than database rows or implementation-specific exceptions.
- Keep authorization at the service boundary and scope every query to the authorized owner or tenant.
- Return structured expected failures that clients can handle without parsing message text.
- Do not silently change the meaning of an existing field. Evolve contracts intentionally and remove superseded forms when compatibility is no longer required.
- Keep one authoritative owner for server state. Client caches may predict or retain state, but they must reconcile with authoritative responses.
- Design mutations so their success response contains the authoritative data needed to update the client without an avoidable second read.

## Browser Server State

- TanStack Query through `@trpc/react-query` is the single owner of browser server state. Do not mirror query results into component state or add another fetch cache.
- Use the typed tRPC hooks that fit the operation: `useQuery` for bounded reads, `useInfiniteQuery` for cursor pages, `useMutation` for writes, `useUtils` for cache operations, and the prefetch hooks for likely next navigation or pages.
- Include client-selected filters, ordering, and pagination in the tRPC input so TanStack Query gives each result set the correct cache identity. Apply trusted authorization scope at the service and database boundaries, not from client input.
- Set `staleTime`, `gcTime`, refetch triggers, polling, and bounded read retries from the data's actual freshness and failure needs. Do not apply one policy to unrelated queries or automatically retry unsafe mutations.
- Preserve usable cached data during background refetches and page changes, using placeholder data when continuity is correct. Show an initial loader only when no usable data exists.
- For predictable mutations, cancel affected queries, snapshot and optimistically update their cached data, roll back on failure, then reconcile with the authoritative response and invalidate only affected query keys.
- Use tRPC's integration for cancellation rather than adding parallel request plumbing. Abort work that is no longer useful, but allow useful prefetches to finish populating the cache.

Use an infinite query when the server returns a cursor:

```tsx
const input = { projectId, limit: 25 };
const tasks = trpc.tasks.list.useInfiniteQuery(input, {
  getNextPageParam: (page) => page.nextCursor ?? undefined,
  staleTime: 30_000,
});

const visibleTasks = tasks.data?.pages.flatMap((page) => page.items) ?? [];
```

For predictable changes, update the cache optimistically and keep a rollback snapshot:

```tsx
const utils = trpc.useUtils();
const updateTask = trpc.tasks.update.useMutation({
  onMutate: async (change) => {
    await utils.tasks.list.cancel(input);
    const previous = utils.tasks.list.getInfiniteData(input);
    utils.tasks.list.setInfiniteData(input, (current) => applyTaskChange(current, change));
    return { previous };
  },
  onError: (_error, _change, context) => {
    utils.tasks.list.setInfiniteData(input, context?.previous);
  },
  onSuccess: (savedTask) => {
    utils.tasks.list.setInfiniteData(input, (current) => reconcileTask(current, savedTask));
  },
  onSettled: () => utils.tasks.list.invalidate(input),
});
```

## Migrations and Data Evolution

- Change the Drizzle schema first, then generate migrations with `pnpm db:generate`.
- Review generated SQL and keep the SQL file, snapshot metadata, and migration journal consistent.
- Apply migrations with `pnpm db:migrate`; never mutate production schema manually.
- Treat unexpected follow-up generation as schema drift and fix it before completion.
- Preserve existing data deliberately when changing a required column, relationship, identifier, or representation. Use an explicit backfill and staged constraint change when one atomic migration cannot do so safely.
- Do not combine unrelated schema changes in one migration.
- Seed and fixture data are not schema migrations.

The application database is `.dbs/database.db`. Verification may inspect it read-only but must never migrate, seed, reset, truncate, delete, or otherwise mutate it. Verification uses `.dbs/e2e.db` through `E2E_DATABASE_FILE_PATH` or a clearly isolated temporary database.

The shared SQLite connection enables foreign-key enforcement, WAL mode, `NORMAL` synchronization, and a ten-second busy timeout. Keep those production defaults unless measured behavior requires a deliberate change.

## Performance and Resource Bounds

- Measure before adding performance-specific complexity. Record the workload and compare relevant alternatives under the same conditions.
- Bound database reads, request and response size, concurrency, queues, retained client state, logs, and generated output.
- Avoid holding an entire growing history in memory or the DOM when a windowed or paginated representation is sufficient.
- Cache only when there is one clear owner, a measurable benefit, and an explicit invalidation or expiry rule.
- Load large client features behind `import()` or `React.lazy` unless they are required for first paint.
- Preserve static delivery behavior: hashed assets remain long-cacheable and HTML remains short-cacheable.

## Reliability and Failure Handling

- Put timeouts at external IO boundaries and propagate cancellation to the underlying work.
- Retry only transient failures, with bounded attempts and delay. Do not retry a non-idempotent operation unless duplicate execution is prevented.
- Separate required state changes from best-effort follow-up work and make partial-failure behavior explicit.
- Close listeners, timers, database handles, child processes, temporary files, and other resources in the scope that owns them.
- Persist state needed to recover after process restart; do not treat process memory as durable state.
- Log operational context needed to diagnose a failure without recording credentials or sensitive payloads.

## Security and Data Safety

- Authenticate at the transport boundary and authorize each operation against the target resource at the service boundary.
- Never trust an identifier merely because the client supplied it; include ownership scope in the database operation.
- Accept only contract fields intended for the operation. Do not spread arbitrary request objects into persistence writes.
- Keep secrets outside source, committed configuration, URLs, and logs.
- Use Drizzle or parameterized statements; never construct SQL by concatenating untrusted values.
- Make destructive actions explicit, authorized, and scoped. Preserve recoverability when the product requires it.
