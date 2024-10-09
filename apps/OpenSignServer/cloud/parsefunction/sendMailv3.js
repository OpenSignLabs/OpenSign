import fs from 'node:fs';
import https from 'https';
import http from 'http';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { smtpenable, smtpsecure, updateMailCount, useLocal } from '../../Utils.js';
import sendMailGmailProvider from './sendMailGmailProvider.js';
import { createTransport } from 'nodemailer';
async function sendMailProvider(req, plan, monthchange) {
  const mailgunApiKey = process.env.MAILGUN_API_KEY;
  try {
    let transporterSMTP;
    let mailgunClient;
    let mailgunDomain;
    if (smtpenable) {
      transporterSMTP = createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 465,
        secure: smtpsecure,
        auth: {
          user: process.env.SMTP_USER_EMAIL,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      if (mailgunApiKey) {
        const mailgun = new Mailgun(formData);
        mailgunClient = mailgun.client({ username: 'api', key: mailgunApiKey });
        mailgunDomain = process.env.MAILGUN_DOMAIN;
      }
    }
    if (req.params.url) {
      let Pdf = fs.createWriteStream('test.pdf');
      const writeToLocalDisk = () => {
        return new Promise((resolve, reject) => {
          const isSecure = new URL(req.params.url)?.protocol === 'https:';
          if (useLocal !== 'true' || isSecure) {
            https.get(req.params.url, async function (response) {
              response.pipe(Pdf);
              response.on('end', () => resolve('success'));
            });
          } else {
            const path = new URL(req.params.url)?.pathname;
            const localurl = 'http://localhost:8080' + path;
            http.get(localurl, async function (response) {
              response.pipe(Pdf);
              response.on('end', () => resolve('success'));
            });
          }
        });
      };
      // `writeToLocalDisk` is used to create pdf file from doc url
      const ress = await writeToLocalDisk();
      if (ress) {
        function readTolocal() {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              let PdfBuffer = fs.readFileSync(Pdf.path);
              resolve(PdfBuffer);
            }, 100);
          });
        }
        //  `PdfBuffer` used to create buffer from pdf file
        let PdfBuffer = await readTolocal();
        const pdfName = req.params.pdfName && `${req.params.pdfName}.pdf`;
        const file = {
          filename: pdfName || 'exported.pdf',
          content: smtpenable ? PdfBuffer : undefined, //fs.readFileSync('./exports/exported_file_1223.pdf'),
          data: smtpenable ? undefined : PdfBuffer,
        };

        let attachment;
        const certificatePath = './exports/certificate.pdf';
        if (fs.existsSync(certificatePath)) {
          try {
            //  `certificateBuffer` used to create buffer from pdf file
            const certificateBuffer = fs.readFileSync(certificatePath);
            const certificate = {
              filename: 'certificate.pdf',
              content: smtpenable ? certificateBuffer : undefined, //fs.readFileSync('./exports/exported_file_1223.pdf'),
              data: smtpenable ? undefined : certificateBuffer,
            };
            attachment = [file, certificate];
          } catch (err) {
            attachment = [file];
            console.log('Err in read certificate sendmailv3', err);
          }
        } else {
          attachment = [file];
        }
        const from = req.params.from || '';
        const mailsender = smtpenable ? process.env.SMTP_USER_EMAIL : process.env.MAILGUN_SENDER;

        const messageParams = {
          from: from + ' <' + mailsender + '>',
          to: req.params.recipient,
          subject: req.params.subject,
          text: req.params.text || 'mail',
          html: req.params.html || '',
          attachments: smtpenable ? attachment : undefined,
          attachment: smtpenable ? undefined : attachment,
        };
        if (transporterSMTP) {
          const res = await transporterSMTP.sendMail(messageParams);
          console.log('smtp transporter res: ', res?.response);
          if (!res.err) {
            if (req.params?.extUserId) {
              await updateMailCount(req.params.extUserId, plan, monthchange);
            }
            if (fs.existsSync(certificatePath)) {
              try {
                fs.unlinkSync(certificatePath);
              } catch (err) {
                console.log('Err in unlink certificate sendmailv3');
              }
            }
            return { status: 'success' };
          }
        } else {
          if (mailgunApiKey) {
            const res = await mailgunClient.messages.create(mailgunDomain, messageParams);
            console.log('mailgun res: ', res?.status);
            if (res.status === 200) {
              if (req.params?.extUserId) {
                await updateMailCount(req.params.extUserId, plan, monthchange);
              }
              if (fs.existsSync(certificatePath)) {
                try {
                  fs.unlinkSync(certificatePath);
                } catch (err) {
                  console.log('Err in unlink certificate sendmailv3');
                }
              }
              return { status: 'success' };
            }
          } else {
            if (fs.existsSync(certificatePath)) {
              try {
                fs.unlinkSync(certificatePath);
              } catch (err) {
                console.log('Err in unlink certificate sendmailv3');
              }
            }
            return { status: 'error' };
          }
        }
      }
    } else {
      const from = req.params.from || '';
      const mailsender = smtpenable ? process.env.SMTP_USER_EMAIL : process.env.MAILGUN_SENDER;

      const messageParams = {
        from: from + ' <' + mailsender + '>',
        to: req.params.recipient,
        subject: req.params.subject,
        text: req.params.text || 'mail',
        html: req.params.html || '',
      };

      if (transporterSMTP) {
        const res = await transporterSMTP.sendMail(messageParams);
        console.log('smtp transporter res: ', res?.response);
        if (!res.err) {
          if (req.params?.extUserId) {
            await updateMailCount(req.params.extUserId, plan, monthchange);
          }
          return { status: 'success' };
        }
      } else {
        if (mailgunApiKey) {
          const res = await mailgunClient.messages.create(mailgunDomain, messageParams);
          console.log('mailgun res: ', res?.status);
          if (res.status === 200) {
            if (req.params?.extUserId) {
              await updateMailCount(req.params.extUserId, plan, monthchange);
            }
            return { status: 'success' };
          }
        } else {
          return { status: 'error' };
        }
      }
    }
  } catch (err) {
    console.log('err in sendmailv3', err);
    if (err) {
      return { status: 'error' };
    }
  }
}
async function sendcustomsmtp(extRes, req) {
  const smtpsecure = extRes.SmtpConfig.port !== '465' ? false : true;
  const transporterSMTP = createTransport({
    host: extRes.SmtpConfig.host,
    port: extRes.SmtpConfig.port,
    secure: smtpsecure,
    auth: { user: extRes.SmtpConfig.username, pass: extRes.SmtpConfig.password },
  });
  if (req.params.url) {
    let Pdf = fs.createWriteStream('test.pdf');
    const writeToLocalDisk = () => {
      return new Promise((resolve, reject) => {
        const isSecure = new URL(req.params.url)?.protocol === 'https:';
        if (useLocal !== 'true' || isSecure) {
          https.get(req.params.url, async function (response) {
            response.pipe(Pdf);
            response.on('end', () => resolve('success'));
          });
        } else {
          const path = new URL(req.params.url)?.pathname;
          const localurl = 'http://localhost:8080' + path;
          http.get(localurl, async function (response) {
            response.pipe(Pdf);
            response.on('end', () => resolve('success'));
          });
        }
      });
    };
    // `writeToLocalDisk` is used to create pdf file from doc url
    const ress = await writeToLocalDisk();
    if (ress) {
      function readTolocal() {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            let PdfBuffer = fs.readFileSync(Pdf.path);
            resolve(PdfBuffer);
          }, 100);
        });
      }
      //  `PdfBuffer` used to create buffer from pdf file
      let PdfBuffer = await readTolocal();
      const pdfName = req.params.pdfName ? `${req.params.pdfName}.pdf` : 'exported.pdf';
      const file = { filename: pdfName, content: PdfBuffer };
      let attachment;
      const certificatePath = './exports/certificate.pdf';
      if (fs.existsSync(certificatePath)) {
        try {
          //  `certificateBuffer` used to create buffer from pdf file
          const certificateBuffer = fs.readFileSync(certificatePath);
          const certificate = { filename: 'certificate.pdf', content: certificateBuffer };
          attachment = [file, certificate];
        } catch (err) {
          attachment = [file];
          console.log('Err in read certificate sendmailv3', err);
        }
      } else {
        attachment = [file];
      }
      const from = req.params.from || '';
      const mailsender = extRes.SmtpConfig.username;

      const messageParams = {
        from: from + ' <' + mailsender + '>',
        to: req.params.recipient,
        subject: req.params.subject,
        text: req.params.text || 'mail',
        html: req.params.html || '',
        attachments: attachment,
      };
      const res = await transporterSMTP.sendMail(messageParams);
      console.log('custom smtp transporter res: ', res?.response);
      if (!res.err) {
        if (req.params?.extUserId) {
          await updateMailCount(req.params.extUserId); //, plan, monthchange
        }
        if (fs.existsSync(certificatePath)) {
          try {
            fs.unlinkSync(certificatePath);
          } catch (err) {
            console.log('Err in unlink certificate sendmailv3');
          }
        }
        return { status: 'success', code: 200 };
      }
    }
  } else {
    const from = req.params.from || '';
    const mailsender = extRes.SmtpConfig.username;
    const messageParams = {
      from: from + ' <' + mailsender + '>',
      to: req.params.recipient,
      subject: req.params.subject,
      text: req.params.text || 'mail',
      html: req.params.html || '',
    };

    const res = await transporterSMTP.sendMail(messageParams);
    console.log('custom smtp transporter res: ', res?.response);
    if (!res.err) {
      if (req.params?.extUserId) {
        await updateMailCount(req.params.extUserId); //, plan, monthchange
      }
      return { status: 'success', code: 200 };
    }
  }
}
async function sendmailv3(req) {
  const mailProvider = req.params.mailProvider || 'default';
  if (mailProvider) {
    try {
      const Plan = req.params.plan;
      const extUserId = req.params.extUserId || '';
      const pdfName = req.params.pdfName || '';
      const template = {
        sender: req.params.from || '',
        receiver: req.params.recipient,
        subject: req.params.subject,
        html: req.params.html || '',
        url: req.params.url ? req.params.url : '',
        pdfName: pdfName,
      };
      const extUserQuery = new Parse.Query('contracts_Users');
      const extRes = await extUserQuery.get(extUserId, { useMasterKey: true });
      if (extRes) {
        const _extRes = JSON.parse(JSON.stringify(extRes));
        if (
          _extRes.active_mail_adapter === 'google' &&
          _extRes.google_refresh_token &&
          mailProvider === 'google'
        ) {
          const res = await sendMailGmailProvider(_extRes, template);
          if (res.code === 200) {
            await updateMailCount(req.params.extUserId);
            return { status: 'success' };
          } else {
            return { status: 'error' };
          }
        } else if (_extRes.active_mail_adapter === 'smtp' && mailProvider === 'smtp') {
          const res = await sendcustomsmtp(_extRes, req);
          if (res.code === 200) {
            await updateMailCount(req.params.extUserId);
            return { status: 'success' };
          } else {
            return { status: 'error' };
          }
        } else {
          if (Plan && Plan === 'freeplan') {
            let MonthlyFreeEmails = _extRes?.MonthlyFreeEmails || 0;
            if (_extRes?.LastEmailCountReset?.iso) {
              const lastDate = new Date(_extRes?.LastEmailCountReset?.iso);
              const newDate = new Date();
              const isMonthChange = newDate.getMonth() > lastDate.getMonth();
              if (isMonthChange) {
                const nonCustomMail = await sendMailProvider(req, Plan, true);
                return nonCustomMail;
              } else {
                if (MonthlyFreeEmails >= 15) {
                  return { status: 'quota-reached' };
                } else {
                  const nonCustomMail = await sendMailProvider(req, Plan);
                  return nonCustomMail;
                }
              }
            } else {
              const nonCustomMail = await sendMailProvider(req, Plan);
              return nonCustomMail;
            }
          } else {
            const nonCustomMail = await sendMailProvider(req, '');
            return nonCustomMail;
          }
        }
      }
    } catch (err) {
      console.log('err in send custom mail', err);
      return { status: 'error' };
    }
  } else {
    const nonCustomMail = await sendMailProvider(req);
    return nonCustomMail;
  }
}

export default sendmailv3;
