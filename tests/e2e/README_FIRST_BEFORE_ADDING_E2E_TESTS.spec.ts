import { existsSync } from "node:fs";

import { expect, test } from "@playwright/test";

import { getE2EDatabaseFilePath } from "./database";
import { SEEDED_E2E_ESTIMATE } from "./seed";

test.describe("demo e2e format", () => {
  test.skip("shows how an imaginary saved-view feature would be tested end to end", async ({
    page,
  }) => {
    // THIS IS ONLY A DEMO FILE FOR E2E TEST FORMAT.
    // THIS IS NOT A REAL PRODUCT TEST.
    // REMOVE THIS FILE WHEN THE FIRST ACTUAL E2E TEST IS ADDED.
    // REPLACE IT ONLY WHEN A CORE OR COMPLEX USER FLOW WARRANTS E2E COVERAGE.

    await page.goto("/");

    // Imagine the real UI exposed a saved-view launcher in the shell.
    await page.getByRole("button", { name: "Saved views" }).click();
    await page.getByRole("button", { name: "Priority Opportunities" }).click();

    // Imagine the frontend then rendered a filtered workspace scoped to the
    // seeded backend record from the dedicated Playwright database.
    await expect(
      page.getByRole("heading", { name: SEEDED_E2E_ESTIMATE.project_name }),
    ).toBeVisible();
    await expect(page.getByText(SEEDED_E2E_ESTIMATE.account_name)).toBeVisible();
    expect(existsSync(getE2EDatabaseFilePath())).toBe(true);
  });
});
