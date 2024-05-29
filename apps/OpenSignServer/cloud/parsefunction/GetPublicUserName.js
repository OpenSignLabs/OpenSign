async function GetPublicUserName(request) {
  try {
    const username = request.params.username;
    const userQuery = new Parse.Query('contracts_Users');
    userQuery.equalTo('UserName', username);
    const res = await userQuery.first({ useMasterKey: true });

    return res;
  } catch (err) {
    return err;
  }
}
export default GetPublicUserName;
