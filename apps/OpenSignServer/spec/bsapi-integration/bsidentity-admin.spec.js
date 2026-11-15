// Users page: the bsidentity* cloud functions (cloud/parsefunction/bsIdentityAdmin.js).
import {
  MASTER,
  PARSE,
  PUBLIC,
  identity,
  link,
  mkMember,
  mkTenant,
  req,
  signIn,
} from './support/lib.js';
import { verifier } from './support/verifier.js';
import { accountForVlad, recordSignInAttempt } from '../../utils/bsIdentity.js';

const call = (who, fn, body = {}) =>
  req('POST', `${PARSE}/functions/${fn}`, { headers: who.session, body });

describe('Users page: BetterSign identities', () => {
  let tenant;
  let admin;
  let member;
  let outsider;

  beforeAll(async () => {
    tenant = await mkTenant();
    admin = await mkMember(tenant, 'contracts_Admin');
    member = await mkMember(tenant);
    outsider = await mkMember(await mkTenant(), 'contracts_Admin');
  });

  beforeEach(() => {
    verifier.mode = 'ok';
  });

  it('is for admins only', async () => {
    for (const fn of ['bsidentitylist', 'bsidentitysave', 'bsidentitydelete']) {
      const r = await call(member, fn, { id: 'x' });
      expect(r.status).toBe(400);
      expect(r.json.code).toBe(119); // OPERATION_FORBIDDEN
    }
    const anon = await req('POST', `${PARSE}/functions/bsidentitylist`, { headers: PUBLIC });
    expect(anon.json.code).toBe(209); // INVALID_SESSION_TOKEN
  });

  it("lists the tenant's links and the unassigned attempts, not other tenants' links", async () => {
    const mine = identity();
    const theirs = identity();
    const pending = identity();
    await link(mine, member.userId);
    await link(theirs, outsider.userId);
    await recordSignInAttempt(pending.vlad);

    const r = await call(admin, 'bsidentitylist');
    expect(r.status).toBe(200);
    const { identities, accounts } = r.json.result;
    const byVlad = Object.fromEntries(identities.map(i => [i.vlad, i]));
    expect(byVlad[mine.vlad]).toEqual(
      jasmine.objectContaining({ userId: member.userId, active: true })
    );
    expect(byVlad[pending.vlad]).toEqual(
      jasmine.objectContaining({ userId: null, active: false, label: 'Sign-in attempt' })
    );
    expect(byVlad[pending.vlad].lastSeenAt).toBeTruthy();
    expect(byVlad[theirs.vlad]).toBeUndefined();
    expect(accounts.map(a => a.userId).sort()).toEqual([admin.userId, member.userId].sort());
  });

  it('links an attempt to an account and turns it on; the VLAD can then sign in', async () => {
    const id = identity();
    verifier.register(id);
    expect((await signIn(id)).status).toBe(403); // recorded, off
    const row = (await call(admin, 'bsidentitylist')).json.result.identities.find(
      i => i.vlad === id.vlad
    );

    const on = await call(admin, 'bsidentitysave', { id: row.id, active: true });
    expect(on.status).toBe(400); // no account yet
    expect(on.json.code).toBe(142);

    const saved = await call(admin, 'bsidentitysave', {
      id: row.id,
      userId: member.userId,
      label: '  Laptop  ',
      active: true,
    });
    expect(saved.status).toBe(200);
    expect(saved.json.result).toEqual(
      jasmine.objectContaining({ userId: member.userId, active: true, label: 'Laptop' })
    );
    expect((await signIn(id)).status).toBe(200);

    const off = await call(admin, 'bsidentitysave', { id: row.id, active: false });
    expect(off.json.result.active).toBe(false);
    expect((await signIn(id)).status).toBe(403);

    const unassigned = await call(admin, 'bsidentitysave', {
      id: row.id,
      userId: null,
      active: true,
    });
    expect(unassigned.status).toBe(400); // can't be on without an account
    expect((await accountForVlad(id.vlad)).reason).toBe('inactive');
  });

  it('adds a link by VLAD', async () => {
    const id = identity();
    const r = await call(admin, 'bsidentitysave', {
      vlad: id.vlad.toUpperCase(),
      userId: member.userId,
      active: true,
    });
    expect(r.status).toBe(200);
    expect(r.json.result.vlad).toBe(id.vlad);
    expect((await accountForVlad(id.vlad)).user.id).toBe(member.userId);

    const bad = await call(admin, 'bsidentitysave', { vlad: 'not-hex' });
    expect(bad.status).toBe(400);
    expect(bad.json.code).toBe(142);

    const second = await call(admin, 'bsidentitysave', {
      vlad: id.vlad,
      userId: admin.userId,
      active: true,
    });
    expect(second.json.code).toBe(137); // one active link per VLAD
  });

  it("won't link to, edit or delete another tenant's account", async () => {
    const id = identity();
    const toOutsider = await call(admin, 'bsidentitysave', {
      vlad: id.vlad,
      userId: outsider.userId,
    });
    expect(toOutsider.json.code).toBe(119);

    const theirs = (await link(identity(), outsider.userId)).json.objectId;
    for (const [fn, body] of [
      ['bsidentitysave', { id: theirs, active: false }],
      ['bsidentitysave', { id: theirs, userId: null }],
      ['bsidentitydelete', { id: theirs }],
    ]) {
      const r = await call(admin, fn, body);
      expect(r.json.code).toBe(101); // OBJECT_NOT_FOUND
    }
    const row = await req('GET', `${PARSE}/classes/bs_Identity/${theirs}`, { headers: MASTER });
    expect(row.json.Active).toBe(true);
    expect(row.json.UserId.objectId).toBe(outsider.userId);
  });

  it('deletes a link', async () => {
    const id = identity();
    const rowId = (await link(id, member.userId)).json.objectId;
    expect((await call(admin, 'bsidentitydelete', { id: rowId })).status).toBe(200);
    expect((await accountForVlad(id.vlad)).reason).toBe('not_linked');
  });
});
