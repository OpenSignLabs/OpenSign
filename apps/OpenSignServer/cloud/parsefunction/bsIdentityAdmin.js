// Users page: BetterSign identities (VLAD -> account links, bs_Identity, see
// utils/bsIdentity.js). Admins only (contracts_Admin / contracts_OrgAdmin).
//
// An admin sees and edits links to accounts in their own tenant, plus the
// unassigned rows (VLADs that tried to sign in and aren't linked yet), and can
// only link a VLAD to an account in their tenant.
//
//   bsidentitylist   {}                                   -> { identities, accounts }
//   bsidentitysave   { id?, vlad?, userId?, label?, active? } -> identity
//   bsidentitydelete { id }                               -> { ok: true }
//
// userId: null unassigns the VLAD (which also turns it off).

import { VLAD_HEX_RE } from '../../utils/bsIdentity.js';

const ADMIN_ROLES = ['contracts_Admin', 'contracts_OrgAdmin'];
const MAX_LABEL = 100;

const forbidden = () => new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Unauthorized.');
const userPtr = id => ({ __type: 'Pointer', className: '_User', objectId: id });

// The caller's tenant, and its accounts: { userId: { userId, name, email } }.
async function adminScope(request) {
  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  const callerQuery = new Parse.Query('contracts_Users');
  callerQuery.equalTo('UserId', userPtr(request.user.id));
  callerQuery.notEqualTo('IsDisabled', true);
  const caller = await callerQuery.first({ useMasterKey: true });
  const tenantId = caller?.get('TenantId')?.id;
  if (!caller || !ADMIN_ROLES.includes(caller.get('UserRole')) || !tenantId) throw forbidden();

  const usersQuery = new Parse.Query('contracts_Users');
  usersQuery.equalTo('TenantId', {
    __type: 'Pointer',
    className: 'partners_Tenant',
    objectId: tenantId,
  });
  const extUsers = await usersQuery.findAll({ useMasterKey: true });
  const accounts = {};
  for (const ext of extUsers) {
    const userId = ext.get('UserId')?.id;
    if (!userId) continue;
    accounts[userId] = { userId, name: ext.get('Name') || '', email: ext.get('Email') || '' };
  }
  return { accounts };
}

const visible = (row, accounts) => {
  const userId = row.get('UserId')?.id;
  return !userId || !!accounts[userId];
};

const toJson = row => ({
  id: row.id,
  vlad: row.get('vlad'),
  label: row.get('Label') || '',
  active: row.get('Active') === true,
  userId: row.get('UserId')?.id || null,
  lastSeenAt: row.get('LastSeenAt')?.toISOString() || null,
  createdAt: row.createdAt?.toISOString() || null,
});

async function rowFor(id, accounts) {
  if (typeof id !== 'string' || !id) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Missing id.');
  }
  const row = await new Parse.Query('bs_Identity')
    .get(id, { useMasterKey: true })
    .catch(() => null);
  if (!row || !visible(row, accounts)) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Identity not found.');
  }
  return row;
}

export async function listBsIdentities(request) {
  const { accounts } = await adminScope(request);
  const rows = await new Parse.Query('bs_Identity').findAll({ useMasterKey: true });
  rows.sort((a, b) => b.createdAt - a.createdAt);
  return {
    identities: rows.filter(r => visible(r, accounts)).map(toJson),
    accounts: Object.values(accounts).sort((a, b) => a.email.localeCompare(b.email)),
  };
}

export async function saveBsIdentity(request) {
  const { accounts } = await adminScope(request);
  const p = request.params || {};
  let row;
  if (p.id) {
    row = await rowFor(p.id, accounts);
  } else {
    const vlad = String(p.vlad || '')
      .trim()
      .toLowerCase();
    if (!VLAD_HEX_RE.test(vlad) || vlad.length < 64 || vlad.length > 8192 || vlad.length % 2) {
      throw new Parse.Error(Parse.Error.VALIDATION_ERROR, 'Enter the VLAD in hex.');
    }
    row = new Parse.Object('bs_Identity');
    row.set('vlad', vlad);
    row.set('Active', false);
    row.setACL(new Parse.ACL());
  }

  if ('userId' in p) {
    if (p.userId === null || p.userId === '') {
      row.unset('UserId');
      row.set('Active', false);
    } else if (typeof p.userId === 'string' && accounts[p.userId]) {
      row.set('UserId', Parse.User.createWithoutData(p.userId));
    } else {
      throw forbidden();
    }
  }
  if ('label' in p)
    row.set(
      'Label',
      String(p.label ?? '')
        .trim()
        .slice(0, MAX_LABEL)
    );
  if ('active' in p) row.set('Active', p.active === true);

  await row.save(null, { useMasterKey: true });
  console.log(
    JSON.stringify({
      event: 'bsidentity_saved',
      by: request.user.id,
      id: row.id,
      vlad: row.get('vlad').slice(0, 16),
      userId: row.get('UserId')?.id || null,
      active: row.get('Active') === true,
    })
  );
  return toJson(row);
}

export async function deleteBsIdentity(request) {
  const { accounts } = await adminScope(request);
  const row = await rowFor(request.params?.id, accounts);
  await row.destroy({ useMasterKey: true });
  console.log(JSON.stringify({ event: 'bsidentity_deleted', by: request.user.id, id: row.id }));
  return { ok: true };
}
