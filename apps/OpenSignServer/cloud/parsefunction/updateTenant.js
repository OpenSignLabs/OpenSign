export default async function updateTenant(request) {
  const { tenantId, details } = request.params;

  if (!tenantId || !details) {
    throw new Parse.Error(400, 'Missing tenantId or details.');
  }

  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'unauthorized');
  }

  // Derive the caller's tenant and role server-side. Never trust the
  // client-supplied tenantId: an authenticated user may only update their own
  // tenant and must hold an admin role to do so.
  const callerQuery = new Parse.Query('contracts_Users');
  callerQuery.equalTo('UserId', {
    __type: 'Pointer',
    className: '_User',
    objectId: request.user.id,
  });
  callerQuery.notEqualTo('IsDisabled', true);
  const callerExtUser = await callerQuery.first({ useMasterKey: true });
  if (!callerExtUser) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
  }
  const callerRole = callerExtUser.get('UserRole');
  if (callerRole !== 'contracts_Admin' && callerRole !== 'contracts_OrgAdmin') {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Unauthorized.');
  }
  const callerTenantId = callerExtUser.get('TenantId')?.id;
  if (!callerTenantId || callerTenantId !== tenantId) {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Unauthorized.');
  }

  const validKeys = ['CompletionBody', 'CompletionSubject', 'RequestBody', 'RequestSubject'];
  try {
    const tenant = new Parse.Object('partners_Tenant');
    tenant.id = tenantId;
    // Update tenant details
    Object.keys(details).forEach(key => {
      if (validKeys.includes(key)) {
        if (details?.[key] !== undefined) {
          tenant.set(key, details?.[key]);
        } else {
          tenant.unset(key);
        }
      }
    });
    if (details?.EmailEditorType) tenant.set('EmailEditorType', details.EmailEditorType);

    const tenantRes = await tenant.save(null, { useMasterKey: true });
    if (tenantRes) {
      const res = JSON.parse(JSON.stringify(tenantRes));
      return res;
    }
  } catch (error) {
    throw error;
  }
}
