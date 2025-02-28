import axios from 'axios';
import { cloudServerUrl } from '../../Utils.js';
const serverUrl = cloudServerUrl; //process.env.SERVER_URL;
const appId = process.env.APP_ID;
export default async function getPayments(request) {
  const limit = request.params.limit || 100;
  const skip = request.params.skip || 0;
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
      const paymentsCls = new Parse.Query('contracts_Payments');
      paymentsCls.equalTo('ExtUserPtr', {
        __type: 'Pointer',
        className: 'contracts_User',
        objectId: extUserId,
      });
      paymentsCls.limit(limit);
      paymentsCls.skip(skip);
      paymentsCls.descending('createdAt');
      const payments = await paymentsCls.find({ useMasterKey: true });
      if (payments?.length > 0) {
        const _payments = JSON.parse(JSON.stringify(payments));
        return { status: 'success', result: _payments };
      } else {
        return { status: 'success', result: [] };
      }
    } else {
      return { status: 'error', result: 'Invalid session token!' };
    }
  } catch (err) {
    console.log('Err in get Payments', err.message);
    return { status: 'error', result: err.message };
  }
}
