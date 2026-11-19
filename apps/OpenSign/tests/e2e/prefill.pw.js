import { test, expect } from "./support/fixtures.js";
import { loginAsAdmin } from "./support/login.js";
import { createPrefillTemplate, parseRequest, prepareAdminUser } from "./support/parse.js";
import { prefillText } from "./support/widgets.js";

const PREFILL_VALUE = "ACME Corp";

test.beforeAll(prepareAdminUser);

/** Newest document with the given name. */
const findDocumentByName = async (name) => {
  const where = encodeURIComponent(JSON.stringify({ Name: name }));
  const { results } = await parseRequest(`classes/contracts_Document?where=${where}&order=-createdAt&limit=1`);
  return results[0];
};

test("the owner fills the prefill widget, picks a recipient and creates the document", async ({ page }) => {
  const name = `e2e prefill ${Date.now()}`;
  const templateId = await createPrefillTemplate({ name, prefillWidgets: [prefillText("company-name", 300)] });
  await loginAsAdmin(page);
  await page.goto(`/template/${templateId}`);
  await expect(page.locator("canvas").first()).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Use Template" }).click();

  const modal = page.locator(".op-modal-box").last();
  await expect(modal.getByText("company-name")).toBeVisible();
  const field = modal.locator("input.op-input").first();
  await field.click();
  await page.keyboard.type(PREFILL_VALUE, { delay: 40 });
  await expect(field).toHaveValue(PREFILL_VALUE);

  const recipient = modal.getByRole("combobox").last();
  await recipient.click();
  await recipient.fill("juan");
  await page.getByRole("option").first().click();
  await modal.getByRole("button", { name: "Next", exact: true }).click();

  await expect.poll(async () => (await findDocumentByName(name))?.objectId, { timeout: 30_000 }).toBeTruthy();
  const doc = await findDocumentByName(name);
  const widgets = doc.Placeholders.flatMap((role) => role.placeHolder.flatMap((p) => p.pos));
  const prefilled = widgets.find((w) => w.options?.name === "company-name");
  expect(prefilled.options.response).toBe(PREFILL_VALUE);
});

test("a prefill widget that already has a value is shown with it (#83)", async ({ page }) => {
  const templateId = await createPrefillTemplate({
    name: `e2e prefill shown ${Date.now()}`,
    prefillWidgets: [prefillText("company-name", 300, { response: "Saved Inc" })]
  });
  await loginAsAdmin(page);
  await page.goto(`/template/${templateId}`);
  await expect(page.locator("canvas").first()).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Use Template" }).click();
  const modal = page.locator(".op-modal-box").last();
  await expect(modal.getByText("company-name")).toBeVisible();
  await expect(modal.locator("input.op-input").first()).toHaveValue("Saved Inc");
});
