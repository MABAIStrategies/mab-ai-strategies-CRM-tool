import { test, expect } from "@playwright/test";

test("login and view Today", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("Passcode").fill("mab");
  await page.getByRole("button", { name: "Enter Workspace" }).click();
  await expect(page.getByText("Momentum Command Center")).toBeVisible();
});
