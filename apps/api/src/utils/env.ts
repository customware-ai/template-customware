import { z } from "zod";

/**
 * Default HTTP port used when no valid PORT value is provided.
 */
export const DEFAULT_SERVER_PORT = 8080;

const ServerPortSchema = z.coerce.number().int().min(1).max(65_535);

/**
 * Resolves the HTTP port from process environment values while rejecting
 * unusable input such as empty strings or out-of-range ports.
 */
export function resolveServerPort(environment: NodeJS.ProcessEnv): number {
  const parsedPort = ServerPortSchema.safeParse(environment.PORT);

  return parsedPort.success ? parsedPort.data : DEFAULT_SERVER_PORT;
}
