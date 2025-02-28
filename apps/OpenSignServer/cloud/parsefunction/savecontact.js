import { parseJwt } from '../../Utils.js';
import jwt from 'jsonwebtoken';

export default async function savecontact(request) {
  const name = request.params.name;
  const phone = request.params.phone;
  const email = request.params.email;
  const tenantId = request.params.tenantId;
  const jwttoken = request.headers.jwttoken;

  if (request.user) {
    const currentUser = request?.user;
    const currentUserPtr = { __type: 'Pointer', className: '_User', objectId: currentUser?.id };
    const query = new Parse.Query('contracts_Contactbook');
    query.equalTo('CreatedBy', currentUserPtr);
    query.notEqualTo('IsDeleted', true);
    query.equalTo('Email', email);
    const res = await query.first({ sessionToken: request.user.getSessionToken() });
    if (!res) {
      const contactQuery = new Parse.Object('contracts_Contactbook');
      contactQuery.set('Name', name);
      if (phone) {
        contactQuery.set('Phone', phone);
      }
      contactQuery.set('Email', email);
      contactQuery.set('UserRole', 'contracts_Guest');
      contactQuery.set('IsDeleted', false);
      if (tenantId) {
        contactQuery.set('TenantId', {
          __type: 'Pointer',
          className: 'partners_Tenant',
          objectId: tenantId,
        });
      }

      try {
        const _users = Parse.Object.extend('User');
        const _user = new _users();
        _user.set('name', name);
        _user.set('username', email);
        _user.set('email', email);
        _user.set('password', email);
        if (phone) {
          _user.set('phone', phone);
        }

        const user = await _user.save();
        if (user) {
          contactQuery.set('CreatedBy', currentUserPtr);
          contactQuery.set('UserId', user);
          const acl = new Parse.ACL();
          acl.setReadAccess(user.id, true);
          acl.setWriteAccess(user.id, true);
          acl.setReadAccess(currentUser.id, true);
          acl.setWriteAccess(currentUser.id, true);
          contactQuery.setACL(acl);

          const res = await contactQuery.save();
          const parseData = JSON.parse(JSON.stringify(res));
          return parseData;
        }
      } catch (err) {
        console.log('err ', err);
        if (err.code === 202) {
          const params = { email: email };
          const userRes = await Parse.Cloud.run('getUserId', params);
          contactQuery.set('CreatedBy', currentUserPtr);
          contactQuery.set('UserId', {
            __type: 'Pointer',
            className: '_User',
            objectId: userRes.id,
          });
          const acl = new Parse.ACL();
          acl.setReadAccess(userRes.id, true);
          acl.setWriteAccess(userRes.id, true);
          acl.setReadAccess(currentUser.id, true);
          acl.setWriteAccess(currentUser.id, true);
          contactQuery.setACL(acl);
          const res = await contactQuery.save();
          const parseData = JSON.parse(JSON.stringify(res));
          return parseData;
        }
      }
    } else {
      throw new Parse.Error(Parse.Error.DUPLICATE_VALUE, 'Contact already exists.');
    }
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
    const currentUser = userRes;
    const currentUserPtr = { __type: 'Pointer', className: '_User', objectId: userId };
    if (decoded?.user_email) {
      const query = new Parse.Query('contracts_Contactbook');
      query.equalTo('CreatedBy', currentUserPtr);
      query.notEqualTo('IsDeleted', true);
      query.equalTo('Email', email);
      const res = await query.first({ useMasterKey: true });
      if (!res) {
        const contactQuery = new Parse.Object('contracts_Contactbook');
        contactQuery.set('Name', name);
        if (phone) {
          contactQuery.set('Phone', phone);
        }
        contactQuery.set('Email', email);
        contactQuery.set('UserRole', 'contracts_Guest');
        contactQuery.set('IsDeleted', false);
        if (tenantId) {
          contactQuery.set('TenantId', {
            __type: 'Pointer',
            className: 'partners_Tenant',
            objectId: tenantId,
          });
        }
        try {
          const _users = Parse.Object.extend('User');
          const _user = new _users();
          _user.set('name', name);
          _user.set('username', email);
          _user.set('email', email);
          _user.set('password', email);
          if (phone) {
            _user.set('phone', phone);
          }

          const user = await _user.save();
          if (user) {
            contactQuery.set('CreatedBy', currentUserPtr);
            contactQuery.set('UserId', user);
            const acl = new Parse.ACL();
            acl.setReadAccess(user.id, true);
            acl.setWriteAccess(user.id, true);
            acl.setReadAccess(currentUser.id, true);
            acl.setWriteAccess(currentUser.id, true);
            contactQuery.setACL(acl);

            const res = await contactQuery.save();
            const parseData = JSON.parse(JSON.stringify(res));
            return parseData;
          }
        } catch (err) {
          console.log('err ', err);
          if (err.code === 202) {
            const params = { email: email };
            const userRes = await Parse.Cloud.run('getUserId', params);
            contactQuery.set('CreatedBy', currentUserPtr);
            contactQuery.set('UserId', {
              __type: 'Pointer',
              className: '_User',
              objectId: userRes.id,
            });
            const acl = new Parse.ACL();
            acl.setReadAccess(userRes.id, true);
            acl.setWriteAccess(userRes.id, true);
            acl.setReadAccess(currentUser.id, true);
            acl.setWriteAccess(currentUser.id, true);
            contactQuery.setACL(acl);
            const res = await contactQuery.save();
            const parseData = JSON.parse(JSON.stringify(res));
            return parseData;
          }
        }
      } else {
        throw new Parse.Error(Parse.Error.DUPLICATE_VALUE, 'Contact already exists.');
      }
    } else {
      throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Invalid token.');
    }
  }
}
