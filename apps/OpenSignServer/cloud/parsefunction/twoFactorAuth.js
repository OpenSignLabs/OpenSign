import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { appName } from '../../Utils.js';

const sanitizeUser = (user, { includeSession = true } = {}) => {
  if (!user) {
    return null;
  }
  const json = user.toJSON();
  delete json.authData;
  delete json.twoFactorSecret;
  delete json.twoFactorTempSecret;
  delete json.twoFactorTempSecretCreatedAt;
  delete json.twoFactorPendingToken;
  delete json.twoFactorPendingSession;
  delete json.twoFactorPendingExpires;
  if (includeSession) {
    json.sessionToken = user.getSessionToken();
  } else {
    delete json.sessionToken;
  }
  return json;
};

const destroyPendingSession = async sessionToken => {
  if (!sessionToken) {
    return;
  }
  try {
    const Session = Parse.Object.extend('_Session');
    const query = new Parse.Query(Session);
    query.equalTo('sessionToken', sessionToken);
    const session = await query.first({ useMasterKey: true });
    if (session) {
      await session.destroy({ useMasterKey: true });
    }
  } catch (error) {
    console.log('Failed to destroy pending session', error);
  }
};

export const generateTwoFactorSecret = async request => {
  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  const user = await request.user.fetch({
    useMasterKey: true,
    context: { preserveTwoFactorFields: true },
  });
  const email = user.get('email') || user.get('username');

  const secret = speakeasy.generateSecret({
    length: 32,
    name: `${appName} (${email})`,
  });

  user.set('twoFactorTempSecret', secret.base32);
  user.set('twoFactorTempSecretCreatedAt', new Date());
  await user.save(null, { useMasterKey: true });

  const qrCodeData = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url,
    qrCodeData,
  };
};

export const enableTwoFactor = async request => {
  const { token } = request.params || {};
  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  if (!token) {
    throw new Parse.Error(Parse.Error.VALIDATION_ERROR, 'Verification code is required.');
  }
  const user = await request.user.fetch({
    useMasterKey: true,
    context: { preserveTwoFactorFields: true },
  });
  const tempSecret = user.get('twoFactorTempSecret');
  if (!tempSecret) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Two-factor setup has not been initiated.');
  }
  const verified = speakeasy.totp.verify({
    secret: tempSecret,
    encoding: 'base32',
    token,
    window: 1,
  });
  if (!verified) {
    throw new Parse.Error(Parse.Error.VALIDATION_ERROR, 'Invalid verification code.');
  }
  user.set('twoFactorSecret', tempSecret);
  user.set('twoFactorEnabled', true);
  user.unset('twoFactorTempSecret');
  user.unset('twoFactorTempSecretCreatedAt');
  await user.save(null, { useMasterKey: true });
  return { success: true };
};

export const disableTwoFactor = async request => {
  const { token } = request.params || {};
  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  if (!token) {
    throw new Parse.Error(Parse.Error.VALIDATION_ERROR, 'Verification code is required.');
  }
  const user = await request.user.fetch({
    useMasterKey: true,
    context: { preserveTwoFactorFields: true },
  });
  const secret = user.get('twoFactorSecret');
  if (!secret || !user.get('twoFactorEnabled')) {
    return { success: true };
  }
  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1,
  });
  if (!verified) {
    throw new Parse.Error(Parse.Error.VALIDATION_ERROR, 'Invalid verification code.');
  }
  const pendingSession = user.get('twoFactorPendingSession');
  await destroyPendingSession(pendingSession);
  user.unset('twoFactorSecret');
  user.unset('twoFactorEnabled');
  user.unset('twoFactorPendingToken');
  user.unset('twoFactorPendingSession');
  user.unset('twoFactorPendingExpires');
  user.unset('twoFactorTempSecret');
  user.unset('twoFactorTempSecretCreatedAt');
  await user.save(null, { useMasterKey: true });
  return { success: true };
};

export const verifyTwoFactorLogin = async request => {
  const { pendingToken, token } = request.params || {};
  if (!pendingToken || !token) {
    throw new Parse.Error(Parse.Error.VALIDATION_ERROR, 'Verification code is required.');
  }
  const userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('twoFactorPendingToken', pendingToken);
  const user = await userQuery.first({
    useMasterKey: true,
    context: { preserveTwoFactorFields: true },
  });
  if (!user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Two-factor challenge not found.');
  }
  const expiresAt = user.get('twoFactorPendingExpires');
  if (!expiresAt || expiresAt < new Date()) {
    const pendingSession = user.get('twoFactorPendingSession');
    await destroyPendingSession(pendingSession);
    user.unset('twoFactorPendingToken');
    user.unset('twoFactorPendingSession');
    user.unset('twoFactorPendingExpires');
    await user.save(null, { useMasterKey: true });
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Two-factor challenge expired.');
  }
  const secret = user.get('twoFactorSecret');
  if (!secret || !user.get('twoFactorEnabled')) {
    const pendingSession = user.get('twoFactorPendingSession');
    await destroyPendingSession(pendingSession);
    user.unset('twoFactorPendingToken');
    user.unset('twoFactorPendingSession');
    user.unset('twoFactorPendingExpires');
    await user.save(null, { useMasterKey: true });
    throw new Parse.Error(
      Parse.Error.OBJECT_NOT_FOUND,
      'Two-factor authentication is not enabled.'
    );
  }
  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1,
  });
  if (!verified) {
    throw new Parse.Error(Parse.Error.VALIDATION_ERROR, 'Invalid verification code.');
  }
  const sessionToken = user.get('twoFactorPendingSession');
  if (!sessionToken) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Session token not found.');
  }
  user.unset('twoFactorPendingToken');
  user.unset('twoFactorPendingSession');
  user.unset('twoFactorPendingExpires');
  await user.save(null, { useMasterKey: true });
  const sanitizedUser = sanitizeUser(user, { includeSession: false });
  return {
    sessionToken,
    user: { ...sanitizedUser, sessionToken },
  };
};

export const sanitizeParseUser = sanitizeUser;
export const destroyTwoFactorSession = destroyPendingSession;
