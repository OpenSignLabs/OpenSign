import { test, expect } from "./support/fixtures.js";
import { createSignerDocument, prepareAdminUser } from "./support/parse.js";
import { drawStroke, openSigner } from "./support/signer.js";
import { dateWidget, signature, textInput } from "./support/widgets.js";

test.beforeAll(prepareAdminUser);

test("linked text fields share the value typed in one of them (#59)", async ({ page }) => {
  const ids = await createSignerDocument({
    name: "e2e linked",
    pages: [{ pageNumber: 1, pos: [textInput("full-name", 165), textInput("full-name", 400)] }]
  });
  await openSigner(page, ids);
  const fields = page.locator("textarea[placeholder=full-name]");
  await expect(fields).toHaveCount(2);
  await fields.nth(0).fill("Ana Prueba");
  await fields.nth(0).blur();
  await expect(fields.nth(1)).toHaveValue("Ana Prueba");
});

test("Next Field skips fields that already have a value (#67)", async ({ page }) => {
  const ids = await createSignerDocument({
    name: "e2e next",
    pages: [
      {
        pageNumber: 1,
        pos: [
          signature("first-signature", 120),
          textInput("prefilled", 300, { defaultValue: "already set" }),
          signature("second-signature", 500)
        ]
      }
    ]
  });
  await openSigner(page, ids);
  await page.getByText("first-signature").first().click();
  await expect(page.getByText("first-signature").last()).toBeVisible();
  await drawStroke(page);
  await page.getByText("Next Field").click();
  await expect(page.locator(".op-modal-box, [role=dialog]").getByText("second-signature")).toBeVisible();
});

test("the date picker opens next to its field (#67)", async ({ page }) => {
  const ids = await createSignerDocument({
    name: "e2e date",
    pages: [{ pageNumber: 1, pos: [dateWidget("when", 700)] }]
  });
  await openSigner(page, ids);
  const input = page.locator(".react-datepicker-wrapper input").first();
  await input.scrollIntoViewIfNeeded();
  await input.click();
  const calendar = page.locator(".react-datepicker").first();
  await expect(calendar).toBeVisible();
  const box = await calendar.boundingBox();
  const field = await input.boundingBox();
  const viewport = page.viewportSize();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  // Anchored: the calendar touches the field above or below it.
  const gap = Math.min(Math.abs(box.y - (field.y + field.height)), Math.abs(field.y - (box.y + box.height)));
  expect(gap).toBeLessThan(40);
  await page.locator(".react-datepicker__day:not(.react-datepicker__day--outside-month)").nth(9).click();
  await expect(input).not.toHaveValue("");
});
