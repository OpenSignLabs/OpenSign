import axios from 'axios';
import { cloudServerUrl, generateId, serverAppId } from '../../../Utils.js';
import { deleteContactsInBatch, deleteDataFiles, deleteInBatches } from './deleteFileUrl.js';
import { MAX_ATTEMPTS } from './deleteUtils.js';
const serverUrl = cloudServerUrl;
const appId = serverAppId;

const deleteSessionsAndUser = async (userPointer, userId) => {
  const Session = Parse.Object.extend('_Session');
  const sessionQuery = new Parse.Query(Session);
  sessionQuery.equalTo('user', userPointer);
  const sessions = await sessionQuery.find({ useMasterKey: true });
  if (sessions?.length > 0) await Parse.Object.destroyAll(sessions, { useMasterKey: true });

  const userObj = await new Parse.Query(Parse.User).get(userId, { useMasterKey: true });
  if (userObj) await userObj.destroy({ useMasterKey: true });
};

const resetPasswordAndDeleteSession = async userId => {
  const password = generateId(16);
  const user = await new Parse.Query(Parse.User).get(userId, { useMasterKey: true });
  user.set('password', password);
  user.set('emailVerified', false);
  user.unset('ProfilePic');
  await user.save(null, { useMasterKey: true });

  // Optional: revoke all existing sessions (forces logout everywhere)
  const sessionQuery = new Parse.Query('_Session');
  sessionQuery.equalTo('user', user);
  const sessions = await sessionQuery.find({ useMasterKey: true });
  if (sessions.length) {
    await Parse.Object.destroyAll(sessions, { useMasterKey: true });
  }
};
export async function deleteUser(userId, adminId) {
  const userPointer = { __type: 'Pointer', className: '_User', objectId: userId };
  let userDetails = {
    UserRole: 'not found',
    Name: 'not found',
    Email: 'not found',
    UserId: userId || 'not found',
    objectId: 'not found',
    TenantId: 'not found',
  };
  try {
    // STEP 1: contracts_Users lookup
    const Users = Parse.Object.extend('contracts_Users');
    const userQuery = new Parse.Query(Users);
    userQuery.equalTo('UserId', userPointer);
    if (adminId) {
      userQuery.equalTo('CreatedBy', { __type: 'Pointer', className: '_User', objectId: adminId });
    }
    const userResult = await userQuery.first({ useMasterKey: true });
    userDetails = { ...userDetails, UserId: userId };
    if (!userResult) {
      const errorMessage = 'User not found.';
      return { code: 400, message: errorMessage };
    }
    const contractsUserId = userResult.id;
    const tenantId = userResult.get('TenantId')?.id;
    const teamIds = userResult.get('TeamIds') || [];
    const organizationId = userResult.get('OrganizationId')?.id;
    const isAdmin = userResult?.get('UserRole') === 'contracts_Admin' ? true : false;
    userDetails = {
      ...userDetails,
      UserRole: userResult?.get('UserRole'),
      Name: userResult?.get('Name'),
      Email: userResult?.get('Email'),
      UserId: userResult?.get('UserId')?.id,
      objectId: userResult?.id,
      TenantId: userResult?.get('TenantId')?.id,
    };
    if (adminId && isAdmin) {
      const errorMessage = 'An error occurred while deleting your account.';
      return { code: 400, message: errorMessage };
    }

    // STEP 2: contracts_Document & contracts_Template
    try {
      for (const className of ['contracts_Document', 'contracts_Template']) {
        await deleteInBatches(className, userPointer);
      }
    } catch (err) {
      console.error('Failed during contracts_Template cleanup:', err);
      const errorMessage = 'Failed during contracts_Template cleanup:' + err?.message;
      return { code: 400, message: errorMessage };
    }

    // STEP 3: delete Contacts created by user from contactbook class
    try {
      await deleteContactsInBatch('contracts_Contactbook', userPointer);
    } catch (err) {
      console.error('Failed during contactbook cleanup:', err);
      const errorMessage = 'Failed during contactbook cleanup:' + err?.message;
      return { code: 400, message: errorMessage };
    }

    try {
      // Check if any rows remain for this UserId
      const Contactbook = Parse.Object.extend('contracts_Contactbook');
      const remainingCount = await new Parse.Query(Contactbook)
        .equalTo('UserId', userPointer)
        .count({ useMasterKey: true });

      // If no record remains delete from _User class
      if (remainingCount === 0) {
        await deleteSessionsAndUser(userPointer, userId);
      } else {
        await resetPasswordAndDeleteSession(userId);
      }
    } catch (err) {
      console.error('Failed during contactbook current user cleanup:', err);
      const errorMessage =
        'Failed during contactbook current user cleanup: ' + (err?.message || err);
      return { code: 400, message: errorMessage };
    }

    // STEP 4: appToken
    try {
      const AppToken = Parse.Object.extend('appToken');
      const query = new Parse.Query(AppToken);
      query.equalTo('UserId', userPointer);
      const tokens = await query.find({ useMasterKey: true });
      if (tokens?.length) await Parse.Object.destroyAll(tokens, { useMasterKey: true });
    } catch (err) {
      console.error('Failed to delete appToken entries:', err);
      const errorMessage = 'Failed to delete appToken entries:' + err?.message;
      return { code: 400, message: errorMessage };
    }

    // STEP 5: partner_DataFiles
    try {
      await deleteDataFiles('partners_DataFiles', userPointer);
    } catch (err) {
      console.error('Failed during partners_DataFiles cleanup:', err);
      const errorMessage = 'Failed during partners_DataFiles cleanup:' + err?.message;
      return { code: 400, message: errorMessage };
    }

    if (isAdmin) {
      // STEP 6: contracts_Organizations
      try {
        if (organizationId) {
          const Org = Parse.Object.extend('contracts_Organizations');
          const query = new Parse.Query(Org);
          const object = await query.get(organizationId, { useMasterKey: true });
          await object.destroy({ useMasterKey: true });
        }
      } catch (err) {
        console.error('Failed to delete contracts_Organizations entry:', err);
        const errorMessage = 'Failed to delete contracts_Organizations entry:' + err?.message;
        return { code: 400, message: errorMessage };
      }
      // STEP 7: Delete each entry in contracts_Teams by objectId from teamIds
      try {
        if (teamIds.length > 0) {
          const Teams = Parse.Object.extend('contracts_Teams');
          for (const team of teamIds) {
            try {
              const teamObj = await new Parse.Query(Teams).get(team.id, { useMasterKey: true });
              if (teamObj) await teamObj.destroy({ useMasterKey: true });
            } catch (teamErr) {
              console.error(`Failed to delete team with ID ${team.id}:`, teamErr);
              const errorMessage = `Failed to delete team with ID ${team.id}` + teamErr?.message;
              return { code: 400, message: errorMessage };
            }
          }
        }
      } catch (err) {
        console.error('Failed during contracts_Teams deletion loop:', err);
        const errorMessage = 'Failed during contracts_Teams deletion loop:' + err?.message;
        return { code: 400, message: errorMessage };
      }

      // STEP 8 : partners_Tenant cleanup
      try {
        if (tenantId) {
          const Tenant = Parse.Object.extend('partners_Tenant');
          const query = new Parse.Query(Tenant);
          const tenantObj = await query.get(tenantId, { useMasterKey: true });
          await tenantObj.destroy({ useMasterKey: true });
        }
      } catch (err) {
        const msg = `Failed during partners_Tenant ${'cleanup:'} `;
        console.error(msg, err);
        const errorMessage = msg + err?.message;
        return { code: 400, message: errorMessage };
      }

      // STEP 9: partners_TenantCredits cleanup
      try {
        if (tenantId) {
          const tenantCredits = Parse.Object.extend('partners_TenantCredits');
          const subsByTenant = new Parse.Query(tenantCredits);
          subsByTenant.equalTo('PartnersTenant', {
            __type: 'Pointer',
            className: 'partners_Tenant',
            objectId: tenantId,
          });
          const subs = await subsByTenant.find({ useMasterKey: true });
          await Parse.Object.destroyAll(subs, { useMasterKey: true });
        }
      } catch (err) {
        console.error('Failed during partners_TenantCredits cleanup:', err);
        const errorMessage = 'Failed during partners_TenantCredits cleanup:' + err?.message;
        return { code: 400, message: errorMessage };
      }
    }
    // STEP 10: contracts_Signature
    try {
      const Signature = Parse.Object.extend('contracts_Signature');
      const sigQuery = new Parse.Query(Signature);
      sigQuery.equalTo('UserId', userPointer);
      const sigResults = await sigQuery.find({ useMasterKey: true });
      if (sigResults?.length > 0) await Parse.Object.destroyAll(sigResults, { useMasterKey: true });
    } catch (err) {
      console.error('Failed during contracts_Signature cleanup:', err);
      const errorMessage = 'Failed during contracts_Signature cleanup:' + err?.message;
      return { code: 400, message: errorMessage };
    }

    // STEP 11: contracts_Users
    try {
      await userResult.destroy({ useMasterKey: true });
    } catch (err) {
      console.error('Failed to delete contracts_Users entry:', err);
      const errorMessage = 'Failed to delete contracts_Users entry:' + err?.message;
      return { code: 400, message: errorMessage };
    }
    return { code: 200, message: 'User and all associated data deleted successfully.' };
  } catch (error) {
    console.error('User deletion process failed:', error);
    const errorMessage = `User deletion failed: ${error.message || error}`;
    return { code: 400, message: errorMessage };
  }
}

// 2. Handle Password Verification and Deletion
export const deleteUserPost = async (req, res) => {
  const { userId } = req.params;
  const { otp } = req.body;
  let userDetails = {
    UserRole: 'not found',
    Name: 'not found',
    Email: 'not found',
    UserId: userId || 'not found',
    objectId: 'not found',
    TenantId: 'not found',
  };
  if (!userId) return res.status(404).send('Missing userId parameter.');

  try {
    // 1. Get the user
    const userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo('objectId', userId);
    const user = await userQuery.first({ useMasterKey: true });
    if (!user) {
      const errorMessage = 'User not found.';
      return res.send(errorMessage);
    }
    const extUserQuery = new Parse.Query('contracts_Users');
    extUserQuery.equalTo('UserId', { __type: 'Pointer', className: '_User', objectId: userId });

    const extUser = await extUserQuery.first({ useMasterKey: true });
    if (!extUser) {
      const errorMessage = 'User not found.';
      return res.send(errorMessage);
    }

    // Get stored OTP info
    const savedOtp = extUser.get('DeleteOTP') || '';
    const expiry = extUser.get('DeleteOTPExpiry');
    const tries = Number(extUser.get('DeleteOTPTries') || 0);

    if (tries >= MAX_ATTEMPTS) {
      return res.status(429).send('Too many invalid attempts. Please resend OTP and try again.');
    }
    if (!otp || typeof otp !== 'string') {
      // Count attempt
      extUser.set('DeleteOTPTries', tries + 1);
      await extUser.save(null, { useMasterKey: true });
      return res.status(400).send('OTP is required.');
    }
    if (!savedOtp) {
      return res.status(400).send('No OTP found. Please request a new OTP.');
    }
    if (expiry && Date.now() > expiry.getTime()) {
      return res.status(400).send('OTP has expired. Please request a new OTP.');
    }
    if (otp !== savedOtp) {
      // Increment tries on mismatch
      extUser.set('DeleteOTPTries', tries + 1);
      await extUser.save(null, { useMasterKey: true });
      return res.status(400).send('Invalid OTP.');
    }

    // 2. Remove OTP related data
    try {
      extUser.unset('DeleteOTP');
      extUser.unset('DeleteOTPExpiry');
      extUser.unset('DeleteOTPSentAt');
      extUser.unset('DeleteOTPTries');
      await extUser.save(null, { useMasterKey: true });
    } catch (err) {
      console.log('err while validating password: ', err?.response?.data || err);
    }

    const response = await deleteUser(userId);
    const code = response?.code || 500;
    const message = response?.message || 'An error occurred while deleting your account.';
    return res.status(code).send(message);
  } catch (error) {
    console.error('Account deletion error:', error);
    const errorMessage = error?.message || 'An error occurred while deleting your account.';
    return res.status(500).send(errorMessage);
  }
};

// 2. Handle Password Verification and Deletion
export const deleteUserByAdmin = async (req, res) => {
  const sessiontoken = req.headers.sessiontoken;
  const userId = req.params.userId;
  let userDetails = {
    UserRole: 'not found',
    Name: 'not found',
    Email: 'not found',
    UserId: userId || 'not found',
    objectId: 'not found',
    TenantId: 'not found',
  };
  if (!sessiontoken) return res.status(400).json({ message: 'unauthorized.' });
  if (!userId || userId === ':userId') {
    return res.status(400).json({ message: 'Missing userId parameter.' });
  }
  try {
    const axiosRes = await axios.get(serverUrl + '/users/me', {
      headers: {
        'X-Parse-Application-Id': appId,
        'X-Parse-Session-Token': sessiontoken,
      },
    });
    const adminId = axiosRes?.data && axiosRes.data?.objectId;

    if (!adminId) {
      return res.status(400).json({ message: 'Unauthorized.' });
    }
    // 1. Get the user
    const userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo('objectId', userId);
    const user = await userQuery.first({ useMasterKey: true });
    if (!user) {
      const errorMessage = 'User not found.';
      return res.status(400).json({ message: errorMessage });
    }
    const response = await deleteUser(userId, adminId);
    const code = response?.code || 400;
    const message = response?.message || 'An error occurred while deleting your account.';
    return res.status(code).json({ message: message });
  } catch (error) {
    const code = error?.response?.data?.code || 400;
    const errorMessage =
      error?.response?.data?.error ||
      error?.message ||
      'An error occurred while deleting your account.';
    console.error(`Account deletion error:`, errorMessage);
    return res.status(code).json({ message: errorMessage });
  }
};
