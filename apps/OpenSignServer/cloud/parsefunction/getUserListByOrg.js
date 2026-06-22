export default async function getUserListByOrg(req) {
  const OrganizationId = req.params.organizationId;
  const orgPtr = {
    __type: 'Pointer',
    className: 'contracts_Organizations',
    objectId: OrganizationId,
  };
  if (!req?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  } else {
    try {
      if (!OrganizationId) {
        throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Please provide organizationId.');
      }
      // Authorize the requested organization against the caller's server-side
      // tenant/organization. This prevents an authenticated user from
      // enumerating users in an arbitrary organization or tenant.
      const callerQuery = new Parse.Query('contracts_Users');
      callerQuery.equalTo('UserId', {
        __type: 'Pointer',
        className: '_User',
        objectId: req.user.id,
      });
      callerQuery.notEqualTo('IsDisabled', true);
      const callerExtUser = await callerQuery.first({ useMasterKey: true });
      if (!callerExtUser) {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
      }
      const callerTenantId = callerExtUser.get('TenantId')?.id;
      const callerOrgId = callerExtUser.get('OrganizationId')?.id;
      const callerRole = callerExtUser.get('UserRole');
      const isAdmin = callerRole === 'contracts_Admin' || callerRole === 'contracts_OrgAdmin';

      const orgQuery = new Parse.Query('contracts_Organizations');
      const targetOrg = await orgQuery.get(OrganizationId, { useMasterKey: true });
      // Must belong to the caller's tenant.
      if (!callerTenantId || targetOrg.get('TenantId')?.id !== callerTenantId) {
        throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Unauthorized.');
      }
      // Non-admins may only list their own organization.
      if (!isAdmin && OrganizationId !== callerOrgId) {
        throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Unauthorized.');
      }

      const extUser = new Parse.Query('contracts_Users');
      extUser.equalTo('OrganizationId', orgPtr);
      extUser.include('TeamIds');
      extUser.descending('createdAt');
      const userRes = await extUser.find({ useMasterKey: true });
      if (userRes.length > 0) {
        const _userRes = JSON.parse(JSON.stringify(userRes));
        return _userRes;
      } else {
        return [];
      }
    } catch (err) {
      console.log('err in getuserlist', err);
      throw err;
    }
  }
}
