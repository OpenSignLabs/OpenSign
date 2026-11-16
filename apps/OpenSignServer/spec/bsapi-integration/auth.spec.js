// /api/v1 sign-in, VLAD links, and the read endpoints.
import crypto from 'node:crypto';
import {
  API,
  MASTER,
  PARSE,
  PUBLIC,
  RP,
  bearer,
  challenge,
  docRow,
  getFile,
  identity,
  link,
  loginStatement,
  mkContact,
  mkDoc,
  mkOwner,
  mkUser,
  ptr,
  receiverVlad,
  req,
  signIn,
  tag,
  tbs,
  tokenFor,
} from './support/lib.js';
import { verifier } from './support/verifier.js';
import { createRequire } from 'node:module';
import { accountForVlad } from '../../utils/bsIdentity.js';

const require = createRequire(import.meta.url);
const moveEnvLinks = require('../../databases/migrations/20261115140000-move_bs_id_users_to_bs_identity.cjs');
const activeFlag = require('../../databases/migrations/20261115150000-bs_identity_active_flag.cjs');

async function withEnvUsers(map, fn) {
  const saved = process.env.BS_ID_USERS;
  process.env.BS_ID_USERS = JSON.stringify(map);
  try {
    return await fn();
  } finally {
    if (saved === undefined) delete process.env.BS_ID_USERS;
    else process.env.BS_ID_USERS = saved;
  }
}

const identityRows = async vlad =>
  (
    await req(
      'GET',
      `${PARSE}/classes/bs_Identity?` + new URLSearchParams({ where: JSON.stringify({ vlad }) }),
      { headers: MASTER }
    )
  ).json.results;

const tokenRequest = body => req('POST', `${API}/api/v1/auth/token`, { body });
const me = auth => req('GET', `${API}/api/v1/me`, { headers: auth });

describe('/api/v1 sign-in', () => {
  let alice;
  let aliceId;

  beforeAll(async () => {
    alice = identity();
    verifier.register(alice);
    aliceId = await mkUser(`alice-${tag()}@example.com`);
    await link(alice, aliceId);
  });

  beforeEach(() => {
    verifier.mode = 'ok';
  });

  it('signs in a VLAD linked in bs_Identity', async () => {
    const r = await signIn(alice);
    expect(r.status).toBe(200);
    expect(r.json.access_token).toMatch(/^bso_[A-Za-z0-9_-]{43}$/);
    expect(r.json.token_type).toBe('Bearer');
    const who = await me(bearer(r.json.access_token));
    expect(who.json.vlad).toBe(alice.vlad);
    expect(who.json.user.id).toBe(aliceId);
  });

  it('gives the verifier the canonical signed message and the configured rp', async () => {
    const ch = (await challenge(alice)).json;
    const body = { challengeId: ch.challengeId, ...loginStatement(alice, ch) };
    verifier.calls.length = 0;
    expect((await tokenRequest(body)).status).toBe(200);
    expect(verifier.calls.length).toBe(1);
    expect(verifier.calls[0].vlad).toBe(alice.vlad);
    const st = Buffer.from(body.statement, 'base64url');
    expect(verifier.calls[0].nonce).toBe(tbs('bs-login', alice.vlad, st).toString('hex'));
    expect(verifier.calls[0].rp).toBe(RP);
  });

  it('names its receiver VLAD in the challenge', async () => {
    const ch = (await challenge(alice)).json;
    expect(ch.receiverVlad).toBe(receiverVlad());
  });

  it('signs in with the full signed message, or with both fields', async () => {
    expect((await signIn(alice, {}, alice, { send: 'message' })).status).toBe(200);
    expect((await signIn(alice, {}, alice, { send: 'both' })).status).toBe(200);
  });

  // A full message that isn't canonical, or isn't from this identity to us
  // for a login, is named as such before the verifier is asked.
  const notCanonical = [
    ['another domain separator', { domain: 'bettersign-message-v1' }, /domain separator/],
    ['another key path', { keyPath: '/keys/secondary' }, /sender_key_path/],
    ['another receiver', { receiverVlad: '8724' + 'ee'.repeat(38) }, /receiver_vlad/],
    [
      'the docsign content type',
      { contentType: 'application/vnd.bettersign.docsign+cbor' },
      /content_type/,
    ],
  ];
  for (const [name, msg, err] of notCanonical) {
    it(`rejects a signed message with ${name}`, async () => {
      verifier.calls.length = 0;
      const r = await signIn(alice, {}, alice, { send: 'message', msg });
      expect(r.status).toBe(400);
      expect(r.json.error).toBe('invalid_statement');
      expect(r.json.message).toMatch(err);
      expect(verifier.calls.length).toBe(0);
    });
    it(`rejects a statement signed with ${name}`, async () => {
      const r = await signIn(alice, {}, alice, { msg });
      expect(r.status).toBe(401);
      expect(r.json.code).toBe('rejected');
    });
  }

  it('rejects a signature over the old statement digest', async () => {
    const ch = (await challenge(alice)).json;
    const { statement } = loginStatement(alice, ch);
    const st = Buffer.from(statement, 'base64url');
    const digest = crypto
      .createHash('sha256')
      .update(Buffer.from('bs-login/v1/statement\n'))
      .update(st)
      .digest();
    const r = await tokenRequest({
      challengeId: ch.challengeId,
      statement,
      signature: crypto.sign(null, digest, alice.privateKey).toString('base64url'),
    });
    expect(r.status).toBe(401);
  });

  it('rejects a statement that is not the signed message body', async () => {
    const ch = (await challenge(alice)).json;
    const { message, signature } = loginStatement(alice, ch, {}, alice, { send: 'message' });
    const { statement } = loginStatement(alice, ch);
    const r = await tokenRequest({ challengeId: ch.challengeId, message, statement, signature });
    expect(r.status).toBe(400);
    expect(r.json.message).toMatch(/not the signed message body/);
  });

  describe('without BS_API_RECEIVER_VLAD', () => {
    let saved;
    beforeEach(() => {
      saved = process.env.BS_API_RECEIVER_VLAD;
      delete process.env.BS_API_RECEIVER_VLAD;
    });
    afterEach(() => {
      process.env.BS_API_RECEIVER_VLAD = saved;
    });

    const stored = async () =>
      (
        await req(
          'GET',
          `${PARSE}/classes/bs_ApiConfig?` +
            new URLSearchParams({ where: JSON.stringify({ Key: 'receiverVlad' }) }),
          { headers: MASTER }
        )
      ).json.results;

    it('generates one, stores it, and signs in with it', async () => {
      const ch = (await challenge(alice)).json;
      expect(ch.receiverVlad).toMatch(/^8724[0-9a-f]{64}$/);
      expect(process.env.BS_API_RECEIVER_VLAD).toBe(ch.receiverVlad);
      const rows = await stored();
      expect(rows.length).toBe(1);
      expect(rows[0].Value).toBe(ch.receiverVlad);

      const r = await tokenRequest({
        challengeId: ch.challengeId,
        ...loginStatement(alice, ch, {}, alice, { msg: { receiverVlad: ch.receiverVlad } }),
      });
      expect(r.status).toBe(200);
    });

    it('reuses the stored one after a restart, and under a race', async () => {
      const first = (await stored())[0]?.Value ?? (await challenge(alice)).json.receiverVlad;
      // A restart: the env is empty again, the row is still there.
      delete process.env.BS_API_RECEIVER_VLAD;
      const results = await Promise.all([1, 2, 3].map(() => challenge(alice)));
      for (const r of results) expect(r.json.receiverVlad).toBe(first);
      expect((await stored()).length).toBe(1);
    });

    it('is not readable without the master key', async () => {
      const r = await req('GET', `${PARSE}/classes/bs_ApiConfig`, { headers: PUBLIC });
      expect(r.status).not.toBe(200);
    });
  });

  it('turns sign-in off when BS_API_RECEIVER_VLAD is not a VLAD', async () => {
    const saved = process.env.BS_API_RECEIVER_VLAD;
    try {
      process.env.BS_API_RECEIVER_VLAD = 'abcd';
      const r = await challenge(alice);
      expect(r.status).toBe(503);
      expect(r.json.error).toBe('not_configured');
    } finally {
      process.env.BS_API_RECEIVER_VLAD = saved;
    }
  });

  it('uses BS_API_RP for both the statement check and the verifier', async () => {
    process.env.BS_API_RP = 'bs-opensign-staging';
    try {
      const ch = (await challenge(alice)).json;
      expect(ch.rp).toBe('bs-opensign-staging');
      verifier.calls.length = 0;
      const r = await tokenRequest({ challengeId: ch.challengeId, ...loginStatement(alice, ch) });
      expect(r.status).toBe(200);
      expect(verifier.calls[0].rp).toBe('bs-opensign-staging');
    } finally {
      delete process.env.BS_API_RP;
    }
  });

  it('uses a challenge once, even when requests race', async () => {
    const ch = (await challenge(alice)).json;
    const body = { challengeId: ch.challengeId, ...loginStatement(alice, ch) };
    const results = await Promise.all([1, 2, 3, 4].map(() => tokenRequest(body)));
    expect(results.filter(r => r.status === 200).length).toBe(1);
    expect(results.filter(r => r.status === 400).length).toBe(3);
    expect(results.find(r => r.status === 400).json.error).toBe('invalid_challenge');
  });

  const rejections = [
    ['another origin', { origin: 'https://evil.example' }],
    ['another rp', { rp: 'bs-delegate' }],
    ['another challenge', { challenge: crypto.randomBytes(32) }],
    ['a stale iat', { iat: Math.floor(Date.now() / 1000) - 600 }],
  ];
  for (const [name, over] of rejections) {
    it(`rejects a statement for ${name}`, async () => {
      const r = await signIn(alice, over);
      expect(r.status).toBe(401);
      expect(r.json.error).toBe('access_denied');
    });
  }

  it("rejects another identity's VLAD on this challenge", async () => {
    const other = identity();
    const r = await signIn(alice, { vlad: Buffer.from(other.vlad, 'hex') });
    expect(r.status).toBe(401);
  });

  it('rejects a signature by another key', async () => {
    const r = await signIn(alice, {}, identity());
    expect(r.status).toBe(401);
    expect(r.json.code).toBe('rejected');
  });

  it('rejects malformed input', async () => {
    const bad = await req('POST', `${API}/api/v1/auth/challenge`, { body: { vlad: 'xyz' } });
    expect(bad.status).toBe(400);
    const ch = (await challenge(alice)).json;
    const garbage = await tokenRequest({
      challengeId: ch.challengeId,
      statement: 'AAAA',
      signature: 'AAAA',
    });
    expect(garbage.status).toBe(400);
    expect(garbage.json.error).toBe('invalid_statement');
  });

  it('refuses an unlinked VLAD, and records it once its signature verifies', async () => {
    const id = identity();
    verifier.register(id);
    expect((await challenge(id)).status).toBe(200);
    const r = await signIn(id);
    expect(r.status).toBe(403);
    expect(r.json.error).toBe('not_linked');
    const rows = await identityRows(id.vlad);
    expect(rows.length).toBe(1);
    expect(rows[0].Active).toBe(false);
    expect(rows[0].UserId).toBeUndefined();
    expect(rows[0].Label).toBe('Sign-in attempt');
    expect(rows[0].ACL).toEqual({});
    const first = rows[0].LastSeenAt.iso;

    await new Promise(resolve => setTimeout(resolve, 5));
    expect((await signIn(id)).status).toBe(403);
    const again = await identityRows(id.vlad);
    expect(again.length).toBe(1);
    expect(again[0].LastSeenAt.iso > first).toBe(true);
  });

  it("doesn't record an unlinked VLAD whose signature fails", async () => {
    const id = identity(); // not registered with the verifier: not_found
    expect((await challenge(id)).status).toBe(200);
    expect((await signIn(id)).status).toBe(401);
    expect((await identityRows(id.vlad)).length).toBe(0);
  });

  it("returns 503 and no token when the verifier can't decide", async () => {
    verifier.mode = '503';
    const r = await signIn(alice);
    expect(r.status).toBe(503);
    expect(r.json.error).toBe('verifier_unavailable');
  });

  it("says the server is misconfigured, not the signature, when the verifier refuses our secret", async () => {
    verifier.mode = 'bad_secret';
    const r = await signIn(alice);
    expect(r.status).toBe(502);
    expect(r.json.error).toBe('verifier_misconfigured');
    expect(r.json.access_token).toBeUndefined();
  });

  it('requires a valid token', async () => {
    expect((await me({})).status).toBe(401);
    expect((await me(bearer('bso_' + 'A'.repeat(43)))).status).toBe(401);
  });

  it('stores tokens hashed and creates no Parse session', async () => {
    const sessionsFor = async () =>
      (
        await req(
          'GET',
          `${PARSE}/classes/_Session?` +
            new URLSearchParams({ where: JSON.stringify({ user: ptr('_User', aliceId) }) }),
          { headers: MASTER }
        )
      ).json.results.length;
    const sessionsBefore = await sessionsFor();
    const token = (await signIn(alice)).json.access_token;
    expect(await sessionsFor()).toBe(sessionsBefore);

    const rows = await req(
      'GET',
      `${PARSE}/classes/bs_ApiToken?` +
        new URLSearchParams({
          where: JSON.stringify({ UserId: ptr('_User', aliceId) }),
          order: '-createdAt',
          limit: '1',
        }),
      { headers: MASTER }
    );
    const row = rows.json.results[0];
    expect(row.TokenHash).toBe(crypto.createHash('sha256').update(token).digest('hex'));
    expect(JSON.stringify(row)).not.toContain(token.slice(4));
    expect(row.SessionToken).toBeUndefined();
  });

  it('logout revokes the token', async () => {
    const auth = await tokenFor(alice);
    expect((await req('POST', `${API}/api/v1/auth/logout`, { headers: auth })).status).toBe(204);
    expect((await me(auth)).status).toBe(401);
  });
});

describe('VLAD links (bs_Identity)', () => {
  it('unlinking ends live tokens; relinking restores them', async () => {
    const id = identity();
    verifier.register(id);
    const userId = await mkUser(`unlink-${tag()}@example.com`);
    const row = (await link(id, userId)).json.objectId;
    const auth = await tokenFor(id);

    await req('PUT', `${PARSE}/classes/bs_Identity/${row}`, {
      headers: MASTER,
      body: { Active: false },
    });
    expect((await me(auth)).status).toBe(401);
    expect((await signIn(id)).status).toBe(403);

    await req('PUT', `${PARSE}/classes/bs_Identity/${row}`, {
      headers: MASTER,
      body: { Active: true },
    });
    expect((await me(auth)).status).toBe(200);
  });

  it('an active link needs an account', async () => {
    const r = await req('POST', `${PARSE}/classes/bs_Identity`, {
      headers: MASTER,
      body: { vlad: identity().vlad, Active: true, ACL: {} },
    });
    expect(r.status).toBe(400);
    expect(r.json.code).toBe(142); // VALIDATION_ERROR
  });

  it('a new row is off unless it says otherwise', async () => {
    const id = identity();
    verifier.register(id);
    const userId = await mkUser(`off-${tag()}@example.com`);
    expect((await link(id, userId, { Active: undefined })).status).toBe(201);
    expect((await identityRows(id.vlad))[0].Active).toBe(false);
    expect((await accountForVlad(id.vlad)).reason).toBe('inactive');
  });

  it('allows one active link per VLAD', async () => {
    const id = identity();
    const a = await mkUser(`dup-a-${tag()}@example.com`);
    const b = await mkUser(`dup-b-${tag()}@example.com`);
    expect((await link(id, a)).status).toBe(201);
    const second = await link(id, b);
    expect(second.status).toBe(400);
    expect(second.json.code).toBe(137); // DUPLICATE_VALUE
  });

  it('an old link turned off and a new one: the new one wins', async () => {
    const id = identity();
    verifier.register(id);
    const oldUser = await mkUser(`old-${tag()}@example.com`);
    const newUser = await mkUser(`new-${tag()}@example.com`);
    const old = (await link(id, oldUser)).json.objectId;
    await req('PUT', `${PARSE}/classes/bs_Identity/${old}`, {
      headers: MASTER,
      body: { Active: false },
    });
    expect((await link(id, newUser)).status).toBe(201);
    for (let i = 0; i < 5; i++) {
      expect((await accountForVlad(id.vlad)).user.id).toBe(newUser);
    }
    expect((await me(await tokenFor(id))).json.user.id).toBe(newUser);
  });

  it('refuses to guess between two active links', async () => {
    const id = identity();
    const a = await mkUser(`amb-a-${tag()}@example.com`);
    const b = await mkUser(`amb-b-${tag()}@example.com`);
    // Bypass the save hook, as a direct database write would.
    for (const userId of [a, b]) {
      await Parse.Server.database.create('bs_Identity', {
        objectId: `raw${tag()}`,
        vlad: id.vlad,
        UserId: ptr('_User', userId),
        Active: true,
      });
    }
    expect((await accountForVlad(id.vlad)).reason).toBe('ambiguous');
    expect((await challenge(id)).status).toBe(403);
  });

  it('ignores BS_ID_USERS: links live only in bs_Identity', async () => {
    const id = identity();
    verifier.register(id);
    const email = `envonly-${tag()}@example.com`;
    await mkUser(email);
    await withEnvUsers({ [id.vlad]: email }, async () => {
      expect((await accountForVlad(id.vlad)).reason).toBe('not_linked');
      expect((await signIn(id)).status).toBe(403);
    });
  });

  it("reports a link to an account that doesn't exist", async () => {
    const id = identity();
    await Parse.Server.database.create('bs_Identity', {
      objectId: `raw${tag()}`,
      vlad: id.vlad,
      UserId: ptr('_User', 'missingUser1'),
      Active: true,
    });
    expect((await accountForVlad(id.vlad)).reason).toBe('no_account');
  });

  it('only the master key can read or write links and tokens', async () => {
    const email = `eve-${tag()}@example.com`;
    const signup = await req('POST', `${PARSE}/users`, {
      headers: PUBLIC,
      body: { username: email, password: 'pw', email },
    });
    const eve = { ...PUBLIC, 'X-Parse-Session-Token': signup.json.sessionToken };
    const forged = await req('POST', `${PARSE}/classes/bs_Identity`, {
      headers: eve,
      body: { vlad: identity().vlad, UserId: ptr('_User', signup.json.objectId) },
    });
    expect(forged.status).not.toBe(201);
    for (const className of ['bs_Identity', 'bs_ApiToken', 'bs_ApiChallenge']) {
      const read = await req('GET', `${PARSE}/classes/${className}`, { headers: eve });
      expect(read.status === 200 ? read.json.results.length : 0).toBe(0);
    }
    const schema = await req('GET', `${PARSE}/schemas/bs_Identity`, { headers: MASTER });
    expect(schema.json.classLevelPermissions.create).toEqual({});
  });

  it('the Active migration keeps old rows on or off as RevokedAt had them', async () => {
    const [on, off, orphan] = [identity(), identity(), identity()];
    const userId = await mkUser(`flag-${tag()}@example.com`);
    const old = { __type: 'Date', iso: new Date().toISOString() };
    // Old-shape rows, as they were before the migration (no save hook).
    for (const [id, extra] of [
      [on, { UserId: ptr('_User', userId) }],
      [off, { UserId: ptr('_User', userId), RevokedAt: old }],
      [orphan, {}],
    ]) {
      await Parse.Server.database.create('bs_Identity', {
        objectId: `old${tag()}`,
        vlad: id.vlad,
        ...extra,
      });
    }
    await activeFlag.up(Parse);
    const rows = await Promise.all([on, off, orphan].map(id => identityRows(id.vlad)));
    expect(rows.map(r => r[0].Active)).toEqual([true, false, false]);
    expect(rows.every(r => r[0].RevokedAt === undefined)).toBe(true);
    const schema = await req('GET', `${PARSE}/schemas/bs_Identity`, { headers: MASTER });
    expect(schema.json.fields.RevokedAt).toBeUndefined();
    expect(schema.json.fields.Active.type).toBe('Boolean');
  });

  describe('moving BS_ID_USERS into bs_Identity (migration)', () => {
    it('links each listed VLAD to its account, once', async () => {
      const id = identity();
      verifier.register(id);
      const email = `moved-${tag()}@example.com`;
      const userId = await mkUser(email);
      await withEnvUsers({ [id.vlad.toUpperCase()]: ` ${email.toUpperCase()}` }, async () => {
        await moveEnvLinks.up(Parse);
        await moveEnvLinks.up(Parse);
      });
      const rows = await identityRows(id.vlad);
      expect(rows.length).toBe(1);
      expect(rows[0].Label).toBe('Moved from BS_ID_USERS');
      expect(rows[0].ACL).toEqual({});
      const account = await accountForVlad(id.vlad);
      expect(account.source).toBe('bs_Identity');
      expect(account.user.id).toBe(userId);
      expect((await me(await tokenFor(id))).json.user.id).toBe(userId);
    });

    it('leaves a VLAD that already has a row, even a revoked one', async () => {
      const id = identity();
      const email = `listed-${tag()}@example.com`;
      await mkUser(email);
      const linked = await mkUser(`linked-${tag()}@example.com`);
      await link(id, linked, { Active: false });
      await withEnvUsers({ [id.vlad]: email }, () => moveEnvLinks.up(Parse));
      expect((await identityRows(id.vlad)).length).toBe(1);
      expect((await accountForVlad(id.vlad)).reason).toBe('inactive');
    });

    it("skips an account that doesn't exist", async () => {
      const id = identity();
      await withEnvUsers({ [id.vlad]: `nobody-${tag()}@example.com` }, () =>
        moveEnvLinks.up(Parse)
      );
      expect((await identityRows(id.vlad)).length).toBe(0);
    });
  });
});

describe('/api/v1 documents', () => {
  let owner;
  let bob;
  let ownerAuth;
  let bobAuth;
  let mine;
  let bobsDraft;
  let noExpiry;

  beforeAll(async () => {
    const ownerId = identity();
    bob = identity();
    verifier.register(ownerId);
    verifier.register(bob);
    owner = await mkOwner(`owner-${tag()}@example.com`);
    const bobOwner = await mkOwner(`bob-${tag()}@example.com`);
    await link(ownerId, owner.userId);
    await link(bob, bobOwner.userId);
    const bobContact = await mkContact(owner.userId, 'Bob', 'bob@example.com', bobOwner.userId);
    mine = await mkDoc(owner, [bobContact]);
    noExpiry = await mkDoc(owner, [bobContact], { expiry: false });
    bobsDraft = await mkDoc(bobOwner, [], { sent: false });
    ownerAuth = await tokenFor(ownerId);
    bobAuth = await tokenFor(bob);
  });

  const list = (auth, query = '') =>
    req('GET', `${API}/api/v1/documents${query}`, { headers: auth });

  it("lists the owner's documents, not others'", async () => {
    const ids = (await list(ownerAuth)).json.results.map(d => d.id);
    expect(ids).toContain(mine);
    expect(ids).not.toContain(bobsDraft);
  });

  it('describes a document in public field names', async () => {
    const d = (await list(ownerAuth)).json.results.find(x => x.id === mine);
    expect(d.status).toBe('in_progress');
    expect(d.role).toBe('owner');
    expect(d.signers[0].email).toBe('bob@example.com');
    expect(d.signers[0].signed).toBe(false);
    expect(d.appendOnly).toBe(false);
  });

  it('filters by status', async () => {
    const drafts = (await list(bobAuth, '?status=draft')).json.results.map(d => d.id);
    expect(drafts).toEqual([bobsDraft]);
    expect((await list(ownerAuth, '?status=bogus')).status).toBe(400);
  });

  it('counts a document with no expiry date as in progress', async () => {
    const got = await req('GET', `${API}/api/v1/documents/${noExpiry}`, { headers: ownerAuth });
    expect(got.json.status).toBe('in_progress');
    const ids = (await list(ownerAuth, '?status=in_progress&limit=100')).json.results.map(
      d => d.id
    );
    expect(ids).toContain(noExpiry);
    expect(ids).toContain(mine);
    const expired = (await list(ownerAuth, '?status=expired')).json.results.map(d => d.id);
    expect(expired).not.toContain(noExpiry);
  });

  it('shows a signer the documents they sign, with their fields', async () => {
    const asSigner = (await list(bobAuth, '?role=signer')).json.results;
    const d = asSigner.find(x => x.id === mine);
    expect(d.role).toBe('signer');
    expect(d.canSign).toBe(true);
    expect(d.myFields).toEqual([
      { page: 1, type: 'signature', x: 50, y: 100, width: 150, height: 50 },
    ]);
  });

  it("keeps other people's documents private", async () => {
    const r = await req('GET', `${API}/api/v1/documents/${bobsDraft}`, { headers: ownerAuth });
    expect(r.status).toBe(404);
  });

  it('serves the file with its hash', async () => {
    const f = await getFile(ownerAuth, mine);
    expect(f.status).toBe(200);
    expect(f.bytes.subarray(0, 5).toString()).toBe('%PDF-');
    expect(f.sha).toBe(crypto.createHash('sha256').update(f.bytes).digest('hex'));
    expect((await docRow(mine)).SignedUrl).toBeDefined();
  });
});
