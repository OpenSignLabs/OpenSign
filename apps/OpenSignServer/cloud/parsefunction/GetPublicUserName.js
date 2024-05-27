async function GetPublicUserName(request) {
  try {
    const userName = request.params.userName;
    const userQuery = new Parse.Query('contracts_Users');
    userQuery.equalTo('UserName', userName);
    const res = await userQuery.first({ useMasterKey: true });
    console.log('res', res);
    return res;
  } catch (err) {
    console.log('Err ', err);
    return err;
  }
}
export default GetPublicUserName;
