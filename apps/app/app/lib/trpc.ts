import type { AppRouter } from "@template-customware/api/trpc";
import { createTRPCReact, type CreateTRPCReact } from "@trpc/react-query";

/** Typed browser access to the API router. */
export const trpc: CreateTRPCReact<AppRouter, unknown> = createTRPCReact<AppRouter>({
  abortOnUnmount: true,
});
