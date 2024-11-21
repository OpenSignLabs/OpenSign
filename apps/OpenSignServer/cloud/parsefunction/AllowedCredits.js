import { parseJwt } from '../../Utils.js';
import jwt from 'jsonwebtoken';
async function checkCredits(userId) {
  const extUser = new Parse.Query('contracts_Users');
  extUser.equalTo('UserId', {
    __type: 'Pointer',
    className: '_User',
    objectId: userId,
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
      const AllowedCredits = _resSub?.AllowedCredits || 0;
      const AddonCredits = _resSub?.AddonCredits || 0;
      return { allowedcredits: AllowedCredits, addoncredits: AddonCredits };
    }
  } else {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
  }
}
export default async function AllowedCredits(request) {
  const jwttoken = request?.headers?.jwttoken || '';

  try {
    if (request?.user) {
      return await checkCredits(request.user.id);
    } else if (jwttoken) {
      const jwtDecode = parseJwt(jwttoken);
      if (jwtDecode?.user_email) {
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
        const decoded = jwt.verify(jwttoken, appRes?.get('token'));
        if (decoded?.user_email) {
          return await checkCredits(userId);
        } else {
          throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Invalid token.');
        }
      } else {
        throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Invalid token.');
      }
    } else {
      throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
    }
  } catch (err) {
    console.log('err in allowedCredits', err);
    const code = err?.code || 400;
    const msg = err?.message || 'Something went wrong.';
    throw new Parse.Error(code, msg);
  }
}
