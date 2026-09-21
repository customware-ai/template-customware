import type { FullConfig } from "@playwright/test";

import { prepareE2EDatabase } from "./database";

/**
 * Rebuilds the Playwright sqlite database before the server starts so e2e tests
 * run against a clean backend schema.
 */
async function globalSetup(_config: FullConfig): Promise<void> {
  await prepareE2EDatabase();
}

export default globalSetup;
