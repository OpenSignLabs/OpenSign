/**
 * Database and SMTP settings read from the environment in one place.
 */

const DEFAULT_SMTP_PORT = 465;

/**
 * Database connection string.
 * @param {object} env Environment variables.
 * @returns {string} DATABASE_URI, or MONGODB_URI as the legacy name.
 * @throws {Error} When neither variable is set.
 */
export const getDatabaseUri = env => {
  const uri = String(env.DATABASE_URI || env.MONGODB_URI || '').trim();
  if (!uri) {
    throw new Error('DATABASE_URI is not set: provide the MongoDB connection string.');
  }
  return uri;
};

/**
 * SMTP port.
 * @param {object} env Environment variables.
 * @returns {number} SMTP_PORT, or 465 (implicit TLS) when it is empty.
 * @throws {Error} When SMTP_PORT is not a valid TCP port.
 */
export const getSmtpPort = env => {
  const raw = String(env.SMTP_PORT ?? '').trim();
  if (!raw) return DEFAULT_SMTP_PORT;
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid SMTP_PORT "${raw}": expected an integer from 1 to 65535.`);
  }
  return port;
};
