import fs from 'node:fs';
import https from 'https';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { createTransport } from 'nodemailer';
import { updateMailCount } from '../../Utils.js';

async function sendmailv3(req) {
  try {
    let transporterSMTP;
    let mailgunClient;
    let mailgunDomain;
    if (process.env.SMTP_ENABLE) {
      transporterSMTP = createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 465,
        secure: process.env.SMTP_SECURE || true,
        auth: {
          user: process.env.SMTP_USER_EMAIL,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      const mailgun = new Mailgun(formData);
      mailgunClient = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY,
      });
      mailgunDomain = process.env.MAILGUN_DOMAIN;
    }
    if (req.params.url) {
      let Pdf = fs.createWriteStream('test.pdf');
      const writeToLocalDisk = () => {
        return new Promise((resolve, reject) => {
          https.get(req.params.url, async function (response) {
            response.pipe(Pdf);
            response.on('end', () => resolve('success'));
          });
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
          content: process.env.SMTP_ENABLE ? PdfBuffer : undefined, //fs.readFileSync('./exports/exported_file_1223.pdf'),
          data: process.env.SMTP_ENABLE ? undefined : PdfBuffer,
        };

        // const html = "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body style='text-align: center;'> <p style='font-weight: bolder; font-size: large;'>Hello!</p> <p>This is a html checking mail</p><p><button style='background-color: lightskyblue; cursor: pointer; border-radius: 5px; padding: 10px; border-style: solid; border-width: 2px; text-decoration: none; font-weight: bolder; color:blue'>Verify email</button></p></body></html>"

        const from = req.params.from || '';
        const mailsender = process.env.SMTP_ENABLE
          ? process.env.SMTP_USER_EMAIL
          : process.env.MAILGUN_SENDER;

        const messageParams = {
          from: from + ' <' + mailsender + '>',
          to: req.params.recipient,
          subject: req.params.subject,
          text: req.params.text || 'mail',
          html: req.params.html || '',
          attachments: process.env.SMTP_ENABLE ? [file] : undefined,
          attachment: process.env.SMTP_ENABLE ? undefined : file,
        };
        if (transporterSMTP) {
          const res = await transporterSMTP.sendMail(messageParams);
          console.log('Res ', res);
          if (!res.err) {
            if (req.params?.extUserId) {
              await updateMailCount(req.params.extUserId);
            }
            return {
              status: 'success',
            };
          }
        } else {
          const res = await mailgunClient.messages.create(mailgunDomain, messageParams);
          console.log('Res ', res);
          if (res.status === 200) {
            if (req.params?.extUserId) {
              await updateMailCount(req.params.extUserId);
            }
            return {
              status: 'success',
            };
          }
        }
      }
    } else {
      const from = req.params.from || '';
      const mailsender = process.env.SMTP_ENABLE
        ? process.env.SMTP_USER_EMAIL
        : process.env.MAILGUN_SENDER;

      const messageParams = {
        from: from + ' <' + mailsender + '>',
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
          return {
            status: 'success',
          };
        }
      } else {
        const res = await mailgunClient.messages.create(mailgunDomain, messageParams);
        console.log('Res ', res);
        if (res.status === 200) {
          if (req.params?.extUserId) {
            await updateMailCount(req.params.extUserId);
          }
          return {
            status: 'success',
          };
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

export default sendmailv3;
