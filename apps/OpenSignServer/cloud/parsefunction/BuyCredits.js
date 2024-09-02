import axios from 'axios';
export default async function BuyCredits(request) {
  const credits = request.params.credits;
  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  if (credits) {
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
          // Define the URL
          const url = 'https://accounts.zoho.in/oauth/v2/token';

          // Convert the data to x-www-form-urlencoded format
          const formData = new URLSearchParams();
          formData.append('refresh_token', process.env.ZOHO_REFRESH_TOKEN);
          formData.append('client_id', process.env.ZOHO_CLIENT_ID);
          formData.append('client_secret', process.env.ZOHO_CLIENT_SECRET);
          formData.append('redirect_uri', process.env.ZOHO_REDIRECT_URI);
          formData.append('grant_type', 'refresh_token');

          const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

          // Make the POST request using Axios
          const res = await axios.post(url, formData, { headers });
          if (res.data.access_token) {
            const subscriptionId = _resSub.SubscriptionId;
            const plan_code = _resSub?.SubscriptionDetails?.data?.subscription?.plan?.plan_code;
            const quantity = parseInt(credits);
            const addoncode = 'addon-credits';
            const data = JSON.stringify({
              plan: { plan_code: plan_code },
              addons: [
                { addon_code: addoncode, addon_description: 'addon credits', quantity: quantity },
              ],
            });
            const creditsUrl = `https://www.zohoapis.in/billing/v1/subscriptions/${subscriptionId}/buyonetimeaddon`;
            const resCredits = await axios.post(creditsUrl, data, {
              headers: {
                Authorization: 'Zoho-oauthtoken ' + res.data.access_token,
                'X-com-zoho-subscriptions-organizationid': process.env.ZOHO_BILLING_ORG_ID,
              },
            });
            // console.log('resCredits ', resCredits.data);
            if (resCredits.data) {
              const existAddonCredits = _resSub?.AddonCredits ? _resSub.AddonCredits : 0;
              const addonCredits = existAddonCredits + quantity;
              const updateSub = new Parse.Object('contracts_Subscriptions');
              updateSub.id = resSub.id;
              updateSub.set('AddonCredits', addonCredits);
              const resupdateSub = await updateSub.save(null, { useMasterKey: true });
              // console.log('resupdateSub ', resupdateSub);
              return { status: 'success', addon: quantity };
            }
          } else {
            throw new Parse.Error('400', 'Invalid access token.');
          }
        }
      } else {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
      }
    } catch (err) {
      const code = err?.response?.data?.code || err?.response?.status || err?.code || 400;
      const msg =
        err?.response?.data?.error ||
        err?.response?.data ||
        err?.message ||
        'Something went wrong.';
      console.log('err in Buyaddonusers', code, msg);
      throw new Parse.Error(code, msg);
    }
  } else {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Please provide parameters.');
  }
}
