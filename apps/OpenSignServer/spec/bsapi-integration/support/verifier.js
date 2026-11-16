// A stand-in for bs-verifier POST /verify: checks x-bs-verifier-secret, then an
// Ed25519 signature over the nonce bytes against the "primary key" registered
// for the VLAD. Specs register keys, switch to 503, and read the calls.
import http from 'node:http';
import crypto from 'node:crypto';

export const VERIFIER_PORT = 8799;
export const VERIFIER_SECRET = 'bsapi-test-verifier-secret';

export const verifier = {
  keys: new Map(), // vladHex -> KeyObject
  mode: 'ok', // 'ok' | '503' | 'bad_secret'
  calls: [],
  register(id) {
    this.keys.set(id.vlad, id.publicKey);
  },
};

let server;

export function startVerifier() {
  server = http.createServer((req, res) => {
    let body = '';
    req.on('data', c => (body += c));
    req.on('end', () => {
      const send = (status, obj) => {
        res.writeHead(status, { 'content-type': 'application/json' });
        res.end(JSON.stringify(obj));
      };
      if (req.url !== '/verify') return send(404, { ok: false });
      if (
        verifier.mode === 'bad_secret' ||
        req.headers['x-bs-verifier-secret'] !== VERIFIER_SECRET
      ) {
        return send(401, { ok: false, code: 'bad_secret', error: 'bad secret' });
      }
      const call = JSON.parse(body);
      verifier.calls.push(call);
      if (verifier.mode === '503') {
        return send(503, { ok: false, code: 'resolve_failed', error: 'dht down' });
      }
      const key = verifier.keys.get(call.vlad);
      if (!key) return send(401, { ok: false, code: 'not_found', error: 'no record' });
      const ok = crypto.verify(
        null,
        Buffer.from(call.nonce, 'hex'),
        key,
        Buffer.from(call.signature, 'hex')
      );
      return ok
        ? send(200, { ok: true, vlad: 'mock' })
        : send(401, { ok: false, code: 'rejected', error: 'bad signature' });
    });
  });
  return new Promise(resolve => server.listen(VERIFIER_PORT, resolve));
}

export function stopVerifier() {
  return new Promise(resolve => (server ? server.close(resolve) : resolve()));
}
