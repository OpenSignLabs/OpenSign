// "Sign on phone" (cloud/parsefunction/bsPhoneSign.js): a BetterSign web
// session pushes a field to the signer's app through the relay (a stand-in,
// support/relay.js), and the spec plays the phone.
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
import { recordBsIdSession } from '../../utils/bsWebSession.js';
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

async function session(userId) {
  const r = await req('POST', `${PARSE}/loginAs`, { headers: MASTER, body: { userId } });
  return r.json.sessionToken;
}

const call = (fn, token, params) =>
  req('POST', `${PARSE}/functions/${fn}`, {
    headers: { ...PUBLIC, 'X-Parse-Session-Token': token },
    body: params,
  });

// The app's side: check the request, approve (or not) and seal the answer to
// the request's one-time key.
function phoneAnswer(id, rec, { result = 'ok', over = {}, signer = id } = {}) {
  const env = decodeCbor(Buffer.from(rec.env, 'base64url'));
  const r = decodeCbor(env.get('body'));
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
    iat: Math.floor(Date.now() / 1000),
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
          image: PNG,
        }
      : { v: 1, reqId: r.get('reqId'), result, reason: 'user' };

  const idSign = ed25519FromSeed(crypto.randomBytes(32));
  const reqId = Buffer.from(r.get('reqId'));
  const now = Math.floor(Date.now() / 1000);
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
  let token;
  let docId;

  beforeAll(async () => {
    owner = await mkOwner(`owner-${tag()}@example.com`);
    bob = identity();
    verifier.register(bob);
    bobId = await mkUser(`bob-${tag()}@example.com`);
    await link(bob, bobId);
    const bobC = await mkContact(owner.userId, 'Bob', `bob-${tag()}@example.com`, bobId);
    docId = await mkDoc(owner, [bobC]);
    token = await session(bobId);
    await recordBsIdSession(token, bob.vlad, bobId);
  });

  beforeEach(() => {
    verifier.mode = 'ok';
    relay.mode = 'ok';
    relay.delivery = 'pushed';
  });

  const start = (params = {}) =>
    call('bsphonesignstart', token, { docId, fieldId: 'field-1', kind: 'signature', ...params });
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
    const body = decodeCbor(env.get('body'));
    expect(body.get('docId')).toBe(docId);
    expect(body.get('fieldId')).toBe('field-1');
    expect(body.get('origin')).toBe(published.origin);

    // Nothing yet; then the phone approves.
    const p1 = await poll(s.json.result.requestId, 'pushed');
    expect(p1.json.result.status).toBe('pending');
    phoneAnswer(bob, rec);
    const p2 = await poll(s.json.result.requestId, 'pushed');
    expect(p2.json.result.status).toBe('signed');
    expect(p2.json.result.image).toBe('data:image/png;base64,' + PNG.toString('base64'));

    const row = await req(
      'GET',
      `${PARSE}/classes/bs_PhoneSignRequest/${s.json.result.requestId}`,
      {
        headers: MASTER,
      }
    );
    expect(row.json.Status).toBe('signed');
    expect(row.json.Statement).toBeTruthy();
    expect(row.json.EphSecret).toBeUndefined();
  });

  it('reports a change in delivery while waiting', async () => {
    relay.delivery = 'live';
    const s = await start();
    expect(s.json.result.delivery).toBe('live');
    relay.delivery = 'seen';
    const p = await poll(s.json.result.requestId, 'live');
    expect(p.json.result).toEqual({ status: 'pending', delivery: 'seen' });
  });

  it('reports a decline on the phone', async () => {
    const s = await start();
    phoneAnswer(bob, relay.last, { result: 'denied' });
    expect((await poll(s.json.result.requestId)).json.result.status).toBe('denied');
  });

  it('refuses an approval for another field', async () => {
    const s = await start();
    phoneAnswer(bob, relay.last, { over: { fieldId: 'field-2' } });
    expect((await poll(s.json.result.requestId)).json.result.status).toBe('failed');
  });

  it('refuses an approval signed by another key', async () => {
    const s = await start();
    phoneAnswer(bob, relay.last, { signer: identity() });
    expect((await poll(s.json.result.requestId)).json.result.status).toBe('failed');
  });

  it('keeps waiting while the verifier is down', async () => {
    const s = await start();
    phoneAnswer(bob, relay.last);
    verifier.mode = '503';
    expect((await poll(s.json.result.requestId)).json.result.status).toBe('pending');
    verifier.mode = 'ok';
    expect((await poll(s.json.result.requestId)).json.result.status).toBe('signed');
  });

  it('says so when the app has never connected to the relay', async () => {
    relay.mode = 'unknown';
    const s = await start();
    expect(s.json.code).toBe(101);
    expect(s.json.error).toMatch(/Open the app/);
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

  it("doesn't let another user poll the request", async () => {
    const s = await start();
    const eve = identity();
    const eveId = await mkUser(`eve-${tag()}@example.com`);
    await link(eve, eveId);
    const eveToken = await session(eveId);
    await recordBsIdSession(eveToken, eve.vlad, eveId);
    const p = await call('bsphonesignpoll', eveToken, { requestId: s.json.result.requestId });
    expect(p.json.code).toBe(101);
  });
});
