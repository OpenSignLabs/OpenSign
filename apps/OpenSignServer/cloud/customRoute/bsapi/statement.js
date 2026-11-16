// The BetterSign sign-in statement (bs-login v1), as oauthService and
// apiDelegateService check it (BetterSignApps
// docs/Technical/extension-login-design.md §6.3,
// client/browserExtension/docs/PROTOCOL.md §1.3).
//
// A canonical-CBOR map of exactly nine keys:
//   { v: 1, type: "bs-login", vlad: <bytes>, origin: <text>, rp: <text>,
//     challenge: <32B>, reqId: <16B>, extSignPub: <32B>, iat: <uint> }
// The identity signs it with its current /keys/primary inside bs-message's
// canonical form (buildSignedMessage below), and the verifier's /verify
// checks that.
//
// For the desktop app, extSignPub is the app install's own public key (audit
// only: it names which client asked).
//
// Uploading a desktop-signed PDF uses a second statement, bs-docsign v1, with
// its own type and content_type so neither can stand in for the other:
//   { v: 1, type: "bs-docsign", vlad: <bytes>, origin: <text>, rp: <text>,
//     docId: <text>, base: <32B>, file: <32B>, reqId: <16B>, iat: <uint> }
// base = SHA-256 of the file the app downloaded, file = SHA-256 of the file it
// uploads.
//
// "Sign on phone" in the web app (parsefunction/bsPhoneSign.js) uses a third,
// bs-docsign-field v1, approving one field:
//   { v: 1, type: "bs-docsign-field", vlad: <bytes>, origin: <text>, rp: <text>,
//     docId: <text>, fieldId: <text>, challenge: <32B>, reqId: <16B>, iat: <uint> }

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
  },
  'bs-docsign-field': {
    fields: {
      v: 'number',
      type: 'string',
      vlad: 'bytes',
      origin: 'string',
      rp: 'string',
      docId: 'string',
      fieldId: 'string',
      challenge: 'bytes',
      reqId: 'bytes',
      iat: 'number',
    },
    lengths: { vlad: 0, challenge: 32, reqId: 16 },
  },
};

// Decode and shape-check a statement of the given type (bs-login,
// bs-docsign or bs-docsign-field). Throws on anything else; the caller still checks the values.
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

// What the identity's /keys/primary actually signs: the statement wrapped in
// bs-message's canonical to-be-signed form (BetterSignApps
// crates/bs-message/src/message.rs build_tbs), the same bytes bs-auth signs.
// Every VLAD sign-in signs this form, not just this API:
//
//   TBS = "bettersign-message-v2" ‖ sender_vlad ‖ Varbytes(sender_key_path)
//         ‖ receiver_vlad ‖ Varbytes(content_type) ‖ Varbytes(body)
//
// Varbytes = unsigned LEB128 length, then the bytes. A VLAD is its wire
// encoding (self-delimiting; the same bytes as the `vlad` hex). Here:
//   sender_vlad     the signing identity (= the statement's vlad)
//   sender_key_path "/keys/primary"
//   receiver_vlad   this server's VLAD (BS_API_RECEIVER_VLAD)
//   content_type    MESSAGE_CONTENT_TYPES[statement type]
//   body            the bs-login / bs-docsign statement CBOR, unchanged
// The signature is a Multisig over the TBS bytes themselves, no extra hash.
export const MESSAGE_DOMAIN = 'bettersign-message-v2';
export const SENDER_KEY_PATH = '/keys/primary';
export const MESSAGE_CONTENT_TYPES = {
  'bs-login': 'application/vnd.bettersign.login+cbor',
  'bs-docsign': 'application/vnd.bettersign.docsign+cbor',
  'bs-docsign-field': 'application/vnd.bettersign.docsign-field+cbor',
};

export function varint(n) {
  const out = [];
  do {
    let b = n % 128;
    n = Math.floor(n / 128);
    if (n > 0) b |= 0x80;
    out.push(b);
  } while (n > 0);
  return Buffer.from(out);
}

const varbytes = b => Buffer.concat([varint(b.length), b]);

// Build the TBS. VLADs are Buffers of their wire bytes.
export function buildSignedMessage({ senderVlad, receiverVlad, type, body }) {
  return Buffer.concat([
    Buffer.from(MESSAGE_DOMAIN, 'utf8'),
    senderVlad,
    varbytes(Buffer.from(SENDER_KEY_PATH, 'utf8')),
    receiverVlad,
    varbytes(Buffer.from(MESSAGE_CONTENT_TYPES[type], 'utf8')),
    varbytes(body),
  ]);
}

// Check that `bytes` is exactly a canonical TBS from senderVlad to
// receiverVlad carrying a statement of `type`, and return the statement
// (body) bytes. Throws, naming the first part that's wrong. The statement
// itself is still to be parsed and checked by the caller.
export function inspectSignedMessage(bytes, { senderVlad, receiverVlad, type }) {
  const buf = Buffer.from(bytes);
  let i = 0;
  const fail = part => new Error(`signed message is not canonical: ${part}`);
  const fixed = (expected, part) => {
    if (!buf.subarray(i, i + expected.length).equals(expected)) throw fail(part);
    i += expected.length;
  };
  // Minimal-length LEB128, as the unsigned-varint crate requires.
  const length = part => {
    let n = 0;
    for (let k = 0; k < 9; k++) {
      if (i >= buf.length) throw fail(part);
      const b = buf[i++];
      n += (b & 0x7f) * 2 ** (7 * k);
      if (!(b & 0x80)) {
        if (k > 0 && b === 0) throw fail(part);
        if (n > buf.length - i) throw fail(part);
        return n;
      }
    }
    throw fail(part);
  };
  const field = part => {
    const n = length(part);
    const v = buf.subarray(i, i + n);
    i += n;
    return v;
  };
  const text = (expected, part) => {
    if (!field(part).equals(Buffer.from(expected, 'utf8'))) throw fail(part);
  };

  fixed(Buffer.from(MESSAGE_DOMAIN, 'utf8'), 'domain separator');
  fixed(senderVlad, 'sender_vlad');
  text(SENDER_KEY_PATH, 'sender_key_path');
  fixed(receiverVlad, 'receiver_vlad');
  text(MESSAGE_CONTENT_TYPES[type], 'content_type');
  const body = field('body');
  if (i !== buf.length) throw fail('trailing bytes');
  return Buffer.from(body);
}

// The two ways a client may send what it signed: the full TBS (`message`,
// inspected as above) or just the statement (`statement`, wrapped here).
// Either way the verifier gets canonical TBS bytes. Returns
// { statementBytes, message }; throws on a malformed or mismatched message.
export function signedMessageFrom({ message, statement }, { senderVlad, receiverVlad, type }) {
  if (message) {
    const body = inspectSignedMessage(Buffer.from(message, 'base64url'), {
      senderVlad,
      receiverVlad,
      type,
    });
    if (statement && !Buffer.from(statement, 'base64url').equals(body)) {
      throw new Error('statement is not the signed message body');
    }
    return { statementBytes: body, message: Buffer.from(message, 'base64url') };
  }
  const statementBytes = Buffer.from(statement, 'base64url');
  return {
    statementBytes,
    message: buildSignedMessage({ senderVlad, receiverVlad, type, body: statementBytes }),
  };
}
