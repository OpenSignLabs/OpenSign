// Sign in with BetterSign (cloud/parsefunction/bsidlogin.js) against the mock
// bs-id: linked VLADs get a session; a VLAD without an active link is refused
// and recorded for an admin (utils/bsIdentity.js recordSignInAttempt).
import { MASTER, PARSE, PUBLIC, identity, link, mkUser, ptr, req, tag } from './support/lib.js';
import { bsidLoginParams } from './support/bsid.js';

const bsidlogin = vlad =>
  req('POST', `${PARSE}/functions/bsidlogin`, { headers: PUBLIC, body: bsidLoginParams(vlad) });
const rowsFor = async vlad =>
  (
    await req(
      'GET',
      `${PARSE}/classes/bs_Identity?` + new URLSearchParams({ where: JSON.stringify({ vlad }) }),
      { headers: MASTER }
    )
  ).json.results;

describe('Sign in with BetterSign (bsidlogin)', () => {
  it('signs in a linked VLAD', async () => {
    const id = identity();
    const email = `bsid-${tag()}@example.com`;
    const userId = await mkUser(email);
    await link(id, userId);
    const r = await bsidlogin(id.vlad);
    expect(r.status).toBe(200);
    expect(r.json.result.objectId).toBe(userId);
    expect(r.json.result.email).toBe(email);
    expect(r.json.result.sessionToken).toMatch(/^r:/);
  });

  it('refuses an unlinked VLAD and records it, once', async () => {
    const id = identity();
    const first = await bsidlogin(id.vlad);
    expect(first.json.code).toBe(101); // OBJECT_NOT_FOUND
    expect(first.json.error).toMatch(/isn't linked/);
    const rows = await rowsFor(id.vlad);
    expect(rows.length).toBe(1);
    expect(rows[0]).toEqual(
      jasmine.objectContaining({ Active: false, Label: 'Sign-in attempt', ACL: {} })
    );
    expect(rows[0].UserId).toBeUndefined();
    expect((await bsidlogin(id.vlad)).json.code).toBe(101);
    expect((await rowsFor(id.vlad)).length).toBe(1);
  });

  it('refuses a VLAD whose link is off, and notes the attempt on that link', async () => {
    const id = identity();
    const userId = await mkUser(`off-${tag()}@example.com`);
    await link(id, userId, { Active: false });
    expect((await bsidlogin(id.vlad)).json.code).toBe(101);
    const rows = await rowsFor(id.vlad);
    expect(rows.length).toBe(1);
    expect(rows[0].UserId.objectId).toBe(userId);
    expect(rows[0].LastSeenAt).toBeDefined();
  });

  it("doesn't record a VLAD whose link is broken", async () => {
    const id = identity();
    for (const userId of [
      await mkUser(`amb1-${tag()}@example.com`),
      await mkUser(`amb2-${tag()}@example.com`),
    ]) {
      await Parse.Server.database.create('bs_Identity', {
        objectId: `bsid${tag()}`,
        vlad: id.vlad,
        UserId: ptr('_User', userId),
        Active: true,
      });
    }
    expect((await bsidlogin(id.vlad)).json.code).toBe(101);
    const rows = await rowsFor(id.vlad);
    expect(rows.length).toBe(2);
    expect(rows.every(r => r.LastSeenAt === undefined)).toBe(true);
  });

  it('refuses a token bs-id never issued', async () => {
    const r = await req('POST', `${PARSE}/functions/bsidlogin`, {
      headers: PUBLIC,
      body: { ...bsidLoginParams(identity().vlad), code: 'not-a-code-we-issued' },
    });
    expect(r.json.code).toBe(101);
    expect(r.json.error).toMatch(/sign-in failed/);
  });
});
