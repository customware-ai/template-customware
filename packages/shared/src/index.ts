import { z } from "zod";

export const APP_NAME = "Customware Template";

export const HealthResponseSchema = z.object({
  name: z.literal(APP_NAME),
  status: z.literal("ok"),
  timestamp: z.iso.datetime(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
