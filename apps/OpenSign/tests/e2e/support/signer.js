/**
 * Open the guest signer page and accept the electronic signature consent.
 * @param {import("@playwright/test").Page} page Browser page.
 * @param {{docId: string, contactId: string}} ids Document and signer ids.
 * @returns {Promise<void>} Resolves when the document is ready to edit.
 */
export const openSigner = async (page, { docId, contactId }) => {
  await page.goto(`/load/recipientSignPdf/${docId}/${contactId}`);
  await page.getByText("I confirm & agree to continue").click();
  await page.locator("canvas").first().waitFor();
};

/**
 * Draw a stroke on the last canvas of the open signature modal.
 * @param {import("@playwright/test").Page} page Browser page.
 * @returns {Promise<void>} Resolves when the stroke is drawn.
 */
export const drawStroke = async (page) => {
  const box = await page.locator("canvas").last().boundingBox();
  await page.mouse.move(box.x + 40, box.y + 60);
  await page.mouse.down();
  for (let i = 0; i < 20; i += 1) {
    await page.mouse.move(box.x + 40 + i * 12, box.y + 60 + Math.sin(i / 2) * 30);
  }
  await page.mouse.up();
};

/**
 * Press Finish and wait for the success page.
 * @param {import("@playwright/test").Page} page Browser page.
 * @returns {Promise<void>} Resolves on the success page.
 */
export const finish = async (page) => {
  // After "Done" the modal shows its own Finish button; otherwise only the toolbar one exists.
  await page.getByRole("button", { name: "Finish", exact: true }).last().click();
  await page.waitForURL(/\/success\?docid=/, { timeout: 60_000 });
};

/**
 * Confirm the open widget modal: "Next Field" when more fields remain, "Done" on the last one.
 * @param {import("@playwright/test").Page} page Browser page.
 * @returns {Promise<void>} Resolves after the click.
 */
export const confirmField = async (page) => {
  await page.getByRole("button", { name: /Next Field|Done/ }).last().click();
};
