import { test, expect } from "./support/fixtures.js";
import { loginAsAdmin } from "./support/login.js";
import { createSignerDocument, getDocument, prepareAdminUser } from "./support/parse.js";
import { openSigner } from "./support/signer.js";
import { textInput } from "./support/widgets.js";

test.beforeAll(prepareAdminUser);

test("the owner opens the dashboard and the reports without page errors", async ({ page }) => {
  await loginAsAdmin(page);
  await expect(page.locator("body")).not.toContainText("Something went wrong");
});

test("the template editor shows the PDF, the roles and the widget palette", async ({ page }) => {
  await loginAsAdmin(page);
  const { results } = await (await fetch(`${process.env.E2E_SERVER_URL}/classes/contracts_Template?limit=1`, {
    headers: { "X-Parse-Application-Id": process.env.E2E_APP_ID, "X-Parse-Master-Key": process.env.E2E_MASTER_KEY }
  })).json();
  await page.goto(`/template/${results[0].objectId}`);
  await expect(page.locator("canvas").first()).toBeVisible();
  for (const type of ["signature", "text input", "radio button", "cells", "date"]) {
    await expect(page.getByRole("button", { name: type, exact: true }).first()).toBeVisible();
  }
  await expect(page.getByText("Add role")).toBeVisible();
});

test("a signer can decline a document with a reason", async ({ page }) => {
  const ids = await createSignerDocument({ name: "e2e decline", pages: [{ pageNumber: 1, pos: [textInput("nombres", 165)] }] });
  await openSigner(page, ids);
  await page.getByRole("button", { name: "Decline", exact: true }).click();
  await page.locator("textarea.op-textarea").fill("e2e reason");
  await page.getByRole("button", { name: "Yes", exact: true }).click();
  await expect.poll(async () => (await getDocument(ids.docId)).IsDeclined, { timeout: 20_000 }).toBe(true);
  expect((await getDocument(ids.docId)).DeclineReason).toBe("e2e reason");
});
