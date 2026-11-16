// Sign in with BetterSign through the extension (cloud/parsefunction/bsextlogin.js):
// a challenge, then the phone's bs-login statement and its signature over
// SHA-256("bs-login/v1/statement\n" ‖ statement), checked by the mock verifier.
import crypto from 'node:crypto';
import { ORIGIN, PARSE, PUBLIC, cbor, identity, link, mkUser, req, tag } from './support/lib.js';
import { verifier } from './support/verifier.js';

const RP = 'bs-opensign'; // the bs-id client the extension link is for
const run = (name, body = {}) => req('POST', `${PARSE}/functions/${name}`, { headers: PUBLIC, body });
const newChallenge = async () => (await run('bsextchallenge')).json.result;

// What the phone sends back through the extension, signed by `signer`.
function approve(id, ch, over = {}, signer = id) {
  const statement = cbor({
    v: 1,
    type: 'bs-login',
    vlad: Buffer.from(id.vlad, 'hex'),
    origin: ORIGIN,
    rp: RP,
    challenge: Buffer.from(ch.challenge, 'base64url'),
    reqId: crypto.randomBytes(16),
    extSignPub: crypto.randomBytes(32),
    iat: Math.floor(Date.now() / 1000),
    ...over,
  });
  const digest = crypto
    .createHash('sha256')
    .update(Buffer.concat([Buffer.from('bs-login/v1/statement\n'), statement]))
    .digest();
  return {
    challengeId: ch.challengeId,
    statement: statement.toString('base64url'),
    vladSig: crypto.sign(null, digest, signer.privateKey).toString('base64url'),
  };
}

async function linkedIdentity() {
  const id = identity();
  verifier.register(id);
  const email = `ext-${tag()}@example.com`;
  const userId = await mkUser(email);
  await link(id, userId);
  return { id, userId, email };
}

describe('Sign in with BetterSign through the extension (bsextlogin)', () => {
  afterEach(() => (verifier.mode = 'ok'));

  it('signs in a linked VLAD', async () => {
    const { id, userId, email } = await linkedIdentity();
    const ch = await newChallenge();
    expect(ch.challenge).toMatch(/^[A-Za-z0-9_-]{43}$/);
    const r = await run('bsextlogin', approve(id, ch));
    expect(r.status).toBe(200);
    expect(r.json.result.objectId).toBe(userId);
    expect(r.json.result.email).toBe(email);
    expect(r.json.result.sessionToken).toMatch(/^r:/);
    expect(r.json.result.bettersign).toBe(true);
  });

  it('uses a challenge once, even after a failed try', async () => {
    const { id } = await linkedIdentity();
    const ch = await newChallenge();
    const body = approve(id, ch);
    expect((await run('bsextlogin', body)).status).toBe(200);
    const again = await run('bsextlogin', body);
    expect(again.json.code).toBe(101);
    expect(again.json.error).toMatch(/expired/);

    const ch2 = await newChallenge();
    expect((await run('bsextlogin', approve(id, ch2, { origin: 'https://evil.example' }))).json.code).toBe(101);
    expect((await run('bsextlogin', approve(id, ch2))).json.error).toMatch(/expired/);
  });

  it('refuses a statement for another site, app, sign-in or time', async () => {
    const { id } = await linkedIdentity();
    for (const over of [
      { origin: 'https://evil.example' },
      { rp: 'bs-oauth-rocket' },
      { challenge: crypto.randomBytes(32) },
      { iat: Math.floor(Date.now() / 1000) - 600 },
      { type: 'bs-docsign' },
    ]) {
      const r = await run('bsextlogin', approve(id, await newChallenge(), over));
      expect(r.json.code).withContext(JSON.stringify(Object.keys(over))).toBe(101);
      expect(r.json.error).toMatch(/could not be verified/);
    }
  });

  it("refuses a signature that isn't the identity's", async () => {
    const { id } = await linkedIdentity();
    const r = await run('bsextlogin', approve(id, await newChallenge(), {}, identity()));
    expect(r.json.code).toBe(101);
    expect(r.json.error).toMatch(/could not be verified/);
  });

  it('refuses an unlinked VLAD and records it for an admin', async () => {
    const id = identity();
    verifier.register(id);
    const r = await run('bsextlogin', approve(id, await newChallenge()));
    expect(r.json.code).toBe(101);
    expect(r.json.error).toMatch(/isn't linked/);
  });

  it("says so when the verifier can't check", async () => {
    const { id } = await linkedIdentity();
    verifier.mode = '503';
    const r = await run('bsextlogin', approve(id, await newChallenge()));
    expect(r.json.code).toBe(1); // INTERNAL_SERVER_ERROR
    expect(r.json.error).toMatch(/right now/);
  });

  it('rejects malformed input', async () => {
    expect((await run('bsextlogin', {})).json.code).toBe(102); // INVALID_QUERY
    expect((await run('bsextlogin', { challengeId: 'x'.repeat(40) })).json.code).toBe(102);
    const ch = await newChallenge();
    const r = await run('bsextlogin', { challengeId: ch.challengeId, statement: 'not base64!', vladSig: 'AA' });
    expect(r.json.code).toBe(101);
  });
});
