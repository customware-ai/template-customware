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

/** Unknown client routes must survive reload and offer a route back home. */
test("handles an unknown route and returns home", async ({ page }) => {
  await page.goto("/missing-page");
  await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
  await page.getByRole("link", { name: "Go Home" }).click();
  await expect(page.getByRole("heading", { name: "Component Reference" })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
});

/** The chart stays accessible and supports keyboard inspection. */
test("renders the chart and exposes its values to keyboard users", async ({ page }) => {
  await page.goto("/");
  const chart = page.getByRole("img", { name: "Velocity and confidence by stage" });
  await expect(chart).toBeVisible();
  await expect(chart.locator("rect")).toHaveCount(8);
  await chart.focus();
  await chart.press("ArrowRight");
  await expect(page.getByRole("status", { name: /(?:Velocity|Confidence).*x:/ })).toBeVisible();
  await page.reload();
  await expect(chart).toBeVisible();
});

/** Shared notifications remain available after the application layout loads. */
test("shows a notification from the deferred layout", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Trigger Toast", exact: true }).click();
  await expect(page.getByText("Base UI notification")).toBeVisible();
});
