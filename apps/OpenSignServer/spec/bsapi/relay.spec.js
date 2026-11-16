// Unit tests for the relay client (cloud/customRoute/bsapi/relay.js): CBOR,
// HPKE and envelopes against the BetterSign protocol's own test vectors, and
// a round trip standing in for the phone. No database or network.
/* eslint-env es2020 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import {
  buildRequestEnvelope,
  ed25519FromSeed,
  ed25519Verify,
  encodeCbor,
  hpkeSealer,
  HPKE_INFO_PREFIX,
  newX25519,
  openEnvelope,
  relayAuthMessage,
  REQUEST_CT,
  REQUEST_ENV_DOMAIN,
  RESPONSE_CT,
  RESPONSE_ENV_DOMAIN,
  sha256,
} from '../../cloud/customRoute/bsapi/relay.js';
import { decodeCbor, parseStatement } from '../../cloud/customRoute/bsapi/statement.js';

const vectors = JSON.parse(
  fs.readFileSync(new URL('./fixtures/relay-envelopes.json', import.meta.url))
).envelopes;
const hex = s => Buffer.from(s, 'hex');

// What the phone does: seal a response to the request's one-time key and sign
// the header with id.sign.
function phoneResponse({ idSign, ephPub, reqId, ct = RESPONSE_CT, iat, exp, plaintext }) {
  const sealer = hpkeSealer(ephPub, Buffer.from(HPKE_INFO_PREFIX + ct));
  const header = {
    v: 1,
    ct,
    to: sha256(reqId),
    from: idSign.pub,
    reqId,
    iat,
    exp,
    enc: sealer.enc,
  };
  const headerCbor = encodeCbor(header);
  const ciphertext = sealer.seal(headerCbor, plaintext);
  const sig = crypto.sign(
    null,
    Buffer.concat([Buffer.from(RESPONSE_ENV_DOMAIN), headerCbor, sha256(ciphertext)]),
    idSign.privateKey
  );
  return encodeCbor({ header, ciphertext, sig });
}

describe('relay envelopes: protocol test vectors', () => {
  for (const v of vectors.filter(x => x.expect === 'ok')) {
    it(`opens ${v.name}`, () => {
      const env = hex(v.envelope);
      const reqId = Buffer.from(decodeCbor(env).get('header').get('reqId'));
      const { plaintext, from } = openEnvelope(env, {
        ct: v.ct,
        recipientSecret: hex(v.recipientSecret),
        reqId,
        now: v.now,
      });
      expect(plaintext.toString('hex')).toBe(v.plaintext);
      expect(from.toString('hex')).toBe(v.senderPub);
    });
  }

  it('refuses a re-signed envelope whose ciphertext was changed', () => {
    const v = vectors.find(x => x.name === 'ciphertextFlippedResigned');
    expect(() =>
      openEnvelope(hex(v.envelope), {
        ct: v.ct,
        recipientSecret: hex(v.recipientSecret),
        now: v.now,
      })
    ).toThrowError(/open|to/);
  });

  it('refuses an expired envelope', () => {
    const v = vectors.find(x => x.name === 'expired');
    expect(() =>
      openEnvelope(hex(v.envelope), {
        ct: v.ct,
        recipientSecret: hex(v.recipientSecret),
        now: v.now,
      })
    ).toThrowError(/time|to/);
  });

  it('refuses a vector under the wrong content type', () => {
    const v = vectors.find(x => x.name === 'loginResponseOk');
    expect(() =>
      openEnvelope(hex(v.envelope), {
        ct: RESPONSE_CT,
        recipientSecret: hex(v.recipientSecret),
        now: v.now,
      })
    ).toThrowError(/content type/);
  });
});

describe('relay envelopes: docsign round trip', () => {
  const now = Math.floor(Date.now() / 1000);
  const idSign = ed25519FromSeed(crypto.randomBytes(32));
  const reqId = crypto.randomBytes(16);
  const eph = newX25519();
  const plaintext = encodeCbor({ v: 1, reqId, result: 'denied' });
  const ok = () =>
    phoneResponse({ idSign, ephPub: eph.pub, reqId, iat: now, exp: now + 60, plaintext });

  it('opens what the phone sealed to the one-time key', () => {
    const out = openEnvelope(ok(), { ct: RESPONSE_CT, recipientSecret: eph.secret, reqId, now });
    expect(out.plaintext.equals(plaintext)).toBeTrue();
    expect(out.from.equals(idSign.pub)).toBeTrue();
  });

  it('refuses an answer to another request', () => {
    expect(() =>
      openEnvelope(ok(), {
        ct: RESPONSE_CT,
        recipientSecret: eph.secret,
        reqId: crypto.randomBytes(16),
        now,
      })
    ).toThrowError(/reqId/);
  });

  it('refuses an answer sealed to another key', () => {
    expect(() =>
      openEnvelope(ok(), { ct: RESPONSE_CT, recipientSecret: newX25519().secret, reqId, now })
    ).toThrowError(/open/);
  });

  it('refuses a tampered signature', () => {
    const env = decodeCbor(ok());
    const sig = Buffer.from(env.get('sig'));
    sig[0] ^= 1;
    env.set('sig', sig);
    expect(() =>
      openEnvelope(encodeCbor(env), { ct: RESPONSE_CT, recipientSecret: eph.secret, reqId, now })
    ).toThrowError(/signature/);
  });

  it('builds a request envelope the phone can check', () => {
    const key = ed25519FromSeed(crypto.randomBytes(32));
    const to = sha256(Buffer.from('8724' + 'ab'.repeat(40), 'hex'));
    const request = {
      v: 1,
      reqId,
      origin: 'https://docsign.bettersign.ing',
      docId: 'abc123',
      fieldId: 'field-1',
      challenge: crypto.randomBytes(32),
      ephPub: eph.pub,
    };
    const env = decodeCbor(
      buildRequestEnvelope({ key, to, reqId, iat: now, exp: now + 180, request })
    );
    expect([...env.keys()].sort()).toEqual(['body', 'header', 'sig']);
    const header = env.get('header');
    expect(header.get('ct')).toBe(REQUEST_CT);
    expect(Buffer.from(header.get('to')).equals(to)).toBeTrue();
    expect(Buffer.from(header.get('from')).equals(key.pub)).toBeTrue();
    const body = Buffer.from(env.get('body'));
    const signed = Buffer.concat([
      Buffer.from(REQUEST_ENV_DOMAIN),
      encodeCbor(header),
      sha256(body),
    ]);
    expect(ed25519Verify(key.pub, signed, Buffer.from(env.get('sig')))).toBeTrue();
    expect(decodeCbor(body).get('fieldId')).toBe('field-1');
  });
});

describe('relay auth message', () => {
  it('is the domain, host, method, path and ts, then the raw body digest', () => {
    const msg = relayAuthMessage(
      'relay.bettersign.ing',
      'POST',
      '/v1/req',
      '1760000000',
      Buffer.from('{}')
    );
    const headText = 'bs-fill/v1.1/relay\nrelay.bettersign.ing\nPOST\n/v1/req\n1760000000\n';
    expect(msg.subarray(0, headText.length).toString()).toBe(headText);
    expect(msg.subarray(headText.length).equals(sha256(Buffer.from('{}')))).toBeTrue();
  });
});

describe('ed25519 keys from a seed', () => {
  it('match the protocol vectors', () => {
    // keys.idSign in the protocol test vectors.
    const k = ed25519FromSeed(
      hex('89b5a4246e017fa9dc7587261dc7f450b1344b4f964bcacb3c06c83f78593ce9')
    );
    expect(k.pub.toString('hex')).toBe(
      '719cb8370745572239e268d2b406e23e61c738b5c1790f122bffaca371dac42c'
    );
  });
});

describe('bs-docsign-field statement', () => {
  const s = {
    v: 1,
    type: 'bs-docsign-field',
    vlad: Buffer.from('8724' + 'ab'.repeat(40), 'hex'),
    origin: 'https://docsign.bettersign.ing',
    rp: 'bs-opensign-api',
    docId: 'abc123',
    fieldId: 'field-1',
    challenge: crypto.randomBytes(32),
    reqId: crypto.randomBytes(16),
    iat: Math.floor(Date.now() / 1000),
  };

  it('parses', () => {
    const p = parseStatement(encodeCbor(s), 'bs-docsign-field');
    expect(p.fieldId).toBe('field-1');
  });

  it('is not a bs-login or bs-docsign statement', () => {
    expect(() => parseStatement(encodeCbor(s), 'bs-login')).toThrow();
    expect(() => parseStatement(encodeCbor(s), 'bs-docsign')).toThrow();
  });

  it('needs a 32-byte challenge', () => {
    expect(() =>
      parseStatement(encodeCbor({ ...s, challenge: crypto.randomBytes(16) }), 'bs-docsign-field')
    ).toThrowError(/challenge/);
  });
});
