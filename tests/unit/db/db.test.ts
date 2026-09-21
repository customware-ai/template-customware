/**
 * Tests for low-level SQLite behavior using better-sqlite3.
 */

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import BetterSqlite3, { type Database } from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

let testDb: Database;

/**
 * Creates a deterministic test table for each test case.
 */
function initializeSchema(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS test_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      value INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

/**
 * Clears rows so each test has isolated state.
 */
function resetTable(db: Database): void {
  db.exec("DELETE FROM test_data;");
  db.exec("DELETE FROM sqlite_sequence WHERE name = 'test_data';");
}

describe("Database Operations", () => {
  beforeEach(() => {
    testDb = new BetterSqlite3(":memory:");
    initializeSchema(testDb);
    resetTable(testDb);
  });

  afterEach(() => {
    testDb.close();
  });

  it("supports create, read, update, and delete operations", () => {
    testDb.prepare("INSERT INTO test_data (name, value) VALUES (?, ?)").run("Test Item", 42);

    const created = testDb
      .prepare("SELECT id, name, value FROM test_data WHERE name = ?")
      .get("Test Item") as { id: number; name: string; value: number };

    expect(created).toEqual({ id: 1, name: "Test Item", value: 42 });

    testDb
      .prepare("UPDATE test_data SET name = ?, value = ? WHERE id = ?")
      .run("Updated Item", 84, created.id);

    const updated = testDb
      .prepare("SELECT name, value FROM test_data WHERE id = ?")
      .get(created.id) as { name: string; value: number };

    expect(updated).toEqual({ name: "Updated Item", value: 84 });

    testDb.prepare("DELETE FROM test_data WHERE id = ?").run(created.id);

    const deleted = testDb.prepare("SELECT id FROM test_data WHERE id = ?").get(created.id) as
      | { id: number }
      | undefined;

    expect(deleted).toBeUndefined();
  });

  it("enforces constraints and rolls back failed transactions", () => {
    expect(() => {
      testDb.prepare("INSERT INTO test_data (value) VALUES (?)").run(1);
    }).toThrow();

    const transaction = testDb.transaction(() => {
      testDb.prepare("INSERT INTO test_data (name, value) VALUES (?, ?)").run("Before Rollback", 1);
      throw new Error("force rollback");
    });

    expect(() => transaction()).toThrow("force rollback");

    const count = testDb.prepare("SELECT COUNT(*) as count FROM test_data").get() as {
      count: number;
    };

    expect(count.count).toBe(0);
  });

  it("persists data to a file-backed sqlite database", () => {
    const tempDirectory = mkdtempSync(path.join(tmpdir(), "better-sqlite3-test-"));
    const dbPath = path.join(tempDirectory, "test.db");

    const fileDb = new BetterSqlite3(dbPath);
    initializeSchema(fileDb);
    fileDb.prepare("INSERT INTO test_data (name, value) VALUES (?, ?)").run("Persisted", 7);
    fileDb.close();

    const reopenedDb = new BetterSqlite3(dbPath);
    const row = reopenedDb
      .prepare("SELECT name, value FROM test_data WHERE name = ?")
      .get("Persisted") as { name: string; value: number };

    expect(row).toEqual({ name: "Persisted", value: 7 });

    reopenedDb.close();
    rmSync(tempDirectory, { recursive: true, force: true });
  });
});
