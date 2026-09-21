import { Result } from "better-result";

import { getDatabase } from "../../apps/api/src/db/index.js";
import { estimates } from "../../apps/api/src/db/schemas.js";

/**
 * Canonical deterministic seed data for interactive Playwright scripts and E2E
 * specs.
 *
 * Add warranted shared seed records here instead of creating tables or writing
 * ad hoc SQLite setup inside individual specs. Keep this file focused on
 * stable test data that multiple verification paths can reuse through
 * `pnpm run prepare:e2e`.
 */
export const SEEDED_E2E_ESTIMATE = {
  estimate_number: "E2E-EST-001",
  account_name: "BarkBilt",
  project_name: "Priority Opportunities",
  status: "review",
  workflow_stage: "Estimate Build",
  item_count: 4,
  total_value: 28640.14,
  margin_percent: 30,
  notes: "Canonical E2E seed estimate",
} as const;

export async function seedE2EData(): Promise<void> {
  const db = Result.unwrap(getDatabase(), "Failed to open the E2E database");

  await db.insert(estimates).values(SEEDED_E2E_ESTIMATE);
}
