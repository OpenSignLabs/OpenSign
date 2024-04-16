import axios from 'axios';
export default async function saveSubscriptio(request) {
  const serverUrl = process.env.SERVER_URL;
  const appId = process.env.APP_ID;
  const subscription = request.params.subscription;
  const SubscriptionId = subscription.data.subscription.subscription_id;
  const body = subscription;
  const Next_billing_date = subscription.data.subscription.next_billing_at;
  const planCode = subscription.data.subscription.plan.plan_code;

  try {
    const userRes = await axios.get(serverUrl + '/users/me', {
      headers: {
        'X-Parse-Application-Id': appId,
        'X-Parse-Session-Token': request.headers['sessiontoken'],
      },
    });
    if (userRes.data && userRes.data.objectId) {
      const extUserCls = new Parse.Query('contracts_Users');
      extUserCls.equalTo('UserId', {
        __type: 'Pointer',
        className: '_User',
        objectId: userRes.data.objectId,
      });
      const extUser = await extUserCls.first({ useMasterKey: true });
      if (extUser) {
        const subcriptionCls = new Parse.Query('contracts_Subscriptions');
        subcriptionCls.equalTo('TenantId', {
          __type: 'Pointer',
          className: 'partners_Tenant',
          objectId: extUser.get('TenantId').id,
        });
        const subscription = await subcriptionCls.first({ useMasterKey: true });
        if (subscription) {
          const updateSubscription = new Parse.Object('contracts_Subscriptions');
          updateSubscription.id = subscription.id;
          updateSubscription.set('SubscriptionId', SubscriptionId);
          updateSubscription.set('SubscriptionDetails', body);
          updateSubscription.set('Next_billing_date', new Date(Next_billing_date));
          updateSubscription.set('PlanCode', planCode);
          await updateSubscription.save(null, { useMasterKey: true });
          return { status: 'update subscription!' };
        } else {
          const createSubscription = new Parse.Object('contracts_Subscriptions');
          createSubscription.set('SubscriptionId', SubscriptionId);
          createSubscription.set('SubscriptionDetails', body);
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
          createSubscription.set('TenantId', {
            __type: 'Pointer',
            className: 'partners_Tenant',
            objectId: extUser.get('TenantId').id,
          });
          createSubscription.set('Next_billing_date', new Date(Next_billing_date));
          createSubscription.set('PlanCode', planCode);
          await createSubscription.save(null, { useMasterKey: true });
          return { status: 'create subscription!' };
        }
      } else {
        return { status: 'user not found!' };
      }
    } else {
      return { status: 'user not found!' };
    }
  } catch (err) {
    console.log('Err in save subscription', err);
    throw new Error(err.message);
  }
}
