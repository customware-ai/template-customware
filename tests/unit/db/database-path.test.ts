import path from "node:path";

import { afterEach, describe, expect, it } from "vite-plus/test";

import { getDatabaseFilePath } from "../../../apps/api/src/db/index.js";

const ORIGINAL_E2E_DATABASE_FILE_PATH = process.env.E2E_DATABASE_FILE_PATH;
const ORIGINAL_NODE_ENV = process.env.NODE_ENV;
const ORIGINAL_VITEST = process.env.VITEST;

function restoreEnvironmentValue(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}

afterEach(() => {
  restoreEnvironmentValue("E2E_DATABASE_FILE_PATH", ORIGINAL_E2E_DATABASE_FILE_PATH);
  restoreEnvironmentValue("NODE_ENV", ORIGINAL_NODE_ENV);
  restoreEnvironmentValue("VITEST", ORIGINAL_VITEST);
});

describe("database path resolution", () => {
  it("uses the app database in app runtime", () => {
    process.env.NODE_ENV = "production";
    delete process.env.VITEST;
    delete process.env.E2E_DATABASE_FILE_PATH;

    expect(getDatabaseFilePath()).toBe(path.join(process.cwd(), ".dbs", "database.db"));
  });

  it("uses the e2e database in unit-test runtime", () => {
    process.env.NODE_ENV = "test";
    delete process.env.E2E_DATABASE_FILE_PATH;

    expect(getDatabaseFilePath()).toBe(path.join(process.cwd(), ".dbs", "e2e.db"));
  });

  it("uses E2E_DATABASE_FILE_PATH when explicitly configured", () => {
    process.env.NODE_ENV = "production";
    process.env.E2E_DATABASE_FILE_PATH = ".dbs/custom-e2e.db";

    expect(getDatabaseFilePath()).toBe(path.join(process.cwd(), ".dbs", "custom-e2e.db"));
  });
});
