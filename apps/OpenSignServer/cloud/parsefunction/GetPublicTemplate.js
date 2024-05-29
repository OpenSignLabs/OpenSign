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
      }
      return { error: "You don't have access of this document!" };
    } else {
      return { error: 'Please provide username!' };
    }
  } catch (err) {
    console.log('error', err);
    return { error: "You don't have access of this document!" };
  }
}
export default GetPublicTemplate;
