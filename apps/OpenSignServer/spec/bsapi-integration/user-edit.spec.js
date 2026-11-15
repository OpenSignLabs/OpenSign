// Users page: an admin edits a user (cloud/parsefunction/updateUserByAdmin.js).
import { MASTER, PARSE, mkMember, mkTenant, ptr, req, tag } from './support/lib.js';

const mk = async (className, body) =>
  (await req('POST', `${PARSE}/classes/${className}`, { headers: MASTER, body })).json.objectId;
const get = async (className, id) =>
  (await req('GET', `${PARSE}/classes/${className}/${id}`, { headers: MASTER })).json;
const edit = (who, body) =>
  req('POST', `${PARSE}/functions/updateuserbyadmin`, { headers: who.session, body });

describe('Users page: editing a user', () => {
  let tenant;
  let org;
  let otherOrg;
  let teamA;
  let teamB;
  let otherTeam;
  let admin;
  let orgAdmin;
  let user;
  let otherOrgUser;
  let outsider;

  beforeAll(async () => {
    tenant = await mkTenant();
    org = await mk('contracts_Organizations', {
      Name: 'Org',
      TenantId: ptr('partners_Tenant', tenant),
    });
    otherOrg = await mk('contracts_Organizations', {
      Name: 'Other',
      TenantId: ptr('partners_Tenant', tenant),
    });
    const team = (name, orgId) =>
      mk('contracts_Teams', {
        Name: name,
        IsActive: true,
        OrganizationId: ptr('contracts_Organizations', orgId),
      });
    teamA = await team('All Users', org);
    teamB = await team('Sales', org);
    otherTeam = await team('All Users', otherOrg);
    const inOrg = (orgId, teamId) => ({
      OrganizationId: ptr('contracts_Organizations', orgId),
      TeamIds: [ptr('contracts_Teams', teamId)],
    });
    admin = await mkMember(tenant, 'contracts_Admin', inOrg(org, teamA));
    orgAdmin = await mkMember(tenant, 'contracts_OrgAdmin', inOrg(org, teamA));
    user = await mkMember(tenant, 'contracts_User', inOrg(org, teamA));
    otherOrgUser = await mkMember(tenant, 'contracts_User', inOrg(otherOrg, otherTeam));
    outsider = await mkMember(await mkTenant(), 'contracts_Admin');
  });

  it('updates name, phone, role and teams, and _User with them', async () => {
    const r = await edit(admin, {
      extUserId: user.extId,
      name: '  Bob Builder ',
      phone: '+1 555 0100',
      role: 'Editor',
      teams: [teamA, teamB],
    });
    expect(r.status).toBe(200);
    expect(r.json.result.Name).toBe('Bob Builder');
    expect(r.json.result.UserRole).toBe('contracts_Editor');
    expect(r.json.result.TeamIds.map(t => t.Name).sort()).toEqual(['All Users', 'Sales']);
    const u = await get('_User', user.userId);
    expect(u.name).toBe('Bob Builder');
    expect(u.phone).toBe('+1 555 0100');

    expect((await edit(admin, { extUserId: user.extId, phone: '' })).status).toBe(200);
    expect((await get('contracts_Users', user.extId)).Phone).toBeUndefined();
    expect((await get('_User', user.userId)).phone).toBeUndefined();
  });

  it("doesn't change the email", async () => {
    const r = await edit(admin, { extUserId: user.extId, email: `new-${tag()}@example.com` });
    expect(r.status).toBe(200);
    expect((await get('contracts_Users', user.extId)).Email).toBe(user.email);
    expect((await get('_User', user.userId)).username).toBe(user.email);
  });

  it('is for admins of the same tenant only', async () => {
    const asUser = await edit(user, { extUserId: orgAdmin.extId, name: 'x' });
    expect(asUser.json.code).toBe(119);
    const asOutsider = await edit(outsider, { extUserId: user.extId, name: 'x' });
    expect(asOutsider.json.code).toBe(101);
  });

  it('keeps an OrgAdmin to their own organization, and off the tenant Admin', async () => {
    expect((await edit(orgAdmin, { extUserId: user.extId, name: 'Ok' })).status).toBe(200);
    expect((await edit(orgAdmin, { extUserId: otherOrgUser.extId, name: 'x' })).json.code).toBe(
      119
    );
    expect((await edit(orgAdmin, { extUserId: admin.extId, name: 'x' })).json.code).toBe(119);
  });

  it("won't make an Admin, change an Admin's role, or change your own role", async () => {
    expect((await edit(admin, { extUserId: user.extId, role: 'Admin' })).json.code).toBe(142);
    const self = await edit(admin, { extUserId: admin.extId, role: 'User' });
    expect(self.json.code).toBe(119);
    const ownOrgAdmin = await edit(orgAdmin, { extUserId: orgAdmin.extId, role: 'User' });
    expect(ownOrgAdmin.json.code).toBe(119);
    // Unchanged role is fine (the form always sends it).
    expect((await edit(admin, { extUserId: admin.extId, role: 'Admin', name: 'Me' })).status).toBe(
      200
    );
    expect((await get('contracts_Users', admin.extId)).UserRole).toBe('contracts_Admin');
  });

  it("only takes teams from the user's organization, and at least one", async () => {
    expect((await edit(admin, { extUserId: user.extId, teams: [otherTeam] })).json.code).toBe(119);
    expect((await edit(admin, { extUserId: user.extId, teams: [] })).json.code).toBe(142);
    expect((await edit(admin, { extUserId: user.extId, name: '' })).json.code).toBe(142);
  });
});
