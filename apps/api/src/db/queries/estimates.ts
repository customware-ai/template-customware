import { and, asc, eq, like, or, type SQL } from "drizzle-orm";
import { ResultAsync } from "neverthrow";

import type { CreateEstimateInput, ListEstimatesFilter } from "../../contracts/estimate.js";
import type { DatabaseError } from "../../types/errors.js";
import { getDatabase } from "../index.js";
import { estimates } from "../schemas.js";

/**
 * Template backend note:
 *
 * These query helpers are sample-only. They show how the template wires
 * Drizzle, neverthrow, and runtime validation together, but they are not tied
 * to any specific product domain and can be deleted when the real query layer
 * exists.
 */

/**
 * Maps unknown errors to a typed database error contract.
 */
function mapDatabaseError(message: string, error: unknown): DatabaseError {
  return {
    type: "DATABASE_ERROR",
    message,
    originalError: error instanceof Error ? error : undefined,
  };
}

/**
 * Reads estimates with optional status and text search filters.
 * This is sample query behavior for the example API slice.
 */
export function listEstimateRows(
  filters: ListEstimatesFilter,
): ResultAsync<(typeof estimates.$inferSelect)[], DatabaseError> {
  const run = ResultAsync.fromThrowable(
    async () => {
      const db = getDatabase();
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

      return db.select().from(estimates).where(whereClause).orderBy(asc(estimates.estimate_number));
    },
    (error: unknown) => mapDatabaseError("Failed to list estimates", error),
  );

  return run();
}

/**
 * Inserts an estimate and returns the created row.
 * Keep this as a reference for the sample API slice only.
 */
export function createEstimateRow(
  input: CreateEstimateInput,
): ResultAsync<typeof estimates.$inferSelect, DatabaseError> {
  const run = ResultAsync.fromThrowable(
    async () => {
      const db = getDatabase();
      const createdRows = await db
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
        .returning();

      const created = createdRows[0];
      if (!created) {
        throw new Error("Estimate insert returned no rows");
      }

      return created;
    },
    (error: unknown) => mapDatabaseError("Failed to create estimate", error),
  );

  return run();
}
