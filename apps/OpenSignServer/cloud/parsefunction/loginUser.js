import crypto from 'node:crypto';
import { sanitizeParseUser } from './twoFactorAuth.js';

const TWO_FACTOR_PENDING_TTL_MS = 5 * 60 * 1000;

export default async function loginUser(request) {
  const username = request.params.email?.toLowerCase()?.replace(/\s/g, '');
  const password = request.params.password;

  if (!username || !password) {
    throw new Parse.Error(Parse.Error.PASSWORD_MISSING, 'username/password is missing.');
  }

  try {
    const user = await Parse.User.logIn(username, password);
    if (!user) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'user not found.');
    }

    const requiresTwoFactor = Boolean(user.get('twoFactorEnabled') && user.get('twoFactorSecret'));

    if (requiresTwoFactor) {
      const pendingToken = crypto.randomBytes(32).toString('hex');
      user.set('twoFactorPendingToken', pendingToken);
      user.set('twoFactorPendingSession', user.getSessionToken());
      user.set('twoFactorPendingExpires', new Date(Date.now() + TWO_FACTOR_PENDING_TTL_MS));
      await user.save(null, { useMasterKey: true });

      return {
        twoFactorRequired: true,
        pendingToken,
        user: {
          objectId: user.id,
          email: user.get('email'),
          username: user.get('username'),
        },
      };
    }

    const sanitizedUser = sanitizeParseUser(user);
    if (
      user.get('twoFactorPendingToken') ||
      user.get('twoFactorPendingSession') ||
      user.get('twoFactorPendingExpires')
    ) {
      user.unset('twoFactorPendingToken');
      user.unset('twoFactorPendingSession');
      user.unset('twoFactorPendingExpires');
      await user.save(null, { useMasterKey: true });
    }

    return {
      twoFactorRequired: false,
      user: sanitizedUser,
    };
  } catch (err) {
    console.log('err in login user', err);
    throw err;
  }
}
