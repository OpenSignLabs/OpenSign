// Unit tests for the bs-login v1 statement parser (cloud/customRoute/bsapi/statement.js).
// No database: run with `npx jasmine --config=spec/support/bsapi.json`.
/* eslint-env es2020 */
import crypto from 'node:crypto';
import {
  decodeCbor,
  parseStatement,
  statementDigest,
  STATEMENT_DOMAIN,
  DOCSIGN_DOMAIN,
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

  it('digests with the bs-login domain prefix', () => {
    const bytes = enc(statement());
    const expected = crypto
      .createHash('sha256')
      .update(Buffer.concat([Buffer.from(STATEMENT_DOMAIN), bytes]))
      .digest('hex');
    expect(statementDigest(bytes).toString('hex')).toBe(expected);
    expect(STATEMENT_DOMAIN).toBe('bs-login/v1/statement\n');
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
    const bytes = enc(docsign());
    expect(statementDigest(bytes, 'bs-docsign').equals(statementDigest(bytes))).toBe(false);
    expect(DOCSIGN_DOMAIN).toBe('bs-docsign/v1/statement\n');
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
