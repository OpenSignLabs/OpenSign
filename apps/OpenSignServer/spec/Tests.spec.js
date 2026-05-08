import axios from 'axios';
import {
  getSignedLocalUrl,
  normalizeLocalFileUrl,
  presignedlocalUrl,
} from '../cloud/parsefunction/getSignedUrl.js';

describe('Parse Server example', () => {
  Parse.User.enableUnsafeCurrentUser();
  it('call function', async () => {
    const result = await Parse.Cloud.run('hello');
    expect(result).toBe('Hi');
  });
  it('call async function', async () => {
    const result = await Parse.Cloud.run('asyncFunction');
    expect(result).toBe('Hi async');
  });
  it('failing test', async () => {
    const obj = new Parse.Object('Test');
    try {
      await obj.save();
      fail('should not have been able to save test object.');
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.code).toBe(9001);
      expect(e.message).toBe('Saving test objects is not available.');
    }
  });
  it('coverage for /', async () => {
    const { data, headers } = await axios.get('http://localhost:30001/');
    expect(headers['content-type']).toContain('text/html');
    expect(data).toBe('I dream of being a website.  Please star the parse-server repo on GitHub!');
  });
  it('coverage for /test', async () => {
    const { data, headers } = await axios.get('http://localhost:30001/test');
    expect(headers['content-type']).toContain('text/html');
    expect(data).toContain('<title>Parse Server Example</title>');
  });
});

describe('local file URL signing', () => {
  const originalServerUrl = process.env.SERVER_URL;
  const originalMasterKey = process.env.MASTER_KEY;

  beforeEach(() => {
    process.env.SERVER_URL = 'https://opensign.example.com:8443/api/app';
    process.env.MASTER_KEY = 'test-master-key';
  });

  afterAll(() => {
    process.env.SERVER_URL = originalServerUrl;
    process.env.MASTER_KEY = originalMasterKey;
  });

  it('normalizes local file URLs to the configured server origin', () => {
    const normalizedUrl = normalizeLocalFileUrl(
      'https://opensign.example.com/api/app/files/opensign/sample.pdf'
    );

    expect(normalizedUrl).toBe(
      'https://opensign.example.com:8443/api/app/files/opensign/sample.pdf'
    );
  });

  it('preserves the configured port when signing local file URLs', () => {
    const signedUrl = getSignedLocalUrl(
      'https://opensign.example.com/api/app/files/opensign/sample.pdf',
      200
    );

    expect(signedUrl).toContain(
      'https://opensign.example.com:8443/api/app/files/opensign/sample.pdf?token='
    );
  });

  it('re-signs existing local URLs with the configured port', () => {
    const signedUrl = presignedlocalUrl(
      'https://opensign.example.com/api/app/files/opensign/sample.pdf?token=old-token',
      200
    );

    expect(signedUrl).toContain(
      'https://opensign.example.com:8443/api/app/files/opensign/sample.pdf?token='
    );
  });
});
