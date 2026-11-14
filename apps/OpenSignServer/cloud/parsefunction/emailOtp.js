// One-time codes (OTC) sent by email, shared by every code flow:
//   - a recipient opening a document from the emailed signing link
//     (SendOTPMailV1 -> AuthLoginAsMail); only for that document's signers
//   - email verification before signing, for a signed-in user's own email
//     (SendOTPMailV1 -> verifyemail)
//   - account deletion (customRoute/deleteAccount, own storage)
//
// Rules (the account-deletion pattern): 6 digits from a CSPRNG, expiry, a resend
// cooldown, a cap on wrong attempts per code and per day. Codes are single use,
// and only an HMAC of the code is stored in `defaultdata_Otp`, which is
// master-key only (migration 20261113000000-lock_defaultdata_otp).
import crypto from 'node:crypto';
import { appName, smtpenable } from '../../Utils.js';

export const OTP_LENGTH = 6;
export const OTP_EXPIRES_MIN = 10; // code validity in minutes
export const RESEND_COOLDOWN_SEC = 30; // cooldown between sends
export const MAX_ATTEMPTS = 5; // wrong attempts before a new code is needed
export const MAX_DAILY_FAILS = 10; // wrong attempts per email per 24h, across resends
const DAY_MS = 24 * 60 * 60 * 1000;

const OTP_CLASS = 'defaultdata_Otp';
const OTP_RE = new RegExp(`^\\d{${OTP_LENGTH}}$`);

export function generateOtp(len = OTP_LENGTH) {
  return String(crypto.randomInt(0, 10 ** len)).padStart(len, '0');
}

export const normalizeEmail = email =>
  typeof email === 'string' ? email.toLowerCase().replace(/\s/g, '') : '';

// Constant-time comparison of two codes (or two hashes).
export function codesMatch(a, b) {
  const x = Buffer.from(String(a ?? ''));
  const y = Buffer.from(String(b ?? ''));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

// Keyed with the master key, so a leaked hash can't be brute-forced offline.
function hashOtp(email, otp) {
  return crypto.createHmac('sha256', process.env.MASTER_KEY).update(`${email}:${otp}`).digest('hex');
}

const otpError = msg => new Parse.Error(Parse.Error.VALIDATION_ERROR, msg);

async function findOtpRecord(email) {
  const query = new Parse.Query(OTP_CLASS);
  query.equalTo('Email', email);
  return query.first({ useMasterKey: true });
}

// Without a signed-in user, codes are only for a recipient of a document: the
// email must be one of its signers.
export async function assertDocRecipient(docId, email) {
  email = normalizeEmail(email);
  const notRecipient = () =>
    new Parse.Error(
      Parse.Error.OPERATION_FORBIDDEN,
      'This email is not a recipient of the document.'
    );
  if (typeof docId !== 'string' || !docId || !email) throw notRecipient();
  const query = new Parse.Query('contracts_Document');
  query.equalTo('objectId', docId);
  query.notEqualTo('IsArchive', true);
  query.include('Signers');
  const doc = await query.first({ useMasterKey: true });
  const isSigner =
    doc?.get('Placeholders')?.some(x => normalizeEmail(x?.email) === email) ||
    doc?.get('Signers')?.some(x => normalizeEmail(x?.get?.('Email')) === email);
  if (!isSigner) throw notRecipient();
}

export function otpEmailHtml(otp) {
  return `
<html lang="en">
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;">
      <tr>
        <td align="center" style="padding:24px;">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e9ecf1;border-radius:8px;padding:20px;">
            <tr>
              <td align="left" style="font-size:16px;color:#0f172a;">
                <div style="font-weight:bold;margin-bottom:8px;">${appName}</div>
                <div style="font-size:18px;margin:0 0 12px 0;">Your verification code</div>
                <div style="display:inline-block;border:1px solid #e9ecf1;border-radius:6px;background:#f8fafc;padding:10px 14px;margin-bottom:10px;">
                  <span style="font-family:Consolas,'Courier New',monospace;font-size:24px;letter-spacing:6px;color:#0f172a;">${otp}</span>
                </div>
                <p style="margin:8px 0 0 0;font-size:13px;color:#475569;">
                  This code expires in <strong>${OTP_EXPIRES_MIN}</strong> minutes and can be used once.
                </p>
                <hr style="border:none;border-top:1px solid #e9ecf1;margin:18px 0;">
                <p style="margin:0;font-size:12px;color:#64748b;">
                  If you didn’t request this code, you can ignore this email. Never share it with anyone.
                </p>
              </td>
            </tr>
          </table>
          <div style="font-size:11px;color:#94a3b8;margin-top:12px;">
            &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}

// Send a new code to `email`. Throws while the resend cooldown is running.
export async function issueEmailOtp(email, { tenantId } = {}) {
  email = normalizeEmail(email);
  if (!email) throw otpError('Please enter a valid email.');

  const now = Date.now();
  const record = await findOtpRecord(email);
  const lastSentAt = record?.get('SentAt')?.getTime?.() || 0;
  const remainingMs = lastSentAt + RESEND_COOLDOWN_SEC * 1000 - now;
  if (remainingMs > 0) {
    throw otpError(
      `Please wait ${Math.ceil(remainingMs / 1000)} seconds before requesting a new code.`
    );
  }

  const otp = generateOtp();
  const mailsender = smtpenable ? process.env.SMTP_USER_EMAIL : process.env.MAILGUN_SENDER;
  try {
    await Parse.Cloud.sendEmail({
      sender: appName + ' <' + mailsender + '>',
      recipient: email,
      subject: `Your ${appName} verification code`,
      text: `Your ${appName} verification code is ${otp}. It expires in ${OTP_EXPIRES_MIN} minutes.`,
      html: otpEmailHtml(otp),
    });
  } catch (err) {
    console.log('error in send OTP mail', err?.message || err);
    throw otpError('Could not send the verification code. Please try again later.');
  }

  const obj = record || new Parse.Object(OTP_CLASS);
  obj.set('Email', email);
  if (tenantId) obj.set('TenantId', tenantId);
  obj.set('CodeHash', hashOtp(email, otp));
  obj.set('ExpiresAt', new Date(now + OTP_EXPIRES_MIN * 60 * 1000));
  obj.set('SentAt', new Date(now));
  obj.set('Tries', 0); // reset tries on resend
  obj.unset('OTP'); // legacy plaintext code
  await obj.save(null, { useMasterKey: true });
  return { cooldownSec: RESEND_COOLDOWN_SEC, expiresInMin: OTP_EXPIRES_MIN };
}

// Check (and consume) the code sent to `email`. Throws a Parse.Error when it
// is missing, expired, wrong, or has been guessed at too many times.
export async function verifyEmailOtp(email, otp) {
  email = normalizeEmail(email);
  const code = String(otp ?? '').trim();
  const record = email && (await findOtpRecord(email));
  const savedHash = record?.get('CodeHash');
  if (!savedHash) throw otpError('No code found. Please request a new code.');

  // Resends reset Tries, so also cap wrong attempts per day.
  const now = Date.now();
  const failsSince = record.get('FailsSince')?.getTime?.() || 0;
  const isNewDay = now - failsSince >= DAY_MS;
  if (!isNewDay && Number(record.get('DailyFails') || 0) >= MAX_DAILY_FAILS) {
    throw otpError('Too many invalid attempts today. Please try again tomorrow.');
  }
  const tries = Number(record.get('Tries') || 0);
  if (tries >= MAX_ATTEMPTS) {
    throw otpError('Too many invalid attempts. Please request a new code.');
  }
  const expiry = record.get('ExpiresAt');
  if (!expiry || now > expiry.getTime()) {
    throw otpError('This code has expired. Please request a new code.');
  }
  if (!OTP_RE.test(code) || !codesMatch(hashOtp(email, code), savedHash)) {
    record.increment('Tries');
    if (isNewDay) {
      record.set('FailsSince', new Date(now));
      record.set('DailyFails', 1);
    } else {
      record.increment('DailyFails');
    }
    await record.save(null, { useMasterKey: true });
    throw otpError('Invalid code.');
  }

  // Single use. SentAt stays so the resend cooldown still applies.
  record.unset('CodeHash');
  record.unset('ExpiresAt');
  record.unset('Tries');
  await record.save(null, { useMasterKey: true });
  return true;
}
