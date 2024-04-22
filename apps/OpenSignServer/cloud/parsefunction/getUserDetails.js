async function getUserDetails(request) {
  try {
    const userId = request.params.userId;
    const userQuery = new Parse.Query('contracts_Users');
    userQuery.equalTo('Email', request.params.email);
    userQuery.include('TenantId');
    userQuery.include('UserId');
    userQuery.exclude('google_refresh_token')
    if (userId) {
      userQuery.equalTo('CreatedBy', { __type: 'Pointer', className: '_User', objectId: userId });
    }
    const res = await userQuery.first({ useMasterKey: true });
    return res;
  } catch (err) {
    console.log('Err ', err);
    return err;
  }
}
export default getUserDetails;
