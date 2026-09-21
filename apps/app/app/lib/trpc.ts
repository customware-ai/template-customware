import type { AppRouter } from "@template-customware/api/trpc";
import { createTRPCReact } from "@trpc/react-query";

/** Typed browser access to the API router. */
export const trpc = createTRPCReact<AppRouter>({ abortOnUnmount: true });
