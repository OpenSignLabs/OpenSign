import { test, expect } from "./support/fixtures.js";
import { mailLogSize, waitForOtp } from "./support/mail.js";
import { createSignerDocument, prepareAdminUser } from "./support/parse.js";
import { textInput } from "./support/widgets.js";

const MAIL_LOG = process.env.E2E_MAIL_LOG;
const OTP_PLACEHOLDER = "Enter verification code received over email";

test.beforeAll(prepareAdminUser);

/** Seed an OTP document and open the link the signer gets by email. */
const openOtpLink = async (page, name) => {
  const ids = await createSignerDocument({
    name,
    otp: true,
    pages: [{ pageNumber: 1, pos: [textInput("nombres", 165)] }]
  });
  const link = encodeURIComponent(btoa(`${ids.docId}/${process.env.E2E_SIGNER_EMAIL}/${ids.contactId}/true`));
  await page.goto(`/login/${link}`);
  await expect(page.getByRole("button", { name: "Get verification code" })).toBeVisible();
  return ids;
};

test("a signer verifies the emailed code and then edits the document", async ({ page }) => {
  test.skip(!MAIL_LOG, "E2E_MAIL_LOG is not set: no SMTP sink to read the code from");
  await openOtpLink(page, "e2e otp");
  const offset = mailLogSize(MAIL_LOG);
  await page.getByRole("button", { name: "Get verification code" }).click();
  const code = await waitForOtp(MAIL_LOG, offset);
  await page.getByPlaceholder(OTP_PLACEHOLDER).fill(code);
  await page.getByRole("button", { name: "Verify", exact: true }).click();
  await page.getByText("I confirm & agree to continue").click();
  const field = page.locator("textarea[placeholder=nombres]");
  await field.fill("Ana");
  await expect(field).toHaveValue("Ana");
});

test("a wrong code is rejected and the document stays locked", async ({ page }) => {
  test.skip(!MAIL_LOG, "E2E_MAIL_LOG is not set: no SMTP sink to read the code from");
  await openOtpLink(page, "e2e otp wrong");
  const dialogs = [];
  page.on("dialog", async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.dismiss();
  });
  const offset = mailLogSize(MAIL_LOG);
  await page.getByRole("button", { name: "Get verification code" }).click();
  const real = await waitForOtp(MAIL_LOG, offset);
  // The field accepts exactly 4 digits; send a different 4-digit code.
  const wrong = String((Number(real) + 1) % 10000).padStart(4, "0");
  await page.getByPlaceholder(OTP_PLACEHOLDER).fill(wrong);
  await page.getByRole("button", { name: "Verify", exact: true }).click();
  await expect.poll(() => dialogs.length, { timeout: 15_000 }).toBeGreaterThan(0);
  expect(dialogs[0]).toMatch(/invalid/i);
  await expect(page.getByText("I confirm & agree to continue")).toHaveCount(0);
  await expect(page).toHaveURL(/\/login\//);
});

test("the resend button sends a new code by email", async ({ page }) => {
  test.skip(!MAIL_LOG, "E2E_MAIL_LOG is not set: no SMTP sink to read the code from");
  await openOtpLink(page, "e2e otp resend");
  await page.getByRole("button", { name: "Get verification code" }).click();
  await expect(page.getByPlaceholder(OTP_PLACEHOLDER)).toBeVisible();
  const offset = mailLogSize(MAIL_LOG);
  await page.getByRole("button", { name: "Resend" }).click();
  const code = await waitForOtp(MAIL_LOG, offset);
  await page.getByPlaceholder(OTP_PLACEHOLDER).fill(code);
  await page.getByRole("button", { name: "Verify", exact: true }).click();
  await page.getByText("I confirm & agree to continue").click();
  await expect(page.locator("textarea[placeholder=nombres]")).toBeVisible();
});
