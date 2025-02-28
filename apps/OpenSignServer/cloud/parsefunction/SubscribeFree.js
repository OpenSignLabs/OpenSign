export default async function SubscribeFree(request) {
  const userId = request.params.userId;
  const userPtr = { __type: 'Pointer', className: '_User', objectId: userId };
  try {
    const extQuery = new Parse.Query('contracts_Users');
    extQuery.equalTo('UserId', userPtr);
    const extUser = await extQuery.first({ useMasterKey: true });
    if (extUser) {
      const subscriptionCls = new Parse.Query('contracts_Subscriptions');
      subscriptionCls.equalTo('TenantId', {
        __type: 'Pointer',
        className: 'partners_Tenant',
        objectId: extUser.get('TenantId').id,
      });
      subscriptionCls.descending('createdAt');
      const subcripitions = await subscriptionCls.first({ useMasterKey: true });
      if (subcripitions) {
        if (subcripitions?.get('PlanCode') === 'freeplan') {
          return { status: 'success', result: 'already subscribed!' };
        } else if (subcripitions?.get('Next_billing_date') < new Date()) {
          try {
            const updateSubscription = new Parse.Object('contracts_Subscriptions');
            updateSubscription.id = subcripitions.id;
            updateSubscription.set('PlanCode', 'freeplan');
            updateSubscription.set('AllowedCredits', 0);
            updateSubscription.set('PlanCredits', 0);
            await updateSubscription.save(null, { useMasterKey: true });
            return { status: 'success', result: 'subscribed!' };
          } catch (err) {
            console.log('err ', err);
            return { status: 'error', result: err.message };
          }
        } else if (subcripitions?.get('Next_billing_date') > new Date()) {
          return { status: 'success', result: 'already subscribed!' };
        } else {
          try {
            const updateSubscription = new Parse.Object('contracts_Subscriptions');
            updateSubscription.id = subcripitions.id;
            updateSubscription.set('PlanCode', 'freeplan');
            updateSubscription.set('AllowedCredits', 0);
            updateSubscription.set('PlanCredits', 0);
            await updateSubscription.save(null, { useMasterKey: true });
            return { status: 'success', result: 'subscribed!' };
          } catch (err) {
            console.log('err ', err);
            return { status: 'error', result: err.message };
          }
        }
      } else {
        try {
          const createSubscription = new Parse.Object('contracts_Subscriptions');
          createSubscription.set('PlanCode', 'freeplan');
          createSubscription.set('ExtUserPtr', {
            __type: 'Pointer',
            className: 'contracts_Users',
            objectId: extUser.id,
          });
          createSubscription.set('CreatedBy', {
            __type: 'Pointer',
            className: '_User',
            objectId: extUser.get('UserId').id,
          });
          if (extUser?.get('TenantId')) {
            createSubscription.set('TenantId', {
              __type: 'Pointer',
              className: 'partners_Tenant',
              objectId: extUser.get('TenantId').id,
            });
          }
          createSubscription.set('AllowedCredits', 0);
          createSubscription.set('PlanCredits', 0);
          await createSubscription.save(null, { useMasterKey: true });
          return { status: 'success', result: 'subscribed!' };
        } catch (err) {
          console.log('err ', err);
          return { status: 'error', result: err.message };
        }
      }
    } else {
      return { status: 'error', result: 'User not found!' };
    }
  } catch (err) {
    console.log('err ', err);
    return { status: 'error', result: err.message };
  }
}
