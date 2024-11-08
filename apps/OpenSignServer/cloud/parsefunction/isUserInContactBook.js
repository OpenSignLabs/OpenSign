import { parseJwt } from '../../Utils.js';
import jwt from 'jsonwebtoken';

export default async function isUserInContactBook(request) {
  try {
    const jwttoken = request.headers.jwttoken;
    if (jwttoken) {
      const jwtDecode = parseJwt(jwttoken);
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
        const email = userRes?.get('email');
        const userPtr = { __type: 'Pointer', className: '_User', objectId: userId };
        const query = new Parse.Query('contracts_Contactbook');
        query.equalTo('CreatedBy', userPtr);
        query.notEqualTo('IsDeleted', true);
        query.equalTo('Email', email);
        const res = await query.first({ useMasterKey: true });
        return res;
      } else {
        throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Invalid token');
      }
    } else if (request.user) {
      const email = request.user.get('email');
      const userPtr = { __type: 'Pointer', className: '_User', objectId: request.user?.id };
      const query = new Parse.Query('contracts_Contactbook');
      query.equalTo('CreatedBy', userPtr);
      query.notEqualTo('IsDeleted', true);
      query.equalTo('Email', email);
      const res = await query.first({ sessionToken: request.user.getSessionToken() });
      return res;
    }
  } catch (err) {
    console.log('err', err);
    throw err;
  }
}
