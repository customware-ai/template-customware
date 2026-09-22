import { Result } from "better-result";
import { ZodError } from "zod";

import {
  TodoPageSchema,
  TodoSchema,
  type CreateTodoInput,
  type ListTodosInput,
  type Todo,
  type TodoPage,
} from "../contracts/todo.js";
import { createTodoRow, listTodoRows, type TodoRow } from "../db/queries/todos.js";
import type { AppError, ValidationError } from "../types/errors.js";

/**
 * TEMPLATE EXAMPLE ONLY. This Notes and Todos service demonstrates an
 * orchestration boundary. Replace it when the real product service layer is
 * implemented.
 */

function validationError(message: string, cause: unknown): ValidationError {
  return {
    type: "VALIDATION_ERROR",
    message,
    issues: cause instanceof ZodError ? cause.issues.map((issue) => issue.message) : [],
  };
}

function parseTodoRow(row: TodoRow): Result<Todo, ValidationError> {
  return Result.try({
    try: () => TodoSchema.parse({ ...row.todo, note: row.note }),
    catch: (cause) => validationError("Stored todo data is invalid.", cause),
  });
}

export function listTodos(input: ListTodosInput): Promise<Result<TodoPage, AppError>> {
  return Result.gen(async function* () {
    const page = yield* Result.await(listTodoRows(input));
    const items = yield* Result.all(page.rows.map(parseTodoRow));
    return Result.try({
      try: () => TodoPageSchema.parse({ items, nextCursor: page.nextCursor }),
      catch: (cause) => validationError("Todo page data is invalid.", cause),
    });
  });
}

export function createTodo(input: CreateTodoInput): Promise<Result<Todo, AppError>> {
  return Result.gen(async function* () {
    const row = yield* Result.await(createTodoRow(input));
    return parseTodoRow(row);
  });
}
