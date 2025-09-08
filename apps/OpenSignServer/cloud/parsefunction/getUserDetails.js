async function getUserDetails(request) {
  const reqEmail = request.params.email;
  if (reqEmail || request.user) {
    try {
      const userId = request.params.userId;
      const userQuery = new Parse.Query('contracts_Users');
      if (reqEmail) {
        userQuery.equalTo('Email', reqEmail);
      } else {
        const email = request.user.get('email');
        userQuery.equalTo('Email', email);
      }
      userQuery.include('TenantId');
      userQuery.include('UserId');
      userQuery.include('CreatedBy');
      userQuery.exclude('CreatedBy.authData');
      userQuery.exclude('TenantId.FileAdapters');
      userQuery.exclude('google_refresh_token');
      userQuery.exclude('TenantId.PfxFile');
      if (userId) {
        userQuery.equalTo('CreatedBy', { __type: 'Pointer', className: '_User', objectId: userId });
      }
      const res = await userQuery.first({ useMasterKey: true });
      if (res) {
        if (reqEmail) {
          return { objectId: res.id };
        } else {
          return res;
        }
      } else {
        return '';
      }
    } catch (err) {
      console.log('Err ', err);
      const code = err?.code || 400;
      const msg = err?.message || 'Something went wrong.';
      throw new Parse.Error(code, msg);
    }
  } else {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
}
export default getUserDetails;
