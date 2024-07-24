export default async function updateTeam(request) {
  const TeamId = request.params.TeamId;
  const IsActive = request.params.IsActive;
  const Name = request.params.Name;
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
    const extUser = JSON.parse(JSON.stringify(resExt));
    if (!extUser) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
    }
    const teamCls = new Parse.Query('contracts_Teams');
    teamCls.equalTo('objectId', TeamId);
    teamCls.equalTo('OrganizationId', {
      __type: 'Pointer',
      className: 'contracts_Organizations',
      objectId: extUser.OrganizationId.objectId,
    });
    const teamRes = await teamCls.first({ useMasterKey: true });
    if (teamRes) {
      const updateteam = new Parse.Object('contracts_Teams');
      updateteam.id = TeamId;
      if (Name) {
        updateteam.set('Name', Name);
      }
      if (IsActive) {
        updateteam.set('IsActive', IsActive);
      }
      const updateTeamRes = await updateteam.save(null, { useMasterKey: true });
      return updateTeamRes;
    } else {
      throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Premission denied.');
    }
  } catch (err) {
    console.log('err in getOrganizations', err);
    const code = err?.code || 400;
    const msg = err?.message || 'Something went wrong.';
    throw new Parse.Error(code, msg);
  }
}
