import { parseJwt } from '../../Utils.js';
import jwt from 'jsonwebtoken';

export default async function getSigners(request) {
  const jwttoken = request.headers.jwttoken || '';
  const search = request.params.search || '';
  const searchEmail = request.params.searchEmail || '';
  try {
    if (request.user) {
      const contactbook = new Parse.Query('contracts_Contactbook');
      contactbook.equalTo('CreatedBy', {
        __type: 'Pointer',
        className: '_User',
        objectId: request?.user?.id,
      });
      if (search) {
        contactbook.matches('Name', new RegExp(search, 'i'));
      } else if (searchEmail) {
        contactbook.matches('Email', new RegExp(searchEmail, 'i'));
      }
      contactbook.notEqualTo('IsDeleted', true);
      const contactRes = await contactbook.find({ sessionToken: request.user.getSessionToken() });
      const _contactRes = JSON.parse(JSON.stringify(contactRes));
      return _contactRes;
    } else if (jwttoken) {
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
        const contactbook = new Parse.Query('contracts_Contactbook');
        contactbook.equalTo('CreatedBy', {
          __type: 'Pointer',
          className: '_User',
          objectId: userId,
        });
        if (search) {
          contactbook.matches('Name', new RegExp(search, 'i'));
        } else if (searchEmail) {
          contactbook.matches('Email', new RegExp(searchEmail, 'i'));
        }
        contactbook.notEqualTo('IsDeleted', true);
        const contactRes = await contactbook.find({ useMasterKey: true });
        const _contactRes = JSON.parse(JSON.stringify(contactRes));
        return _contactRes;
      } else {
        throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Invalid token');
      }
    } else {
      throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Invalid session token');
    }
  } catch (err) {
    console.log('err in get signers', err);
    throw err;
  }
}
