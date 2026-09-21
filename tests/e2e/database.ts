import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";

import { seedE2EData } from "./seed";

/**
 * Fixed sqlite database path shared by Playwright setup, helpers, and the
 * backend process under test.
 */
export const E2E_DATABASE_FILE_PATH = path.join(process.cwd(), ".dbs", "e2e.db");

/**
 * Resolves the dedicated sqlite database used by Playwright.
 */
export function getE2EDatabaseFilePath(): string {
  return E2E_DATABASE_FILE_PATH;
}

/**
 * Removes any prior test database and reapplies the schema migrations so the
 * web server starts against a clean, deterministic database.
 */
export async function prepareE2EDatabase(): Promise<void> {
  const databaseFilePath = getE2EDatabaseFilePath();
  const databaseDirectory = path.dirname(databaseFilePath);
  const sqliteSidecarFilePaths = [
    `${databaseFilePath}-shm`,
    `${databaseFilePath}-wal`,
    `${databaseFilePath}-journal`,
  ];

  process.env.E2E_DATABASE_FILE_PATH = databaseFilePath;

  if (!existsSync(databaseDirectory)) {
    mkdirSync(databaseDirectory, { recursive: true });
  }

  const { resetDatabaseConnection } = await import("../../apps/api/src/db/index.js");
  resetDatabaseConnection();

  rmSync(databaseFilePath, { force: true });
  for (const sqliteSidecarFilePath of sqliteSidecarFilePaths) {
    rmSync(sqliteSidecarFilePath, { force: true });
  }

  const { runMigrations } = await import("../../apps/api/src/db/migrate.js");
  await runMigrations();
  await seedE2EData();
  resetDatabaseConnection();
}
