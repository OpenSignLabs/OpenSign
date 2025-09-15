import axios from 'axios';
import { appName, cloudServerUrl, serverAppId } from '../../../Utils.js';

const serverUrl = cloudServerUrl;
const appId = serverAppId;
const masterKey = process.env.MASTER_KEY;

// Constants (adjust to your preference)
export const OTP_LENGTH = 6;
export const OTP_EXPIRES_MIN = 10; // OTP validity in minutes
export const RESEND_COOLDOWN_SEC = 30; // Cooldown between OTP sends
export const MAX_ATTEMPTS = 5; // Max allowed wrong attempts

export function generateOtp(len = OTP_LENGTH) {
  // 6-digit numeric OTP (000000–999999, padded)
  const n = Math.floor(Math.random() * Math.pow(10, len));
  return String(n).padStart(len, '0');
}

export async function sendDeleteOtpEmail(extUser, otp) {
  const params = {
    extUserId: extUser.id,
    from: appName,
    recipient: extUser?.get('Email'),
    subject: 'OTP for Deletion account request',
    html: `
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
                  This code expires in <strong>${OTP_EXPIRES_MIN}</strong> minutes.
                </p>

                <hr style="border:none;border-top:1px solid #e9ecf1;margin:18px 0;">
                <p style="margin:0;font-size:12px;color:#64748b;">
                  If you didn’t request this code, you can ignore this email.
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
`,
  };
  const headers = {
    'Content-Type': 'application/json',
    'X-Parse-Application-Id': appId,
    'X-Parse-Master-Key': masterKey,
  };
  return axios.post(serverUrl + '/functions/sendmailv3', params, { headers });
}

export function msUntil(nowMs, futureMs) {
  return Math.max(0, (futureMs || 0) - nowMs);
}
