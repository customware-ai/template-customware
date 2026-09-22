import { Result } from "better-result";
import { and, desc, eq, like, lt, or, type SQL } from "drizzle-orm";

import type { CreateTodoInput, ListTodosInput, TodoCursor } from "../../contracts/todo.js";
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

export interface TodoRow {
  readonly todo: typeof todos.$inferSelect;
  readonly note: { readonly id: number; readonly title: string } | null;
}

/** Reads a bounded todo page with filtering performed by SQLite. */
export function listTodoRows(
  input: ListTodosInput,
): Promise<Result<{ rows: TodoRow[]; nextCursor: TodoCursor | null }, DatabaseError>> {
  return Result.gen(async function* () {
    const db = yield* getDatabase();
    const page = yield* Result.await(
      Result.tryPromise({
        try: async () => {
          const predicates: SQL[] = [];

          if (input.completed !== undefined) {
            predicates.push(eq(todos.completed, input.completed));
          }

          if (input.search) {
            const search = or(
              like(todos.title, `%${input.search}%`),
              like(notes.title, `%${input.search}%`),
            );
            if (search) predicates.push(search);
          }

          if (input.cursor) {
            const afterCursor = or(
              lt(todos.created_at, input.cursor.created_at),
              and(eq(todos.created_at, input.cursor.created_at), lt(todos.id, input.cursor.id)),
            );
            if (afterCursor) predicates.push(afterCursor);
          }

          const rows = await db
            .select(todoSelection)
            .from(todos)
            .leftJoin(notes, eq(todos.note_id, notes.id))
            .where(predicates.length === 0 ? undefined : and(...predicates))
            .orderBy(desc(todos.created_at), desc(todos.id))
            .limit(input.limit + 1);
          const hasNextPage = rows.length > input.limit;
          const visibleRows = hasNextPage ? rows.slice(0, input.limit) : rows;
          const lastRow = visibleRows.at(-1)?.todo;

          return {
            rows: visibleRows,
            nextCursor:
              hasNextPage && lastRow ? { created_at: lastRow.created_at, id: lastRow.id } : null,
          };
        },
        catch: (cause: unknown) => databaseError("Failed to list todos", cause),
      }),
    );

    return Result.ok(page);
  });
}

/** Creates an optional note and its linked todo as one atomic change. */
export function createTodoRow(input: CreateTodoInput): Promise<Result<TodoRow, DatabaseError>> {
  return Result.gen(async function* () {
    const db = yield* getDatabase();
    const created = yield* Result.try({
      try: () =>
        db.transaction((transaction): TodoRow => {
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

          return { todo, note };
        }),
      catch: (cause: unknown) => databaseError("Failed to create todo", cause),
    });

    return Result.ok(created);
  });
}
