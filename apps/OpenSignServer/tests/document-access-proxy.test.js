import test from 'node:test';
import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import { randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import {
  getProtectedDocumentFileUrl,
  protectedDocumentFile,
} from '../cloud/parsefunction/getSignedUrl.js';
process.env.MASTER_KEY = randomBytes(32).toString('hex');
process.env.SERVER_URL = 'http://localhost:3120/api/app';
process.env.DO_SPACE = 'fixture-bucket';
process.env.DO_REGION = 'us-east-1';
process.env.DO_ENDPOINT = 'https://storage.example.test';
process.env.DO_ACCESS_KEY_ID = 'TEST_ONLY';
process.env.DO_SECRET_ACCESS_KEY = 'TEST_ONLY_NOT_A_CREDENTIAL';
class PError extends Error {}
globalThis.Parse = {
  Error: PError,
  Query: class {
    constructor(name) {
      this.name = name;
    }
    include() {}
    async get(id) {
      if (this.name === 'contracts_Document' && id === 'document01') return document;
      if (this.name === 'contracts_DocumentAccessGrant' && id === 'grant00001') return grant;
      throw Error('missing');
    }
  },
};
const url = 'https://storage.example.test/fixture-bucket/owned.pdf';
let document, grant, fetches;
function fixture() {
  document = {
    get: (key) =>
      ({
        URL: url,
        Signers: [{ objectId: 'recipient1' }],
        ExpiryDate: new Date(Date.now() + 60000),
      })[key],
  };
  grant = {
    get: (key) =>
      ({
        Document: { objectId: 'document01' },
        Recipient: { objectId: 'recipient1' },
        ExpiresAt: new Date(Date.now() + 60000),
      })[key],
  };
  fetches = 0;
  globalThis.fetch = async () => {
    fetches++;
    return new Response(new TextEncoder().encode('%PDF-FICTITIOUS'), { status: 200 });
  };
}
class Res extends Writable {
  constructor() {
    super();
    this.parts = [];
    this.statusCode = 200;
    this.headers = {};
    this.headersSent = false;
  }
  _write(chunk, encoding, callback) {
    this.headersSent = true;
    this.parts.push(Buffer.from(chunk));
    callback();
  }
  set(key, value) {
    this.headers[key] = value;
    return this;
  }
  status(code) {
    this.statusCode = code;
    return this;
  }
  json(value) {
    this.end(JSON.stringify(value));
    return this;
  }
}
const scope = { docId: 'document01', grantId: 'grant00001', recipientId: 'recipient1' };
const tokenFor = (target = url) =>
  new URL(getProtectedDocumentFileUrl(target, 60, scope)).searchParams.get('token');
async function serve(token, method = 'GET') {
  const res = new Res();
  await protectedDocumentFile({ query: { token }, method }, res);
  return res;
}
test('remote document is streamed through revalidated capability with no-store', async () => {
  fixture();
  const result = await serve(tokenFor());
  assert.equal(result.statusCode, 200);
  assert.equal(Buffer.concat(result.parts).toString(), '%PDF-FICTITIOUS');
  assert.equal(result.headers['Cache-Control'], 'private, no-store');
  assert.equal(fetches, 1);
});
test('revoked remote capability is rejected without requesting storage', async () => {
  fixture();
  const previous = grant.get;
  grant.get = (key) => (key === 'RevokedAt' ? new Date() : previous(key));
  const result = await serve(tokenFor());
  assert.equal(result.statusCode, 403);
  assert.equal(fetches, 0);
});
test('expired remote document is rejected without requesting storage', async () => {
  fixture();
  const previous = document.get;
  document.get = (key) => (key === 'ExpiryDate' ? new Date(Date.now() - 1) : previous(key));
  const result = await serve(tokenFor());
  assert.equal(result.statusCode, 403);
  assert.equal(fetches, 0);
});
test('remote target cannot be swapped to a different document file', async () => {
  fixture();
  const result = await serve(tokenFor('https://storage.example.test/fixture-bucket/foreign.pdf'));
  assert.equal(result.statusCode, 403);
  assert.equal(fetches, 0);
});
test('expired and invalid download tokens are rejected before network access', async () => {
  fixture();
  const expired = jwt.sign(
    { fileUrl: url, scope, purpose: 'document-file', exp: Math.floor(Date.now() / 1000) - 1 },
    process.env.MASTER_KEY
  );
  for (const token of [expired, 'invalid']) assert.equal((await serve(token)).statusCode, 403);
  assert.equal(fetches, 0);
});
