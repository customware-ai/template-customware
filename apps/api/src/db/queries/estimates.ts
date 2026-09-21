import { Result } from "better-result";
import { and, asc, eq, like, or, type SQL } from "drizzle-orm";

import type { CreateEstimateInput, ListEstimatesFilter } from "../../contracts/estimate.js";
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
  filters: ListEstimatesFilter,
): Promise<Result<(typeof estimates.$inferSelect)[], DatabaseError>> {
  return Result.gen(async function* () {
    const db = yield* getDatabase();
    const rows = yield* Result.await(
      Result.tryPromise({
        try: async () => {
          const predicates: SQL[] = [];

          if (filters.status) {
            predicates.push(eq(estimates.status, filters.status));
          }

          if (filters.search) {
            const pattern = `%${filters.search}%`;
            const searchPredicate = or(
              like(estimates.estimate_number, pattern),
              like(estimates.account_name, pattern),
              like(estimates.project_name, pattern),
            );

            if (searchPredicate) {
              predicates.push(searchPredicate);
            }
          }

          if (predicates.length === 0) {
            return db.select().from(estimates).orderBy(asc(estimates.estimate_number));
          }

          const whereClause = predicates.length === 1 ? predicates[0] : and(...predicates);

          return db
            .select()
            .from(estimates)
            .where(whereClause)
            .orderBy(asc(estimates.estimate_number));
        },
        catch: (error: unknown) => databaseError("Failed to list estimates", error),
      }),
    );

    return Result.ok(rows);
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
