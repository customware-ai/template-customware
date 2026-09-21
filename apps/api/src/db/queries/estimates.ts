import { Result } from "better-result";
import { and, asc, eq, gt, like, or, type SQL } from "drizzle-orm";

import type {
  CreateEstimateInput,
  EstimateCursor,
  ListEstimatesInput,
} from "../../contracts/estimate.js";
import { databaseError, type DatabaseError } from "../../types/errors.js";
import { getDatabase } from "../index.js";
import { estimates } from "../schemas.js";

/**
 * Template backend note:
 *
 * These query helpers are sample-only. They show how the template wires
 * Drizzle, BetterResult, and runtime validation together, but they are not tied
 * to any specific product domain and can be deleted when the real query layer
 * exists.
 */

/**
 * Reads estimates with optional status and text search filters.
 * This is sample query behavior for the example API slice.
 */
export function listEstimateRows(
  input: ListEstimatesInput,
): Promise<
  Result<
    { rows: (typeof estimates.$inferSelect)[]; nextCursor: EstimateCursor | null },
    DatabaseError
  >
> {
  return Result.gen(async function* () {
    const db = yield* getDatabase();
    const page = yield* Result.await(
      Result.tryPromise({
        try: async () => {
          const predicates: SQL[] = [];

          if (input.status) {
            predicates.push(eq(estimates.status, input.status));
          }

          if (input.search) {
            const pattern = `%${input.search}%`;
            const searchPredicate = or(
              like(estimates.estimate_number, pattern),
              like(estimates.account_name, pattern),
              like(estimates.project_name, pattern),
            );

            if (searchPredicate) {
              predicates.push(searchPredicate);
            }
          }

          if (input.cursor) {
            const afterCursor = or(
              gt(estimates.estimate_number, input.cursor.estimate_number),
              and(
                eq(estimates.estimate_number, input.cursor.estimate_number),
                gt(estimates.id, input.cursor.id),
              ),
            );
            if (afterCursor) {
              predicates.push(afterCursor);
            }
          }

          const rows = await db
            .select()
            .from(estimates)
            .where(predicates.length === 0 ? undefined : and(...predicates))
            .orderBy(asc(estimates.estimate_number), asc(estimates.id))
            .limit(input.limit + 1);
          const hasNextPage = rows.length > input.limit;
          const visibleRows = hasNextPage ? rows.slice(0, input.limit) : rows;
          const lastRow = visibleRows.at(-1);

          return {
            rows: visibleRows,
            nextCursor:
              hasNextPage && lastRow
                ? { estimate_number: lastRow.estimate_number, id: lastRow.id }
                : null,
          };
        },
        catch: (error: unknown) => databaseError("Failed to list estimates", error),
      }),
    );

    return Result.ok(page);
  });
}

/**
 * Inserts an estimate and returns the created row.
 * Keep this as a reference for the sample API slice only.
 */
export function createEstimateRow(
  input: CreateEstimateInput,
): Promise<Result<typeof estimates.$inferSelect, DatabaseError>> {
  return Result.gen(async function* () {
    const db = yield* getDatabase();
    const createdRows = yield* Result.await(
      Result.tryPromise({
        try: async () =>
          db
            .insert(estimates)
            .values({
              estimate_number: input.estimate_number,
              account_name: input.account_name,
              project_name: input.project_name,
              status: input.status ?? "draft",
              workflow_stage: input.workflow_stage,
              item_count: input.item_count,
              total_value: input.total_value,
              margin_percent: input.margin_percent,
              notes: input.notes ?? null,
            })
            .returning(),
        catch: (error: unknown) => databaseError("Failed to create estimate", error),
      }),
    );

    const created = createdRows[0];
    if (!created) {
      return Result.err(databaseError("Estimate insert returned no rows", undefined));
    }

    return Result.ok(created);
  });
}
