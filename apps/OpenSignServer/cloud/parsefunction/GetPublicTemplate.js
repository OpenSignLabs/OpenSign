async function GetPublicTemplate(request) {
  try {
    const username = request.params.username;
    if (username) {
      const extUserQuery = new Parse.Query('contracts_Users');
      extUserQuery.equalTo('UserName', username);
      const res = await extUserQuery.first({ useMasterKey: true });
      const userId = res.get('UserId').id;
      if (userId) {
        const templatQuery = new Parse.Query('contracts_Template');
        templatQuery.equalTo('CreatedBy', {
          __type: 'Pointer',
          className: '_User',
          objectId: userId,
        });
        templatQuery.equalTo('IsPublic', true);
        const getTemplate = await templatQuery.find({ useMasterKey: true });
        return getTemplate;
      } else {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Template not found');
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
