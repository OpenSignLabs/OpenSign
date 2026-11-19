/** Names of the variables the suite needs. */
const REQUIRED = [
  "E2E_BASE_URL",
  "E2E_SERVER_URL",
  "E2E_APP_ID",
  "E2E_MASTER_KEY",
  "E2E_ADMIN_EMAIL",
  "E2E_ADMIN_PASSWORD",
  "E2E_BASE_DOC_ID",
  "E2E_SIGNER_EMAIL"
];

/**
 * Read the suite settings from the environment.
 * @returns {Record<string, string>} Settings by variable name.
 * @throws {Error} When a required variable is missing.
 */
export const readEnv = () => {
  const missing = REQUIRED.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(`Missing environment variables for the E2E suite: ${missing.join(", ")}`);
  }
  return Object.fromEntries(REQUIRED.map((name) => [name, process.env[name]]));
};
