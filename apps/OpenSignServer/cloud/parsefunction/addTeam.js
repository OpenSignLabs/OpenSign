export default async function addTeam(request) {
  const Name = request.params.Name;
  const ParentId = request.params.ParentId;
  const Ancestors = request.params.Ancestors;
  const ParentPtr = { __type: 'Pointer', className: 'contracts_Teams', objectId: ParentId };
  if (Name) {
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
      teamCls.equalTo('Name', Name);
      teamCls.equalTo('OrganizationId', {
        __type: 'Pointer',
        className: 'contracts_Organizations',
        objectId: extUser.OrganizationId.objectId,
      });
      if (ParentId) {
        teamCls.equalTo('ParentId', ParentPtr);
      }
      const teamRes = await teamCls.first({ useMasterKey: true });
      if (teamRes) {
        throw new Parse.Error(Parse.Error.DUPLICATE_VALUE, 'Team already exists.');
      } else {
        const newteam = new Parse.Object('contracts_Teams');
        newteam.set('Name', Name);
        newteam.set('OrganizationId', {
          __type: 'Pointer',
          className: 'contracts_Organizations',
          objectId: extUser.OrganizationId.objectId,
        });
        if (ParentId) {
          newteam.set('ParentId', ParentPtr);
        }
        if (Ancestors && Ancestors.length > 0) {
          newteam.set('Ancestors', Ancestors);
        }
        newteam.set('IsActive', true);
        const newTeamRes = await newteam.save(null, { useMasterKey: true });
        return newTeamRes;
      }
    } catch (err) {
      console.log('err in getOrganizations', err);
      const code = err?.code || 400;
      const msg = err?.message || 'Something went wrong.';
      throw new Parse.Error(code, msg);
    }
  } else {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Please provide parameters');
  }
}
