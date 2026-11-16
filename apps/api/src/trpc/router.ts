import { TRPCError, initTRPC } from "@trpc/server";

import { CreateTodoInputSchema } from "@cw/shared/todo";

import {
  DEFAULT_TODO_PAGE_SIZE,
  ListTodosInputSchema,
  TodoActivityInputSchema,
} from "../contracts/todo.js";
import { logServerEvent } from "../services/logging.js";
import { createTodo, getTodoActivity, listTodos } from "../services/todo.js";
import type { DatabaseError } from "../types/errors.js";

/**
 * TEMPLATE EXAMPLE ONLY. This Notes and Todos router demonstrates transport
 * wiring. Replace its procedures when the real product API is implemented.
 */

const t = initTRPC.create();

function toTrpcError(error: DatabaseError): TRPCError {
  logServerEvent("error", error.message, {
    type: error.type,
    detail: error.originalError?.message,
  }).unwrapOr(undefined);
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong. Please try again.",
  });
}

export const appRouter = t.router({
  listTodos: t.procedure.input(ListTodosInputSchema.optional()).query(({ input }) => {
    const result = listTodos(input ?? { limit: DEFAULT_TODO_PAGE_SIZE });
    if (result.isErr()) throw toTrpcError(result.error);
    return result.value;
  }),

  todoActivity: t.procedure.input(TodoActivityInputSchema).query(({ input }) => {
    const result = getTodoActivity(input);
    if (result.isErr()) throw toTrpcError(result.error);
    return result.value;
  }),

  createTodo: t.procedure.input(CreateTodoInputSchema).mutation(({ input }) => {
    const result = createTodo(input);
    if (result.isErr()) throw toTrpcError(result.error);
    return result.value;
  }),
});

export type AppRouter = typeof appRouter;
