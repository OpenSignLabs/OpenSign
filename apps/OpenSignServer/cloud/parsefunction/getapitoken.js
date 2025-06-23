import axios from 'axios';
import { cloudServerUrl } from '../../Utils.js';

export default async function getapitoken(request) {
  try {
    const serverUrl = cloudServerUrl; //process.env.SERVER_URL;
    const userRes = await axios.get(serverUrl + '/users/me', {
      headers: {
        'X-Parse-Application-Id': process.env.APP_ID,
        'X-Parse-Session-Token': request.headers['sessiontoken'],
      },
    });
    const userId = userRes.data && userRes.data.objectId;
    if (userId) {
      const tokenQuery = new Parse.Query('appToken');
      tokenQuery.equalTo('userId', { __type: 'Pointer', className: '_User', objectId: userId });
      const res = await tokenQuery.first({ useMasterKey: true });
      if (res) {
        return { status: 'success', result: res.get('token') };
      } else {
        return { error: 'api token found.' };
      }
    } else {
      return { error: 'Invalid session token.' };
    }
  } catch (err) {
    console.log('Err in getapitoken', err);
    if (err.code == 209) {
      return { error: 'Invalid session token.' };
    } else {
      return { error: "You don't have access." };
    }
  }
}
