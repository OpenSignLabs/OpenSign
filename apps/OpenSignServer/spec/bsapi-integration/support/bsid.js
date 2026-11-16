// A stand-in for bs-id (Sign in with BetterSign): /jwks and /token, issuing
// an ES256 id_token for whichever VLAD the spec queues for the next code.
import http from 'node:http';
import crypto from 'node:crypto';

export const BSID_PORT = 8797;
export const BSID_URL = `http://localhost:${BSID_PORT}`;
const CLIENT_ID = 'bs-opensign';

const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'test-key', alg: 'ES256', use: 'sig' };

export const bsid = {
  codes: new Map(), // code -> { vlad, nonce }
  issue(vlad, nonce) {
    const code = crypto.randomBytes(16).toString('base64url');
    this.codes.set(code, { vlad, nonce });
    return code;
  },
};

const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');

function idToken({ vlad, nonce }) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64({ alg: 'ES256', kid: jwk.kid, typ: 'JWT' });
  const body = b64({
    iss: BSID_URL,
    aud: CLIENT_ID,
    sub: 'user-' + vlad.slice(0, 8),
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

let server;

export function startBsId() {
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
        const code = new URLSearchParams(body).get('code');
        const grant = bsid.codes.get(code);
        if (!grant) return send(400, { error: 'invalid_grant' });
        bsid.codes.delete(code);
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
