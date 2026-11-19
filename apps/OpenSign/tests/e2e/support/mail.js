import fs from "node:fs";

/** Pattern of the code inside the OTP email (after quoted-printable decoding). */
const OTP_PATTERN = /verification is:<\/p><p[^>]*>(\d{4,8})</;

/**
 * Decode the quoted-printable subset the mailer uses.
 * @param {string} text Raw message text.
 * @returns {string} Decoded text.
 */
const decodeQuotedPrintable = (text) =>
  text.replace(/=\r?\n/g, "").replace(/=([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

/**
 * Current size of the SMTP sink log, used as the offset for the next read.
 * @param {string} logPath Path of the sink log (E2E_MAIL_LOG).
 * @returns {number} Size in bytes.
 */
export const mailLogSize = (logPath) => (fs.existsSync(logPath) ? fs.statSync(logPath).size : 0);

/**
 * Wait for an OTP email in the sink log and return its code.
 * @param {string} logPath Path of the sink log.
 * @param {number} offset Log size before the OTP was requested.
 * @param {number} [timeoutMs] Maximum wait.
 * @returns {Promise<string>} The numeric code.
 * @throws {Error} When no OTP email arrives in time.
 */
export const waitForOtp = async (logPath, offset, timeoutMs = 20_000) => {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    const text = fs.existsSync(logPath) ? fs.readFileSync(logPath, "utf8").slice(offset) : "";
    const match = decodeQuotedPrintable(text).match(OTP_PATTERN);
    if (match) return match[1];
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("No OTP email received");
};
