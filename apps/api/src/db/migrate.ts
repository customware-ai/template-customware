import path from "node:path";
import { fileURLToPath } from "node:url";

import { Result } from "better-result";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import { databaseError, type DatabaseError } from "../types/errors.js";
import { getDatabase } from "./index.js";

/**
 * Applies all generated Drizzle migrations from the API workspace.
 */
export function runMigrations(): Result<void, DatabaseError> {
  return Result.gen(function* () {
    const db = yield* getDatabase();
    const migrationsFolder = path.join(process.cwd(), "apps", "api", "src", "db", "migrations");

    yield* Result.try({
      try: () => migrate(db, { migrationsFolder }),
      catch: (cause) => databaseError("Failed to apply database migrations", cause),
    });

    return Result.ok(undefined);
  });
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  const migrationResult = runMigrations();
  if (migrationResult.isErr()) {
    console.error("Migration failed:", migrationResult.error);
    process.exit(1);
  }

  console.log("Drizzle migrations applied successfully.");
}
