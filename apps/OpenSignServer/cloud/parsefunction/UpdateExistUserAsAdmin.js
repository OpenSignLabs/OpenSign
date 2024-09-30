async function updateUserExceptAdmin(data) {
  const Contracts = Parse.Object.extend('contracts_Users');
  let skip = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    const query = new Parse.Query(Contracts);
    query.notEqualTo('Email', data.email);
    query.limit(limit);
    query.skip(skip);

    try {
      // Fetch a batch of entries
      const results = await query.find({ useMasterKey: true });

      // Check if there are more entries to process
      hasMore = results.length === limit;
      skip += results.length;

      // Iterate through each entry and update the userRole field
      for (let i = 0; i < results.length; i++) {
        const contract = results[i];
        contract.set('UserRole', 'contracts_User');
        contract.set('OrganizationId', data.orgPtr);
        contract.set('TeamIds', data.teamIds);
        contract.set('CreatedBy', data.createdBy);
        contract.set('TenantId', data.tenantId);
      }

      // Save all the updated entries
      await Parse.Object.saveAll(results, { useMasterKey: true });
      console.log(`${results.length} user roles updated successfully`);
    } catch (error) {
      console.error('Error while updating user roles:', error);
      hasMore = false; // Stop if there's an error
    }
  }
}

// `UpdateExistUserAsAdmin` is used to create admin from exist user records and transfer to org of admin
export default async function UpdateExistUserAsAdmin(request) {
  const email = request.params.email;
  const masterkey = request.params.masterkey;
  try {
    if (masterkey !== process.env.MASTER_KEY) {
      throw new Parse.Error(404, 'Invalid master key.');
    }
    const extClsQuery = new Parse.Query('contracts_Users');
    extClsQuery.equalTo('UserRole', 'contracts_Admin');
    extClsQuery.notEqualTo('IsDisabled', true);
    const extAdminRes = await extClsQuery.find({ useMasterKey: true });
    if (extAdminRes && extAdminRes.length === 1 && extAdminRes?.[0]?.get('OrganizationId')) {
      throw new Parse.Error(
        Parse.Error.DUPLICATE_VALUE,
        'Admin already exists. Please login to the application using admin credentials in order to manage users.'
      );
    } else {
      const extCls = new Parse.Query('contracts_Users');
      extCls.equalTo('Email', email);
      extCls.notEqualTo('IsDisabled', true);
      const extRes = await extCls.first({ useMasterKey: true });
      console.log('extRes ', extRes);
      if (extRes) {
        const _extRes = JSON.parse(JSON.stringify(extRes));
        const tenantId = {
          __type: 'Pointer',
          className: 'partners_Tenant',
          objectId: _extRes.TenantId.objectId,
        };
        const createdBy = {
          __type: 'Pointer',
          className: '_User',
          objectId: _extRes.UserId.objectId,
        };
        const org = new Parse.Object('contracts_Organizations');
        org.set('Name', _extRes.Company);
        org.set('IsActive', true);
        org.set('TenantId', tenantId);
        org.set('ExtUserId', {
          __type: 'Pointer',
          className: 'contracts_Users',
          objectId: extRes.id,
        });
        org.set('CreatedBy', createdBy);
        const orgRes = await org.save(null, { useMasterKey: true });
        const teamCls = new Parse.Object('contracts_Teams');
        teamCls.set('Name', 'All Users');
        teamCls.set('OrganizationId', {
          __type: 'Pointer',
          className: 'contracts_Organizations',
          objectId: orgRes.id,
        });
        teamCls.set('IsActive', true);
        const teamRes = await teamCls.save(null, { useMasterKey: true });
        const orgPtr = {
          __type: 'Pointer',
          className: 'contracts_Organizations',
          objectId: orgRes.id,
        };
        const teamIds = [
          {
            __type: 'Pointer',
            className: 'contracts_Teams',
            objectId: teamRes.id,
          },
        ];
        const extUser = new Parse.Object('contracts_Users');
        extUser.id = extRes.id;
        extUser.set('UserRole', 'contracts_Admin');
        extUser.set('OrganizationId', orgPtr);
        extUser.set('TeamIds', teamIds);
        const extUserRes = await extUser.save(null, { useMasterKey: true });
        if (extUserRes) {
          const data = {
            orgPtr: orgPtr,
            teamIds: teamIds,
            email: email,
            createdBy: createdBy,
            tenantId: tenantId,
          };
          updateUserExceptAdmin(data);
          return 'admin_created';
        }
      } else {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
      }
    }
  } catch (err) {
    console.log('err in updateExistUserAsAdmin', err);
    const code = err.code || 400;
    const msg = err.message || 'something went wrong.';
    throw new Parse.Error(code, msg);
  }
}
