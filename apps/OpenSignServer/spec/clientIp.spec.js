import { resolveClientIp, parseTrustProxy } from '../utils/clientIp.js';

// Pure helpers: they run without a Parse Server or a database.
describe('parseTrustProxy', () => {
  it('defaults to no trusted proxy', () => {
    expect(parseTrustProxy(undefined)).toEqual({ hops: 0, cloudflare: false });
    expect(parseTrustProxy('')).toEqual({ hops: 0, cloudflare: false });
  });

  it('reads a hop count', () => {
    expect(parseTrustProxy('2')).toEqual({ hops: 2, cloudflare: false });
  });

  it('reads the cloudflare keyword', () => {
    expect(parseTrustProxy('cloudflare')).toEqual({ hops: 0, cloudflare: true });
  });

  it('ignores invalid values', () => {
    expect(parseTrustProxy('abc')).toEqual({ hops: 0, cloudflare: false });
    expect(parseTrustProxy('-3')).toEqual({ hops: 0, cloudflare: false });
  });
});

describe('resolveClientIp', () => {
  const socket = '10.0.0.9';

  it('ignores forged headers when no proxy is trusted', () => {
    const headers = {
      'x-forwarded-for': '1.2.3.4',
      'cf-connecting-ip': '5.6.7.8',
      'x-real-ip': '9.9.9.9',
    };
    expect(resolveClientIp(headers, socket, { hops: 0, cloudflare: false })).toBe(socket);
  });

  it('uses the entry added by the trusted proxy, not the forged first entry', () => {
    const headers = { 'x-forwarded-for': '1.2.3.4, 203.0.113.7' };
    expect(resolveClientIp(headers, socket, { hops: 1, cloudflare: false })).toBe('203.0.113.7');
  });

  it('skips one extra hop per trusted proxy', () => {
    const headers = { 'x-forwarded-for': '1.2.3.4, 203.0.113.7, 10.1.1.1' };
    expect(resolveClientIp(headers, socket, { hops: 2, cloudflare: false })).toBe('203.0.113.7');
  });

  it('falls back to the socket when the chain is empty', () => {
    expect(resolveClientIp({}, socket, { hops: 1, cloudflare: false })).toBe(socket);
  });

  it('trusts cf-connecting-ip only in cloudflare mode', () => {
    const headers = { 'cf-connecting-ip': '5.6.7.8' };
    expect(resolveClientIp(headers, socket, { hops: 0, cloudflare: true })).toBe('5.6.7.8');
    expect(resolveClientIp(headers, socket, { hops: 0, cloudflare: false })).toBe(socket);
  });

  it('returns an empty string when nothing is known', () => {
    expect(resolveClientIp({}, undefined, { hops: 0, cloudflare: false })).toBe('');
  });
});
