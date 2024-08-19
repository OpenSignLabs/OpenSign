import fs from 'node:fs';
import https from 'https';
import http from 'http';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { smtpenable, smtpsecure, updateMailCount, useLocal } from '../../Utils.js';
import sendMailGmailProvider from './sendMailGmailProvider.js';
import { createTransport } from 'nodemailer';
async function sendMailProvider(req) {
  const mailgunApiKey = process.env.MAILGUN_API_KEY;
  try {
    let transporterSMTP;
    let mailgunClient;
    let mailgunDomain;
    if (smtpenable) {
      console.log("Passou la");

      transporterSMTP = createTransport({
        host: process.env.SMTP_HOST,

        port: process.env.SMTP_PORT || 465,
        secure: smtpsecure,
        auth: {
          user: "resend",
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
          if (useLocal !== 'true') {
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
        //  `certificateBuffer` used to create buffer from pdf file
        try {
          const certificateBuffer = fs.readFileSync('./exports/certificate.pdf');
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
        const from = req.params.from || '';
        const mailsender = smtpenable ? process.env.SMTP_USER_EMAIL : process.env.MAILGUN_SENDER;

        const messageParams = {
          from: "delivered@resend.dev",
          to: req.params.recipient,
          subject: req.params.subject,
          text: req.params.text || 'mail',
          html: req.params.html || '',
          attachments: smtpenable ? attachment : undefined,
          attachment: smtpenable ? undefined : attachment,
        };
        if (transporterSMTP) {
          const res = await transporterSMTP.sendMail(messageParams);
          console.log('Res ', res);
          if (!res.err) {
            if (req.params?.extUserId) {
              await updateMailCount(req.params.extUserId);
            }
            try {
              fs.unlinkSync('./exports/certificate.pdf');
            } catch (err) {
              console.log('Err in unlink certificate sendmailv3');
            }
            return { status: 'success' };
          }
        } else {
          if (mailgunApiKey) {
            const res = await mailgunClient.messages.create(mailgunDomain, messageParams);
            console.log('Res ', res);
            if (res.status === 200) {
              if (req.params?.extUserId) {
                await updateMailCount(req.params.extUserId);
              }
              try {
                fs.unlinkSync('./exports/certificate.pdf');
              } catch (err) {
                console.log('Err in unlink certificate sendmailv3');
              }
              return { status: 'success' };
            }
          } else {
            try {
              fs.unlinkSync('./exports/certificate.pdf');
            } catch (err) {
              console.log('Err in unlink certificate sendmailv3');
            }
            return { status: 'error' };
          }
        }
      }
    } else {
      console.log(req.params);

      const mailsender = smtpenable ? process.env.SMTP_USER_EMAIL : process.env.MAILGUN_SENDER;

      const messageParams = {
        from: "delivered@resend.dev",
        to: req.params.recipient,
        subject: req.params.subject,
        text: req.params.text || 'mail',
        html: req.params.html || '',
      };

      if (transporterSMTP) {
        const res = await transporterSMTP.sendMail(messageParams);
        console.log('Res ', res);
        if (!res.err) {
          if (req.params?.extUserId) {
            await updateMailCount(req.params.extUserId);
          }
          return { status: 'success' };
        }
      } else {
        if (mailgunApiKey) {
          const res = await mailgunClient.messages.create(mailgunDomain, messageParams);
          console.log('Res ', res);
          if (res.status === 200) {
            if (req.params?.extUserId) {
              await updateMailCount(req.params.extUserId);
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
async function sendmailv3(req) {
  const mailProvider = req.params.mailProvider || 'default';
  if (mailProvider) {
    try {
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
        if (_extRes.google_refresh_token && mailProvider === 'google') {
          const res = await sendMailGmailProvider(_extRes, template);
          if (res.code === 200) {
            await updateMailCount(req.params.extUserId);
            return { status: 'success' };
          } else {
            return { status: 'error' };
          }
        } else {
          const nonCustomMail = await sendMailProvider(req);
          return nonCustomMail;
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
