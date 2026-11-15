// The BetterSign sign-in statement (bs-login v1), as oauthService and
// apiDelegateService check it (BetterSignApps
// docs/Technical/extension-login-design.md §6.3,
// client/browserExtension/docs/PROTOCOL.md §1.3).
//
// A canonical-CBOR map of exactly nine keys:
//   { v: 1, type: "bs-login", vlad: <bytes>, origin: <text>, rp: <text>,
//     challenge: <32B>, reqId: <16B>, extSignPub: <32B>, iat: <uint> }
// The identity signs digest = SHA-256("bs-login/v1/statement\n" ‖ statement)
// with its current /keys/primary, and the verifier's /verify checks that.
//
// For the desktop app, extSignPub is the app install's own public key (audit
// only: it names which client asked).
//
// Uploading a desktop-signed PDF uses a second statement, bs-docsign v1, with
// its own domain so neither can stand in for the other:
//   { v: 1, type: "bs-docsign", vlad: <bytes>, origin: <text>, rp: <text>,
//     docId: <text>, base: <32B>, file: <32B>, reqId: <16B>, iat: <uint> }
// base = SHA-256 of the file the app downloaded, file = SHA-256 of the file it
// uploads. digest = SHA-256("bs-docsign/v1/statement\n" ‖ statement).

import crypto from 'node:crypto';

export const STATEMENT_DOMAIN = 'bs-login/v1/statement\n';
export const DOCSIGN_DOMAIN = 'bs-docsign/v1/statement\n';

const dec = new TextDecoder('utf-8', { fatal: true });

// Strict CBOR decoder for the statement, ported from apiDelegateService
// src/cbor.js: unsigned ints, byte strings, text strings and maps with text
// keys, all definite-length and shortest-form, keys in RFC 8949 §4.2.1 order.
// Anything else is rejected. The signature covers the raw bytes, so this only
// has to read them correctly.
export function decodeCbor(bytes) {
  let i = 0;
  const need = n => {
    if (i + n > bytes.length) throw new Error('cbor: truncated');
  };
  const head = () => {
    need(1);
    const b = bytes[i++];
    const major = b >> 5;
    const info = b & 0x1f;
    let n;
    if (info < 24) n = info;
    else if (info === 24) {
      need(1);
      n = bytes[i++];
      if (n < 24) throw new Error('cbor: non-shortest');
    } else if (info === 25) {
      need(2);
      n = (bytes[i] << 8) | bytes[i + 1];
      i += 2;
      if (n < 256) throw new Error('cbor: non-shortest');
    } else if (info === 26) {
      need(4);
      n = ((bytes[i] << 24) >>> 0) + (bytes[i + 1] << 16) + (bytes[i + 2] << 8) + bytes[i + 3];
      i += 4;
      if (n < 65536) throw new Error('cbor: non-shortest');
    } else if (info === 27) {
      need(8);
      let x = 0;
      for (let k = 0; k < 8; k++) x = x * 256 + bytes[i + k];
      i += 8;
      if (x < 2 ** 32 || !Number.isSafeInteger(x)) throw new Error('cbor: integer out of range');
      n = x;
    } else throw new Error('cbor: unsupported length');
    return { major, n };
  };
  const item = () => {
    const { major, n } = head();
    switch (major) {
      case 0:
        return n;
      case 2: {
        need(n);
        const v = bytes.slice(i, i + n);
        i += n;
        return v;
      }
      case 3: {
        need(n);
        const v = dec.decode(bytes.subarray(i, i + n));
        i += n;
        return v;
      }
      case 5: {
        const m = new Map();
        let prev = null;
        for (let k = 0; k < n; k++) {
          const start = i;
          const key = item();
          if (typeof key !== 'string') throw new Error('cbor: non-text key');
          const kb = bytes.subarray(start, i);
          if (prev && compare(prev, kb) >= 0) throw new Error('cbor: keys not in canonical order');
          prev = kb;
          m.set(key, item());
        }
        return m;
      }
      default:
        throw new Error('cbor: unsupported type');
    }
  };
  const v = item();
  if (i !== bytes.length) throw new Error('cbor: trailing bytes');
  return v;
}

function compare(a, b) {
  for (let k = 0; k < Math.min(a.length, b.length); k++) if (a[k] !== b[k]) return a[k] - b[k];
  return a.length - b.length;
}

// Field types, and byte lengths where fixed (0 = any non-empty length).
const KINDS = {
  'bs-login': {
    fields: {
      v: 'number',
      type: 'string',
      vlad: 'bytes',
      origin: 'string',
      rp: 'string',
      challenge: 'bytes',
      reqId: 'bytes',
      extSignPub: 'bytes',
      iat: 'number',
    },
    lengths: { vlad: 0, challenge: 32, reqId: 16, extSignPub: 32 },
    domain: STATEMENT_DOMAIN,
  },
  'bs-docsign': {
    fields: {
      v: 'number',
      type: 'string',
      vlad: 'bytes',
      origin: 'string',
      rp: 'string',
      docId: 'string',
      base: 'bytes',
      file: 'bytes',
      reqId: 'bytes',
      iat: 'number',
    },
    lengths: { vlad: 0, base: 32, file: 32, reqId: 16 },
    domain: DOCSIGN_DOMAIN,
  },
};

// Decode and shape-check a statement of the given type (bs-login or
// bs-docsign). Throws on anything else; the caller still checks the values.
export function parseStatement(bytes, type = 'bs-login') {
  const kind = KINDS[type];
  const notIt = () => new Error(`not a ${type} v1 statement`);
  const st = decodeCbor(bytes);
  if (!(st instanceof Map) || st.size !== Object.keys(kind.fields).length) throw notIt();
  const s = {};
  for (const [k, t] of Object.entries(kind.fields)) {
    const v = st.get(k);
    if (t === 'bytes' ? !(v instanceof Uint8Array) : typeof v !== t) {
      throw new Error(`malformed statement.${k}`);
    }
    s[k] = v;
  }
  if (s.v !== 1 || s.type !== type) throw notIt();
  for (const [k, len] of Object.entries(kind.lengths)) {
    if (len ? s[k].length !== len : s[k].length === 0) {
      throw new Error(`malformed statement.${k}`);
    }
  }
  return s;
}

// The bytes the identity's /keys/primary signs.
export function statementDigest(bytes, type = 'bs-login') {
  return crypto
    .createHash('sha256')
    .update(Buffer.from(KINDS[type].domain, 'utf8'))
    .update(bytes)
    .digest();
}
