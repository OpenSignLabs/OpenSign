import path from "node:path";
import { test, expect } from "./support/fixtures.js";
import { createSignerDocument, prepareAdminUser, waitForCompleted } from "./support/parse.js";
import { confirmField, drawStroke, finish, openSigner } from "./support/signer.js";
import { cells, image, initials, signature } from "./support/widgets.js";

test.beforeAll(prepareAdminUser);

const modal = (page) => page.locator(".op-modal-box, [role=dialog]").last();

test("a typed signature is accepted and the document completes", async ({ page }) => {
  const ids = await createSignerDocument({ name: "e2e typed", pages: [{ pageNumber: 1, pos: [signature("signature-1", 120)] }] });
  await openSigner(page, ids);
  await page.getByText("signature-1").first().click();
  await modal(page).getByText("Type", { exact: true }).click();
  await modal(page).locator("input.op-input[type=text]").fill("Ana Prueba");
  await confirmField(page);
  await finish(page);
  expect((await waitForCompleted(ids.docId)).IsCompleted).toBe(true);
});

test("initials are drawn and the document completes", async ({ page }) => {
  const ids = await createSignerDocument({ name: "e2e initials", pages: [{ pageNumber: 1, pos: [initials("initials-1", 300)] }] });
  await openSigner(page, ids);
  await page.getByText("initials-1").first().click();
  await expect(modal(page).getByText("Draw", { exact: true })).toBeVisible();
  await drawStroke(page);
  await confirmField(page);
  await finish(page);
  expect((await waitForCompleted(ids.docId)).IsCompleted).toBe(true);
});

test("an uploaded image is accepted and the document completes", async ({ page }) => {
  const ids = await createSignerDocument({ name: "e2e image", pages: [{ pageNumber: 1, pos: [image("image-1", 300)] }] });
  await openSigner(page, ids);
  await page.getByText("image-1").first().click();
  await modal(page).locator("input[type=file]").setInputFiles(path.resolve("tests/e2e/support/red.png"));
  await expect(modal(page).locator("img").first()).toBeVisible();
  await confirmField(page);
  await finish(page);
  expect((await waitForCompleted(ids.docId)).IsCompleted).toBe(true);
});

test("cells are typed in place, one character per cell (#80)", async ({ page }) => {
  const ids = await createSignerDocument({ name: "e2e cells", pages: [{ pageNumber: 1, pos: [cells("code", 300)] }] });
  await openSigner(page, ids);
  const boxes = page.locator("input[maxlength='1']");
  await expect(boxes).toHaveCount(5);
  await boxes.nth(0).click();
  await page.keyboard.type("AB12");
  await expect(boxes.nth(0)).toHaveValue("A");
  await expect(boxes.nth(1)).toHaveValue("B");
  await expect(boxes.nth(3)).toHaveValue("2");
  await expect(page.locator(".op-modal-box")).toHaveCount(0);
});

test("a document with required cells completes after typing them (#80)", async ({ page }) => {
  const ids = await createSignerDocument({
    name: "e2e cells complete",
    pages: [{ pageNumber: 1, pos: [cells("code", 300), signature("signature-1", 120)] }]
  });
  await openSigner(page, ids);
  await page.locator("input[maxlength='1']").first().click();
  await page.keyboard.type("XY789");
  await page.getByText("signature-1").first().click();
  await drawStroke(page);
  await confirmField(page);
  await finish(page);
  expect((await waitForCompleted(ids.docId)).IsCompleted).toBe(true);
});
