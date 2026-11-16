import { z } from "zod";

import { APP_NAME } from "./app-name.js";

export const HealthResponseSchema = z.object({
  name: z.literal(APP_NAME),
  status: z.literal("ok"),
  timestamp: z.iso.datetime(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
