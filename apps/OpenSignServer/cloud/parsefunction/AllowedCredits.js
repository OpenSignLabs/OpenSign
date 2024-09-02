export default async function AllowedCredits(request) {
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
        const AllowedCredits = _resSub?.AllowedCredits || 0;
        const AddonCredits = _resSub?.AddonCredits || 0;
        return { allowedcredits: AllowedCredits, addoncredits: AddonCredits };
      }
    } else {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
    }
  } catch (err) {
    console.log('err in allowedCredits', err);
    const code = err?.code || 400;
    const msg = err?.message || 'Something went wrong.';
    throw new Parse.Error(code, msg);
  }
}
