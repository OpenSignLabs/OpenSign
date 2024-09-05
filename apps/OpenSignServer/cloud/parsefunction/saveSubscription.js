import axios from 'axios';
import { cloudServerUrl, planCredits } from '../../Utils.js';
export default async function saveSubscription(request) {
  const serverUrl = cloudServerUrl; //process.env.SERVER_URL;
  const appId = process.env.APP_ID;
  const subscription = request.params.subscription;
  const SubscriptionId = subscription.data.subscription.subscription_id;
  const body = subscription;
  const Next_billing_date = subscription.data.subscription.next_billing_at;
  const planCode = subscription.data.subscription.plan.plan_code;
  const event = subscription?.data?.event_type || '';
  const credits = planCredits?.[planCode] || 0;
  const isTeamPlan = planCode?.includes('team');
  let newAddons = 0;
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
        const resSubscription = await subcriptionCls.first({ useMasterKey: true });
        const addons = subscription?.data?.subscription?.addons || [];
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
            newAddons = allowedUsersMonthly + allowedUsersYearly + 1; // + 1 is Admin user
          }
        } else {
          if (
            planCode === 'teams-yearly' ||
            planCode === 'teams-monthly' ||
            planCode === 'team-weekly'
          ) {
            newAddons = 1; // 1 is Admin user
          }
        }
        if (resSubscription) {
          const _resSub = JSON.parse(JSON.stringify(resSubscription));
          const updateSubscription = new Parse.Object('contracts_Subscriptions');
          updateSubscription.id = resSubscription.id;
          updateSubscription.set('SubscriptionId', SubscriptionId);
          updateSubscription.set('SubscriptionDetails', body);
          updateSubscription.set('Next_billing_date', new Date(Next_billing_date));
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
          const isSameAsPrevPlan = resSubscription?.get('PlanCode') === planCode;
          if (isSameAsPrevPlan) {
            const planCredits = resSubscription?.get('PlanCredits');
            const existAllowedCredits = resSubscription?.get('AllowedCredits') || 0;
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
              if (isTeamPlan) {
                const newCredits = newAddons * credits;
                updateSubscription.set('AllowedCredits', newCredits);
                updateSubscription.set('PlanCredits', credits);
              } else {
                updateSubscription.set('AllowedCredits', credits);
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
