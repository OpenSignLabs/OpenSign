export default async function addUser(request) {
  const { phone, name, password, organization, team, tenantId, timezone, role } = request.params;
  const email = request.params?.email?.toLowerCase()?.replace(/\s/g, '');
  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Invalid session token.');
  }
  const currentUser = { __type: 'Pointer', className: '_User', objectId: request.user.id };
  if (name && email && password && organization && team && role && tenantId) {
    try {
      // Derive the caller's tenant/organization/role from the server-side
      // record rather than trusting client-supplied identifiers. This
      // prevents an authenticated low-privileged user from creating an admin
      // or assigning the new user to an arbitrary tenant/organization/team.
      const callerQuery = new Parse.Query('contracts_Users');
      callerQuery.equalTo('UserId', currentUser);
      callerQuery.notEqualTo('IsDisabled', true);
      const callerExtUser = await callerQuery.first({ useMasterKey: true });
      if (!callerExtUser) {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
      }
      const callerRole = callerExtUser.get('UserRole');
      const isAdmin = callerRole === 'contracts_Admin';
      const isOrgAdmin = callerRole === 'contracts_OrgAdmin';
      if (!isAdmin && !isOrgAdmin) {
        throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Unauthorized.');
      }
      const callerTenantId = callerExtUser.get('TenantId')?.id;
      const callerOrgId = callerExtUser.get('OrganizationId')?.id;
      // Enforce tenant-bound writes for all admins and require org scope for OrgAdmin callers.
      if (!callerTenantId || tenantId !== callerTenantId || (isOrgAdmin && !callerOrgId)) {
        throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Unauthorized.');
      }

      // Only allow creating non-admin roles; never allow elevating to a
      // tenant Admin through this endpoint.
      const allowedRoles = ['OrgAdmin', 'Editor', 'User'];
      if (!allowedRoles.includes(role)) {
        throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Invalid role.');
      }

      // Resolve and authorize the target organization within the caller's tenant.
      const targetOrgId = organization.objectId;
      if (!targetOrgId) {
        throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Please provide all required fields.');
      }
      const orgQuery = new Parse.Query('contracts_Organizations');
      const targetOrg = await orgQuery.get(targetOrgId, { useMasterKey: true });
      if (targetOrg.get('TenantId')?.id !== callerTenantId) {
        throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Unauthorized.');
      }
      // An OrgAdmin may only add users to their own organization.
      if (isOrgAdmin && targetOrgId !== callerOrgId) {
        throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Unauthorized.');
      }

      // Authorize the target team belongs to the target organization.
      const teamQuery = new Parse.Query('contracts_Teams');
      const targetTeam = await teamQuery.get(team, { useMasterKey: true });
      if (targetTeam.get('OrganizationId')?.id !== targetOrgId) {
        throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Unauthorized.');
      }

      const extUser = new Parse.Object('contracts_Users');
      extUser.set('Name', name);
      if (phone) {
        extUser.set('Phone', phone);
      }
      extUser.set('Email', email);
      extUser.set('UserRole', `contracts_${role}`);
      extUser.set('TeamIds', [
        {
          __type: 'Pointer',
          className: 'contracts_Teams',
          objectId: team,
        },
      ]);
      extUser.set('OrganizationId', {
        __type: 'Pointer',
        className: 'contracts_Organizations',
        objectId: targetOrgId,
      });
      if (organization.company) {
        extUser.set('Company', organization.company);
      }

      extUser.set('TenantId', {
        __type: 'Pointer',
        className: 'partners_Tenant',
        objectId: callerTenantId,
      });
      if (timezone) {
        extUser.set('Timezone', timezone);
      }
      try {
        const _users = Parse.Object.extend('User');
        const _user = new _users();
        _user.set('name', name);
        _user.set('username', email);
        _user.set('email', email);
        _user.set('password', password);
        if (phone) {
          _user.set('phone', phone);
        }

        const user = await _user.save();
        if (user) {
          extUser.set('CreatedBy', currentUser);

          extUser.set('UserId', user);
          const acl = new Parse.ACL();
          acl.setReadAccess(request.user.id, true);
          acl.setWriteAccess(request.user.id, true);
          acl.setReadAccess(user.id, true);
          acl.setWriteAccess(user.id, true);
          extUser.setACL(acl);
          const extUserRes = await extUser.save();

          const parseData = JSON.parse(JSON.stringify(extUserRes));
          return parseData;
        }
      } catch (err) {
        console.log('err ', err);
        if (err.code === 202) {
          const userQuery = new Parse.Query(Parse.User);
          userQuery.equalTo('email', email);
          const userRes = await userQuery.first({ useMasterKey: true });
          userRes.setPassword(password);
          await userRes.save(null, { useMasterKey: true });
          extUser.set('CreatedBy', currentUser);
          extUser.set('UserId', { __type: 'Pointer', className: '_User', objectId: userRes.id });
          const acl = new Parse.ACL();
          acl.setReadAccess(request.user.id, true);
          acl.setWriteAccess(request.user.id, true);
          acl.setReadAccess(userRes.id, true);
          acl.setWriteAccess(userRes.id, true);

          extUser.setACL(acl);
          const res = await extUser.save();

          const parseData = JSON.parse(JSON.stringify(res));
          return parseData;
        } else {
          throw new Parse.Error(400, err?.message || 'something went wrong');
        }
      }
    } catch (err) {
      console.log('err', err);
      throw new Parse.Error(400, err?.message || 'something went wrong');
    }
  } else {
    throw new Parse.Error(400, 'Please provide all required fields.');
  }
}
