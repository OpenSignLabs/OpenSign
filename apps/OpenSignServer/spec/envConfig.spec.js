import { getDatabaseUri, getSmtpPort } from '../utils/envConfig.js';

// Pure helpers: they run without a Parse Server or a database.
describe('getDatabaseUri', () => {
  it('prefers DATABASE_URI', () => {
    expect(getDatabaseUri({ DATABASE_URI: 'mongodb://a/x', MONGODB_URI: 'mongodb://b/y' })).toBe(
      'mongodb://a/x'
    );
  });

  it('accepts MONGODB_URI as the legacy name', () => {
    expect(getDatabaseUri({ MONGODB_URI: 'mongodb://b/y' })).toBe('mongodb://b/y');
  });

  it('fails fast when neither variable is set', () => {
    expect(() => getDatabaseUri({})).toThrowError(/DATABASE_URI/);
    expect(() => getDatabaseUri({ DATABASE_URI: '  ' })).toThrowError(/DATABASE_URI/);
  });
});

describe('getSmtpPort', () => {
  it('defaults to the implicit TLS port', () => {
    expect(getSmtpPort({})).toBe(465);
    expect(getSmtpPort({ SMTP_PORT: '' })).toBe(465);
  });

  it('reads SMTP_PORT as a number', () => {
    expect(getSmtpPort({ SMTP_PORT: '587' })).toBe(587);
  });

  it('fails fast on an invalid SMTP_PORT', () => {
    expect(() => getSmtpPort({ SMTP_PORT: 'abc' })).toThrowError(/SMTP_PORT/);
    expect(() => getSmtpPort({ SMTP_PORT: '0' })).toThrowError(/SMTP_PORT/);
  });
});
