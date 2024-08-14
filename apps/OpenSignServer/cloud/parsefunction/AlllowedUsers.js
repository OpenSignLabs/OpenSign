export default async function AllowedUsers(request) {
  const tenantId = request.params.tenantId;
  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  try {
    const subscription = new Parse.Query('contracts_Subscriptions');
    subscription.equalTo('TenantId', {
      __type: 'Pointer',
      className: 'partners_Tenant',
      objectId: tenantId,
    });
    subscription.include('ExtUserPtr');
    const resSub = await subscription.first({ useMasterKey: true });
    if (resSub) {
      const _resSub = JSON.parse(JSON.stringify(resSub));
      const userCls = new Parse.Query('contracts_Users');
      userCls.equalTo('OrganizationId', {
        __type: 'Pointer',
        className: 'contracts_Organizations',
        objectId: _resSub.ExtUserPtr.OrganizationId.objectId,
      });
      userCls.notEqualTo('IsDisabled', true);
      const count = await userCls.count({ useMasterKey: true });
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
  } catch (err) {
    console.log('err in allowedusers', err);
    const code = err?.code || 400;
    const msg = err?.message || 'Something went wrong.';
    throw new Parse.Error(code, msg);
  }
}
