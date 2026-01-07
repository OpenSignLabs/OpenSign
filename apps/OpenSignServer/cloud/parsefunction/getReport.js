import { cloudServerUrl, serverAppId } from '../../Utils.js';
import reportJson, { applySearch } from './reportsJson.js';
import axios from 'axios';
function buildClassesUrl({ serverUrl, clsName, paramsObj, keys, orderBy, skip, limit, include }) {
  const url = new URL(`${serverUrl}/classes/${clsName}`);
  url.searchParams.set('where', JSON.stringify(paramsObj));
  url.searchParams.set('keys', keys.join(','));
  url.searchParams.set('order', orderBy);
  url.searchParams.set('skip', String(skip));
  url.searchParams.set('limit', String(limit));
  if (include) url.searchParams.set('include', include);
  return url.toString();
}
export default async function getReport(request) {
  const reportId = request.params.reportId;
  const limit = request.params.limit;
  const skip = request.params.skip;
  const searchTerm = request.params.searchTerm || '';

  const serverUrl = cloudServerUrl; //process.env.SERVER_URL;
  const appId = serverAppId;
  const masterKey = process.env.MASTER_KEY;
  const sessionToken = request.headers['sessiontoken'] || request.headers['x-parse-session-token'];
  try {
    const userRes = await axios.get(serverUrl + '/users/me', {
      headers: {
        'X-Parse-Application-Id': appId,
        'X-Parse-Session-Token': sessionToken,
      },
    });
    const userId = userRes.data && userRes.data.objectId;
    if (!userId) {
      return { error: 'Invalid session token' };
    }
    const json = reportId && reportJson(reportId, userId);
    if (json) {
      let paramsObj = { ...(json.params || {}) };
      if (reportId == '6TeaPr321t') {
        const extUserQuery = new Parse.Query('contracts_Users');
        extUserQuery.equalTo('Email', userRes.data.email);
        extUserQuery.include('TeamIds');
        const extUser = await extUserQuery.first({ useMasterKey: true });
        const userPtr = { __type: 'Pointer', className: '_User', objectId: userId };
        if (!extUser) {
          paramsObj = { ...paramsObj, CreatedBy: userPtr };
        }
        const _extUser = JSON.parse(JSON.stringify(extUser));
        const extPtr = { __type: 'Pointer', className: 'contracts_Users', objectId: extUser.id };
        if (_extUser?.TeamIds && _extUser.TeamIds?.length > 0) {
          // Collect ancestors efficiently + de-dupe
          const teamSet = new Set();
          for (const team of _extUser?.TeamIds) {
            const ancestors = team.Ancestors || [];
            for (const a of ancestors) teamSet.add(a);
          }
          const teamArr = [...teamSet];
          paramsObj = {
            ...paramsObj,
            $or: [
              { SharedWith: { $in: teamArr } },
              { ExtUserPtr: extPtr },
              { SharedWithUsers: extPtr },
            ],
          };
        } else {
          paramsObj = { ...paramsObj, CreatedBy: userPtr };
        }
      }
      paramsObj = applySearch({ reportId, baseWhere: paramsObj, searchTerm });
      const headers = {
        'Content-Type': 'application/json',
        'X-Parse-Application-Id': appId,
        'X-Parse-Master-Key': masterKey,
      };

      const clsName = json?.reportClass ? json.reportClass : 'contracts_Document';
      const orderBy = '-updatedAt';
      const include = 'AuditTrail.UserPtr,Placeholders.signerPtr,ExtUserPtr.TenantId';

      const url = buildClassesUrl({
        serverUrl,
        clsName,
        paramsObj,
        keys: json.keys || [],
        orderBy,
        skip,
        limit,
        include,
      });
      const res = await axios.get(url, { headers: headers });
      if (res.data && res.data.results) {
        return res.data.results;
      } else {
        return [];
      }
    } else {
      return { error: 'Report is not available!' };
    }
  } catch (err) {
    const message = err?.response?.data?.error || err?.message || 'Something went wrong';
    console.log('getreport error:', message);
    if (err.code == 209) {
      return { error: 'Invalid session token' };
    } else {
      return { error: "You don't have access!" };
    }
  }
}
