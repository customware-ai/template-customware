import { expect, test } from "@playwright/test";

/** The panel shows a new todo before the server saves it, then keeps the saved record. */
test("adds a todo optimistically from the panel", async ({ page }) => {
  const title = `Panel todo ${Date.now()}`;
  const { promise: saved, resolve: save } = Promise.withResolvers<void>();
  await page.route("**/trpc/createTodo*", async (route) => {
    await saved;
    await route.continue();
  });
  await page.goto("/");
  await expect(page.getByText("Loading todos")).toHaveCount(0);
  await page.getByRole("textbox", { name: "Todo title" }).fill(title);
  await page.getByRole("button", { name: "Add todo" }).click();
  const row = page.getByRole("listitem").filter({ hasText: title });
  await expect(row).toContainText("Saving…");
  await expect(page.getByRole("button", { name: "Add todo" })).toBeDisabled();
  save();
  await expect(row).toContainText("Open");
  await expect(page.getByRole("button", { name: "Add todo" })).toBeEnabled();
  await page.reload();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
});

/** Older records remain reachable beyond the first cursor page. */
test("loads older todos", async ({ page, request }) => {
  const prefix = `Pagination ${Date.now()}`;
  for (let index = 0; index < 6; index++) {
    const response = await request.post("/trpc/createTodo", {
      data: { title: `${prefix} ${index}` },
    });
    expect(response.ok()).toBeTruthy();
  }
  await page.goto("/");
  await expect(page.getByText(`${prefix} 5`, { exact: true })).toBeVisible();
  await expect(page.getByText(`${prefix} 0`, { exact: true })).not.toBeVisible();
  await page.getByRole("button", { name: "Load more" }).click();
  await expect(page.getByText(`${prefix} 5`, { exact: true })).toBeVisible();
  await expect(page.getByText(`${prefix} 0`, { exact: true })).toBeVisible();
});
