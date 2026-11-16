// "Sign on phone" (cloud/parsefunction/bsPhoneSign.js): a BetterSign web
// session pushes a field to the signer's app through the relay (a stand-in,
// support/relay.js), and the spec plays the phone. Sign in with BetterSign
// itself goes through a stand-in bs-id (support/bsid.js).
import crypto from 'node:crypto';
import {
  API,
  MASTER,
  PARSE,
  PUBLIC,
  identity,
  link,
  mkContact,
  mkDoc,
  mkOwner,
  mkUser,
  req,
  sha,
  tag,
} from './support/lib.js';
import { verifier } from './support/verifier.js';
import { relay } from './support/relay.js';
import { bsidLoginParams } from './support/bsid.js';
import { recordBsIdSession } from '../../utils/bsWebSession.js';
import { storedConfigEntry } from '../../cloud/customRoute/bsapi/apiConfig.js';
import {
  ed25519FromSeed,
  ed25519Verify,
  encodeCbor,
  hpkeSealer,
  HPKE_INFO_PREFIX,
  REQUEST_ENV_DOMAIN,
  RESPONSE_CT,
  RESPONSE_ENV_DOMAIN,
} from '../../cloud/customRoute/bsapi/relay.js';
import { buildSignedMessage, decodeCbor } from '../../cloud/customRoute/bsapi/statement.js';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);
const nowSec = () => Math.floor(Date.now() / 1000);

async function session(userId) {
  const r = await req('POST', `${PARSE}/loginAs`, { headers: MASTER, body: { userId } });
  return r.json.sessionToken;
}

// A session that came from Sign in with BetterSign, for a linked identity.
async function bsSession(id, userId) {
  const token = await session(userId);
  await recordBsIdSession(token, id.vlad, userId);
  return token;
}

const call = (fn, token, params) =>
  req('POST', `${PARSE}/functions/${fn}`, {
    headers: { ...PUBLIC, 'X-Parse-Session-Token': token },
    body: params,
  });

const requestBody = rec => decodeCbor(decodeCbor(Buffer.from(rec.env, 'base64url')).get('body'));

const rowOf = requestId =>
  req('GET', `${PARSE}/classes/bs_PhoneSignRequest/${requestId}`, { headers: MASTER }).then(
    r => r.json
  );

const rowCount = async userId => {
  const where = JSON.stringify({
    UserId: { __type: 'Pointer', className: '_User', objectId: userId },
  });
  const r = await req(
    'GET',
    `${PARSE}/classes/bs_PhoneSignRequest?count=1&limit=0&where=${encodeURIComponent(where)}`,
    { headers: MASTER }
  );
  return r.json.count;
};

// The app's side: approve (or not) and seal the answer to the request's
// one-time key. `over` changes the statement, `answerOver` the answer.
function phoneAnswer(
  id,
  rec,
  { result = 'ok', over = {}, answerOver = {}, signer = id, image = PNG } = {}
) {
  const r = requestBody(rec);
  const statement = encodeCbor({
    v: 1,
    type: 'bs-docsign-field',
    vlad: Buffer.from(id.vlad, 'hex'),
    origin: r.get('origin'),
    rp: r.get('rp'),
    docId: r.get('docId'),
    fieldId: r.get('fieldId'),
    challenge: r.get('challenge'),
    reqId: r.get('reqId'),
    imageHash: sha(image),
    iat: nowSec(),
    ...over,
  });
  const message = buildSignedMessage({
    senderVlad: Buffer.from(id.vlad, 'hex'),
    receiverVlad: Buffer.from(r.get('receiverVlad')),
    type: 'bs-docsign-field',
    body: statement,
  });
  const answer =
    result === 'ok'
      ? {
          v: 1,
          reqId: r.get('reqId'),
          result,
          statement,
          vladSig: crypto.sign(null, message, signer.privateKey),
          image,
          ...answerOver,
        }
      : { v: 1, reqId: r.get('reqId'), result, reason: 'user', ...answerOver };

  const idSign = ed25519FromSeed(crypto.randomBytes(32));
  const reqId = Buffer.from(r.get('reqId'));
  const now = nowSec();
  const sealer = hpkeSealer(
    Buffer.from(r.get('ephPub')),
    Buffer.from(HPKE_INFO_PREFIX + RESPONSE_CT)
  );
  const header = {
    v: 1,
    ct: RESPONSE_CT,
    to: sha(reqId),
    from: idSign.pub,
    reqId,
    iat: now,
    exp: now + 60,
    enc: sealer.enc,
  };
  const headerCbor = encodeCbor(header);
  const ciphertext = sealer.seal(headerCbor, encodeCbor(answer));
  const sig = crypto.sign(
    null,
    Buffer.concat([Buffer.from(RESPONSE_ENV_DOMAIN), headerCbor, sha(ciphertext)]),
    idSign.privateKey
  );
  relay.respond(rec.reqId, encodeCbor({ header, ciphertext, sig }).toString('base64url'));
}

describe('sign on phone', () => {
  let owner;
  let bob;
  let bobId;
  let bobC;
  let token;
  let docId;

  beforeAll(async () => {
    owner = await mkOwner(`owner-${tag()}@example.com`);
    bob = identity();
    verifier.register(bob);
    bobId = await mkUser(`bob-${tag()}@example.com`);
    await link(bob, bobId);
    bobC = await mkContact(owner.userId, 'Bob', `bob-${tag()}@example.com`, bobId);
    docId = await mkDoc(owner, [bobC]);
    token = await bsSession(bob, bobId);
  });

  beforeEach(() => {
    verifier.mode = 'ok';
    relay.mode = 'ok';
    relay.delivery = 'pushed';
    relay.onRequest = null;
  });

  // Widget keys in the web app are numbers.
  const start = (params = {}) =>
    call('bsphonesignstart', token, { docId, fieldId: 12345678, kind: 'signature', ...params });
  const poll = (requestId, delivery) => call('bsphonesignpoll', token, { requestId, delivery });

  it('pushes the field to the phone and returns the approved image', async () => {
    const s = await start();
    expect(s.status).toBe(200);
    expect(s.json.result.delivery).toBe('pushed');
    const rec = relay.last;

    // Addressed to the identity, signed by the key docsign publishes.
    expect(Buffer.from(rec.to, 'base64url').equals(sha(Buffer.from(bob.vlad, 'hex')))).toBeTrue();
    const published = (await req('GET', `${API}/api/v1/relay-key`)).json;
    expect(published.pub).toBe(rec.from);
    const env = decodeCbor(Buffer.from(rec.env, 'base64url'));
    const signed = Buffer.concat([
      Buffer.from(REQUEST_ENV_DOMAIN),
      encodeCbor(env.get('header')),
      sha(Buffer.from(env.get('body'))),
    ]);
    expect(
      ed25519Verify(Buffer.from(published.pub, 'base64url'), signed, Buffer.from(env.get('sig')))
    ).toBeTrue();
    const body = requestBody(rec);
    expect(body.get('docId')).toBe(docId);
    // The numeric widget key travels as text, as the statement needs.
    expect(body.get('fieldId')).toBe('12345678');
    expect(body.get('origin')).toBe(published.origin);
    // Not sealed, so no document title in it.
    expect(body.has('title')).toBeFalse();

    // Nothing yet; then the phone approves.
    const p1 = await poll(s.json.result.requestId, 'pushed');
    expect(p1.json.result.status).toBe('pending');
    phoneAnswer(bob, rec);
    const p2 = await poll(s.json.result.requestId, 'pushed');
    expect(p2.json.result.status).toBe('signed');
    expect(p2.json.result.image).toBe('data:image/png;base64,' + PNG.toString('base64'));

    const row = await rowOf(s.json.result.requestId);
    expect(row.Status).toBe('signed');
    expect(row.FieldId).toBe('12345678');
    expect(row.Statement).toBeTruthy();
    expect(row.EphSecret).toBeUndefined();

    // Polling again gives the same result.
    const p3 = await poll(s.json.result.requestId);
    expect(p3.json.result).toEqual(p2.json.result);
  });

  it('saves the request before pushing it, with the one-time key encrypted', async () => {
    let seen;
    relay.onRequest = async rec => {
      const where = JSON.stringify({ ReqId: Buffer.from(rec.reqId, 'base64url').toString('hex') });
      const r = await req(
        'GET',
        `${PARSE}/classes/bs_PhoneSignRequest?where=${encodeURIComponent(where)}`,
        { headers: MASTER }
      );
      seen = r.json.results[0];
    };
    const s = await start();
    expect(seen?.objectId).toBe(s.json.result.requestId);
    expect(seen.Status).toBe('pending');
    // Not the raw 32-byte secret in hex.
    expect(seen.EphSecret).not.toMatch(/^[0-9a-f]{64}$/);
  });

  it('sends the initials kind', async () => {
    await start({ kind: 'initials' });
    expect(requestBody(relay.last).get('kind')).toBe('initials');
  });

  it('reports a change in delivery while waiting', async () => {
    relay.delivery = 'live';
    const s = await start();
    expect(s.json.result.delivery).toBe('live');
    relay.delivery = 'seen';
    const p = await poll(s.json.result.requestId, 'live');
    expect(p.json.result).toEqual({ status: 'pending', delivery: 'seen' });
  });

  it('reports a decline on the phone, and keeps reporting it', async () => {
    const s = await start();
    phoneAnswer(bob, relay.last, { result: 'denied' });
    expect((await poll(s.json.result.requestId)).json.result.status).toBe('denied');
    expect((await poll(s.json.result.requestId)).json.result.status).toBe('denied');
  });

  it('reports a request the relay expired', async () => {
    const s = await start();
    relay.expire(relay.last.reqId);
    expect((await poll(s.json.result.requestId)).json.result.status).toBe('expired');
  });

  describe('refuses an answer', () => {
    const failed = async opts => {
      const s = await start();
      phoneAnswer(bob, relay.last, opts);
      return (await poll(s.json.result.requestId)).json.result;
    };

    it('for another field', async () => {
      expect((await failed({ over: { fieldId: '999' } })).status).toBe('failed');
    });

    it('signed by another key', async () => {
      expect((await failed({ signer: identity() })).status).toBe('failed');
    });

    it('for another request', async () => {
      expect((await failed({ answerOver: { reqId: crypto.randomBytes(16) } })).status).toBe(
        'failed'
      );
    });

    it("whose image isn't a PNG", async () => {
      expect((await failed({ image: Buffer.from('GIF89a not a png') })).status).toBe('failed');
    });

    it('whose image is too large', async () => {
      const big = Buffer.concat([PNG.subarray(0, 8), Buffer.alloc(512 * 1024)]);
      expect((await failed({ image: big })).status).toBe('failed');
    });

    it("whose image isn't the one that was signed", async () => {
      const r = await failed({ over: { imageHash: sha(Buffer.from('another image')) } });
      expect(r.status).toBe('failed');
    });

    it('signed before the request was made', async () => {
      expect((await failed({ over: { iat: nowSec() - 600 } })).status).toBe('failed');
    });

    it('signed after the request expired', async () => {
      expect((await failed({ over: { iat: nowSec() + 600 } })).status).toBe('failed');
    });
  });

  it('accepts an answer signed at any time while the request was open', async () => {
    // More than the old 2-minute window from now, but before the request's exp.
    const s = await start();
    phoneAnswer(bob, relay.last, { over: { iat: nowSec() + 170 } });
    expect((await poll(s.json.result.requestId)).json.result.status).toBe('signed');
  });

  it('keeps waiting while the verifier is down', async () => {
    const s = await start();
    phoneAnswer(bob, relay.last);
    verifier.mode = '503';
    expect((await poll(s.json.result.requestId)).json.result.status).toBe('pending');
    verifier.mode = 'ok';
    expect((await poll(s.json.result.requestId)).json.result.status).toBe('signed');
  });

  it('says so when the app has never connected to the relay, and leaves no request', async () => {
    const before = await rowCount(bobId);
    relay.mode = 'unknown';
    const s = await start();
    expect(s.json.code).toBe(101);
    expect(s.json.error).toMatch(/Open the app/);
    expect(await rowCount(bobId)).toBe(before);
  });

  it('reports the relay rate limit, and leaves no request', async () => {
    const before = await rowCount(bobId);
    relay.mode = 'ratelimited';
    const s = await start();
    expect(s.json.code).toBe(155);
    expect(await rowCount(bobId)).toBe(before);
  });

  it('is only for a Sign in with BetterSign session', async () => {
    const plain = await session(bobId);
    const s = await call('bsphonesignstart', plain, { docId, fieldId: 'field-1' });
    expect(s.json.code).toBe(119);
  });

  it("refuses a document the signer can't see", async () => {
    const other = await mkOwner(`other-${tag()}@example.com`);
    const otherDoc = await mkDoc(other, [
      await mkContact(other.userId, 'X', `x-${tag()}@example.com`),
    ]);
    expect((await start({ docId: otherDoc })).json.code).toBe(101);
  });

  it("refuses a document the signer can't sign now", async () => {
    const completed = await mkDoc(owner, [bobC], { extra: { IsCompleted: true } });
    const c = await start({ docId: completed });
    expect(c.json.code).toBe(119);
    expect(c.json.error).toMatch(/already signed/);

    const daveC = await mkContact(owner.userId, 'Dave', `dave-${tag()}@example.com`);
    const inOrder = await mkDoc(owner, [daveC, bobC], { sendInOrder: true });
    const o = await start({ docId: inOrder });
    expect(o.json.code).toBe(119);
    expect(o.json.error).toMatch(/Earlier signers/);
  });

  it('lets the owner sign a document they sign themselves', async () => {
    const carol = identity();
    verifier.register(carol);
    const carolOwner = await mkOwner(`carol-${tag()}@example.com`);
    await link(carol, carolOwner.userId);
    const carolToken = await bsSession(carol, carolOwner.userId);
    const selfDoc = await mkDoc(carolOwner, [], { extra: { IsSignyourself: true } });

    const s = await call('bsphonesignstart', carolToken, { docId: selfDoc, fieldId: 42 });
    expect(s.status).toBe(200);
    phoneAnswer(carol, relay.last);
    const p = await call('bsphonesignpoll', carolToken, { requestId: s.json.result.requestId });
    expect(p.json.result.status).toBe('signed');

    // Not once it's finished.
    const done = await mkDoc(carolOwner, [], {
      extra: { IsSignyourself: true, IsCompleted: true },
    });
    const d = await call('bsphonesignstart', carolToken, { docId: done, fieldId: 42 });
    expect(d.json.code).toBe(119);
  });

  it("doesn't let another user poll the request", async () => {
    const s = await start();
    const eve = identity();
    const eveId = await mkUser(`eve-${tag()}@example.com`);
    await link(eve, eveId);
    const eveToken = await bsSession(eve, eveId);
    const p = await call('bsphonesignpoll', eveToken, { requestId: s.json.result.requestId });
    expect(p.json.code).toBe(101);
  });
});

describe('Sign in with BetterSign marks the session', () => {
  let dan;
  let danId;

  beforeAll(async () => {
    dan = identity();
    danId = await mkUser(`dan-${tag()}@example.com`);
    await link(dan, danId);
  });

  const signIn = () =>
    req('POST', `${PARSE}/functions/bsidlogin`, {
      headers: PUBLIC,
      body: bsidLoginParams(dan.vlad),
    });

  it('records the session and its VLAD', async () => {
    const r = await signIn();
    expect(r.status).toBe(200);
    expect(r.json.result.bettersign).toBeTrue();
    const tokenHash = crypto.createHash('sha256').update(r.json.result.sessionToken).digest('hex');
    const where = encodeURIComponent(JSON.stringify({ TokenHash: tokenHash }));
    const rows = await req('GET', `${PARSE}/classes/bs_WebSession?where=${where}`, {
      headers: MASTER,
    });
    expect(rows.json.results.length).toBe(1);
    expect(rows.json.results[0].vlad).toBe(dan.vlad);
    expect(rows.json.results[0].UserId.objectId).toBe(danId);
  });

  it("still signs in when the session can't be recorded", async () => {
    let failing = true;
    Parse.Cloud.beforeSave('bs_WebSession', () => {
      if (failing) throw new Parse.Error(Parse.Error.INTERNAL_SERVER_ERROR, 'boom');
    });
    try {
      const r = await signIn();
      expect(r.status).toBe(200);
      expect(r.json.result.sessionToken).toBeTruthy();
      expect(r.json.result.bettersign).toBeFalse();
    } finally {
      failing = false;
    }
  });
});

describe('the relay key', () => {
  afterEach(() => delete process.env.BS_RELAY_SIGNING_KEY);

  it('is the same stored key for every machine creating it at once', async () => {
    const key = `test-${tag()}`;
    const results = await Promise.all(
      Array.from({ length: 12 }, (_, n) => n).map(n =>
        storedConfigEntry(key, () => `value-${n}-${tag()}`)
      )
    );
    expect(new Set(results.map(r => r.value)).size).toBe(1);
    expect(results.filter(r => r.created).length).toBe(1);
  });

  it('is published from BS_RELAY_SIGNING_KEY when set', async () => {
    const seed = crypto.randomBytes(32);
    process.env.BS_RELAY_SIGNING_KEY = seed.toString('hex');
    const r = await req('GET', `${API}/api/v1/relay-key`);
    expect(r.json.pub).toBe(ed25519FromSeed(seed).pub.toString('base64url'));
  });

  it("answers 500 when BS_RELAY_SIGNING_KEY can't be used", async () => {
    process.env.BS_RELAY_SIGNING_KEY = 'not-a-seed';
    const r = await req('GET', `${API}/api/v1/relay-key`);
    expect(r.status).toBe(500);
    expect(r.json.error).toBe('internal');
  });
});
