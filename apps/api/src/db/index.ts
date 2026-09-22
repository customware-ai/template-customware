import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

import { Result } from "better-result";
import BetterSqlite3, { type Database as BetterSqliteDatabase } from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import { databaseError, type DatabaseError } from "../types/errors.js";
import * as schema from "./schemas.js";

export type DatabaseClient = BetterSQLite3Database<typeof schema>;

const SQLITE_BUSY_TIMEOUT_MS = 10_000;

function resolveMaybeRelativePath(filePath: string): string {
  return path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
}

function isUnitTestRuntime(): boolean {
  return process.env.NODE_ENV === "test" || process.env.VITEST === "true";
}

/**
 * Resolves the sqlite file path for the current runtime.
 * Playwright uses the e2e-specific override to point the backend process at an
 * isolated database without changing the default local development database.
 */
function resolveDatabaseFilePath(): string {
  const configuredPath = process.env.E2E_DATABASE_FILE_PATH;
  if (configuredPath && configuredPath.trim().length > 0) {
    return resolveMaybeRelativePath(configuredPath);
  }

  if (isUnitTestRuntime()) {
    return path.join(process.cwd(), ".dbs", "e2e.db");
  }

  return path.join(process.cwd(), ".dbs", "database.db");
}

/**
 * Returns the active sqlite file path for the current process environment.
 */
export function getDatabaseFilePath(): string {
  return resolveDatabaseFilePath();
}

let sqlite: BetterSqliteDatabase | null = null;
let db: DatabaseClient | null = null;

/**
 * Initializes sqlite and Drizzle once per process.
 */
export function initializeDatabase(): Result<DatabaseClient, DatabaseError> {
  if (sqlite && db) {
    return Result.ok(db);
  }

  let openingSqlite: BetterSqliteDatabase | null = null;
  return Result.try({
    try: () => {
      const databaseFilePath = getDatabaseFilePath();
      const directory = path.dirname(databaseFilePath);
      if (!existsSync(directory)) mkdirSync(directory, { recursive: true });

      openingSqlite = new BetterSqlite3(databaseFilePath);
      openingSqlite.pragma("foreign_keys = ON");
      openingSqlite.pragma("journal_mode = WAL");
      openingSqlite.pragma("synchronous = NORMAL");
      openingSqlite.pragma(`busy_timeout = ${SQLITE_BUSY_TIMEOUT_MS}`);
      const initializedDatabase = drizzle(openingSqlite, { schema });

      sqlite = openingSqlite;
      db = initializedDatabase;
      openingSqlite = null;

      return initializedDatabase;
    },
    catch: (cause) => {
      if (openingSqlite !== null) {
        Result.try(() => openingSqlite?.close()).unwrapOr(undefined);
      }

      return databaseError("Failed to initialize the database", cause);
    },
  });
}

/**
 * Returns the shared database connection.
 */
export function getDatabase(): Result<DatabaseClient, DatabaseError> {
  if (!sqlite || !db) {
    return initializeDatabase();
  }

  return Result.ok(db);
}

/**
 * Closes the shared sqlite handle so tests can swap database files safely.
 */
export function resetDatabaseConnection(): Result<void, DatabaseError> {
  return Result.try({
    try: () => {
      sqlite?.close();
      sqlite = null;
      db = null;
    },
    catch: (cause) => databaseError("Failed to close the database", cause),
  });
}
