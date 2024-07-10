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
        const getTemplate = await templatQuery.find({ useMasterKey: true });

        const extend_Res = await Parse.Cloud.run('getUserDetails', {
          email: user.get('email'),
        });
        if (extend_Res) {
          return { template: getTemplate, user: user, extend_User: extend_Res };
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
