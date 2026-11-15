// Unit tests for the bs-login v1 statement parser (cloud/customRoute/bsapi/statement.js).
// No database: run with `npx jasmine --config=spec/support/bsapi.json`.
/* eslint-env es2020 */
import crypto from 'node:crypto';
import {
  buildSignedMessage,
  decodeCbor,
  inspectSignedMessage,
  MESSAGE_CONTENT_TYPES,
  parseStatement,
  signedMessageFrom,
  varint,
} from '../../cloud/customRoute/bsapi/statement.js';

// Minimal canonical CBOR encoder for the test statements.
function head(major, n) {
  if (n < 24) return Buffer.from([(major << 5) | n]);
  if (n < 256) return Buffer.from([(major << 5) | 24, n]);
  if (n < 65536) return Buffer.from([(major << 5) | 25, n >> 8, n & 0xff]);
  if (n < 2 ** 32) {
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
function enc(v) {
  if (typeof v === 'number') return head(0, v);
  if (typeof v === 'string') {
    const s = Buffer.from(v, 'utf8');
    return Buffer.concat([head(3, s.length), s]);
  }
  if (Buffer.isBuffer(v)) return Buffer.concat([head(2, v.length), v]);
  // Object: keys sorted by encoded bytes (RFC 8949 §4.2.1).
  const entries = Object.entries(v).map(([k, val]) => [enc(k), enc(val)]);
  entries.sort((a, b) => Buffer.compare(a[0], b[0]));
  return Buffer.concat([head(5, entries.length), ...entries.flat()]);
}

function statement(overrides = {}) {
  return {
    v: 1,
    type: 'bs-login',
    vlad: Buffer.from('aa'.repeat(40), 'hex'),
    origin: 'https://docsign.bettersign.ing',
    rp: 'bs-opensign-api',
    challenge: crypto.randomBytes(32),
    reqId: crypto.randomBytes(16),
    extSignPub: crypto.randomBytes(32),
    iat: Math.floor(Date.now() / 1000),
    ...overrides,
  };
}

describe('bs-login statement', () => {
  it('parses a well-formed statement', () => {
    const s = statement();
    const parsed = parseStatement(enc(s));
    expect(parsed.v).toBe(1);
    expect(parsed.type).toBe('bs-login');
    expect(Buffer.from(parsed.vlad).equals(s.vlad)).toBe(true);
    expect(Buffer.from(parsed.challenge).equals(s.challenge)).toBe(true);
    expect(parsed.origin).toBe(s.origin);
    expect(parsed.rp).toBe(s.rp);
    expect(parsed.iat).toBe(s.iat);
  });

  it('accepts a 64-bit iat', () => {
    expect(parseStatement(enc(statement({ iat: 2 ** 33 }))).iat).toBe(2 ** 33);
  });

  it('rejects keys out of canonical order', () => {
    const entries = Object.entries(statement()).map(([k, v]) => [enc(k), enc(v)]);
    entries.sort((a, b) => Buffer.compare(b[0], a[0])); // descending
    const unsorted = Buffer.concat([head(5, entries.length), ...entries.flat()]);
    expect(() => decodeCbor(unsorted)).toThrowError(/canonical order/);
  });

  it('rejects an extra or a missing key', () => {
    expect(() => parseStatement(enc({ ...statement(), extra: 'x' }))).toThrowError(
      /not a bs-login v1 statement/
    );
    const { reqId, ...missing } = statement(); // eslint-disable-line no-unused-vars
    expect(() => parseStatement(enc(missing))).toThrowError(/not a bs-login v1 statement/);
  });

  it('rejects wrong types, versions and lengths', () => {
    expect(() => parseStatement(enc(statement({ v: 2 })))).toThrowError(/not a bs-login/);
    expect(() => parseStatement(enc(statement({ type: 'bs-sign' })))).toThrowError(
      /not a bs-login/
    );
    expect(() => parseStatement(enc(statement({ challenge: 'abc' })))).toThrowError(/challenge/);
    expect(() =>
      parseStatement(enc(statement({ challenge: crypto.randomBytes(16) })))
    ).toThrowError(/challenge/);
    expect(() => parseStatement(enc(statement({ reqId: crypto.randomBytes(8) })))).toThrowError(
      /reqId/
    );
    expect(() => parseStatement(enc(statement({ vlad: Buffer.alloc(0) })))).toThrowError(/vlad/);
  });

  it('rejects non-shortest integers and trailing bytes', () => {
    expect(() => decodeCbor(Buffer.from([0x18, 0x05]))).toThrowError(/non-shortest/);
    expect(() => decodeCbor(Buffer.concat([enc(statement()), Buffer.from([0])]))).toThrowError(
      /trailing/
    );
    expect(() => decodeCbor(Buffer.from([0x49, 1, 2]))).toThrowError(/truncated/); // 9-byte bstr, 2 given
  });
});

function docsign(overrides = {}) {
  return {
    v: 1,
    type: 'bs-docsign',
    vlad: Buffer.from('bb'.repeat(40), 'hex'),
    origin: 'https://docsign.bettersign.ing',
    rp: 'bs-opensign-api',
    docId: 'AbC123xyz',
    base: crypto.randomBytes(32),
    file: crypto.randomBytes(32),
    reqId: crypto.randomBytes(16),
    iat: Math.floor(Date.now() / 1000),
    ...overrides,
  };
}

describe('bs-docsign statement', () => {
  it('parses a well-formed statement', () => {
    const s = docsign();
    const parsed = parseStatement(enc(s), 'bs-docsign');
    expect(parsed.docId).toBe('AbC123xyz');
    expect(Buffer.from(parsed.file).equals(s.file)).toBe(true);
    expect(Buffer.from(parsed.base).equals(s.base)).toBe(true);
  });

  it('is not interchangeable with bs-login', () => {
    expect(() => parseStatement(enc(docsign()))).toThrowError(/not a bs-login/);
    expect(() => parseStatement(enc(statement()), 'bs-docsign')).toThrowError(/not a bs-docsign/);
  });

  it('rejects wrong hash lengths and a relabelled type', () => {
    expect(() =>
      parseStatement(enc(docsign({ file: crypto.randomBytes(20) })), 'bs-docsign')
    ).toThrowError(/file/);
    expect(() => parseStatement(enc(docsign({ base: 'x' })), 'bs-docsign')).toThrowError(/base/);
    expect(() => parseStatement(enc(docsign({ type: 'bs-login' })), 'bs-docsign')).toThrowError(
      /not a bs-docsign/
    );
  });
});

// bs-message's canonical to-be-signed form (BetterSignApps
// crates/bs-message/src/message.rs build_tbs), which is what gets signed.
describe('signed message (bs-message TBS)', () => {
  const sender = Buffer.from('8724' + 'aa'.repeat(38), 'hex');
  const receiver = Buffer.from('8724' + 'cc'.repeat(30), 'hex');
  const ctx = { senderVlad: sender, receiverVlad: receiver, type: 'bs-login' };

  it('encodes varints as minimal unsigned LEB128', () => {
    expect(varint(0).toString('hex')).toBe('00');
    expect(varint(127).toString('hex')).toBe('7f');
    expect(varint(128).toString('hex')).toBe('8001');
    expect(varint(300).toString('hex')).toBe('ac02');
    expect(varint(16384).toString('hex')).toBe('808001');
  });

  it('matches build_tbs byte for byte', () => {
    const body = enc(statement());
    // Written out by hand, not with the helpers under test.
    const ct = 'application/vnd.bettersign.login+cbor';
    const expected = Buffer.concat([
      Buffer.from('bettersign-message-v2'),
      sender,
      Buffer.from([13]),
      Buffer.from('/keys/primary'),
      receiver,
      Buffer.from([ct.length]),
      Buffer.from(ct),
      Buffer.from(
        body.length < 128 ? [body.length] : [(body.length & 0x7f) | 0x80, body.length >> 7]
      ),
      body,
    ]);
    expect(buildSignedMessage({ ...ctx, body }).equals(expected)).toBe(true);
    expect(MESSAGE_CONTENT_TYPES['bs-docsign']).toBe('application/vnd.bettersign.docsign+cbor');
  });

  // Shared with the desktop app (BetterSignApps PR #193), which pins the same
  // bytes: sender 0x01..0x28, receiver 0x8724 then 0x00..0x21, a fixed login
  // statement. Either side drifting breaks this.
  it('matches the cross-check vector shared with the desktop app', () => {
    const sender = Buffer.from(Array.from({ length: 40 }, (_, i) => i + 1));
    const receiver = Buffer.from(
      '8724' + Buffer.from(Array.from({ length: 34 }, (_, i) => i)).toString('hex'),
      'hex'
    );
    const body = enc({
      v: 1,
      type: 'bs-login',
      vlad: sender,
      origin: 'https://docsign.example',
      rp: 'bs-opensign-api',
      challenge: Buffer.alloc(32, 0xab),
      reqId: Buffer.alloc(16, 0x01),
      extSignPub: Buffer.alloc(32, 0x02),
      iat: 1800000000,
    });
    const bodyHex =
      'a96176016272706f62732d6f70656e7369676e2d617069636961741a6b49d2006474797065686273' +
      '2d6c6f67696e64766c616458280102030405060708090a0b0c0d0e0f101112131415161718191a1b' +
      '1c1d1e1f2021222324252627286572657149645001010101010101010101010101010101666f7269' +
      '67696e7768747470733a2f2f646f637369676e2e6578616d706c65696368616c6c656e67655820ab' +
      'ababababababababababababababababababababababababababababababab6a6578745369676e50' +
      '756258200202020202020202020202020202020202020202020202020202020202020202';
    const prefixHex =
      '6265747465727369676e2d6d6573736167652d76320102030405060708090a0b0c0d0e0f10111213' +
      '1415161718191a1b1c1d1e1f2021222324252627280d2f6b6579732f7072696d6172798724000102' +
      '030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f2021256170706c69636174' +
      '696f6e2f766e642e6265747465727369676e2e6c6f67696e2b63626f72ec01';
    expect(body.toString('hex')).toBe(bodyHex);
    const msg = buildSignedMessage({
      senderVlad: sender,
      receiverVlad: receiver,
      type: 'bs-login',
      body,
    });
    expect(msg.toString('hex')).toBe(prefixHex + bodyHex);
    expect(msg.length).toBe(387);
  });

  it('inspects a canonical message and returns its body', () => {
    const body = enc(statement());
    const msg = buildSignedMessage({ ...ctx, body });
    expect(inspectSignedMessage(msg, ctx).equals(body)).toBe(true);
  });

  it('rejects each part when it is not what this server expects', () => {
    const body = enc(statement());
    const msg = buildSignedMessage({ ...ctx, body });
    const replace = (from, to) => Buffer.from(msg.toString('hex').replace(from, to), 'hex');
    const cases = [
      [
        replace(
          Buffer.from('bettersign-message-v2').toString('hex'),
          Buffer.from('bettersign-message-v1').toString('hex')
        ),
        /domain separator/,
      ],
      [
        buildSignedMessage({
          ...ctx,
          senderVlad: Buffer.from('8724' + 'ab'.repeat(38), 'hex'),
          body,
        }),
        /sender_vlad/,
      ],
      [
        replace(
          Buffer.from('/keys/primary').toString('hex'),
          Buffer.from('/keys/secured').toString('hex')
        ),
        /sender_key_path/,
      ],
      [
        buildSignedMessage({
          ...ctx,
          receiverVlad: Buffer.from('8724' + 'dd'.repeat(30), 'hex'),
          body,
        }),
        /receiver_vlad/,
      ],
      [buildSignedMessage({ ...ctx, type: 'bs-docsign', body }), /content_type/],
      [Buffer.concat([msg, Buffer.from([0])]), /trailing bytes/],
      [msg.subarray(0, msg.length - 1), /body/],
      [Buffer.alloc(0), /domain separator/],
    ];
    for (const [bytes, err] of cases) {
      expect(() => inspectSignedMessage(bytes, ctx)).toThrowError(err);
    }
  });

  it('rejects a non-minimal length', () => {
    const body = Buffer.from([0xa0]); // empty CBOR map; content is irrelevant here
    const msg = buildSignedMessage({ ...ctx, body });
    // Re-encode the body length 1 as 0x81 0x00: same value, not minimal.
    const padded = Buffer.concat([
      msg.subarray(0, msg.length - 2),
      Buffer.from([0x81, 0x00]),
      body,
    ]);
    expect(() => inspectSignedMessage(padded, ctx)).toThrowError(/body/);
  });

  it('wraps a bare statement, or inspects a full message', () => {
    const body = enc(statement());
    const msg = buildSignedMessage({ ...ctx, body });
    const fromStatement = signedMessageFrom({ statement: body.toString('base64url') }, ctx);
    expect(fromStatement.message.equals(msg)).toBe(true);
    const fromMessage = signedMessageFrom({ message: msg.toString('base64url') }, ctx);
    expect(fromMessage.statementBytes.equals(body)).toBe(true);
    expect(() =>
      signedMessageFrom(
        { message: msg.toString('base64url'), statement: enc(statement()).toString('base64url') },
        ctx
      )
    ).toThrowError(/not the signed message body/);
  });
});
