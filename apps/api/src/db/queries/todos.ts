import { Result } from "better-result";
import { and, count, desc, eq, gte, like, lt, or, sql } from "drizzle-orm";

import type { CreateTodoInput } from "@cw/shared/todo";

import {
  TODO_ACTIVITY_DAYS,
  TodoActivitySchema,
  TodoPageSchema,
  TodoSchema,
  type ListTodosInput,
  type Todo,
  type TodoActivity,
  type TodoActivityInput,
  type TodoPage,
} from "../../contracts/todo.js";
import { databaseError, type DatabaseError } from "../../types/errors.js";
import { getDatabase } from "../index.js";
import { notes, todos } from "../schemas.js";

/**
 * TEMPLATE EXAMPLE ONLY. These Notes and Todos queries demonstrate Drizzle,
 * BetterResult, joins, transactions, and cursor pagination. Replace this file
 * when the real product query layer is implemented.
 */

const todoSelection = {
  todo: todos,
  note: {
    id: notes.id,
    title: notes.title,
  },
};

/** Reads a bounded todo page and validates the stored rows before returning them. */
export function selectTodoPage(input: ListTodosInput): Result<TodoPage, DatabaseError> {
  return getDatabase().andThen((db) =>
    Result.try({
      try: () => {
        const rows = db
          .select(todoSelection)
          .from(todos)
          .leftJoin(notes, eq(todos.note_id, notes.id))
          .where(
            and(
              input.completed === undefined ? undefined : eq(todos.completed, input.completed),
              input.search
                ? or(like(todos.title, `%${input.search}%`), like(notes.title, `%${input.search}%`))
                : undefined,
              input.cursor
                ? or(
                    lt(todos.created_at, input.cursor.created_at),
                    and(
                      eq(todos.created_at, input.cursor.created_at),
                      lt(todos.id, input.cursor.id),
                    ),
                  )
                : undefined,
            ),
          )
          .orderBy(desc(todos.created_at), desc(todos.id))
          .limit(input.limit + 1)
          .all();
        const hasNextPage = rows.length > input.limit;
        const visibleRows = hasNextPage ? rows.slice(0, input.limit) : rows;
        const lastRow = visibleRows.at(-1)?.todo;

        return TodoPageSchema.parse({
          items: visibleRows.map((row) => ({ ...row.todo, note: row.note })),
          nextCursor:
            hasNextPage && lastRow ? { created_at: lastRow.created_at, id: lastRow.id } : null,
        });
      },
      catch: (cause: unknown) => databaseError("Failed to list todos", cause),
    }),
  );
}

/** Creates an optional note and its linked todo atomically; invalid stored data rolls both back. */
export function insertTodo(input: CreateTodoInput): Result<Todo, DatabaseError> {
  return getDatabase().andThen((db) =>
    Result.try({
      try: () =>
        db.transaction((transaction): Todo => {
          const note = input.note
            ? transaction
                .insert(notes)
                .values({ title: input.note.title, body: input.note.body ?? "" })
                .returning({ id: notes.id, title: notes.title })
                .get()
            : null;
          const todo = transaction
            .insert(todos)
            .values({ note_id: note?.id ?? null, title: input.title })
            .returning()
            .get();

          return TodoSchema.parse({ ...todo, note });
        }),
      catch: (cause: unknown) => databaseError("Failed to create todo", cause),
    }),
  );
}

/** Counts todos created between each of the caller's local day boundaries. */
export function selectTodoActivity(input: TodoActivityInput): Result<TodoActivity, DatabaseError> {
  // `created_at` holds SQLite's UTC `YYYY-MM-DD HH:MM:SS`, so ISO bounds are compared in that format.
  const bounds = input.dayStarts.map((instant) => instant.replace("T", " ").slice(0, 19));
  const day = sql<number>`case ${sql.join(
    bounds
      .slice(1, -1)
      .map((bound, index) => sql`when ${todos.created_at} < ${bound} then ${index}`),
    sql` `,
  )} else ${TODO_ACTIVITY_DAYS - 1} end`;
  return getDatabase().andThen((db) =>
    Result.try({
      try: () => {
        const rows = db
          .select({ day, count: count() })
          .from(todos)
          .where(
            and(gte(todos.created_at, bounds[0]), lt(todos.created_at, bounds[TODO_ACTIVITY_DAYS])),
          )
          .groupBy(day)
          .all();
        return TodoActivitySchema.parse(
          Array.from(
            { length: TODO_ACTIVITY_DAYS },
            (_, index) => rows.find((row) => row.day === index)?.count ?? 0,
          ),
        );
      },
      catch: (cause: unknown) => databaseError("Failed to count todo activity", cause),
    }),
  );
}
