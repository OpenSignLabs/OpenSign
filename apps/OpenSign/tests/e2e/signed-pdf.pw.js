import { test, expect } from "./support/fixtures.js";
import { createSignerDocument, prepareAdminUser, waitForCompleted } from "./support/parse.js";
import { hasDigitalSignature, readPdfBytes } from "./support/pdf.js";
import { measureRadioMarks } from "./support/render.js";
import { drawStroke, finish, openSigner } from "./support/signer.js";
import { radio, signature } from "./support/widgets.js";

test.beforeAll(prepareAdminUser);

/** Complete a document that has one radio group and one signature. */
const completeWithRadio = async (page, name, radioWidget, choose) => {
  const ids = await createSignerDocument({
    name,
    pages: [{ pageNumber: 1, pos: [radioWidget, signature("signature-1", 120)] }]
  });
  await openSigner(page, ids);
  if (choose !== undefined) {
    // The inline radio settles a tick after the click, so assert with a retry.
    await page.locator("input[type=radio]").nth(choose).click();
    await expect(page.locator("input[type=radio]").nth(choose)).toBeChecked();
  }
  await page.getByText("signature-1").first().click();
  await drawStroke(page);
  await page.getByText("Next Field").click();
  await finish(page);
  return waitForCompleted(ids.docId);
};

/** Index of the filled circle; fails when no circle or several circles are filled. */
const filledIndex = (marks) => {
  expect(marks.every((m) => m !== null), `labels found: ${JSON.stringify(marks)}`).toBe(true);
  const filled = marks.map((m, i) => (m > 0.3 ? i : -1)).filter((i) => i >= 0);
  expect(filled.length, `dark share per circle: ${JSON.stringify(marks)}`).toBeLessThanOrEqual(1);
  return filled.length ? filled[0] : -1;
};

test("the radio chosen by the signer is drawn as selected in the signed PDF (#66)", async ({ page, browser }) => {
  const doc = await completeWithRadio(page, "e2e radio pdf", radio("plan", ["Basic", "Pro", "Max"], 300), 1);
  expect(await hasDigitalSignature(doc.SignedUrl)).toBe(true);
  const marks = await measureRadioMarks(browser, await readPdfBytes(doc.SignedUrl), ["Basic", "Pro", "Max"]);
  expect(filledIndex(marks)).toBe(1);
});

test("a stale radio default does not block completion (#66)", async ({ page }) => {
  const stale = radio("plan", ["Basic", "Pro"], 300, { status: "optional", defaultValue: "Removed option" });
  const doc = await completeWithRadio(page, "e2e radio stale", stale, undefined);
  expect(doc.IsCompleted).toBe(true);
});
