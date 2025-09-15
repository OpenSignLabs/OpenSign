import {
  generateOtp,
  msUntil,
  sendDeleteOtpEmail,
  OTP_EXPIRES_MIN,
  RESEND_COOLDOWN_SEC,
} from './deleteUtils.js';

export const deleteUserOtp = async (req, res) => {
  const { userId } = req.params;

  const extUserQuery = new Parse.Query('contracts_Users');
  extUserQuery.equalTo('UserId', { __type: 'Pointer', className: '_User', objectId: userId });
  const extUser = await extUserQuery.first({ useMasterKey: true });
  if (!extUser) return res.status(404).json({ error: 'User not found' });

  const now = Date.now();
  const lastSentAt = extUser.get('DeleteOTPSentAt')?.getTime?.() || 0;
  const cooldownEndsAt = lastSentAt + RESEND_COOLDOWN_SEC * 1000;
  const remainingMs = msUntil(now, cooldownEndsAt);

  if (remainingMs > 0) {
    return res
      .status(429)
      .json({ error: 'Cooldown not finished', retryAfterSec: Math.ceil(remainingMs / 1000) });
  }

  const otp = generateOtp();
  const expiresAt = new Date(now + OTP_EXPIRES_MIN * 60 * 1000);

  try {
    const resp = await sendDeleteOtpEmail(extUser, otp);
    extUser.set('DeleteOTP', otp);
    extUser.set('DeleteOTPExpiry', expiresAt);
    extUser.set('DeleteOTPSentAt', new Date(now));
    extUser.set('DeleteOTPTries', 0); // reset tries on resend
    await extUser.save(null, { useMasterKey: true });
    return res.json({ ok: true, cooldownSec: RESEND_COOLDOWN_SEC, expiresInMin: OTP_EXPIRES_MIN });
  } catch (err) {
    console.log('Error sending delete OTP (POST /otp):', err?.response?.data || err);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
};
