import axios from 'axios';
const serverUrl = process.env.SERVER_URL;
const appId = process.env.APP_ID;
export default async function getSubscription(request) {
  const extUserId = request.params.extUserId;
  try {
    const userRes = await axios.get(serverUrl + '/users/me', {
      headers: {
        'X-Parse-Application-Id': appId,
        'X-Parse-Session-Token': request.headers['sessiontoken'],
      },
    });
    const userId = userRes.data && userRes.data.objectId;
    if (userId) {
      const subcriptionCls = new Parse.Query('contracts_Users');
      const exUser = await subcriptionCls.get(extUserId, { useMasterKey: true });
      if (exUser) {
        const subscriptionCls = new Parse.Query('contracts_Subscriptions');
        subscriptionCls.equalTo('TenantId', {
          __type: 'Pointer',
          className: 'partners_Tenant',
          objectId: exUser.get('TenantId').id,
        });
        subscriptionCls.descending('createdAt');
        const subcripitions = await subscriptionCls.first({ useMasterKey: true });
        if (subcripitions) {
          const _subcripitions = JSON.parse(JSON.stringify(subcripitions));
          return { status: 'success', result: _subcripitions };
        } else {
          return { status: 'success', result: {} };
        }
      } else {
        return { status: 'error', result: 'User not found!' };
      }
    } else {
      return { status: 'error', result: 'Invalid session token!' };
    }
  } catch (err) {
    console.log('Err in get subscription', err.message);
    return { status: 'error', result: err.message };
  }
}
