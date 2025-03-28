import fs from 'node:fs';
import https from 'https';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { smtpenable, smtpsecure, updateMailCount } from '../../Utils.js';
import { createTransport } from 'nodemailer';
import axios from 'axios';
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
          user: process.env.SMTP_USERNAME ? process.env.SMTP_USERNAME : process.env.SMTP_USER_EMAIL,
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
      const randomNumber = Math.floor(Math.random() * 5000);
      const testPdf = `test_${randomNumber}.pdf`;
      try {
        let Pdf = fs.createWriteStream(testPdf);
        const writeToLocalDisk = () => {
          return new Promise((resolve, reject) => {
            const isSecure =
              new URL(req.params.url)?.protocol === 'https:' &&
              new URL(req.params.url)?.hostname !== 'localhost';
            if (isSecure) {
              https
                .get(req.params.url, async function (response) {
                  response.pipe(Pdf);
                  response.on('end', () => resolve('success'));
                })
                .on('error', e => {
                  console.error(`error: ${e.message}`);
                  resolve('error');
                });
            } else {
              const httpsAgent = new https.Agent({ rejectUnauthorized: false }); // Disable SSL validation
              axios
                .get(req.params.url, { responseType: 'stream', httpsAgent })
                .then(response => {
                  response.data.pipe(Pdf);
                  Pdf.on('finish', () => resolve('success'));
                  Pdf.on('error', () => resolve('error'));
                })
                .catch(e => {
                  console.log('error', e.message);
                  resolve('error');
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
          const filename = req.params.filename;
          const file = {
            filename: filename || pdfName || 'exported.pdf',
            content: smtpenable ? PdfBuffer : undefined,
            data: smtpenable ? undefined : PdfBuffer,
          };

          let attachment;
          const certificatePath = req.params.certificatePath || `./exports/certificate.pdf`;
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
          const replyto = req.params?.replyto || '';
          const messageParams = {
            from: from + ' <' + mailsender + '>',
            to: req.params.recipient,
            subject: req.params.subject,
            text: req.params.text || 'mail',
            html: req.params.html || '',
            attachments: smtpenable ? attachment : undefined,
            attachment: smtpenable ? undefined : attachment,
            bcc: req.params.bcc ? req.params.bcc : undefined,
            replyTo: replyto ? replyto : undefined,
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
              if (fs.existsSync(testPdf)) {
                try {
                  fs.unlinkSync(testPdf);
                } catch (err) {
                  console.log('Err in unlink pdf sendmailv3');
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
                if (fs.existsSync(testPdf)) {
                  try {
                    fs.unlinkSync(testPdf);
                  } catch (err) {
                    console.log('Err in unlink pdf sendmailv3');
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
              if (fs.existsSync(testPdf)) {
                try {
                  fs.unlinkSync(testPdf);
                } catch (err) {
                  console.log('Err in unlink pdf sendmailv3');
                }
              }
              return { status: 'error' };
            }
          }
        }
      } catch (err) {
        console.log('err in sendmailv3', err);
        if (fs.existsSync(testPdf)) {
          try {
            fs.unlinkSync(testPdf);
          } catch (err) {
            console.log('Err in unlink pdf sendmailv3');
          }
        }
        if (err) {
          return { status: 'error' };
        }
      }
    } else {
      const from = req.params.from || '';
      const mailsender = smtpenable ? process.env.SMTP_USER_EMAIL : process.env.MAILGUN_SENDER;
      const replyto = req.params?.replyto || '';
      const messageParams = {
        from: from + ' <' + mailsender + '>',
        to: req.params.recipient,
        subject: req.params.subject,
        text: req.params.text || 'mail',
        html: req.params.html || '',
        bcc: req.params.bcc ? req.params.bcc : undefined,
        replyTo: replyto ? replyto : undefined,
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

async function sendmailv3(req) {
  const nonCustomMail = await sendMailProvider(req);
  return nonCustomMail;
}

export default sendmailv3;
