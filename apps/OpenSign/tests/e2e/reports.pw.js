import { test, expect } from "./support/fixtures.js";
import { loginAsAdmin } from "./support/login.js";
import { prepareAdminUser } from "./support/parse.js";

/** Report pages reached from the sidebar: [group button or null, menu item]. */
const REPORTS = [
  ["Templates", "Manage templates"],
  ["Documents", "Need your sign"],
  ["Documents", "In progress"],
  ["Documents", "Completed"],
  ["Documents", "Drafts"],
  ["Documents", "Declined"],
  ["Documents", "Expired"],
  [null, "Contactbook"]
];

test.beforeAll(prepareAdminUser);

for (const [group, item] of REPORTS) {
  test(`the ${item} report opens without errors`, async ({ page }) => {
    await loginAsAdmin(page);
    if (group) await page.getByRole("button", { name: new RegExp(group) }).first().click();
    await page.getByRole("menuitem", { name: item, exact: true }).click();
    await page.waitForURL(/\/report\//);
    await expect(page.locator("table, [role=table], [data-tut]").first()).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Something went wrong");
  });
}
