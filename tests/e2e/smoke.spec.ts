import { expect, test } from "@playwright/test";

/** The starter page and theme control remain usable. */
test("loads the template and changes its color theme", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "UI components" })).toBeVisible();
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page.getByRole("menuitemradio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

/** The built API must resolve its workspace dependencies and persist writes. */
test("persists a todo through the built API", async ({ request }) => {
  const title = `Persistence test ${Date.now()}`;
  const created = await request.post("/trpc/createTodo", { data: { title } });
  expect(created.ok()).toBeTruthy();
  const response = await request.get(
    `/trpc/listTodos?input=${encodeURIComponent(JSON.stringify({ search: title }))}`,
  );
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.result.data.items).toEqual(
    expect.arrayContaining([expect.objectContaining({ title })]),
  );
});

/** Unknown client routes must survive reload and offer a route back home. */
test("handles an unknown route and returns home", async ({ page }) => {
  await page.goto("/missing-page");
  await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
  await page.getByRole("link", { name: "Go Home" }).click();
  await expect(page.getByRole("heading", { name: "UI components" })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
});

/** The chart stays accessible and supports keyboard inspection. */
test("renders the chart and exposes its values to keyboard users", async ({ page }) => {
  await page.goto("/");
  const chart = page.getByRole("img", { name: "Example values by category" });
  await expect(chart).toBeVisible();
  await expect(chart.locator("rect")).toHaveCount(3);
  await chart.focus();
  await chart.press("ArrowRight");
  await expect(page.getByRole("status", { name: /Values.*x:/ })).toBeVisible();
  await page.reload();
  await expect(chart).toBeVisible();
});

/** The starter content fits a narrow viewport. */
test("fits a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.getByRole("img", { name: "Example values by category" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
