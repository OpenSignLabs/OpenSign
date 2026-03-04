import fs from 'node:fs';
import https from 'https';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { appName, smtpenable, smtpsecure, updateMailCount } from '../../Utils.js';
import { createTransport } from 'nodemailer';
import axios from 'axios';
async function sendMailProvider(req) {
  const app = appName;
  const extUserId = req.params?.extUserId || '';
  const reportMsg = `<p style="font-size: 13px; color:grey; text-align: center;">If you think this email is inappropriate or spam, you may file a complaint with OpenSign™ <a href="mailto:complaints@opensignlabs.com?subject=Spam%20report%20for%20user%20ID%20${extUserId}&body=Hello%20Support%20Team%2C%0D%0A%0D%0AI%E2%80%99m%20reporting%20spam%20activity%20coming%20from%20a%20sender%20using%20your%20platform.%0D%0A%0D%0AThe%20messages%20I%20received%20appear%20unsolicited%20and%20suspicious.%20The%20user%20ID%20associated%20with%20the%20emails%20is%3A%20${extUserId}.%20Please%20investigate%20this%20account%20and%20take%20appropriate%20action%20to%20prevent%20further%20abuse.%0D%0A%0D%0AIf%20you%20need%20additional%20details%2C%20I%E2%80%99m%20happy%20to%20provide%20the%20original%20email%20headers%20or%20screenshots.%0D%0A%0D%0AThank%20you%20for%20looking%20into%20this.%0D%0A%0D%0ABest%20regards%2C%0D%0A%5BYour%20Name%5D">here</a>.</p>`;

  const mailgunApiKey = process.env.MAILGUN_API_KEY;
  try {
    let transporterSMTP;
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
              const localUrl = req.params.url;
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
            html: req.params?.html ? req.params.html + reportMsg : '',
            attachments: smtpenable ? attachment : undefined,
            attachment: smtpenable ? undefined : attachment,
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
                if (extUserId) {
                  await updateMailCount(extUserId);
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
        console.log(`Error in sendmailv3: ${err}`);
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
    }
  } catch (err) {
    console.log(`Error in sendmailv3: ${err}`);
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
