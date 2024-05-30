async function GetPublicUserName(request) {
  try {
    if (!request?.user) {
      throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
    } else {
      const username = request.params.username;
      if (username) {
        const userQuery = new Parse.Query('contracts_Users');
        userQuery.equalTo('UserName', username);
        const res = await userQuery.first({ useMasterKey: true });
        return res;
      } else {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Please provide required parameters!');
      }
    }
  } catch (err) {
    const code = err.code || 400;
    const msg = err.message;
    const error = new Parse.Error(code, msg);
    throw error;
  }
}
export default GetPublicUserName;
