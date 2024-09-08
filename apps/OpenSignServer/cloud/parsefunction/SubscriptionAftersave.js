async function addTeamAndOrg(extUser) {
  try {
    const orgCls = new Parse.Object('contracts_Organizations');
    orgCls.set('Name', extUser.Company);
    orgCls.set('IsActive', true);
    orgCls.set('ExtUserId', {
      __type: 'Pointer',
      className: 'contracts_Users',
      objectId: extUser?.objectId,
    });
    orgCls.set('CreatedBy', {
      __type: 'Pointer',
      className: '_User',
      objectId: extUser?.UserId?.objectId,
    });
    orgCls.set('TenantId', {
      __type: 'Pointer',
      className: 'partners_Tenant',
      objectId: extUser?.TenantId?.objectId,
    });

    const orgRes = await orgCls.save(null, { useMasterKey: true });
    const teamCls = new Parse.Object('contracts_Teams');
    teamCls.set('Name', 'All Users');
    teamCls.set('OrganizationId', {
      __type: 'Pointer',
      className: 'contracts_Organizations',
      objectId: orgRes.id,
    });
    teamCls.set('IsActive', true);
    const teamRes = await teamCls.save(null, { useMasterKey: true });
    const updateUser = new Parse.Object('contracts_Users');
    updateUser.id = extUser.objectId;
    updateUser.set('UserRole', 'contracts_Admin');
    updateUser.set('OrganizationId', {
      __type: 'Pointer',
      className: 'contracts_Organizations',
      objectId: orgRes.id,
    });
    updateUser.set('TeamIds', [
      {
        __type: 'Pointer',
        className: 'contracts_Teams',
        objectId: teamRes.id,
      },
    ]);
    const extUserRes = await updateUser.save(null, { useMasterKey: true });
  } catch (err) {
    console.log('err in add team, role, org', err);
  }
}

export default async function SubscriptionAftersave(request) {
  const oldObj = request.original;
  if (!oldObj) {
    try {
      const subscription = new Parse.Query('contracts_Subscriptions');
      subscription.include('CreatedBy');
      const res = await subscription.get(request.object.id, { useMasterKey: true });
      const _res = JSON.parse(JSON.stringify(res));
      const user = _res.CreatedBy?.email;
      if (user) {
        const extUserQuery = new Parse.Query('contracts_Users');
        extUserQuery.equalTo('Email', user);
        const extUserRes = await extUserQuery.first({ useMasterKey: true });
        if (extUserRes) {
          const extUser = JSON.parse(JSON.stringify(extUserRes));
          if (!extUser?.OrganizationId) {
            await addTeamAndOrg(extUser);
          }
        }
      }
    } catch (err) {
      console.log('Err in subscriptionaftersave', err);
    }
  } else {
    try {
      const subscription = new Parse.Query('contracts_Subscriptions');
      subscription.include('CreatedBy');
      const res = await subscription.get(request.object.id, { useMasterKey: true });
      const _res = JSON.parse(JSON.stringify(res));
      const user = _res.CreatedBy?.email;
      if (user) {
        const extUserQuery = new Parse.Query('contracts_Users');
        extUserQuery.equalTo('Email', user);
        const extUserRes = await extUserQuery.first({ useMasterKey: true });
        if (extUserRes) {
          const extUser = JSON.parse(JSON.stringify(extUserRes));
          if (!extUser?.OrganizationId) {
            await addTeamAndOrg(extUser);
          }
        }
      }
    } catch (err) {
      console.log('Err in subscriptionaftersave', err);
    }
  }
}
