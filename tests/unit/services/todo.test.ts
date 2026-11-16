import { Result } from "better-result";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vite-plus/test";

import { getDatabase, resetDatabaseConnection } from "../../../apps/api/src/db/index.js";
import { notes, todos } from "../../../apps/api/src/db/schemas.js";
import { createTodo, getTodoActivity, listTodos } from "../../../apps/api/src/services/todo.js";
import { appRouter } from "../../../apps/api/src/trpc/router.js";
import { prepareE2EDatabase } from "../../e2e/database.js";

/** TEMPLATE EXAMPLE ONLY. Replace these tests with coverage for the real product domain. */

beforeAll(async () => {
  Result.unwrap(resetDatabaseConnection(), "Failed to reset the test database connection");
  await prepareE2EDatabase();
});

beforeEach(() => {
  const db = Result.unwrap(getDatabase(), "Failed to open the test database");
  db.delete(todos).run();
  db.delete(notes).run();
});

afterAll(() => {
  Result.unwrap(resetDatabaseConnection(), "Failed to close the test database connection");
});

describe("Notes and Todos service", () => {
  it("creates a todo and its linked note atomically", () => {
    const result = Result.unwrap(
      createTodo({
        title: "Review the API example",
        note: { title: "Template notes", body: "Replace this domain after learning the pattern." },
      }),
    );

    expect(result.title).toBe("Review the API example");
    expect(result.completed).toBe(false);
    expect(result.note?.title).toBe("Template notes");
  });

  it("returns a generic internal error for invalid stored data", async () => {
    const db = Result.unwrap(getDatabase(), "Failed to open the test database");
    db.insert(todos).values({ title: "" }).run();
    await expect(appRouter.createCaller({}).listTodos({ limit: 5 })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong. Please try again.",
    });
  });

  it("returns stable bounded cursor pages", () => {
    for (const title of ["First", "Second", "Third", "Fourth"]) {
      Result.unwrap(createTodo({ title }));
    }

    const firstPage = Result.unwrap(listTodos({ limit: 2 }));
    const secondPage = Result.unwrap(
      listTodos({
        limit: 2,
        cursor: firstPage.nextCursor ?? undefined,
      }),
    );

    expect(firstPage.items).toHaveLength(2);
    expect(secondPage.items).toHaveLength(2);
    expect(new Set([...firstPage.items, ...secondPage.items].map((todo) => todo.id)).size).toBe(4);
    expect(secondPage.nextCursor).toBeNull();
  });

  it("counts todos per caller day boundary, including empty days", () => {
    const db = Result.unwrap(getDatabase(), "Failed to open the test database");
    for (const created_at of [
      "2026-11-01 23:59:59",
      "2026-11-02 00:00:00",
      "2026-11-08 12:00:00",
      "2026-11-09 00:00:00",
    ]) {
      db.insert(todos).values({ title: created_at, created_at }).run();
    }
    const dayStarts = Array.from({ length: 8 }, (_, index) =>
      new Date(Date.UTC(2026, 10, 2 + index)).toISOString(),
    );

    expect(Result.unwrap(getTodoActivity({ dayStarts }))).toEqual([1, 0, 0, 0, 0, 0, 1]);
  });
});
