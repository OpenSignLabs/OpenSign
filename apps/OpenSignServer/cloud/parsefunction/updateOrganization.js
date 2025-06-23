export default async function updateOrganization(request) {
  const orgId = request.params.orgId;
  const isactive = request.params.isactive;
  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  try {
    const orgQuery = new Parse.Query('contracts_Organizations');
    orgQuery.equalTo('objectId', orgId);
    orgQuery.equalTo('CreatedBy', {
      __type: 'Pointer',
      className: '_User',
      objectId: request.user.id,
    });
    const resOrg = await orgQuery.first({ useMasterKey: true });
    if (resOrg) {
      const newOrg = new Parse.Object('contracts_Organizations');
      newOrg.id = orgId;
      newOrg.set('IsActive', isactive);
      const newResOrg = await newOrg.save(null, { useMasterKey: true });
      if (newResOrg) {
        return newResOrg;
      }
    } else {
      throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Premission denied.');
    }
  } catch (err) {
    console.log('err in addorganization', err);
    const code = err?.code || 400;
    const msg = err?.message || 'Something went wrong.';
    throw new Parse.Error(code, msg);
  }
}
