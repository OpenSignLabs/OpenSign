import { planCredits } from '../../Utils.js';

export default async function saveSubscription(request, response) {
  const SubscriptionId = request.body?.data?.subscription?.subscription_id;
  const body = request.body;
  const Email = request.body.data?.subscription?.customer?.email;
  const Next_billing_date = request.body?.data?.subscription?.next_billing_at;
  const planCode = request.body?.data?.subscription?.plan?.plan_code;
  const addons = request.body?.data?.subscription?.addons || [];
  const event = request.body?.data?.event_type || '';
  const credits = planCredits?.[planCode] || 0;
  const isTeamPlan = planCode?.includes('team');
  let newAddons = 0;
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
      newAddons = allowedUsersMonthly + allowedUsersYearly + 1;
    }
  } else {
    if (planCode === 'teams-yearly' || planCode === 'teams-monthly' || planCode === 'team-weekly') {
      newAddons = 1;
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
        const _resSub = JSON.parse(JSON.stringify(subscription));
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
        if (newAddons > 0) {
          updateSubscription.set('AllowedUsers', parseInt(newAddons));
        }
        let existAddon = 0;
        let allowedUsersMonthly = 0;
        let allowedUsersYearly = 0;
        _resSub.SubscriptionDetails?.data?.subscription?.addons?.forEach(item => {
          if (item.addon_code === 'extra-teams-users-monthly') {
            allowedUsersMonthly += item.quantity;
          } else if (item.addon_code === 'extra-teams-users-yearly') {
            allowedUsersYearly += item.quantity;
          } else if (item.addon_code === 'extra-users') {
            allowedUsersMonthly += item.quantity;
          }
        });
        if (allowedUsersMonthly > 0 || allowedUsersYearly > 0) {
          existAddon = allowedUsersMonthly + allowedUsersYearly + 1; // + 1 is Admin user
        } else {
          if (
            planCode === 'teams-yearly' ||
            planCode === 'teams-monthly' ||
            planCode === 'team-weekly'
          ) {
            existAddon = 1; // 1 is Admin user
          }
        }
        const isSameAsPrevPlan = subscription?.get('PlanCode') === planCode;
        if (isSameAsPrevPlan) {
          const planCredits = subscription?.get('PlanCredits');
          const existAllowedCredits = subscription?.get('AllowedCredits') || 0;
          if (planCredits) {
            const oldAddons = existAddon;
            const substractedAddon = newAddons - oldAddons;
            if (isTeamPlan && substractedAddon > 0) {
              const newCredits = existAllowedCredits + substractedAddon * planCredits;
              updateSubscription.set('AllowedCredits', newCredits);
              if (event === 'subscription_created') {
                updateSubscription.set('PlanCredits', credits);
              }
            } else if (isTeamPlan) {
              const existCredits = existAddon * planCredits;
              updateSubscription.set('AllowedCredits', existCredits);
              if (event === 'subscription_created') {
                updateSubscription.set('PlanCredits', credits);
              }
            } else {
              updateSubscription.set('AllowedCredits', planCredits);
              if (event === 'subscription_created') {
                updateSubscription.set('PlanCredits', credits);
              }
            }
          } else {
            if (credits > 0) {
              if (isTeamPlan) {
                const newCredits = newAddons * credits;
                updateSubscription.set('AllowedCredits', newCredits);
                updateSubscription.set('PlanCredits', credits);
              } else {
                updateSubscription.set('AllowedCredits', credits);
                updateSubscription.set('PlanCredits', credits);
              }
            }
          }
        } else {
          if (credits > 0) {
            if (isTeamPlan) {
              const newCredits = newAddons * credits;
              updateSubscription.set('AllowedCredits', newCredits);
              updateSubscription.set('PlanCredits', credits);
            } else {
              updateSubscription.set('AllowedCredits', credits);
              updateSubscription.set('PlanCredits', credits);
            }
          }
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
        if (newAddons > 0) {
          createSubscription.set('AllowedUsers', parseInt(newAddons));
        }
        if (credits > 0) {
          if (isTeamPlan) {
            const totalCredits = parseInt(newAddons) * credits;
            createSubscription.set('AllowedCredits', totalCredits);
            createSubscription.set('PlanCredits', credits);
          } else {
            createSubscription.set('AllowedCredits', credits);
            createSubscription.set('PlanCredits', credits);
          }
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
