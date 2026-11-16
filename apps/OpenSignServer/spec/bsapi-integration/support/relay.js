// A stand-in for the BetterSign relay (bs-fill-relay) for "Sign on phone":
// POST /v1/req and GET /v1/resp/{reqId}, with the relay's signed-call check.
// Specs play the phone by reading `relay.requests` and calling respond().
import http from 'node:http';
import crypto from 'node:crypto';
import { relayAuthMessage } from '../../../cloud/customRoute/bsapi/relay.js';

export const RELAY_PORT = 8796;

const ED_SPKI = Buffer.from('302a300506032b6570032100', 'hex');

export const relay = {
  // 'ok' | 'unknown' (no phone registered for `to`) | 'ratelimited'
  mode: 'ok',
  delivery: 'pushed',
  requests: new Map(), // reqId (b64u) -> { env, to, exp, from, response }
  last: null,
  // Called with each accepted request before the relay answers.
  onRequest: null,
  respond(reqId, env) {
    this.requests.get(reqId).response = env;
  },
  // The relay deleted the request (its exp passed).
  expire(reqId) {
    this.requests.get(reqId).exp = 0;
  },
};

function authed(req, raw) {
  const pub = Buffer.from(req.headers['x-bs-pub'] || '', 'base64url');
  const sig = Buffer.from(req.headers['x-bs-sig'] || '', 'base64url');
  const ts = req.headers['x-bs-ts'] || '';
  if (pub.length !== 32 || sig.length !== 64 || Math.abs(Date.now() / 1000 - Number(ts)) > 60) {
    return null;
  }
  const path = new URL(req.url, 'http://x').pathname;
  const msg = relayAuthMessage(`localhost:${RELAY_PORT}`, req.method, path, ts, raw);
  const key = crypto.createPublicKey({
    key: Buffer.concat([ED_SPKI, pub]),
    format: 'der',
    type: 'spki',
  });
  return crypto.verify(null, msg, key, sig) ? pub.toString('base64url') : null;
}

let server;

export function startRelay() {
  server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', async () => {
      const raw = Buffer.concat(chunks);
      const send = (status, obj) => {
        res.writeHead(status, { 'content-type': 'application/json' });
        res.end(obj ? JSON.stringify(obj) : '');
      };
      const from = authed(req, raw);
      if (!from) return send(401, { error: 'auth' });
      const url = new URL(req.url, 'http://x');
      if (req.method === 'POST' && url.pathname === '/v1/req') {
        const body = JSON.parse(raw.toString());
        if (relay.mode === 'unknown') return send(404, { error: 'unknown-recipient' });
        if (relay.mode === 'ratelimited') return send(429, { error: 'rate-limited' });
        const rec = { ...body, from, response: null };
        relay.requests.set(body.reqId, rec);
        relay.last = rec;
        if (relay.onRequest) await relay.onRequest(rec);
        return send(202, { recipientPub: 'x', delivery: relay.delivery });
      }
      const m = /^\/v1\/resp\/([A-Za-z0-9_-]+)$/.exec(url.pathname);
      if (req.method === 'GET' && m) {
        const rec = relay.requests.get(m[1]);
        if (!rec || rec.exp < Date.now() / 1000) return send(410, { error: 'expired' });
        if (rec.from !== from) return send(403, { error: 'wrong-key' });
        if (rec.response) return send(200, { env: rec.response });
        const known = url.searchParams.get('delivery');
        if (known && known !== relay.delivery) return send(202, { delivery: relay.delivery });
        return send(204);
      }
      return send(404, { error: 'not-found' });
    });
  });
  return new Promise(resolve => server.listen(RELAY_PORT, resolve));
}

export function stopRelay() {
  return new Promise(resolve => (server ? server.close(resolve) : resolve()));
}
