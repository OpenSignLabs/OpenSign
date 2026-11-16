import { test, expect } from "./support/fixtures.js";
import { createSignerDocument, prepareAdminUser } from "./support/parse.js";
import { openSigner } from "./support/signer.js";
import { cells, checkbox, dateWidget, dropdown, radio } from "./support/widgets.js";

test.beforeAll(prepareAdminUser);

/** Seed a document with one widget of each inline type and open it as the signer. */
const openWidgetsDocument = async (page, name) => {
  const ids = await createSignerDocument({
    name,
    pages: [
      {
        pageNumber: 1,
        pos: [
          radio("colors", ["Red", "Green", "Blue"], 150),
          checkbox("tags", ["One", "Two", "Three"], 150),
          dropdown("size", ["Small", "Large"], 150),
          dateWidget("when", 200),
          cells("code", 260)
        ]
      }
    ]
  });
  await openSigner(page, ids);
  return ids;
};

test("radio buttons select one option inline", async ({ page }) => {
  await openWidgetsDocument(page, "e2e radio");
  const radios = page.locator("input[type=radio]");
  await expect(radios).toHaveCount(3);
  await radios.nth(1).check();
  await expect(radios.nth(1)).toBeChecked();
  await radios.nth(2).check();
  await expect(radios.nth(2)).toBeChecked();
  await expect(radios.nth(1)).not.toBeChecked();
});

test("checkboxes keep several options and can be unchecked", async ({ page }) => {
  await openWidgetsDocument(page, "e2e checkbox");
  const boxes = page.locator("input.op-checkbox");
  await expect(boxes).toHaveCount(3);
  await boxes.nth(0).check();
  await boxes.nth(2).check();
  await expect(boxes.nth(0)).toBeChecked();
  await expect(boxes.nth(2)).toBeChecked();
  await boxes.nth(0).uncheck();
  await expect(boxes.nth(0)).not.toBeChecked();
});

test("dropdown selects an option inline", async ({ page }) => {
  await openWidgetsDocument(page, "e2e dropdown");
  const select = page.locator("select").first();
  await select.selectOption("Large");
  await expect(select).toHaveValue("Large");
});

test("radio default value with spaces is shown as selected (#65)", async ({ page }) => {
  const ids = await createSignerDocument({
    name: "e2e radio default",
    pages: [{ pageNumber: 1, pos: [radio("colors", ["Red", "Green"], 150, { defaultValue: " Green " })] }]
  });
  await openSigner(page, ids);
  const radios = page.locator("input[type=radio]");
  await expect(radios.nth(1)).toBeChecked();
  await expect(radios.nth(0)).not.toBeChecked();
});

test("radio with an object default and no options does not crash (#65)", async ({ page }) => {
  const ids = await createSignerDocument({
    name: "e2e radio object default",
    pages: [{ pageNumber: 1, pos: [radio("colors", [{ name: "Red" }, { name: "Green" }], 150, { defaultValue: [{ name: "Red", checked: true }] })] }]
  });
  await openSigner(page, ids);
  await expect(page.locator("input[type=radio]").nth(0)).toBeChecked();
});
