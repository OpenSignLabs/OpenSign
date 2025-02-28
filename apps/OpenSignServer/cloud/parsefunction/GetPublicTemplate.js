async function GetPublicTemplate(request) {
  try {
    const username = request.params.username;
    if (username) {
      const extUserQuery = new Parse.Query('contracts_Users');
      extUserQuery.equalTo('UserName', username);
      const userRes = await extUserQuery.first({ useMasterKey: true });
      const userId = userRes.get('UserId').id;

      //get _user details
      const userQuery = new Parse.Query(Parse.User);
      const user = await userQuery.get(userId, { useMasterKey: true });
      if (userId) {
        const templatQuery = new Parse.Query('contracts_Template');
        templatQuery.equalTo('CreatedBy', {
          __type: 'Pointer',
          className: '_User',
          objectId: userId,
        });
        templatQuery.descending('updatedAt');
        templatQuery.equalTo('IsPublic', true);
        templatQuery.notEqualTo('IsArchive', true);
        templatQuery.include('ExtUserPtr.TenantId');
        const getTemplate = await templatQuery.find({ useMasterKey: true });
        const extcls = new Parse.Query('contracts_Users');
        extcls.equalTo('Email', user.get('email'));
        const res = await extcls.first({ useMasterKey: true });
        if (res) {
          const _res = JSON.parse(JSON.stringify(res));
          return {
            template: getTemplate,
            user: user,
            extend_User: { Tagline: _res?.Tagline || '', SearchIndex: _res?.SearchIndex || '' },
          };
        } else {
          throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Template not found');
        }
      } else {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User does not exist');
      }
    } else {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Please provide required parameters!');
    }
  } catch (err) {
    const code = err.code || 400;
    const msg = err.message;
    const error = new Parse.Error(code, msg);
    throw error;
  }
}
export default GetPublicTemplate;
