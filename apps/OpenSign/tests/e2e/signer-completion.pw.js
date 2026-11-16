import { test, expect } from "./support/fixtures.js";
import { createSignerDocument, prepareAdminUser, waitForCompleted } from "./support/parse.js";
import { drawStroke, finish, openSigner } from "./support/signer.js";
import { signature, textInput } from "./support/widgets.js";

test.beforeAll(prepareAdminUser);

test("guest signer fills text, draws a signature and completes the document", async ({ page }) => {
  const ids = await createSignerDocument({
    name: "e2e completion",
    pages: [{ pageNumber: 1, pos: [textInput("nombres", 165), textInput("apellidos", 185), signature("signature-1", 120)] }]
  });
  await openSigner(page, ids);
  await page.locator("textarea[placeholder=nombres]").fill("Ana");
  await page.locator("textarea[placeholder=apellidos]").fill("Prueba");
  await page.getByText("signature-1").first().click();
  await expect(page.getByText("Draw", { exact: true })).toBeVisible();
  await drawStroke(page);
  await page.getByText("Next Field").click();
  await finish(page);
  const doc = await waitForCompleted(ids.docId);
  expect(doc.IsCompleted).toBe(true);
  expect(doc.AuditTrail.at(-1).Activity).toBe("Signed");
});
