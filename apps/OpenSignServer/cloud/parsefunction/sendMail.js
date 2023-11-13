import fs from 'node:fs';
import https from 'https';
import {createTransport} from "nodemailer"

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_HOST || 465,
  secure: process.env.SMTP_SECURE || true,
  auth: {
    user: process.env.SMTP_USER,
    pass:  process.env.SMTP_PASS,
  },
});

async function sendmail(req) {
  try {
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
          content: PdfBuffer, //fs.readFileSync('./exports/exported_file_1223.pdf'),
        };

        // const html = "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body style='text-align: center;'> <p style='font-weight: bolder; font-size: large;'>Hello!</p> <p>This is a html checking mail</p><p><button style='background-color: lightskyblue; cursor: pointer; border-radius: 5px; padding: 10px; border-style: solid; border-width: 2px; text-decoration: none; font-weight: bolder; color:blue'>Verify email</button></p></body></html>"

        const from = req.params.from || '';

        const messageParams = {
          from: from + ' <' + process.env.MAILGUN_SENDER + '>',
          to: req.params.recipient,
          subject: req.params.subject,
          text: req.params.text || 'mail',
          html: req.params.html || '',
          attachments: [file],
        };

        const res = await transporter.sendMail(messageParams)
        

        console.log('Res ', res);
        if (!res.err) {
          return {
            status: 'success',
          };
        }
      }
    } else {
      const from = req.params.from || '';
      const messageParams = {
        from: from + ' <' + process.env.MAILGUN_SENDER + '>',
        to: req.params.recipient,
        subject: req.params.subject,
        text: req.params.text || 'mail',
        html: req.params.html || '',
      };

      const res = await transporter.sendMail(messageParams)

      console.log('Res ', res);
      if (!res.err) {
        return {
          status: 'success',
        };
      }
    }
  } catch (err) {
    console.log('err ', err);
    if (err) {
      return { status: 'error' };
    }
  }
}

export default sendmail;
