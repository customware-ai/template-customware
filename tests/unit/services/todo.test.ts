import { Result } from "better-result";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vite-plus/test";

import { DEFAULT_TODO_PAGE_SIZE } from "../../../apps/api/src/contracts/todo.js";
import { getDatabase, resetDatabaseConnection } from "../../../apps/api/src/db/index.js";
import { notes, todos } from "../../../apps/api/src/db/schemas.js";
import { createTodo, listTodos } from "../../../apps/api/src/services/todo.js";
import { prepareE2EDatabase } from "../../e2e/database.js";

/** TEMPLATE EXAMPLE ONLY. Replace these tests with coverage for the real product domain. */

beforeAll(async () => {
  Result.unwrap(resetDatabaseConnection(), "Failed to reset the test database connection");
  await prepareE2EDatabase();
});

beforeEach(async () => {
  const db = Result.unwrap(getDatabase(), "Failed to open the test database");
  await db.delete(todos);
  await db.delete(notes);
});

afterAll(() => {
  Result.unwrap(resetDatabaseConnection(), "Failed to close the test database connection");
});

describe("Notes and Todos service", () => {
  it("creates a todo and its linked note atomically", async () => {
    const result = await createTodo({
      title: "Review the API example",
      note: { title: "Template notes", body: "Replace this domain after learning the pattern." },
    });

    expect(result.isOk()).toBe(true);
    if (result.isErr()) return;

    expect(result.value.title).toBe("Review the API example");
    expect(result.value.completed).toBe(false);
    expect(result.value.note?.title).toBe("Template notes");
  });

  it("maps invalid persisted rows to a validation error", async () => {
    const db = Result.unwrap(getDatabase(), "Failed to open the test database");
    await db.insert(todos).values({ title: "" });

    const result = await listTodos({ limit: DEFAULT_TODO_PAGE_SIZE });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) return;
    expect(result.error.type).toBe("VALIDATION_ERROR");
  });

  it("applies completed filtering in the database query", async () => {
    const db = Result.unwrap(getDatabase(), "Failed to open the test database");
    await db.insert(todos).values([
      { title: "Open todo", completed: false },
      { title: "Completed todo", completed: true },
    ]);

    const result = await listTodos({ completed: true, limit: DEFAULT_TODO_PAGE_SIZE });

    expect(result.isOk()).toBe(true);
    if (result.isErr()) return;
    expect(result.value.items.map((todo) => todo.title)).toEqual(["Completed todo"]);
  });

  it("returns stable bounded cursor pages", async () => {
    for (const title of ["First", "Second", "Third", "Fourth"]) {
      await createTodo({ title });
    }

    const firstPage = await listTodos({ limit: 2 });
    expect(firstPage.isOk()).toBe(true);
    if (firstPage.isErr()) return;

    const secondPage = await listTodos({
      limit: 2,
      cursor: firstPage.value.nextCursor ?? undefined,
    });
    expect(secondPage.isOk()).toBe(true);
    if (secondPage.isErr()) return;

    expect(firstPage.value.items).toHaveLength(2);
    expect(secondPage.value.items).toHaveLength(2);
    expect(
      new Set([...firstPage.value.items, ...secondPage.value.items].map((todo) => todo.id)).size,
    ).toBe(4);
    expect(secondPage.value.nextCursor).toBeNull();
  });
});
