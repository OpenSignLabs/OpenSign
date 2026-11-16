// A stand-in for bs-id (the BetterSign OIDC provider) for Sign in with
// BetterSign (cloud/parsefunction/bsidlogin.js): POST /token trades a code the
// spec issued for an ES256 id_token naming a VLAD; GET /jwks serves the key.
import http from 'node:http';
import crypto from 'node:crypto';

export const BSID_PORT = 8798;
export const BSID_URL = `http://localhost:${BSID_PORT}`;
const CLIENT_ID = 'bs-opensign'; // bsidlogin's default BS_ID_CLIENT_ID
const KID = 'test-key';

const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
const codes = new Map(); // code -> { vlad, nonce }

const b64url = obj => Buffer.from(JSON.stringify(obj)).toString('base64url');

function idToken({ vlad, nonce }) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64url({ alg: 'ES256', kid: KID, typ: 'JWT' });
  const body = b64url({
    iss: BSID_URL,
    aud: CLIENT_ID,
    sub: `sub-${vlad.slice(4, 20)}`,
    vlad,
    nonce,
    iat: now,
    exp: now + 300,
  });
  const sig = crypto.sign('sha256', Buffer.from(`${head}.${body}`), {
    key: privateKey,
    dsaEncoding: 'ieee-p1363',
  });
  return `${head}.${body}.${sig.toString('base64url')}`;
}

// The params the browser would pass to bsidlogin after bs-id approved `vlad`.
export function bsidLoginParams(vlad) {
  const code = crypto.randomBytes(16).toString('base64url');
  const nonce = crypto.randomBytes(16).toString('base64url');
  codes.set(code, { vlad, nonce });
  return {
    code,
    nonce,
    codeVerifier: crypto.randomBytes(32).toString('base64url'),
    redirectUri: 'http://localhost:3000/auth/bettersign/callback',
  };
}

let server;

export function startBsId() {
  const jwk = { ...publicKey.export({ format: 'jwk' }), kid: KID, alg: 'ES256', use: 'sig' };
  server = http.createServer((req, res) => {
    let body = '';
    req.on('data', c => (body += c));
    req.on('end', () => {
      const send = (status, obj) => {
        res.writeHead(status, { 'content-type': 'application/json' });
        res.end(JSON.stringify(obj));
      };
      if (req.method === 'GET' && req.url === '/jwks') return send(200, { keys: [jwk] });
      if (req.method === 'POST' && req.url === '/token') {
        const form = new URLSearchParams(body);
        const grant = codes.get(form.get('code'));
        if (!grant || form.get('client_id') !== CLIENT_ID) {
          return send(400, { error: 'invalid_grant' });
        }
        codes.delete(form.get('code'));
        return send(200, { id_token: idToken(grant), token_type: 'Bearer' });
      }
      return send(404, { error: 'not_found' });
    });
  });
  return new Promise(resolve => server.listen(BSID_PORT, resolve));
}

export function stopBsId() {
  return new Promise(resolve => (server ? server.close(resolve) : resolve()));
}
