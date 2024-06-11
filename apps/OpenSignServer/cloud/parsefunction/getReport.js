import reportJson from './reportsJson.js';
import axios from 'axios';

export default async function getReport(request) {
  const reportId = request.params.reportId;
  const limit = request.params.limit;
  const skip = request.params.skip;

  const serverUrl = process.env.SERVER_URL;
  const appId = process.env.APP_ID;

  try {
    const userRes = await axios.get(serverUrl + '/users/me', {
      headers: {
        'X-Parse-Application-Id': appId,
        'X-Parse-Session-Token': request.headers['sessiontoken'],
      },
    });
    const userId = userRes.data && userRes.data.objectId;
    if (userId) {
      const json = reportId && reportJson(reportId, userId);
      const clsName = json?.reportClass ? json.reportClass : 'contracts_Document';
      if (json) {
        const { params, keys } = json;
        const orderBy = '-updatedAt';
        const strParams = JSON.stringify(params);
        const strKeys = keys.join();
        const headers = {
          'Content-Type': 'application/json',
          'X-Parse-Application-Id': appId,
          'X-Parse-Master-Key': process.env.MASTER_KEY,
        };
        const url = `${serverUrl}/classes/${clsName}?where=${strParams}&keys=${strKeys}&order=${orderBy}&skip=${skip}&limit=${limit}&include=AuditTrail.UserPtr`;
        const res = await axios.get(url, { headers: headers });
        if (res.data && res.data.results) {
          return res.data.results;
        } else {
          return [];
        }
      } else {
        return { error: 'Report is not available!' };
      }
    }
  } catch (err) {
    console.log('err', err.message);
    if (err.code == 209) {
      return { error: 'Invalid session token' };
    } else {
      return { error: "You don't have access!" };
    }
  }
}
