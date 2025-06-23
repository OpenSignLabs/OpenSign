export default async function getUserByOrg(req) {
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
      const extUser = new Parse.Query('contracts_Users');
      extUser.include('TeamIds');
      extUser.equalTo('OrganizationId', orgPtr);
      const userRes = await extUser.first({ useMasterKey: true });
      if (userRes.length > 0) {
        const _userRes = JSON.parse(JSON.stringify(userRes));
        return _userRes;
      } else {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
      }
    } catch (err) {
      console.log('err in getuserlist', err);
      throw err;
    }
  }
}
