/**
 * Public URL used to build links in emails. The request Host and Origin
 * headers are client-controlled, so they are accepted only when they match
 * the configured URL or an explicit allowlist.
 */

/**
 * Normalize an origin: trim spaces and drop trailing slashes.
 * @param {string|undefined} value Raw origin.
 * @returns {string} Normalized origin or an empty string.
 */
const normalizeOrigin = value => String(value ?? '').trim().replace(/\/+$/, '');

/**
 * Parse a comma-separated list of origins.
 * @param {string|undefined} value Raw environment value.
 * @returns {string[]} Normalized origins without empty entries.
 */
export const parseOriginList = value =>
  String(value ?? '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

/**
 * Resolve the public URL for links in emails.
 * @param {{host?: string, origin?: string}} request Host and Origin headers.
 * @param {{baseUrl: string, allowlist: string[]}} config Configured public
 *   URL and extra allowed origins (custom domains).
 * @returns {string} Public origin without a trailing slash.
 */
export const resolvePublicUrl = (request, config) => {
  const baseUrl = normalizeOrigin(config?.baseUrl);
  const candidate =
    normalizeOrigin(request?.origin) ||
    (request?.host ? `https://${normalizeOrigin(request.host)}` : '');
  if (!baseUrl) return candidate;
  const allowed = [baseUrl, ...(config?.allowlist || [])];
  return allowed.includes(candidate) ? candidate : baseUrl;
};
