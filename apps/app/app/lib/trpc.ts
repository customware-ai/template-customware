import type { AppRouter } from "@cw/api/trpc";
import { createTRPCReact, type CreateTRPCReact } from "@trpc/react-query";

/** Typed browser access to the API router. */
export const trpc: CreateTRPCReact<AppRouter, unknown> = createTRPCReact<AppRouter>({
  abortOnUnmount: true,
});
