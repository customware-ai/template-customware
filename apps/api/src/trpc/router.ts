import { TRPCError, initTRPC } from "@trpc/server";

import {
  CreateEstimateInputSchema,
  DEFAULT_ESTIMATE_PAGE_SIZE,
  ListEstimatesInputSchema,
} from "../contracts/estimate.js";
import { createEstimate, listEstimates } from "../services/estimate.js";
import type { AppError } from "../types/errors.js";

/**
 * Template backend note:
 *
 * This router is the sample API contract for the example backend slice. It is
 * intentionally small so the template shows how procedures hang together,
 * while still making it obvious that a consuming app can replace the whole
 * router with its own CPQ contract surface.
 */

const t = initTRPC.create();

/**
 * Maps typed app errors into tRPC errors for transport.
 */
function toTrpcError(error: AppError): TRPCError {
  if (error.type === "VALIDATION_ERROR") {
    return new TRPCError({
      code: "BAD_REQUEST",
      message: error.message,
    });
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error.message,
  });
}

/**
 * Minimal template router with one related CPQ estimate example flow.
 * The procedures below are sample-only and exist to show wiring, not product
 * opinion.
 */
export const appRouter = t.router({
  listEstimates: t.procedure.input(ListEstimatesInputSchema.optional()).query(async ({ input }) => {
    const result = await listEstimates(input ?? { limit: DEFAULT_ESTIMATE_PAGE_SIZE });
    if (result.isErr()) {
      throw toTrpcError(result.error);
    }

    return result.value;
  }),

  createEstimate: t.procedure.input(CreateEstimateInputSchema).mutation(async ({ input }) => {
    const result = await createEstimate(input);
    if (result.isErr()) {
      throw toTrpcError(result.error);
    }

    return result.value;
  }),
});

export type AppRouter = typeof appRouter;
