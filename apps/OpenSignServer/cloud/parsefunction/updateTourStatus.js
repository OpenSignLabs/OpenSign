import { parseJwt } from '../../Utils.js';
import jwt from 'jsonwebtoken';

export default async function updateTourStatus(request) {
  const tourstatus = request.params.TourStatus;
  const extUserId = request.params.ExtUserId;
  const jwttoken = request?.headers?.jwttoken || '';
  if (request.user) {
    try {
      const updateUser = new Parse.Object('contracts_Users');
      updateUser.id = extUserId;
      updateUser.set('TourStatus', tourstatus);
      const res = await updateUser.save();
      return res;
    } catch (err) {
      console.log('Err ', err);
      const code = err?.code || 400;
      const msg = err?.message || 'Something went wrong.';
      throw new Parse.Error(code, msg);
    }
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
        try {
          const updateUser = new Parse.Object('contracts_Users');
          updateUser.id = extUserId;
          updateUser.set('TourStatus', tourstatus);
          const res = await updateUser.save(null, { useMasterKey: true });
          return res;
        } catch (err) {
          console.log('Err ', err);
          const code = err?.code || 400;
          const msg = err?.message || 'Something went wrong.';
          throw new Parse.Error(code, msg);
        }
      } else {
        return { status: 'error', result: 'Invalid token!' };
      }
    } else {
      return { status: 'error', result: 'Invalid token!' };
    }
  } else {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
}
