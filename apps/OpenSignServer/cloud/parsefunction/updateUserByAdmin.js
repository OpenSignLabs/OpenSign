// Users page: an admin edits another user's name, phone, role and teams.
// Email can't be changed here: it's also the account's username, and
// documents and contacts find people by it.
//
// Same rules as adduser:
//   - callers are contracts_Admin or contracts_OrgAdmin, in the user's tenant;
//     an OrgAdmin only in their own organization, and not a tenant Admin's row;
//   - roles are OrgAdmin, Editor or User. A tenant Admin's role never
//     changes here, and nobody changes their own role (so an admin can't lock
//     themselves out);
//   - teams must belong to the user's organization.
//
// Params: { extUserId, name?, phone?, role?, teams? (team ids) }
// Returns the contracts_Users row, TeamIds included.

const ROLES = ['OrgAdmin', 'Editor', 'User'];
const MAX_NAME = 100;
const MAX_PHONE = 30;

const forbidden = () => new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Unauthorized.');
const invalid = msg => new Parse.Error(Parse.Error.VALIDATION_ERROR, msg);

export default async function updateUserByAdmin(request) {
  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  const p = request.params || {};
  if (typeof p.extUserId !== 'string' || !p.extUserId) throw invalid('Missing extUserId.');

  const callerQuery = new Parse.Query('contracts_Users');
  callerQuery.equalTo('UserId', {
    __type: 'Pointer',
    className: '_User',
    objectId: request.user.id,
  });
  callerQuery.notEqualTo('IsDisabled', true);
  const caller = await callerQuery.first({ useMasterKey: true });
  const callerRole = caller?.get('UserRole');
  const isAdmin = callerRole === 'contracts_Admin';
  const isOrgAdmin = callerRole === 'contracts_OrgAdmin';
  const callerTenantId = caller?.get('TenantId')?.id;
  if ((!isAdmin && !isOrgAdmin) || !callerTenantId) throw forbidden();

  const target = await new Parse.Query('contracts_Users')
    .get(p.extUserId, { useMasterKey: true })
    .catch(() => null);
  if (!target || target.get('TenantId')?.id !== callerTenantId) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
  }
  const targetOrgId = target.get('OrganizationId')?.id;
  const targetIsAdmin = target.get('UserRole') === 'contracts_Admin';
  const isSelf = target.get('UserId')?.id === request.user.id;
  if (isOrgAdmin && (targetOrgId !== caller.get('OrganizationId')?.id || targetIsAdmin)) {
    throw forbidden();
  }

  const userChanges = {};
  if ('name' in p) {
    const name = String(p.name ?? '').trim();
    if (!name || name.length > MAX_NAME) throw invalid('Enter a name.');
    target.set('Name', name);
    userChanges.name = name;
  }
  if ('phone' in p) {
    const phone = String(p.phone ?? '').trim();
    if (phone.length > MAX_PHONE) throw invalid('That phone number is too long.');
    if (phone) target.set('Phone', phone);
    else target.unset('Phone');
    userChanges.phone = phone;
  }
  if ('role' in p) {
    const role = `contracts_${p.role}`;
    if (role !== target.get('UserRole')) {
      if (!ROLES.includes(p.role)) throw invalid('Invalid role.');
      if (targetIsAdmin || isSelf) throw forbidden();
      target.set('UserRole', role);
    }
  }
  if ('teams' in p) {
    const ids = Array.isArray(p.teams) ? [...new Set(p.teams)] : null;
    if (!ids || ids.length === 0 || ids.some(id => typeof id !== 'string')) {
      throw invalid('Choose at least one team.');
    }
    const teamQuery = new Parse.Query('contracts_Teams');
    teamQuery.containedIn('objectId', ids);
    const teams = await teamQuery.find({ useMasterKey: true });
    if (
      teams.length !== ids.length ||
      teams.some(t => t.get('OrganizationId')?.id !== targetOrgId)
    ) {
      throw forbidden();
    }
    target.set(
      'TeamIds',
      ids.map(id => ({ __type: 'Pointer', className: 'contracts_Teams', objectId: id }))
    );
  }

  await target.save(null, { useMasterKey: true });

  // Keep _User's copy of the name and phone in step.
  const userId = target.get('UserId')?.id;
  if (userId && Object.keys(userChanges).length) {
    const user = Parse.User.createWithoutData(userId);
    if ('name' in userChanges) user.set('name', userChanges.name);
    if ('phone' in userChanges) {
      if (userChanges.phone) user.set('phone', userChanges.phone);
      else user.unset('phone');
    }
    await user.save(null, { useMasterKey: true });
  }

  console.log(
    JSON.stringify({
      event: 'user_updated_by_admin',
      by: request.user.id,
      extUserId: target.id,
      fields: Object.keys(p).filter(k => k !== 'extUserId'),
    })
  );
  const fresh = await new Parse.Query('contracts_Users')
    .include('TeamIds')
    .get(target.id, { useMasterKey: true });
  return JSON.parse(JSON.stringify(fresh));
}
