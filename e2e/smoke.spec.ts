import { test, expect } from "@playwright/test";

test("authenticated smoke flow: login, dashboard actions, and navigation", async ({ page }) => {
  await page.route("**/api/dashboard", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        stats: {
          companies: 12,
          contacts: 42,
          deals: 8,
          openDeals: 5,
          wonDeals: 2,
          lostDeals: 1,
          tasksOpen: 4,
          tasksDone: 15,
          activitiesThisWeek: 7,
          outreachSent: 11,
          pipelineValue: 240000
        },
        topDeals: [
          {
            id: "deal-1",
            title: "Retention Automation",
            stage: "DISCOVERY_COMPLETED",
            momentumScore: 88,
            value: 60000,
            offerType: "IMPLEMENTATION",
            company: { name: "Northstar Labs" },
            primaryContact: { name: "Ava" }
          }
        ],
        upcomingTasks: [],
        recentActivities: []
      })
    });
  });

  await page.route("**/api/ai/chat", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ response: "Prioritize Northstar Labs and close overdue tasks today." })
    });
  });

  await page.route("**/api/deals?limit=50", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ deals: [] }) });
  });

  await page.goto("/login");
  await page.getByPlaceholder("Passcode").fill("mab");
  await page.getByRole("button", { name: "Enter Workspace" }).click();

  await expect(page.getByText("Momentum Command Center")).toBeVisible();
  await expect(page.getByAltText("Professional headshot")).toBeVisible();

  await page.getByRole("button", { name: "AI Daily Brief" }).click();
  await expect(page.getByText("Prioritize Northstar Labs and close overdue tasks today.")).toBeVisible();

  await page.getByRole("link", { name: "View Pipeline" }).click();
  await expect(page).toHaveURL(/\/pipeline$/);
  await expect(page.getByRole("heading", { name: "Deal Pipeline" })).toBeVisible();

  await page.getByRole("link", { name: "Companies" }).click();
  await expect(page).toHaveURL(/\/companies$/);

  await page.getByRole("button", { name: "Open command palette" }).click();
  await expect(page.getByRole("heading", { name: "Command Palette" })).toBeVisible();
  await page.getByRole("link", { name: "Search Memory Enter ↵" }).click();
  await expect(page).toHaveURL(/\/search$/);
});
