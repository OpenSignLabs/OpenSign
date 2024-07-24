export default async function getOrganizations(request) {
  const limit = request.params.limit || 200;
  const skip = request.params.skip || 0;
  const extUserId = request.params.extUserId;
  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  try {
    const orgQuery = new Parse.Query('contracts_Organizations');
    orgQuery.equalTo('CreatedBy', {
      __type: 'Pointer',
      className: '_User',
      objectId: request.user.id,
    });
    orgQuery.equalTo('ExtUserId', {
      __type: 'Pointer',
      className: 'contracts_Users',
      objectId: extUserId,
    });
    orgQuery.equalTo('IsActive', true);
    orgQuery.exclude('ExtUserId');
    orgQuery.limit(limit);
    orgQuery.skip(skip);
    const resOrg = await orgQuery.find({ useMasterKey: true });
    if (resOrg && resOrg.length > 0) {
      return resOrg;
    } else {
      return [];
    }
  } catch (err) {
    console.log('err in getOrganizations', err);
    const code = err?.code || 400;
    const msg = err?.message || 'Something went wrong.';
    throw new Parse.Error(code, msg);
  }
}
