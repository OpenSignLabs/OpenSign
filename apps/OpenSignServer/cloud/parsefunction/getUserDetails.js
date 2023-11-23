async function getUserDetails(request) {
  try {
    const userQuery = new Parse.Query('contracts_Users');
    userQuery.equalTo('Email', request.params.email);
    userQuery.include('TenantId');
    userQuery.include('UserId')
    const res = await userQuery.first({ useMasterKey: true });
    return res;
  } catch (err) {
    console.log('Err ', err);
    return err;
  }
}
export default getUserDetails;
