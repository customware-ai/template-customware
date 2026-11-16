import type { Result } from "better-result";
import type { CreateTodoInput } from "@cw/shared/todo";

import type {
  ListTodosInput,
  Todo,
  TodoActivity,
  TodoActivityInput,
  TodoPage,
} from "../contracts/todo.js";
import { insertTodo, selectTodoActivity, selectTodoPage } from "../db/queries/todos.js";
import type { DatabaseError } from "../types/errors.js";

/**
 * TEMPLATE EXAMPLE ONLY. This Notes and Todos service is the orchestration
 * boundary between tRPC and the queries. Replace it when the real product
 * service layer is implemented.
 */

/** Lists one page of todos. */
export function listTodos(input: ListTodosInput): Result<TodoPage, DatabaseError> {
  return selectTodoPage(input);
}

/** Creates a todo with its optional note. */
export function createTodo(input: CreateTodoInput): Result<Todo, DatabaseError> {
  return insertTodo(input);
}

/** Counts todos created per local day for the last week. */
export function getTodoActivity(input: TodoActivityInput): Result<TodoActivity, DatabaseError> {
  return selectTodoActivity(input);
}
