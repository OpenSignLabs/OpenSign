import { parseOriginList, resolvePublicUrl } from '../utils/publicUrl.js';

// Pure helpers: they run without a Parse Server or a database.
describe('parseOriginList', () => {
  it('splits, trims and drops trailing slashes and empty entries', () => {
    expect(parseOriginList(' https://a.example/ , ,https://b.example ')).toEqual([
      'https://a.example',
      'https://b.example',
    ]);
  });

  it('returns an empty list for a missing value', () => {
    expect(parseOriginList(undefined)).toEqual([]);
  });
});

describe('resolvePublicUrl', () => {
  const config = {
    baseUrl: 'https://app.example/',
    allowlist: ['https://sign.customer.example'],
  };

  it('returns the configured URL for a forged Host', () => {
    expect(resolvePublicUrl({ host: 'evil.example' }, config)).toBe('https://app.example');
  });

  it('returns the configured URL for a forged Origin', () => {
    expect(resolvePublicUrl({ origin: 'https://evil.example', host: 'app.example' }, config)).toBe(
      'https://app.example'
    );
  });

  it('keeps an allowed custom domain from Origin', () => {
    expect(resolvePublicUrl({ origin: 'https://sign.customer.example' }, config)).toBe(
      'https://sign.customer.example'
    );
  });

  it('keeps an allowed custom domain from Host', () => {
    expect(resolvePublicUrl({ host: 'sign.customer.example' }, config)).toBe(
      'https://sign.customer.example'
    );
  });

  it('always allows the configured URL itself', () => {
    expect(resolvePublicUrl({ origin: 'https://app.example' }, config)).toBe('https://app.example');
  });

  it('falls back to the Host only when no URL is configured', () => {
    expect(resolvePublicUrl({ host: 'dev.example' }, { baseUrl: '', allowlist: [] })).toBe(
      'https://dev.example'
    );
  });
});
