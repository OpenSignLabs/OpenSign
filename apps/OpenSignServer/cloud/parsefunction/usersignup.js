import axios from 'axios';
import { cloudServerUrl } from '../../Utils.js';
const serverUrl = cloudServerUrl;

const APPID = process.env.APP_ID;
const masterKEY = process.env.MASTER_KEY;

if (!APPID || !masterKEY) {
  throw new Error('Missing APP_ID or MASTER_KEY in environment variables');
}

// Helper: Create a new tenant (partner)
async function createTenant(userDetails, userId) {
  const partnerCls = Parse.Object.extend('partners_Tenant');
  const partnerQuery = new partnerCls();

  partnerQuery.set('UserId', {
    __type: 'Pointer',
    className: '_User',
    objectId: userId,
  });
  partnerQuery.set('TenantName', userDetails.company || '');
  partnerQuery.set('EmailAddress', userDetails.email);
  partnerQuery.set('IsActive', true);
  partnerQuery.set('CreatedBy', {
    __type: 'Pointer',
    className: '_User',
    objectId: userId,
  });

  if (userDetails.phone) partnerQuery.set('ContactNumber', userDetails.phone);
  if (userDetails.pincode) partnerQuery.set('PinCode', userDetails.pincode);
  if (userDetails.country) partnerQuery.set('Country', userDetails.country);
  if (userDetails.state) partnerQuery.set('State', userDetails.state);
  if (userDetails.city) partnerQuery.set('City', userDetails.city);
  if (userDetails.address) partnerQuery.set('Address', userDetails.address);

  return await partnerQuery.save(null, { useMasterKey: true });
}

// Helper: Create a new extended user
async function createExtendedUser(userDetails, userId, tenantId, extClass) {
  const extCls = Parse.Object.extend(`${extClass}_Users`);
  const newObj = new extCls();

  newObj.set('UserId', {
    __type: 'Pointer',
    className: '_User',
    objectId: userId,
  });
  newObj.set('UserRole', userDetails.role);
  newObj.set('Email', userDetails.email);
  newObj.set('Name', userDetails.name);
  newObj.set('TenantId', {
    __type: 'Pointer',
    className: 'partners_Tenant',
    objectId: tenantId,
  });

  if (userDetails.phone) newObj.set('Phone', userDetails.phone);
  if (userDetails.company) newObj.set('Company', userDetails.company);
  if (userDetails.jobTitle) newObj.set('JobTitle', userDetails.jobTitle);
  if (userDetails.timezone) newObj.set('Timezone', userDetails.timezone);

  return await newObj.save(null, { useMasterKey: true });
}

// Core user creation/login
async function saveUser(userDetails) {
  const normalizedEmail = userDetails.email?.toLowerCase()?.trim().replace(/\s/g, '');

  const userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('username', normalizedEmail);
  const userRes = await userQuery.first({ useMasterKey: true });

  if (userRes) {
    const url = `${serverUrl}/loginAs`;
    const axiosRes = await axios({
      method: 'POST',
      url,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'X-Parse-Application-Id': APPID,
        'X-Parse-Master-Key': masterKEY,
      },
      params: { userId: userRes.id },
    });

    const login = axiosRes.data;
    return { id: login.objectId, sessionToken: login.sessionToken };
  } else {
    const user = new Parse.User();
    user.set('username', normalizedEmail);
    user.set('password', userDetails.password);
    user.set('email', normalizedEmail);
    user.set('name', userDetails.name);

    if (userDetails.phone) {
      user.set('phone', userDetails.phone);
    }

    const res = await user.signUp();
    return { id: res.id, sessionToken: res.getSessionToken() };
  }
}

// Main export function
export default async function usersignup(request) {
  const userDetails = request.params.userDetails;

  try {
    userDetails.email = userDetails.email?.toLowerCase()?.trim().replace(/\s/g, '');

    const user = await saveUser(userDetails);
    const extClass = userDetails.role.split('_')[0];

    const extQuery = new Parse.Query(`${extClass}_Users`);
    extQuery.equalTo('UserId', {
      __type: 'Pointer',
      className: '_User',
      objectId: user.id,
    });

    const extUser = await extQuery.first({ useMasterKey: true });

    if (extUser) {
      return { message: 'User already exists' };
    } else {
      const tenantRes = await createTenant(userDetails, user.id);
      await createExtendedUser(userDetails, user.id, tenantRes.id, extClass);

      return {
        message: 'User signed up successfully',
        sessionToken: user.sessionToken,
        userId: user.id,
      };
    }
  } catch (err) {
    console.error('Signup Error:', err);
    return {
      error: true,
      message: err.message || 'Unknown error occurred during signup',
    };
  }
}
