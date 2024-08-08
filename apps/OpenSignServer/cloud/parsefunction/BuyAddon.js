import axios from 'axios';
export default async function Buyaddon(request) {
  const tenantId = request.params.tenantId;
  const users = request.params.users;
  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  if (users && tenantId) {
    try {
      const subscription = new Parse.Query('contracts_Subscriptions');
      subscription.equalTo('TenantId', {
        __type: 'Pointer',
        className: 'partners_Tenant',
        objectId: tenantId,
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
          const price = _resSub?.SubscriptionDetails?.data?.subscription?.plan?.price;
          const plan_code = _resSub?.SubscriptionDetails?.data?.subscription?.plan?.plan_code;
          const addonsArr = _resSub?.SubscriptionDetails?.data?.subscription?.addons || [];
          const addon = addonsArr.reduce((acc, curr) => acc + curr.quantity, 0);
          const quantity = parseInt(users) + parseInt(addon);
          const data = JSON.stringify({
            plan: { plan_code: plan_code },
            addons: [
              {
                addon_code: 'extra-users',
                addon_description: 'Extra users',
                price: price,
                quantity: quantity,
              },
            ],
          });
          await axios.put(
            'https://www.zohoapis.in/billing/v1/subscriptions/' + subscriptionId,
            data,
            {
              headers: {
                Authorization: 'Zoho-oauthtoken ' + res.data.access_token,
                'X-com-zoho-subscriptions-organizationid': process.env.ZOHO_BILLING_ORG_ID,
              },
            }
          );
          const hostedpage_id = _resSub.SubscriptionDetails.hostedpage_id;
          const userData = await axios.get(
            'https://www.zohoapis.in/billing/v1/hostedpages/' + hostedpage_id,
            {
              headers: {
                Authorization: 'Zoho-oauthtoken ' + res.data.access_token,
                'X-com-zoho-subscriptions-organizationid': process.env.ZOHO_BILLING_ORG_ID,
              },
            }
          );
          const allowedUsers = quantity + 1;
          const updateSub = new Parse.Object('contracts_Subscriptions');
          updateSub.id = resSub.id;
          updateSub.set('SubscriptionDetails', userData.data);
          updateSub.set('AllowedUsers', allowedUsers);
          const resupdateSub = await updateSub.save(null, { useMasterKey: true });
          return { status: 'success', addon: allowedUsers };
        } else {
          throw new Parse.Error('400', 'Invalid access token.');
        }
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
  }
}
