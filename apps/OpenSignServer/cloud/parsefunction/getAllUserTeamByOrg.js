export default async function getAllUserTeamByOrg(request) {
  const OrgId = request.params.orgId;
  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  try {
    const teamCls = new Parse.Query('contracts_Teams');
    teamCls.equalTo('OrganizationId', {
      __type: 'Pointer',
      className: 'contracts_Organizations',
      objectId: OrgId,
    });
    teamCls.equalTo('IsActive', true);
    const teamRes = await teamCls.first({ useMasterKey: true });
    if (teamRes) {
      return teamRes;
    } else {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Team not found.');
    }
  } catch (err) {
    console.log('err in getOrganizations', err);
    const code = err?.code || 400;
    const msg = err?.message || 'Something went wrong.';
    throw new Parse.Error(code, msg);
  }
}
