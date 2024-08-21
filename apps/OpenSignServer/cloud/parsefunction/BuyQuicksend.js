import axios from 'axios';
export default async function BuyQuickSend(request) {
  const apis = request.params.quicksend;
  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  if (apis) {
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
            const quantity = parseInt(apis);
            const addoncode = 'bulk-signatures';
            const data = JSON.stringify({
              plan: { plan_code: plan_code },
              addons: [
                { addon_code: addoncode, addon_description: 'Bulk Signatures', quantity: quantity },
              ],
            });
            const apiUrl = `https://www.zohoapis.in/billing/v1/subscriptions/${subscriptionId}/buyonetimeaddon`;
            const resAPis = await axios.post(apiUrl, data, {
              headers: {
                Authorization: 'Zoho-oauthtoken ' + res.data.access_token,
                'X-com-zoho-subscriptions-organizationid': process.env.ZOHO_BILLING_ORG_ID,
              },
            });
            if (resAPis.data) {
              const existQuickSend = _resSub?.AllowedQuicksend ? _resSub.AllowedQuicksend : 0;
              const allowedQuicksend = existQuickSend + quantity;
              const updateSub = new Parse.Object('contracts_Subscriptions');
              updateSub.id = resSub.id;
              updateSub.set('AllowedQuicksend', allowedQuicksend);
              const resupdateSub = await updateSub.save(null, { useMasterKey: true });
              return { status: 'success', addon: allowedQuicksend };
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
      console.log('err in buyaddon', code, msg);
      throw new Parse.Error(code, msg);
    }
  } else {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Please provide parameters.');
  }
}
