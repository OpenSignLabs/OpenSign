import axios from 'axios';
import { cloudServerUrl, parseJwt } from '../../Utils.js';
import jwt from 'jsonwebtoken';
const serverUrl = cloudServerUrl; //process.env.SERVER_URL;
const appId = process.env.APP_ID;
export default async function getSubscription(request) {
  const extUserId = request.params.extUserId || '';
  const contactId = request.params.contactId || '';
  const ispublic = request.params.ispublic || false;
  const jwttoken = request.headers?.jwttoken || '';

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
        const extCls = new Parse.Query('contracts_Users');
        extCls.equalTo('Email', decoded?.user_email);
        const exUser = await extCls.first({ useMasterKey: true });
        if (exUser) {
          const subscriptionCls = new Parse.Query('contracts_Subscriptions');
          subscriptionCls.equalTo('TenantId', {
            __type: 'Pointer',
            className: 'partners_Tenant',
            objectId: exUser.get('TenantId').id,
          });
          subscriptionCls.descending('createdAt');
          const subcripitions = await subscriptionCls.first({ useMasterKey: true });
          if (subcripitions) {
            const _subcripitions = JSON.parse(JSON.stringify(subcripitions));
            return { status: 'success', result: _subcripitions };
          } else {
            return { status: 'success', result: {} };
          }
        } else {
          return { status: 'error', result: 'User not found!' };
        }
      } else {
        return { status: 'error', result: 'Invalid token!' };
      }
    }
  } else if (extUserId) {
    try {
      let userId;
      //`ispublic` is used in public profile to get subscription details
      if (!ispublic) {
        const userRes = await axios.get(serverUrl + '/users/me', {
          headers: {
            'X-Parse-Application-Id': appId,
            'X-Parse-Session-Token': request.headers['sessiontoken'],
          },
        });
        userId = userRes.data && userRes.data.objectId;
      }
      if (userId || ispublic) {
        const extCls = new Parse.Query('contracts_Users');
        const exUser = await extCls.get(extUserId, { useMasterKey: true });
        if (exUser) {
          const subscriptionCls = new Parse.Query('contracts_Subscriptions');
          subscriptionCls.equalTo('TenantId', {
            __type: 'Pointer',
            className: 'partners_Tenant',
            objectId: exUser.get('TenantId').id,
          });
          subscriptionCls.descending('createdAt');
          const subcripitions = await subscriptionCls.first({ useMasterKey: true });
          if (subcripitions) {
            const _subcripitions = JSON.parse(JSON.stringify(subcripitions));
            return { status: 'success', result: _subcripitions };
          } else {
            return { status: 'success', result: {} };
          }
        } else {
          return { status: 'error', result: 'User not found!' };
        }
      } else {
        return { status: 'error', result: 'Invalid session token!' };
      }
    } catch (err) {
      console.log('Err in get subscription', err.message);
      return { status: 'error', result: err.message };
    }
  } else if (contactId) {
    try {
      const contactCls = new Parse.Query('contracts_Contactbook');
      const contactUser = await contactCls.get(contactId, { useMasterKey: true });
      if (contactUser) {
        const subscriptionCls = new Parse.Query('contracts_Subscriptions');
        subscriptionCls.equalTo('TenantId', {
          __type: 'Pointer',
          className: 'partners_Tenant',
          objectId: contactUser.get('TenantId').id,
        });
        subscriptionCls.descending('createdAt');
        const subcripitions = await subscriptionCls.first({ useMasterKey: true });
        if (subcripitions) {
          const _subcripitions = JSON.parse(JSON.stringify(subcripitions));
          if (_subcripitions.PlanCode === 'freeplan') {
            return { status: 'success', result: { isSubscribed: false, plan: 'freeplan' } };
          } else if (_subcripitions?.Next_billing_date?.iso) {
            if (new Date(_subcripitions.Next_billing_date.iso) > new Date()) {
              return { status: 'success', result: { isSubscribed: true } };
            } else {
              return { status: 'success', result: { isSubscribed: false } };
            }
          } else {
            return { status: 'success', result: { isSubscribed: false } };
          }
        } else {
          return { status: 'success', result: { isSubscribed: false } };
        }
      } else {
        return { status: 'error', result: 'User not found!' };
      }
    } catch (err) {
      console.log('Err in get subscription2', err.message);
      return { status: 'error', result: err.message };
    }
  } else {
    return { status: 'error', result: 'Invalid session token!' };
  }
}
