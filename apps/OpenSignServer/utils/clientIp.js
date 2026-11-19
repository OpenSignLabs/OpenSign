/**
 * Client IP resolution that only trusts proxy headers when the deployment
 * says a proxy is in front of the server (TRUST_PROXY).
 */

/**
 * Parse the TRUST_PROXY setting.
 * Accepts a hop count ("1", "2") or the keyword "cloudflare".
 * @param {string|undefined} value Raw environment value.
 * @returns {{hops: number, cloudflare: boolean}} Trusted proxy settings.
 */
export const parseTrustProxy = value => {
  const raw = String(value ?? '').trim().toLowerCase();
  if (raw === 'cloudflare') return { hops: 0, cloudflare: true };
  if (/^\d+$/.test(raw)) return { hops: Number(raw), cloudflare: false };
  return { hops: 0, cloudflare: false };
};

/**
 * Read one header as a trimmed string.
 * @param {object} headers Request headers.
 * @param {string} name Lower-case header name.
 * @returns {string} Header value or an empty string.
 */
const readHeader = (headers, name) => {
  const value = headers?.[name];
  return typeof value === 'string' ? value.trim() : '';
};

/**
 * Resolve the client IP without trusting client-controlled headers.
 * @param {object} headers Request headers.
 * @param {string|undefined} socketIp Remote address of the TCP socket.
 * @param {{hops: number, cloudflare: boolean}} trust Parsed TRUST_PROXY.
 * @returns {string} Client IP, or an empty string when unknown.
 */
export const resolveClientIp = (headers, socketIp, trust) => {
  const cloudflareIp = readHeader(headers, 'cf-connecting-ip');
  if (trust?.cloudflare && cloudflareIp) return cloudflareIp;
  if (trust?.hops > 0) {
    const chain = readHeader(headers, 'x-forwarded-for')
      .split(',')
      .map(ip => ip.trim())
      .filter(Boolean);
    if (chain.length > 0) return chain[Math.max(0, chain.length - trust.hops)];
  }
  return socketIp || '';
};
