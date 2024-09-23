import { createTransport } from 'nodemailer';
import { appName } from '../../Utils.js';
// Online Javascript Editor for free
// Write, Edit and Run your Javascript code using JS Online Compiler

function generateOtpWithSum10() {
  let otp = [];
  let sum = 0;

  // First, generate 3 random digits (0-9) and add them to the sum
  for (let i = 0; i < 3; i++) {
    let digit = Math.floor(Math.random() * 10);
    otp.push(digit);
    sum += digit;
  }

  // Calculate the last digit to ensure the sum equals 10
  let lastDigit = 10 - sum;

  // If the last digit is not valid (e.g., greater than 9), regenerate
  if (lastDigit >= 0 && lastDigit <= 9) {
    otp.push(lastDigit);
  } else {
    return generateOtpWithSum10(); // Recursively generate again
  }

  return otp.join('');
}

export default async function validateSmtp(request, response) {
  const host = request.body.host;
  const port = request.body?.port?.toString();
  const username = request.body.username;
  const password = request.body.password;
  const secure = request.body?.secure;
  const email = request.body?.email;
  const otp = generateOtpWithSum10();
  // console.log('Generated OTP:', otp);

  try {
    const smtpsecure = secure || port !== '465' ? false : true;
    const transporterSMTP = createTransport({
      host: host,
      port: port,
      secure: smtpsecure,
      auth: { user: username, pass: password },
    });
    const from = appName;
    const mailsender = username;
    const messageParams = {
      from: from + ' <' + mailsender + '>',
      to: email,
      subject: `Your ${appName} SMTP credentials verification code`,
      text: 'mail',
      html:
        `<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body><div style='background-color:#f5f5f5;padding:20px'><div style='box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;background-color:white;'><div style='background-color:red;padding:2px;font-family:system-ui; background-color:#47a3ad;'>    <p style='font-size:20px;font-weight:400;color:white;padding-left:20px',>SMTP Verification Code</p></div><div style='padding:20px'><p style='font-family:system-ui;font-size:14px'>Your verification code is:</p><p style=' text-decoration: none; font-weight: bolder; color:blue;font-size:45px;margin:20px'>` +
        otp +
        '</p></div> </div> </div></body></html>',
    };

    const res = await transporterSMTP.sendMail(messageParams);
    console.log('custom smtp transporter res: ', res?.response);
    if (!res.err) {
      response.status(200).json({ message: 'success' });
    }
  } catch (err) {
    console.log('err ', err);
    const code = err?.responseCode || 400;
    const message = err?.response || 'failed!';
    response.status(code).json({ error: message });
  }
}
