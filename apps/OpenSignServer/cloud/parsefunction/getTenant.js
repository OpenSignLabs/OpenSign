import { parseJwt } from '../../Utils.js';
import jwt from 'jsonwebtoken';

async function getTenantByUserId(userId) {
  try {
    const query = new Parse.Query('contracts_Users');
    query.equalTo('UserId', {
      __type: 'Pointer',
      className: '_User',
      objectId: userId,
    });
    const extuser = await query.first({ useMasterKey: true });
    if (extuser) {
      const user = extuser?.get('CreatedBy')?.id || userId;
      const tenantCreditsQuery = new Parse.Query('partners_Tenant');
      tenantCreditsQuery.equalTo('UserId', {
        __type: 'Pointer',
        className: '_User',
        objectId: user,
      });
      tenantCreditsQuery.exclude('FileAdapters');
      tenantCreditsQuery.exclude('PfxFile');
      const res = await tenantCreditsQuery.first({ useMasterKey: true });
      return res;
    } else {
      return {};
    }
  } catch (err) {
    console.log('err in getTenant ', err);
    return 'user does not exist!';
  }
}
export default async function getTenant(request) {
  const jwttoken = request.headers.jwttoken || '';
  const userId = request.params.userId || '';
  if (jwttoken) {
    const jwtDecode = parseJwt(jwttoken);
    if (jwtDecode?.user_email) {
      const verifyToken = jwttoken;
      const userCls = new Parse.Query(Parse.User);
      userCls.equalTo('email', jwtDecode?.user_email);
      const userRes = await userCls.first({ useMasterKey: true });
      const apiUserId = userRes?.id;
      const tokenQuery = new Parse.Query('appToken');
      tokenQuery.equalTo('userId', {
        __type: 'Pointer',
        className: '_User',
        objectId: apiUserId,
      });
      const appRes = await tokenQuery.first({ useMasterKey: true });
      const decoded = jwt.verify(verifyToken, appRes?.get('token'));
      if (decoded?.user_email) {
        return await getTenantByUserId(apiUserId);
      } else {
        return { status: 'error', result: 'Invalid token!' };
      }
    }
  } else if (userId) {
    return await getTenantByUserId(userId);
  }
}
