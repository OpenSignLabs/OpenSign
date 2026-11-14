import { sessionViaLoginAs } from './bettersignlogin.js';
import { assertDocRecipient, normalizeEmail, verifyEmailOtp } from './emailOtp.js';

// A recipient opening `docId` from the emailed signing link signs in with the
// one-time code sent by SendOTPMailV1. Returns the user with a session token,
// without touching the user's password.
async function AuthLoginAsMail(request) {
  const email = normalizeEmail(request.params.email);
  await assertDocRecipient(request.params.docId, email);
  await verifyEmailOtp(email, request.params.otp);

  const userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('email', email);
  const user = await userQuery.first({ useMasterKey: true });
  if (!user) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'user not found!');
  }

  const result = await sessionViaLoginAs(user.id);
  // Receiving the code proves the user owns the mailbox.
  if (!result?.emailVerified) {
    user.set('emailVerified', true);
    await user.save(null, { useMasterKey: true });
    result.emailVerified = true;
  }
  return result;
}
export default AuthLoginAsMail;
