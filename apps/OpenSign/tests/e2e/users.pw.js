import { test, expect } from "./support/fixtures.js";
import { loginAsAdmin } from "./support/login.js";
import { createTeammate, prepareAdminUser } from "./support/parse.js";

const TEAMMATE = "e2e.teammate@example.test";

test.beforeAll(async () => {
  await prepareAdminUser();
  await createTeammate(TEAMMATE);
});

test("the copied indicator stays visible before it resets (#73)", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await loginAsAdmin(page);
  await page.goto("/users");
  const row = page.locator("tbody tr", { hasText: TEAMMATE });
  await row.locator("[role=button][title='Reset password']").click();
  await page.getByRole("button", { name: /auto/i }).first().click().catch(() => {});
  const password = page.getByPlaceholder(/password/i).first();
  await password.fill("E2e-Copy-1234!");
  const copy = page.getByRole("button", { name: "Copy password" });
  await copy.click();
  await expect(copy).toHaveAttribute("title", "Copied");
  await page.waitForTimeout(500);
  await expect(copy).toHaveAttribute("title", "Copied");
  await expect(copy).toHaveAttribute("title", "Copy", { timeout: 5000 });
});
