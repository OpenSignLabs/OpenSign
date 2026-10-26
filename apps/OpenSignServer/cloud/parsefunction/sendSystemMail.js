import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { smtpenable, smtpsecure, normalizeMailSubject, updateMailCount } from '../../Utils.js';
import { renderComplaintFooter, resolveBrandContext } from '../../utils/brandContext.js';
import { createTransport } from 'nodemailer';
async function sendMailProvider(req) {
  const brand = resolveBrandContext({});
  const extUserId = req.params?.extUserId || '';
  const senderEmail = '';
  const reportMsg = renderComplaintFooter(brand, extUserId, senderEmail);

  const mailgunApiKey = process.env.MAILGUN_API_KEY;
  let transporterSMTP;
  try {
    let mailgunClient;
    let mailgunDomain;
    if (smtpenable) {
      let transporterConfig = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 465,
        secure: smtpsecure,
      };

      // ✅ Add auth only if BOTH username & password exist
      const smtpUser = process.env.SMTP_USERNAME;
      const smtpPass = process.env.SMTP_PASS;

      if (smtpUser && smtpPass) {
        transporterConfig.auth = {
          user: process.env.SMTP_USERNAME ? process.env.SMTP_USERNAME : process.env.SMTP_USER_EMAIL,
          pass: smtpPass,
        };
      }
      transporterSMTP = createTransport(transporterConfig);
    } else {
      if (mailgunApiKey) {
        const mailgun = new Mailgun(formData);
        mailgunClient = mailgun.client({ username: 'api', key: mailgunApiKey });
        mailgunDomain = process.env.MAILGUN_DOMAIN;
      }
    }

    const from = req.params.from || '';
    const mailsender = smtpenable ? process.env.SMTP_USER_EMAIL : process.env.MAILGUN_SENDER;
    const replyto = req.params?.replyto || '';
    const messageParams = {
      from: from + ' <' + mailsender + '>',
      to: req.params.recipient,
      subject: normalizeMailSubject(req.params.subject),
      text: req.params.text || 'mail',
      html: req.params?.html ? req.params.html + reportMsg : '',
      bcc: req.params.bcc ? req.params.bcc : undefined,
      replyTo: replyto ? replyto : undefined,
    };

    if (transporterSMTP) {
      const res = await transporterSMTP.sendMail(messageParams);
      console.log('smtp transporter res: ', res?.response);
      if (!res.err) {
        if (extUserId) {
          await updateMailCount(extUserId);
        }
        return { status: 'success' };
      }
    } else {
      if (mailgunApiKey) {
        const res = await mailgunClient.messages.create(mailgunDomain, messageParams);
        console.log('mailgun res: ', res?.status);
        if (res.status === 200) {
          if (extUserId) {
            await updateMailCount(extUserId);
          }
          return { status: 'success' };
        }
      } else {
        return { status: 'error' };
      }
    }
  } catch (err) {
    console.log(`sendSystemMail Error: ${err}`);
    if (err) {
      return { status: 'error' };
    }
  } finally {
    if (transporterSMTP) {
      transporterSMTP?.close?.();
    }
  }
}

async function sendSystemMail(req) {
  const nonCustomMail = await sendMailProvider(req);
  return nonCustomMail;
}

export default sendSystemMail;
