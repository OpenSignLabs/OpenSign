import { getServerConfig, rewritePublicApiUrl } from '../utils/serverConfig.js';

// Pure helpers: they run without a Parse Server or a database.
describe('getServerConfig', () => {
  it('uses the documented defaults when nothing is set', () => {
    const config = getServerConfig({});
    expect(config.port).toBe(8080);
    expect(config.bindHost).toBe('0.0.0.0');
    expect(config.serverOrigin).toBe('http://localhost:8080');
    expect(config.cloudServerUrl).toBe('http://localhost:8080/app');
  });

  it('follows a custom PORT and PARSE_MOUNT', () => {
    const config = getServerConfig({ PORT: '9000', PARSE_MOUNT: '/parse' });
    expect(config.cloudServerUrl).toBe('http://localhost:9000/parse');
  });

  it('reads BIND_HOST', () => {
    expect(getServerConfig({ BIND_HOST: '127.0.0.1' }).bindHost).toBe('127.0.0.1');
  });

  it('fails fast on an invalid PORT', () => {
    expect(() => getServerConfig({ PORT: 'abc' })).toThrowError(/PORT/);
    expect(() => getServerConfig({ PORT: '70000' })).toThrowError(/PORT/);
  });
});

describe('rewritePublicApiUrl', () => {
  it('maps a public API URL to the internal origin', () => {
    expect(
      rewritePublicApiUrl('https://dev.example/api/files/a.pdf', 'https://dev.example/api', 'http://localhost:8080')
    ).toBe('http://localhost:8080/files/a.pdf');
  });

  it('leaves the URL untouched when PUBLIC_API_URL is not set', () => {
    expect(rewritePublicApiUrl('https://x.example/a.pdf', '', 'http://localhost:8080')).toBe(
      'https://x.example/a.pdf'
    );
  });

  it('leaves URLs outside PUBLIC_API_URL untouched', () => {
    expect(
      rewritePublicApiUrl('https://other.example/a.pdf', 'https://dev.example/api', 'http://localhost:8080')
    ).toBe('https://other.example/a.pdf');
  });
});
