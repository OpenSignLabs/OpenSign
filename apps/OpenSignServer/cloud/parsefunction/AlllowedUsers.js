export default async function AllowedUsers(request) {
  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  try {
    const extUser = new Parse.Query('contracts_Users');
    extUser.equalTo('UserId', {
      __type: 'Pointer',
      className: '_User',
      objectId: request.user.id,
    });
    const resExtUser = await extUser.first({ useMasterKey: true });
    if (resExtUser) {
      const _resExtUser = JSON.parse(JSON.stringify(resExtUser));
      const subscription = new Parse.Query('contracts_Subscriptions');
      subscription.equalTo('TenantId', {
        __type: 'Pointer',
        className: 'partners_Tenant',
        objectId: _resExtUser.TenantId.objectId,
      });
      subscription.include('ExtUserPtr');
      const resSub = await subscription.first({ useMasterKey: true });
      if (resSub) {
        const _resSub = JSON.parse(JSON.stringify(resSub));
        const count = _resSub?.UsersCount || 0;
        if (count > 0) {
          const allowedUser = resSub.get('AllowedUsers') || 0;
          const remainUsers = allowedUser - count;
          if (remainUsers > 0) {
            return remainUsers;
          } else {
            return 0;
          }
        } else {
          const alloweduser = resSub.get('AllowedUsers') || 0;
          return alloweduser;
        }
      }
    } else {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
    }
  } catch (err) {
    console.log('err in allowedusers', err);
    const code = err?.code || 400;
    const msg = err?.message || 'Something went wrong.';
    throw new Parse.Error(code, msg);
  }
}
