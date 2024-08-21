async function ExtUserAfterdelete(request) {
  try {
    const extUser = request.object;
    const tenantId = extUser.get('TenantId')?.id;
    const subscription = new Parse.Query('contracts_Subscriptions');
    subscription.equalTo('TenantId', {
      __type: 'Pointer',
      className: 'partners_Tenant',
      objectId: tenantId,
    });
    const resSub = await subscription.first({ useMasterKey: true });
    if (resSub) {
      const updateSub = new Parse.Object('contracts_Subscriptions');
      updateSub.id = resSub.id;
      if (resSub?.get('UsersCount') > 0) {
        updateSub.decrement('UsersCount', 1);
      } else {
        updateSub.decrement('UsersCount', 0);
      }
      updateSub.save(null, { useMasterKey: true });
    } else {
      const addSub = new Parse.Object('contracts_Subscriptions');
      addSub.set('UsersCount', 0);
      addSub.save(null, { useMasterKey: true });
    }
  } catch (err) {
    console.log('err in extuser afterdelete', err);
  }
}

export default ExtUserAfterdelete;
