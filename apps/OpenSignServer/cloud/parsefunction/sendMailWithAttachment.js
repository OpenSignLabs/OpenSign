import fs from 'node:fs';
import https from 'https';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { smtpenable, smtpsecure, updateMailCount } from '../../Utils.js';
import { renderComplaintFooter, resolveBrandContext } from '../../utils/brandContext.js';
import { createTransport } from 'nodemailer';
import axios from 'axios';

function safeUnlink(filePath, label = 'file') {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.log(`sendMailWithAttachment unlink ${label} error`);
    }
  }
}
async function sendMailProvider(params) {
  const brand = resolveBrandContext({});
  const extUserId = params?.extUserId || '';
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
    if (params.url) {
      const randomNumber = Math.floor(Math.random() * 5000);
      const testPdf = `test_${randomNumber}.pdf`;
      try {
        let Pdf = fs.createWriteStream(testPdf);
        const writeToLocalDisk = () => {
          return new Promise((resolve, reject) => {
            const isSecure =
              new URL(params.url)?.protocol === 'https:' &&
              new URL(params.url)?.hostname !== 'localhost';
            if (isSecure) {
              https
                .get(params.url, async function (response) {
                  // An error body (404/500) must never be attached as the PDF.
                  if (response.statusCode !== 200) {
                    response.resume();
                    safeUnlink(testPdf, 'pdf');
                    resolve('error');
                    return;
                  }
                  response.pipe(Pdf);
                  // Writing completion is handled by the attachment-download
                  // change; this PR only rejects a non-200 response.
                  response.on('end', () => resolve('success'));
                })
                .on('error', e => {
                  console.error(`error: ${e.message}`);
                  resolve('error');
                });
            } else {
              const httpsAgent = new https.Agent({ rejectUnauthorized: false }); // Disable SSL validation
              const localUrl = params.url;
              const newlocalUrl = localUrl.replace(
                'https://localhost:3001/api',
                'http://localhost:8080'
              );
              axios
                .get(newlocalUrl, { responseType: 'stream', httpsAgent: httpsAgent })
                .then(response => {
                  response.data.pipe(Pdf);
                  Pdf.on('finish', () => resolve('success'));
                  Pdf.on('error', () => resolve('error'));
                })
                .catch(e => {
                  console.log('error in localurl', e.message);
                  resolve('error');
                });
            }
          });
        };
        // `writeToLocalDisk` is used to create pdf file from doc url
        const ress = await writeToLocalDisk();
        if (ress !== 'success') {
          safeUnlink(testPdf, 'pdf');
          return { status: 'error' };
        }
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
          if (!PdfBuffer || PdfBuffer.length === 0) {
            safeUnlink(testPdf, 'pdf');
            return { status: 'error' };
          }
          const pdfName = params.pdfName && `${params.pdfName}.pdf`;
          const filename = params.filename;
          const file = {
            filename: filename || pdfName || 'exported.pdf',
            content: smtpenable ? PdfBuffer : undefined,
            data: smtpenable ? undefined : PdfBuffer,
          };

          let attachment;
          const certificatePath = params.certificatePath || `./exports/certificate.pdf`;
          let certificateBuffer = null;
          if (fs.existsSync(certificatePath)) {
            try {
              const stat = fs.statSync(certificatePath);
              if (stat.size > 0) {
                certificateBuffer = fs.readFileSync(certificatePath);
              }
            } catch (err) {
              console.log('sendMailWithAttachment read certificate error', err);
            }
          }
          if (certificateBuffer && certificateBuffer.length > 0) {
            const certificate = {
              filename: 'certificate.pdf',
              content: smtpenable ? certificateBuffer : undefined,
              data: smtpenable ? undefined : certificateBuffer,
            };
            attachment = [file, certificate];
          } else {
            attachment = [file];
          }
          const from = params.from || '';
          const mailsender = smtpenable ? process.env.SMTP_USER_EMAIL : process.env.MAILGUN_SENDER;
          const replyto = params?.replyto || '';
          const messageParams = {
            from: from + ' <' + mailsender + '>',
            to: params.recipient,
            subject: params.subject,
            text: params.text || 'mail',
            html: params?.html ? params.html + reportMsg : '',
            attachments: smtpenable ? attachment : undefined,
            attachment: smtpenable ? undefined : attachment,
            bcc: params.bcc ? params.bcc : undefined,
            cc: params.cc ? params.cc : undefined,
            replyTo: replyto ? replyto : undefined,
          };
          const cleanupPaths = [
            { path: certificatePath, label: 'certificate' },
            { path: testPdf, label: 'pdf' },
          ];
          if (transporterSMTP) {
            const res = await transporterSMTP.sendMail(messageParams);
            console.log('smtp transporter res: ', res?.response);
            if (!res.err) {
              if (extUserId) {
                await updateMailCount(extUserId);
              }

              cleanupPaths.forEach(file => safeUnlink(file.path, file.label));
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
                cleanupPaths.forEach(file => safeUnlink(file.path, file.label));
                return { status: 'success' };
              }
            } else {
              cleanupPaths.forEach(file => safeUnlink(file.path, file.label));
              return { status: 'error' };
            }
          }
        }
      } catch (err) {
        console.log(`sendMailWithAttachment error: ${err}`);
        safeUnlink(testPdf, 'testPdf');
        if (err) return { status: 'error' };
      }
    } else {
      const from = params.from || '';
      const mailsender = smtpenable ? process.env.SMTP_USER_EMAIL : process.env.MAILGUN_SENDER;
      const replyto = params?.replyto || '';
      const messageParams = {
        from: from + ' <' + mailsender + '>',
        to: params.recipient,
        subject: params.subject,
        text: params.text || 'mail',
        html: params?.html ? params.html + reportMsg : '',
        bcc: params.bcc ? params.bcc : undefined,
        cc: params.cc ? params.cc : undefined,
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
    }
  } catch (err) {
    console.log(`sendMailWithAttachment Error: ${err}`);
    if (err) {
      return { status: 'error' };
    }
  } finally {
    if (transporterSMTP) {
      transporterSMTP?.close?.();
    }
  }
}

// `sendMailWithAttachment` function is used to send completion and forwarded document mail and it also fix security issue.
export default async function sendMailWithAttachment(params) {
  const nonCustomMail = await sendMailProvider(params);
  return nonCustomMail;
}
