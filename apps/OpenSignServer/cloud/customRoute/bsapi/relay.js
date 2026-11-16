// The BetterSign relay (BetterSignApps server/bs-fill-relay,
// https://relay.bettersign.ing): how docsign reaches a signer's BetterSign
// phone app for "Sign on phone". The relay is the app's built-in connection:
//
//   - a request is addressed to the identity, to = sha256(VLAD bytes);
//   - if the app is open (it long-polls /v1/inbox), the request is handed to
//     it at once and the push is held;
//   - otherwise the relay wakes the phone with a content-free FCM push and
//     the app drains its inbox.
//
// The relay is untrusted: it only sees signed, opaque envelopes. Contract:
// BetterSignApps client/browserExtension/docs/PROTOCOL.md §1 and §5.3, and
// DELIVERY.md. The docsign request and response are in
// docs/BetterSignPhoneSign.md (repo root).
//
// Env:
//   BS_RELAY_URL          default https://relay.bettersign.ing
//   BS_RELAY_SIGNING_KEY  docsign's relay key, an Ed25519 seed (64 hex). Unset:
//                         one generated once and stored (apiConfig.js)

import crypto from 'node:crypto';
import axios from 'axios';
import { storedConfigValue } from './apiConfig.js';
import { decodeCbor } from './statement.js';

export const REQUEST_CT = 'application/vnd.bettersign.docsign-sign-request+cbor';
export const RESPONSE_CT = 'application/vnd.bettersign.docsign-sign-response+cbor';
export const REQUEST_ENV_DOMAIN = 'bs-docsign/v1/env\n';
export const RESPONSE_ENV_DOMAIN = 'bs-fill/v1/env\n';
export const RELAY_AUTH_DOMAIN = 'bs-fill/v1.1/relay\n';
// HPKE info = "bettersign-fill/v1/" ‖ ct, as for every relay envelope (§1.2).
export const HPKE_INFO_PREFIX = 'bettersign-fill/v1/';
const CLOCK_SKEW_S = 60;
const SEED_HEX_RE = /^[0-9a-f]{64}$/;

export const sha256 = (...parts) => {
  const h = crypto.createHash('sha256');
  for (const p of parts) h.update(p);
  return h.digest();
};

// --- canonical CBOR (RFC 8949 §4.2.1) --------------------------------------
// Only what the envelopes use: unsigned ints, byte and text strings, and maps
// with text keys. decodeCbor (statement.js) reads the same subset strictly.

function head(major, n) {
  if (n < 24) return Buffer.from([(major << 5) | n]);
  if (n < 0x100) return Buffer.from([(major << 5) | 24, n]);
  if (n < 0x10000) return Buffer.from([(major << 5) | 25, n >> 8, n & 0xff]);
  if (n < 0x100000000) {
    const b = Buffer.alloc(5);
    b[0] = (major << 5) | 26;
    b.writeUInt32BE(n, 1);
    return b;
  }
  const b = Buffer.alloc(9);
  b[0] = (major << 5) | 27;
  b.writeBigUInt64BE(BigInt(n), 1);
  return b;
}

export function encodeCbor(v) {
  if (typeof v === 'number') {
    if (!Number.isSafeInteger(v) || v < 0) throw new Error('cbor: only unsigned integers');
    return head(0, v);
  }
  if (typeof v === 'string') {
    const s = Buffer.from(v.normalize('NFC'), 'utf8');
    return Buffer.concat([head(3, s.length), s]);
  }
  if (v instanceof Uint8Array) return Buffer.concat([head(2, v.length), v]);
  const entries = v instanceof Map ? [...v.entries()] : Object.entries(v || {});
  const encoded = entries
    .filter(([, val]) => val !== undefined)
    .map(([k, val]) => [encodeCbor(String(k)), encodeCbor(val)]);
  encoded.sort((a, b) => Buffer.compare(a[0], b[0]));
  return Buffer.concat([head(5, encoded.length), ...encoded.flat()]);
}

// --- raw keys --------------------------------------------------------------

const ED_PKCS8 = Buffer.from('302e020100300506032b657004220420', 'hex');
const ED_SPKI = Buffer.from('302a300506032b6570032100', 'hex');
const X_PKCS8 = Buffer.from('302e020100300506032b656e04220420', 'hex');
const X_SPKI = Buffer.from('302a300506032b656e032100', 'hex');

const der = (prefix, raw, type) =>
  (type === 'private' ? crypto.createPrivateKey : crypto.createPublicKey)({
    key: Buffer.concat([prefix, raw]),
    format: 'der',
    type: type === 'private' ? 'pkcs8' : 'spki',
  });
const rawPublic = key => Buffer.from(key.export({ format: 'jwk' }).x, 'base64url');

export function ed25519FromSeed(seed) {
  const privateKey = der(ED_PKCS8, seed, 'private');
  return { privateKey, pub: rawPublic(crypto.createPublicKey(privateKey)) };
}
export const ed25519Sign = (privateKey, msg) => crypto.sign(null, msg, privateKey);
export function ed25519Verify(pub, msg, sig) {
  try {
    return crypto.verify(null, msg, der(ED_SPKI, pub, 'public'), sig);
  } catch {
    return false;
  }
}

export function newX25519() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('x25519');
  return {
    secret: Buffer.from(privateKey.export({ format: 'jwk' }).d, 'base64url'),
    pub: rawPublic(publicKey),
  };
}
const x25519Public = secret => rawPublic(crypto.createPublicKey(der(X_PKCS8, secret, 'private')));
const x25519 = (secret, pub) =>
  crypto.diffieHellman({
    privateKey: der(X_PKCS8, secret, 'private'),
    publicKey: der(X_SPKI, pub, 'public'),
  });

// --- HPKE (RFC 9180) base mode -----------------------------------------------
// DHKEM(X25519, HKDF-SHA256) / HKDF-SHA256 / AES-256-GCM, single message
// (sequence number 0), as PROTOCOL.md §1.2.

const KEM_ID = Buffer.from([0x00, 0x20]);
const KEM_SUITE = Buffer.concat([Buffer.from('KEM'), KEM_ID]);
const HPKE_SUITE = Buffer.concat([Buffer.from('HPKE'), KEM_ID, Buffer.from([0, 1, 0, 2])]);
const HPKE_V1 = Buffer.from('HPKE-v1');

const hmac = (key, data) => crypto.createHmac('sha256', key).update(data).digest();
const extract = (suite, salt, label, ikm) =>
  hmac(
    salt.length ? salt : Buffer.alloc(32),
    Buffer.concat([HPKE_V1, suite, Buffer.from(label), ikm])
  );
function expand(suite, prk, label, info, len) {
  const labeled = Buffer.concat([
    Buffer.from([len >> 8, len & 0xff]),
    HPKE_V1,
    suite,
    Buffer.from(label),
    info,
  ]);
  let t = Buffer.alloc(0);
  let out = Buffer.alloc(0);
  for (let i = 1; out.length < len; i++) {
    t = hmac(prk, Buffer.concat([t, labeled, Buffer.from([i])]));
    out = Buffer.concat([out, t]);
  }
  return out.subarray(0, len);
}

function keySchedule(dh, enc, pkR, info) {
  const empty = Buffer.alloc(0);
  const eaePrk = extract(KEM_SUITE, empty, 'eae_prk', dh);
  const shared = expand(KEM_SUITE, eaePrk, 'shared_secret', Buffer.concat([enc, pkR]), 32);
  const context = Buffer.concat([
    Buffer.from([0x00]),
    extract(HPKE_SUITE, empty, 'psk_id_hash', empty),
    extract(HPKE_SUITE, empty, 'info_hash', info),
  ]);
  const secret = extract(HPKE_SUITE, shared, 'secret', empty);
  return {
    key: expand(HPKE_SUITE, secret, 'key', context, 32),
    nonce: expand(HPKE_SUITE, secret, 'base_nonce', context, 12),
  };
}

// The encapsulated key goes in the envelope header, which is the AAD, so a
// sender has to pick it before sealing: hpkeSealer returns it first. docsign
// only opens; the phone seals (and the tests, standing in for it).
export function hpkeSealer(recipientPub, info) {
  const eph = newX25519();
  const { key, nonce } = keySchedule(x25519(eph.secret, recipientPub), eph.pub, recipientPub, info);
  return {
    enc: eph.pub,
    seal(aad, plaintext) {
      const c = crypto.createCipheriv('aes-256-gcm', key, nonce);
      c.setAAD(aad);
      return Buffer.concat([c.update(plaintext), c.final(), c.getAuthTag()]);
    },
  };
}

export function hpkeOpen(recipientSecret, enc, info, aad, ct) {
  if (ct.length < 16) throw new Error('hpke: ciphertext too short');
  const pkR = x25519Public(recipientSecret);
  const { key, nonce } = keySchedule(x25519(recipientSecret, enc), enc, pkR, info);
  const d = crypto.createDecipheriv('aes-256-gcm', key, nonce);
  d.setAAD(aad);
  d.setAuthTag(ct.subarray(ct.length - 16));
  return Buffer.concat([d.update(ct.subarray(0, ct.length - 16)), d.final()]);
}

// --- envelopes -----------------------------------------------------------------

const bytes = (v, len, what) => {
  if (!(v instanceof Uint8Array) || (len && v.length !== len))
    throw new Error(`envelope: bad ${what}`);
  return Buffer.from(v);
};

// docsign → app. Not sealed: docsign doesn't know the identity's /keys/encrypt,
// so the body holds nothing the relay shouldn't see for its 3 minutes (see
// docs/BetterSignPhoneSign.md). Signed by docsign's relay key.
//   { header: { v, ct, to, from, reqId, iat, exp }, body: CBOR(request), sig }
//   sig = Ed25519("bs-docsign/v1/env\n" ‖ CBOR(header) ‖ sha256(body))
export function buildRequestEnvelope({ key, to, reqId, iat, exp, request }) {
  const header = { v: 1, ct: REQUEST_CT, to, from: key.pub, reqId, iat, exp };
  const headerCbor = encodeCbor(header);
  const body = encodeCbor(request);
  const sig = ed25519Sign(
    key.privateKey,
    Buffer.concat([Buffer.from(REQUEST_ENV_DOMAIN), headerCbor, sha256(body)])
  );
  return encodeCbor({ header, body, sig });
}

// app → docsign: an ordinary relay envelope (PROTOCOL.md §1.5), sealed to the
// request's one-time key. Checks the signature by header.from, the content
// type, the reqId and routing, and the time window, then opens it. `from` is
// the identity's id.sign, which docsign doesn't know; it is the relay that
// only lets the key bound to the identity answer, and what counts is the VLAD
// signature inside (checked by the caller through the verifier).
export function openEnvelope(
  envBytes,
  { ct, recipientSecret, reqId, now = Math.floor(Date.now() / 1000) }
) {
  const env = decodeCbor(envBytes);
  if (!(env instanceof Map) || env.size !== 3) throw new Error('envelope: not an envelope');
  const header = env.get('header');
  if (!(header instanceof Map)) throw new Error('envelope: bad header');
  const ciphertext = bytes(env.get('ciphertext'), 0, 'ciphertext');
  const sig = bytes(env.get('sig'), 64, 'sig');
  const from = bytes(header.get('from'), 32, 'from');
  // decodeCbor only accepts canonical CBOR, so re-encoding gives back the
  // header's exact bytes.
  const headerCbor = encodeCbor(header);
  const signed = Buffer.concat([Buffer.from(RESPONSE_ENV_DOMAIN), headerCbor, sha256(ciphertext)]);
  if (!ed25519Verify(from, signed, sig)) throw new Error('envelope: signature');
  if (header.get('v') !== 1) throw new Error('envelope: version');
  if (header.get('ct') !== ct) throw new Error('envelope: content type');
  const id = bytes(header.get('reqId'), 16, 'reqId');
  if (reqId && !id.equals(reqId)) throw new Error('envelope: reqId');
  if (!bytes(header.get('to'), 32, 'to').equals(sha256(id))) throw new Error('envelope: to');
  const iat = header.get('iat');
  const exp = header.get('exp');
  if (typeof iat !== 'number' || typeof exp !== 'number') throw new Error('envelope: times');
  if (iat > now + CLOCK_SKEW_S || exp < now) throw new Error('envelope: time');
  const enc = bytes(header.get('enc'), 32, 'enc');
  let plaintext;
  try {
    plaintext = hpkeOpen(
      recipientSecret,
      enc,
      Buffer.from(HPKE_INFO_PREFIX + ct),
      headerCbor,
      ciphertext
    );
  } catch {
    throw new Error('envelope: open');
  }
  return { header, from, plaintext };
}

// --- relay client --------------------------------------------------------------

export function relayUrl() {
  return (process.env.BS_RELAY_URL || 'https://relay.bettersign.ing').replace(/\/$/, '');
}

export function relayAuthMessage(host, method, path, ts, body) {
  return Buffer.concat([
    Buffer.from(`${RELAY_AUTH_DOMAIN}${host}\n${method}\n${path}\n${ts}\n`),
    sha256(body),
  ]);
}

let keyPending = null;
let keyCache = null;

// docsign's relay key: BS_RELAY_SIGNING_KEY, else one generated once and kept
// in bs_ApiConfig so every machine signs with the same key (the phone checks
// it against GET /api/v1/relay-key). Throws if the env value is malformed.
export async function relayKey() {
  const env = (process.env.BS_RELAY_SIGNING_KEY || '').trim().toLowerCase();
  if (env) {
    if (!SEED_HEX_RE.test(env)) throw new Error('BS_RELAY_SIGNING_KEY must be 64 hex characters');
    if (keyCache?.seedHex !== env)
      keyCache = { seedHex: env, ...ed25519FromSeed(Buffer.from(env, 'hex')) };
    return keyCache;
  }
  if (keyCache) return keyCache;
  keyPending ??= storedConfigValue('relaySigningKey', () => crypto.randomBytes(32).toString('hex'))
    .then(seedHex => (keyCache = { seedHex, ...ed25519FromSeed(Buffer.from(seedHex, 'hex')) }))
    .finally(() => (keyPending = null));
  return keyPending;
}

// One signed call. `path` is relative to the relay URL ("/v1/req"); the
// signed PATH includes any base path and never the query string.
export async function relayCall(key, method, path, { body, query, timeout = 15000 } = {}) {
  const base = new URL(relayUrl());
  const fullPath = base.pathname.replace(/\/$/, '') + path;
  const raw = body === undefined ? Buffer.alloc(0) : Buffer.from(JSON.stringify(body));
  const ts = String(Math.floor(Date.now() / 1000));
  const sig = ed25519Sign(key.privateKey, relayAuthMessage(base.host, method, fullPath, ts, raw));
  const res = await axios({
    method,
    url: base.origin + fullPath + (query ? '?' + new URLSearchParams(query) : ''),
    data: raw.length ? raw : undefined,
    headers: {
      'content-type': 'application/json',
      'x-bs-pub': key.pub.toString('base64url'),
      'x-bs-ts': ts,
      'x-bs-sig': sig.toString('base64url'),
    },
    timeout,
    validateStatus: () => true,
    transformResponse: r => {
      try {
        return r ? JSON.parse(r) : {};
      } catch {
        return {};
      }
    },
  });
  return { status: res.status, body: res.data || {} };
}
