import { expect, test } from "@playwright/test";

/** TEMPLATE EXAMPLE ONLY. Replace this smoke test with the real product flow. */
test("loads the template and changes its color theme", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Component Reference" })).toBeVisible();
  await expect(page.getByText("API connected")).toBeVisible();

  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page.getByRole("menuitemradio", { name: "Dark" }).click();

  await expect(page.locator("html")).toHaveClass(/dark/);
});

/** The built API must resolve its workspace dependencies and persist writes. */
test("persists a todo through the built API", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("E2E todo")).toBeVisible();

  await page.getByRole("button", { name: "Create sample todo" }).click();
  const createdTodo = page.getByText(/^Review the demo patterns \d+$/);
  await expect(createdTodo).toBeVisible();

  await page.reload();
  await expect(createdTodo).toBeVisible();
});
