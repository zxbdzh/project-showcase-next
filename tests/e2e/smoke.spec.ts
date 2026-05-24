import { test, expect } from "@playwright/test";

test("homepage is accessible", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/全栈工程师/);
});
