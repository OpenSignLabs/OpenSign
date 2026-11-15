// Jasmine helper: runs OpenSign's server in-process on :8080/app (Utils.js
// calls itself there), with a mock BetterSign verifier on :8799, against a
// throwaway database on MONGODB_URI (set by `mongodb-runner exec`).
//
// Utils.js reads the environment when it loads, so set it here, before any
// server module is imported; they're imported dynamically below.
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { startVerifier, stopVerifier, VERIFIER_PORT, VERIFIER_SECRET } from './verifier.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(here, '../../..');

// Linked through BS_ID_USERS (the env fallback) rather than bs_Identity.
const envKeys = crypto.generateKeyPairSync('ed25519');
export const envIdentity = {
  vlad: '8724' + crypto.randomBytes(38).toString('hex'),
  publicKey: envKeys.publicKey,
  privateKey: envKeys.privateKey,
  email: 'env-linked@example.com',
};

const mongoBase = new URL(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/');
mongoBase.pathname = `/bsapi-int-${crypto.randomBytes(4).toString('hex')}`;

Object.assign(process.env, {
  TESTING: 'true',
  APP_ID: 'opensign',
  MASTER_KEY: 'bsapi-test-master',
  SERVER_URL: 'http://localhost:8080/app',
  DATABASE_URI: mongoBase.toString(),
  MONGODB_URI: mongoBase.toString(),
  USE_LOCAL: 'true',
  BS_VERIFIER_URL: `http://localhost:${VERIFIER_PORT}`,
  BS_VERIFIER_SECRET: VERIFIER_SECRET,
  BS_API_RECEIVER_VLAD: '8724' + crypto.randomBytes(38).toString('hex'),
  BS_ID_USERS: JSON.stringify({ [envIdentity.vlad]: envIdentity.email }),
  PASS_PHRASE: 'test',
});

export const shared = { p12: null };

let parseServer;
let httpServer;
let before;

// Files the server writes while signing (uploads, certificates, mail temp files).
function artifacts() {
  const list = dir => (fs.existsSync(dir) ? fs.readdirSync(dir).map(f => path.join(dir, f)) : []);
  return new Set([
    ...list(path.join(serverDir, 'files/files')),
    ...list(path.join(serverDir, 'exports')).filter(f => /signed_|\.pdf$/.test(f)),
    ...list(serverDir).filter(f => /\/test_\d+\.pdf$/.test(f)),
  ]);
}

beforeAll(async () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
  before = artifacts();
  const lib = await import('./lib.js');
  shared.p12 = lib.testP12();
  process.env.PFX_BASE64 = shared.p12.toString('base64');

  await startVerifier();
  const { ParseServer } = await import('parse-server');
  const { app, config } = await import('../../../index.js');
  delete config.databaseAdapter;
  parseServer = new ParseServer({
    ...config,
    databaseURI: process.env.DATABASE_URI,
    appId: lib.APP_ID,
    masterKey: lib.MASTER_KEY,
    serverURL: lib.PARSE,
    publicServerURL: lib.PARSE,
    logLevel: 'error',
    silent: true,
  });
  await parseServer.start();
  app.use('/app', parseServer.app);
  httpServer = http.createServer(app);
  await new Promise(resolve => httpServer.listen(lib.PORT, resolve));

  const require = createRequire(import.meta.url);
  await require('../../../databases/migrations/20261114120000-create_bettersign_api_classes.cjs').up(
    Parse
  );
  await require('../../../databases/migrations/20261115120000-create_bs_apiconfig.cjs').up(Parse);
}, 180000);

afterAll(async () => {
  // afterSave hooks (DocumentAftersave's ACL update) run after the response is
  // sent; let them finish before the database goes away under them.
  await new Promise(resolve => setTimeout(resolve, 2000));
  try {
    await Parse.Server.database.deleteEverything(true);
  } catch {
    // the database is throwaway anyway
  }
  await new Promise(resolve => (httpServer ? httpServer.close(resolve) : resolve()));
  try {
    await parseServer?.handleShutdown?.();
  } catch {
    // nothing left to close
  }
  await stopVerifier();
  for (const f of artifacts()) if (!before.has(f)) fs.rmSync(f, { force: true });
});
