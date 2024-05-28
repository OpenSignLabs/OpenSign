async function GetPublicUserName(request) {
  try {
    const userName = request.params.userName;
    const userQuery = new Parse.Query('contracts_Users');
    userQuery.equalTo('UserName', userName);
    const res = await userQuery.first({ useMasterKey: true });
    return res;
  } catch (err) {
    return err;
  }
}
export default GetPublicUserName;
