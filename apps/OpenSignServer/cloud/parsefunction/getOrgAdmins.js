export default async function getOrgAdmins(req) {
  if (!req?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  } else {
    try {
      const extUser = new Parse.Query('contracts_Users');
      extUser.equalTo('UserRole', 'contracts_OrgAdmin');
      extUser.equalTo('CreatedBy', req?.user);
      extUser.notEqualTo('UserId', req?.user);
      extUser.include('TeamIds,OrganizationId');
      extUser.descending('createdAt');
      const userRes = await extUser.find({ useMasterKey: true });
      if (userRes.length > 0) {
        const _userRes = JSON.parse(JSON.stringify(userRes));
        return _userRes;
      } else {
        return [];
      }
    } catch (err) {
      console.log('err in getOrgAdmins', err);
      throw err;
    }
  }
}
