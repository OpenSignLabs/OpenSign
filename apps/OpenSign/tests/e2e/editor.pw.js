import { test, expect } from "./support/fixtures.js";
import { createLargeTemplate } from "./support/bigpdf.js";
import { loginAsAdmin } from "./support/login.js";
import { prepareAdminUser, parseRequest } from "./support/parse.js";

const LARGE_PAGES = 30;
const LEAVE_BUDGET_MS = 5000;
const IDLE_MUTATION_BUDGET = 60;

test.beforeAll(prepareAdminUser);

/** Count DOM mutations for a period while the page is idle. */
const countIdleMutations = (page, ms) =>
  page.evaluate(
    (duration) =>
      new Promise((resolve) => {
        let count = 0;
        const observer = new MutationObserver((list) => { count += list.length; });
        observer.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
        setTimeout(() => { observer.disconnect(); resolve(count); }, duration);
      }),
    ms
  );

test("the template editor stays quiet while idle (#59)", async ({ page }) => {
  await loginAsAdmin(page);
  const { results } = await parseRequest("classes/contracts_Template?limit=1");
  await page.goto(`/template/${results[0].objectId}`);
  await expect(page.locator("canvas").first()).toBeVisible();
  await page.waitForTimeout(2000);
  expect(await countIdleMutations(page, 3000)).toBeLessThan(IDLE_MUTATION_BUDGET);
});

test("leaving a 30-page template navigates without freezing (#59)", async ({ page }) => {
  const templateId = await createLargeTemplate(LARGE_PAGES);
  await loginAsAdmin(page);
  await page.goto(`/template/${templateId}`);
  await expect(page.locator("canvas").first()).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText(`of ${LARGE_PAGES}`).first()).toBeVisible({ timeout: 60_000 });
  const started = Date.now();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.waitForURL((url) => !url.pathname.includes("/template/"), { timeout: LEAVE_BUDGET_MS });
  expect(Date.now() - started).toBeLessThan(LEAVE_BUDGET_MS);
});
