async function addDepartmentAndOrg(extUser) {
  try {
    const orgCls = new Parse.Object('contracts_Organizations');
    orgCls.set('Name', extUser.Company);
    orgCls.set('IsActive', true);
    const orgRes = await orgCls.save(null, { useMasterKey: true });
    const departmentCls = new Parse.Object('contracts_Departments');
    departmentCls.set('Name', 'All Users');
    departmentCls.set('OrganizationId', {
      __type: 'Pointer',
      className: 'contracts_Organizations',
      objectId: orgRes.id,
    });
    departmentCls.set('IsActive', true);
    const departmentRes = await departmentCls.save(null, { useMasterKey: true });
    const updateUser = new Parse.Object('contracts_Users');
    updateUser.id = extUser.objectId;
    updateUser.set('UserRole', 'contracts_Admin');
    updateUser.set('OrganizationId', {
      __type: 'Pointer',
      className: 'contracts_Organizations',
      objectId: orgRes.id,
    });
    updateUser.set('DepartmentIds', [
      {
        __type: 'Pointer',
        className: 'contracts_Departments',
        objectId: departmentRes.id,
      },
    ]);
    const extUserRes = await updateUser.save(null, { useMasterKey: true });
  } catch (err) {
    console.log('err in add department, role, org', err);
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
          if (extUser?.UserRole !== 'contracts_Admin') {
            await addDepartmentAndOrg(extUser);
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
          if (extUser?.UserRole !== 'contracts_Admin') {
            await addDepartmentAndOrg(extUser);
          }
        }
      }
    } catch (err) {
      console.log('Err in subscriptionaftersave', err);
    }
  }
}
