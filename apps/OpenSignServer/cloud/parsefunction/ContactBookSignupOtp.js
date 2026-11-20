import crypto from 'node:crypto';
import { smtpenable } from '../../Utils.js';
import { escapeHtml, renderEmailHeading, resolveBrandContext } from '../../utils/brandContext.js';

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

const hashOtp = (userId, otp) =>
  crypto
    .createHash('sha256')
    .update(`${userId}:${otp}:${process.env.MASTER_KEY || ''}`)
    .digest('hex');

const getPendingContactBook = async user => {
  const registeredQuery = new Parse.Query('contracts_Users');
  registeredQuery.equalTo('UserId', {
    __type: 'Pointer',
    className: '_User',
    objectId: user.id,
  });
  if (await registeredQuery.first({ useMasterKey: true })) return null;

  const contactQuery = new Parse.Query('contracts_Contactbook');
  contactQuery.equalTo('UserId', {
    __type: 'Pointer',
    className: '_User',
    objectId: user.id,
  });
  contactQuery.notEqualTo('IsDeleted', true);
  return contactQuery.first({ useMasterKey: true });
};

const sendOtp = async user => {
  const email = user.get('email');
  if (!email) {
    throw new Parse.Error(
      Parse.Error.INVALID_EMAIL_ADDRESS,
      'A verified email address is required.'
    );
  }

  const lastSentAt = user.get('contactBookSignupOtpSentAt');
  if (lastSentAt && Date.now() - new Date(lastSentAt).getTime() < RESEND_COOLDOWN_MS) {
    throw new Parse.Error(429, 'Please wait before requesting another verification code.');
  }

  let code = Math.floor(1000 + Math.random() * 9000);
  const brand = resolveBrandContext({});
  const AppName = brand.productName;
  const sender = smtpenable ? process.env.SMTP_USER_EMAIL : process.env.MAILGUN_SENDER;
  await Parse.Cloud.sendEmail({
    sender: `${brand.senderName} <${sender}>`,
    recipient: email,
    subject: `Your ${AppName} OTP`,
    text: 'otp email',
    html:
      `<html><head><meta http-equiv='Content-Type' content='text/html;charset=UTF-8' /></head><body><div style='background-color:#f5f5f5;padding:20px'><div style='background-color:white;'>${renderEmailHeading(brand, 'OTP Verification')}<div style='padding:20px;'><p style='font-family:system-ui;font-size:14px;'>Your OTP for ${escapeHtml(AppName)} verification is:</p><p style='text-decoration:none;font-weight:bolder;color:blue;font-size:45px;margin:20px;'>` +
      code +
      '</p></div></div></div></body></html>',
  });

  user.set('contactBookSignupOtpHash', hashOtp(user.id, String(code)));
  user.set('contactBookSignupOtpExpiresAt', new Date(Date.now() + OTP_EXPIRY_MS));
  user.set('contactBookSignupOtpSentAt', new Date());
  user.set('contactBookSignupOtpAttempts', 0);
  await user.save(null, { useMasterKey: true });
};

export const isPendingContactBookUser = async user => Boolean(await getPendingContactBook(user));

export const sendContactBookSignupOtp = async request => {
  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  if (!(await getPendingContactBook(request.user))) {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'OTP verification is not required.');
  }
  await sendOtp(request.user);
  return { message: 'Verification code sent.' };
};

export const verifyContactBookSignupOtp = async request => {
  const user = request.user;
  const otp = String(request.params.otp || '');
  if (!user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  if (!(await getPendingContactBook(user))) {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'OTP verification is not required.');
  }
  if (!/^\d{4}$/.test(otp)) {
    throw new Parse.Error(Parse.Error.INVALID_ARGUMENT, 'Enter the four-digit verification code.');
  }

  const attempts = user.get('contactBookSignupOtpAttempts') || 0;
  if (attempts >= MAX_ATTEMPTS) {
    throw new Parse.Error(429, 'Too many invalid attempts. Please request a new code.');
  }
  const expiresAt = user.get('contactBookSignupOtpExpiresAt');
  const valid = expiresAt && new Date(expiresAt).getTime() > Date.now();
  const savedHash = user.get('contactBookSignupOtpHash') || '';
  const expectedHash = hashOtp(user.id, otp);
  const matches =
    savedHash.length === expectedHash.length &&
    crypto.timingSafeEqual(Buffer.from(savedHash, 'utf8'), Buffer.from(expectedHash, 'utf8'));
  if (!valid || !matches) {
    user.set('contactBookSignupOtpAttempts', attempts + 1);
    await user.save(null, { useMasterKey: true });
    throw new Parse.Error(
      Parse.Error.INVALID_ARGUMENT,
      valid ? 'Invalid verification code.' : 'Verification code has expired.'
    );
  }

  user.set('contactBookSignupOtpVerifiedAt', new Date());
  user.unset('contactBookSignupOtpHash');
  user.unset('contactBookSignupOtpExpiresAt');
  user.unset('contactBookSignupOtpSentAt');
  user.unset('contactBookSignupOtpAttempts');
  await user.save(null, { useMasterKey: true });
  return { message: 'Email verified.' };
};
