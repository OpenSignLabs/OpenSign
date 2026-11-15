import { verifyEmailOtp } from './emailOtp.js';

// Marks the signed-in user's email as verified with a code from SendOTPMailV1.
// The code must have been sent to the user's own email, not one passed in.
export default async function VerifyEmail(request) {
  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  await verifyEmailOtp(request.user.get('email'), request.params.otp);

  if (request.user.get('emailVerified')) {
    return { message: 'Email is already verified.' };
  }
  request.user.set('emailVerified', true);
  await request.user.save(null, { useMasterKey: true });
  return { message: 'Email is verified.' };
}
