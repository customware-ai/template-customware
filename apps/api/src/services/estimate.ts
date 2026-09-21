import { Result } from "better-result";
import { ZodError } from "zod";

import {
  EstimateSchema,
  type CreateEstimateInput,
  type Estimate,
  type ListEstimatesFilter,
} from "../contracts/estimate.js";
import { createEstimateRow, listEstimateRows } from "../db/queries/estimates.js";
import type { AppError, ValidationError } from "../types/errors.js";

/**
 * Template backend note:
 *
 * This service module is a sample orchestration layer. It exists so the
 * template demonstrates a realistic service boundary, but the consuming app
 * should replace it when its own CPQ domain rules are known.
 */

/**
 * Converts zod issues into a typed validation error payload.
 */
function validationError(message: string, issues: string[]): ValidationError {
  return {
    type: "VALIDATION_ERROR",
    message,
    issues,
  };
}

function validationIssues(cause: unknown, fallback: string): string[] {
  return cause instanceof ZodError ? cause.issues.map((issue) => issue.message) : [fallback];
}

/**
 * Returns estimates for the template example service and validates persisted rows.
 * This is sample list behavior, not a product-specific decision.
 */
export async function listEstimates(
  filters: ListEstimatesFilter,
): Promise<Result<Estimate[], AppError>> {
  return Result.gen(async function* () {
    const rows = yield* Result.await(listEstimateRows(filters));
    const estimates = yield* Result.try({
      try: () => rows.map((row) => EstimateSchema.parse(row)),
      catch: (cause) =>
        validationError(
          "Failed to parse estimate rows",
          validationIssues(cause, "Database rows did not match the estimate contract."),
        ),
    });

    return Result.ok(estimates);
  });
}

/**
 * Creates a single estimate and validates the persisted row.
 * Keep this as the sample mutation path until the consuming app defines its
 * own backend contract.
 */
export async function createEstimate(
  input: CreateEstimateInput,
): Promise<Result<Estimate, AppError>> {
  return Result.gen(async function* () {
    const row = yield* Result.await(createEstimateRow(input));
    const estimate = yield* Result.try({
      try: () => EstimateSchema.parse(row),
      catch: (cause) =>
        validationError(
          "Failed to parse created estimate",
          validationIssues(cause, "Database row did not match the estimate contract."),
        ),
    });

    return Result.ok(estimate);
  });
}
