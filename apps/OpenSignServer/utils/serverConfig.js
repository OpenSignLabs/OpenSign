/**
 * Server network settings read from the environment in one place.
 * The defaults below are the values the server has always used.
 */

const DEFAULT_PORT = 8080;
const DEFAULT_BIND_HOST = '0.0.0.0';
const DEFAULT_MOUNT_PATH = '/app';
const LOOPBACK_HOST = 'localhost';

/**
 * Parse and validate the listening port.
 * @param {string|undefined} value Raw PORT value.
 * @returns {number} Port number.
 * @throws {Error} When the value is not a valid TCP port.
 */
const parsePort = value => {
  if (value === undefined || value === '') return DEFAULT_PORT;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT "${value}": expected an integer from 1 to 65535.`);
  }
  return port;
};

/**
 * Build the server network settings.
 * @param {object} env Environment variables.
 * @returns {{port: number, bindHost: string, serverOrigin: string, cloudServerUrl: string}}
 *   Port, interface to bind, internal origin and internal Parse URL.
 * @throws {Error} When PORT is invalid.
 */
export const getServerConfig = env => {
  const port = parsePort(env.PORT);
  const bindHost = env.BIND_HOST || DEFAULT_BIND_HOST;
  const serverOrigin = `http://${LOOPBACK_HOST}:${port}`;
  const mountPath = env.PARSE_MOUNT || DEFAULT_MOUNT_PATH;
  return { port, bindHost, serverOrigin, cloudServerUrl: `${serverOrigin}${mountPath}` };
};

/**
 * Map a URL under the public API prefix to the internal server origin.
 * @param {string} url Original URL.
 * @param {string|undefined} publicApiUrl Public API prefix (PUBLIC_API_URL).
 * @param {string} serverOrigin Internal server origin.
 * @returns {string} Rewritten URL, or the original when it does not apply.
 */
export const rewritePublicApiUrl = (url, publicApiUrl, serverOrigin) => {
  const prefix = String(publicApiUrl ?? '').replace(/\/+$/, '');
  if (!prefix || !url.startsWith(`${prefix}/`)) return url;
  return `${serverOrigin}${url.slice(prefix.length)}`;
};
