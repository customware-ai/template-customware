import { TRPCError, initTRPC } from "@trpc/server";

import {
  CreateTodoInputSchema,
  DEFAULT_TODO_PAGE_SIZE,
  ListTodosInputSchema,
} from "../contracts/todo.js";
import { createTodo, listTodos } from "../services/todo.js";
import type { AppError } from "../types/errors.js";

/**
 * TEMPLATE EXAMPLE ONLY. This Notes and Todos router demonstrates transport
 * wiring. Replace its procedures when the real product API is implemented.
 */

const t = initTRPC.create();

function toTrpcError(error: AppError): TRPCError {
  if (error.type === "VALIDATION_ERROR") {
    return new TRPCError({ code: "BAD_REQUEST", message: error.message });
  }

  return new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
}

export const appRouter = t.router({
  listTodos: t.procedure.input(ListTodosInputSchema.optional()).query(async ({ input }) => {
    const result = await listTodos(input ?? { limit: DEFAULT_TODO_PAGE_SIZE });
    if (result.isErr()) throw toTrpcError(result.error);
    return result.value;
  }),

  createTodo: t.procedure.input(CreateTodoInputSchema).mutation(async ({ input }) => {
    const result = await createTodo(input);
    if (result.isErr()) throw toTrpcError(result.error);
    return result.value;
  }),
});

export type AppRouter = typeof appRouter;
