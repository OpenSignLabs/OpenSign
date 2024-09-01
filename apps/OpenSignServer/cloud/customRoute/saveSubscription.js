import { planCredits } from '../../Utils.js';

export default async function saveSubscription(request, response) {
  const SubscriptionId = request.body?.data?.subscription?.subscription_id;
  const body = request.body;
  const Email = request.body.data?.subscription?.customer?.email;
  const Next_billing_date = request.body?.data?.subscription?.next_billing_at;
  const planCode = request.body?.data?.subscription?.plan?.plan_code;
  const addons = request.body?.data?.subscription?.addons || [];
  const credits = planCredits?.[planCode] || 0;
  let existAddon = 0;
  if (addons?.length > 0) {
    let allowedUsersMonthly = 0;
    let allowedUsersYearly = 0;
    addons?.forEach(item => {
      if (item.addon_code === 'extra-teams-users-monthly') {
        allowedUsersMonthly += item.quantity;
      } else if (item.addon_code === 'extra-teams-users-yearly') {
        allowedUsersYearly += item.quantity;
      } else if (item.addon_code === 'extra-users') {
        allowedUsersMonthly += item.quantity;
      }
    });
    if (allowedUsersMonthly > 0 || allowedUsersYearly > 0) {
      existAddon = allowedUsersMonthly + allowedUsersYearly + 1;
    }
  } else {
    if (planCode === 'teams-yearly' || planCode === 'teams-monthly' || planCode === 'team-weekly') {
      existAddon = 1;
    }
  }
  try {
    const extUserCls = new Parse.Query('contracts_Users');
    extUserCls.equalTo('Email', Email);
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
        if (Next_billing_date) {
          updateSubscription.set('Next_billing_date', new Date(Next_billing_date));
        } else {
          updateSubscription.unset('Next_billing_date');
        }
        updateSubscription.set('PlanCode', planCode);
        if (existAddon > 0) {
          updateSubscription.set('AllowedUsers', parseInt(existAddon));
        }
        if (credits > 0) {
          updateSubscription.set('AllowedCredits', credits);
        }
        await updateSubscription.save(null, { useMasterKey: true });
        return response.status(200).json({ status: 'update subscription!' });
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
        if (Next_billing_date) {
          createSubscription.set('Next_billing_date', new Date(Next_billing_date));
        } else {
          createSubscription.unset('Next_billing_date');
        }
        createSubscription.set('PlanCode', planCode);
        if (existAddon > 0) {
          createSubscription.set('AllowedUsers', parseInt(existAddon));
        }
        if (credits > 0) {
          createSubscription.set('AllowedCredits', credits);
        }
        await createSubscription.save(null, { useMasterKey: true });
        return response.status(200).json({ status: 'create subscription!' });
      }
    } else {
      return response.status(404).json({ status: 'user not found!' });
    }
  } catch (err) {
    console.log('Err in save subscription', err);
    return response.status(400).json({ status: 'error:' + err.message });
  }
}
