import { parseJwt } from '../../Utils.js';
import jwt from 'jsonwebtoken';
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
      const userId = userRes?.id;
      const tokenQuery = new Parse.Query('appToken');
      tokenQuery.equalTo('userId', {
        __type: 'Pointer',
        className: '_User',
        objectId: userId,
      });
      const appRes = await tokenQuery.first({ useMasterKey: true });
      const decoded = jwt.verify(verifyToken, appRes?.get('token'));
      if (decoded?.user_email) {
        try {
          const tenantCreditsQuery = new Parse.Query('partners_Tenant');
          tenantCreditsQuery.equalTo('UserId', {
            __type: 'Pointer',
            className: '_User',
            objectId: userId,
          });
          tenantCreditsQuery.exclude('FileAdapters');
          tenantCreditsQuery.exclude('PfxFile');
          const res = await tenantCreditsQuery.first({ useMasterKey: true });
          if (res) {
            return res;
          }
        } catch (e) {
          return 'user does not exist!';
        }
      } else {
        return { status: 'error', result: 'Invalid token!' };
      }
    }
  } else if (userId) {
    try {
      const tenantCreditsQuery = new Parse.Query('partners_Tenant');
      tenantCreditsQuery.equalTo('UserId', {
        __type: 'Pointer',
        className: '_User',
        objectId: userId,
      });
      const res = await tenantCreditsQuery.first();
      if (res) {
        return res;
      }
    } catch (e) {
      return 'user does not exist!';
    }
  }
}
