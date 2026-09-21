import { z } from "zod";

/**
 * Template backend note:
 *
 * These contracts are intentionally a sample API slice. They show how a
 * consuming CPQ app would structure runtime validation, but they are not
 * required for the initial frontend shell and should be replaced wholesale
 * when the real API contract is introduced.
 */

/**
 * Sample estimate status enum shared across the example backend slice.
 */
export const EstimateStatusSchema = z.enum(["draft", "review", "approved"]);

/**
 * Sample runtime contract for a persisted estimate row.
 */
export const EstimateSchema = z.object({
  id: z.number().int().positive(),
  estimate_number: z.string().min(1),
  account_name: z.string().min(1),
  project_name: z.string().min(1),
  status: EstimateStatusSchema,
  workflow_stage: z.string().min(1),
  item_count: z.number().int().nonnegative(),
  total_value: z.number().nonnegative(),
  margin_percent: z.number().nonnegative(),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

/**
 * Sample runtime contract for estimate creation input.
 */
export const CreateEstimateInputSchema = z.object({
  estimate_number: z.string().min(1).max(80),
  account_name: z.string().min(1).max(200),
  project_name: z.string().min(1).max(200),
  status: EstimateStatusSchema.optional(),
  workflow_stage: z.string().min(1).max(120),
  item_count: z.number().int().nonnegative(),
  total_value: z.number().nonnegative(),
  margin_percent: z.number().nonnegative(),
  notes: z.string().max(2_000).optional(),
});

/**
 * Sample runtime contract for estimate list filters.
 */
export const ListEstimatesFilterSchema = z.object({
  status: EstimateStatusSchema.optional(),
  search: z.string().min(1).optional(),
});

export type Estimate = z.infer<typeof EstimateSchema>;
export type CreateEstimateInput = z.infer<typeof CreateEstimateInputSchema>;
export type ListEstimatesFilter = z.infer<typeof ListEstimatesFilterSchema>;
