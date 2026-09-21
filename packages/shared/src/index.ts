import { Result } from "better-result";
import { z } from "zod";

export const APP_NAME = "Customware Template";

export const HealthResponseSchema = z.object({
  name: z.literal(APP_NAME),
  status: z.literal("ok"),
  timestamp: z.iso.datetime(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export type HealthResponseParseError = {
  type: "HEALTH_RESPONSE_PARSE_ERROR";
  message: string;
  issues: string[];
};

export type HealthResponseResult = Result<HealthResponse, HealthResponseParseError>;

/**
 * Decodes the shared health contract without leaking a thrown schema failure.
 */
export function parseHealthResponse(input: unknown): HealthResponseResult {
  return Result.try({
    try: () => HealthResponseSchema.parse(input),
    catch: (cause): HealthResponseParseError => ({
      type: "HEALTH_RESPONSE_PARSE_ERROR",
      message: "Health response did not match the shared contract.",
      issues: cause instanceof z.ZodError ? cause.issues.map((issue) => issue.message) : [],
    }),
  });
}
