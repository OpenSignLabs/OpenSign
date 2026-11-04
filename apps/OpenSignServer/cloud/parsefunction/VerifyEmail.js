export default async function VerifyEmail(request) {
  try {
    if (!request?.user) {
      throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
    } else {
      let otpN = request.params.otp;
      let otp = parseInt(otpN);
      let email = (request.params.email || '').toLowerCase().trim();
      if (!email) {
        email = request?.user?.get('email');
      }

      //checking otp is correct or not which already save in defaultdata_Otp class
      const checkOtp = new Parse.Query('defaultdata_Otp');
      checkOtp.equalTo('Email', email);
      checkOtp.equalTo('OTP', otp);

      const otpRecord = await checkOtp.first({ useMasterKey: true });
      if (!otpRecord) {
        const error = new Error('OTP is invalid.');
        error.code = 400; // Set the error code (e.g., 400 for bad request)
        throw error;
      }

      // Fetch the user by their objectId
      const userQuery = new Parse.Query(Parse.User);
      const user = await userQuery.get(request?.user.id, {
        sessionToken: request?.user.getSessionToken(),
      });

      const currentEmail = (user?.get('email') || '').toLowerCase().trim();
      const changingEmail = Boolean(email) && email !== currentEmail;
      const isEmailVerified = request?.user?.get('emailVerified');

      if (isEmailVerified && !changingEmail) {
        return { message: 'Email is already verified.' };
      }

      if (changingEmail) {
        // Sync the extended user first: if it fails the account is left
        // untouched, instead of changing the login address with a stale profile.
        const extQuery = new Parse.Query('contracts_Users');
        extQuery.equalTo('UserId', {
          __type: 'Pointer',
          className: '_User',
          objectId: user.id,
        });
        const extUser = await extQuery.first({ useMasterKey: true });
        if (extUser) {
          extUser.set('Email', email);
          extUser.set('NormalizedEmail', email);
          await extUser.save(null, { useMasterKey: true });
        }
        // The account address is the login name, so it has to move with it.
        user.set('username', email);
        user.set('email', email);
        user.set('normalizedEmail', email);
      }
      // Update the emailVerified field to true
      user.set('emailVerified', true);
      // Save the user object
      const saved = await user.save(null, { useMasterKey: true });
      if (!saved) {
        const error = new Error('Something went wrong, please try again later!');
        error.code = 400; // Set the error code (e.g., 400 for bad request)
        throw error;
      }

      // The code is single use; a failed delete would leave it reusable.
      await otpRecord.destroy({ useMasterKey: true });

      return {
        message: changingEmail ? 'Email changed and verified.' : 'Email is verified.',
      };
    }
  } catch (err) {
    console.log('err ', err.code + ' ' + err.message);
    throw err;
  }
}
