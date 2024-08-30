async function ExtUserAftersave(request) {
  try {
    if (!request.original) {
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
        updateSub.increment('UsersCount', 1);
        await updateSub.save(null, { useMasterKey: true });
      } else {
        const addSub = new Parse.Object('contracts_Subscriptions');
        addSub.set('UsersCount', 1);
        addSub.set('ExtUserPtr', {
          __type: 'Pointer',
          className: 'contracts_Users',
          objectId: extUser.id,
        });
        addSub.set('CreatedBy', {
          __type: 'Pointer',
          className: '_User',
          objectId: extUser.get('UserId').id,
        });
        addSub.set('TenantId', {
          __type: 'Pointer',
          className: 'partners_Tenant',
          objectId: extUser.get('TenantId').id,
        });
        await addSub.save(null, { useMasterKey: true });
      }
    }
  } catch (err) {
    console.log('err in extuser aftersave', err);
  }
}

export default ExtUserAftersave;
