export default async function addOrganization(request) {
  const name = request.params.name;

  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  try {
    const extUserQuery = new Parse.Query('contracts_Users');
    extUserQuery.equalTo('UserId', {
      __type: 'Pointer',
      className: '_User',
      objectId: request.user.id,
    });
    extUserQuery.notEqualTo('IsDisabled', true);
    const resExt = await extUserQuery.first({ useMasterKey: true });
    if (!resExt) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
    }
    const _resExt = JSON.parse(JSON.stringify(resExt));

    const orgQuery = new Parse.Query('contracts_Organizations');
    orgQuery.equalTo('Name', name);
    orgQuery.equalTo('CreatedBy', {
      __type: 'Pointer',
      className: '_User',
      objectId: request.user.id,
    });
    const resOrg = await orgQuery.first({ useMasterKey: true });
    if (resOrg) {
      throw new Parse.Error(Parse.Error.DUPLICATE_VALUE, 'Organization already exists.');
    } else {
      const newOrg = new Parse.Object('contracts_Organizations');
      newOrg.set('Name', name);
      newOrg.set('IsActive', true);
      newOrg.set('CreatedBy', {
        __type: 'Pointer',
        className: '_User',
        objectId: request.user.id,
      });
      newOrg.set('TenantId', {
        __type: 'Pointer',
        className: 'partners_Tenant',
        objectId: _resExt.TenantId.objectId,
      });
      newOrg.set('ExtUserId', {
        __type: 'Pointer',
        className: 'contracts_Users',
        objectId: resExt.id,
      });
      const newResOrg = await newOrg.save(null, { useMasterKey: true });
      if (newResOrg) {
        return newResOrg;
      }
    }
  } catch (err) {
    console.log('err in addorganization', err);
    const code = err?.code || 400;
    const msg = err?.message || 'Something went wrong.';
    throw new Parse.Error(code, msg);
  }
}
