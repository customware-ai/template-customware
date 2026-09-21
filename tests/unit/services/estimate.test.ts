import { Result } from "better-result";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vite-plus/test";

import { DEFAULT_ESTIMATE_PAGE_SIZE } from "../../../apps/api/src/contracts/estimate.js";
import { getDatabase, resetDatabaseConnection } from "../../../apps/api/src/db/index.js";
import { estimates } from "../../../apps/api/src/db/schemas.js";
import { createEstimate, listEstimates } from "../../../apps/api/src/services/estimate.js";
import { prepareE2EDatabase } from "../../e2e/database.js";

/**
 * Ensures service tests use the same E2E database contract as Playwright.
 */
beforeAll(async () => {
  Result.unwrap(resetDatabaseConnection(), "Failed to reset the test database connection");
  await prepareE2EDatabase();
});

/**
 * Clears estimate rows between test cases for deterministic assertions.
 */
beforeEach(async () => {
  const db = Result.unwrap(getDatabase(), "Failed to open the test database");
  await db.delete(estimates);
});

/**
 * Releases the shared sqlite connection and removes the temporary database.
 */
afterAll(() => {
  Result.unwrap(resetDatabaseConnection(), "Failed to close the test database connection");
});

describe("estimate service", () => {
  it("creates an estimate with default draft status", async () => {
    const result = await createEstimate({
      estimate_number: "EST-001002",
      account_name: "DR INC",
      project_name: "Retro Brand Focal Walls",
      workflow_stage: "Estimate Build",
      item_count: 4,
      total_value: 28640.14,
      margin_percent: 30,
      notes: "Priority account refresh",
    });

    expect(result.isOk()).toBe(true);
    if (result.isErr()) {
      return;
    }

    expect(result.value.estimate_number).toBe("EST-001002");
    expect(result.value.account_name).toBe("DR INC");
    expect(result.value.project_name).toBe("Retro Brand Focal Walls");
    expect(result.value.status).toBe("draft");
    expect(result.value.item_count).toBe(4);
    expect(result.value.total_value).toBe(28640.14);
  });

  it("maps persisted rows that violate the contract to a validation error", async () => {
    const db = Result.unwrap(getDatabase(), "Failed to open the test database");
    await db.insert(estimates).values({
      estimate_number: "",
      account_name: "DR INC",
      project_name: "Invalid persisted estimate",
      workflow_stage: "Estimate Build",
      item_count: 1,
      total_value: 100,
      margin_percent: 20,
    });
    const result = await listEstimates({ limit: DEFAULT_ESTIMATE_PAGE_SIZE });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) {
      return;
    }

    expect(result.error.type).toBe("VALIDATION_ERROR");
  });

  it("lists estimates with a status filter", async () => {
    await createEstimate({
      estimate_number: "EST-001002",
      account_name: "DR INC",
      project_name: "Retro Brand Focal Walls",
      status: "review",
      workflow_stage: "Estimate Build",
      item_count: 4,
      total_value: 28640.14,
      margin_percent: 30,
    });
    await createEstimate({
      estimate_number: "EST-001003",
      account_name: "DR INC",
      project_name: "Equipment Expansion",
      status: "approved",
      workflow_stage: "Proposal Delivered",
      item_count: 2,
      total_value: 52300,
      margin_percent: 28,
    });

    const reviewOnly = await listEstimates({
      status: "review",
      limit: DEFAULT_ESTIMATE_PAGE_SIZE,
    });
    expect(reviewOnly.isOk()).toBe(true);

    if (reviewOnly.isErr()) {
      return;
    }

    expect(reviewOnly.value.items).toHaveLength(1);
    expect(reviewOnly.value.items[0]?.estimate_number).toBe("EST-001002");
    expect(reviewOnly.value.nextCursor).toBeNull();

    const db = Result.unwrap(getDatabase(), "Failed to open the test database");
    const rows = await db.select().from(estimates).where(eq(estimates.status, "approved"));

    expect(rows).toHaveLength(1);
    expect(rows[0]?.estimate_number).toBe("EST-001003");
  });

  it("returns stable bounded cursor pages", async () => {
    for (const estimateNumber of ["EST-003", "EST-001", "EST-002", "EST-002"]) {
      await createEstimate({
        estimate_number: estimateNumber,
        account_name: "Cursor account",
        project_name: estimateNumber,
        workflow_stage: "Estimate Build",
        item_count: 1,
        total_value: 100,
        margin_percent: 20,
      });
    }

    const firstPage = await listEstimates({ limit: 2 });
    expect(firstPage.isOk()).toBe(true);
    if (firstPage.isErr()) {
      return;
    }

    expect(firstPage.value.items.map((estimate) => estimate.estimate_number)).toEqual([
      "EST-001",
      "EST-002",
    ]);
    expect(firstPage.value.nextCursor).not.toBeNull();

    const secondPage = await listEstimates({
      limit: 2,
      cursor: firstPage.value.nextCursor ?? undefined,
    });
    expect(secondPage.isOk()).toBe(true);
    if (secondPage.isErr()) {
      return;
    }

    expect(secondPage.value.items.map((estimate) => estimate.estimate_number)).toEqual([
      "EST-002",
      "EST-003",
    ]);
    expect(
      new Set([...firstPage.value.items, ...secondPage.value.items].map((estimate) => estimate.id))
        .size,
    ).toBe(4);
    expect(secondPage.value.nextCursor).toBeNull();
  });
});
