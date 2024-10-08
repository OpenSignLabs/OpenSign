import axios from 'axios';
import { google } from 'googleapis';
import fs from 'node:fs';
import https from 'https';
import http from 'http';
import { useLocal } from '../../Utils.js';
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
// Function to create a Gmail client
const createGmailClient = accessToken => {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth: oauth2Client });
};

// Function to exchange refresh token for new access token
const refreshAccessToken = async refreshToken => {
  const tokenEndpoint = 'https://oauth2.googleapis.com/token';
  const params = new URLSearchParams();
  params.append('refresh_token', refreshToken);
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('grant_type', 'refresh_token');

  const response = await axios.post(tokenEndpoint, params);
  return response.data.access_token;
};

// Function to create a raw email message
const makeEmail = async (to, from, subject, html, url, pdfName) => {
  const publicUrl = new URL(process.env.SERVER_URL);
  const htmlContent = html;
  const boundary = 'boundary_' + Date.now().toString(16);
  let str;
  if (url) {
    let attachments;
    let Pdf = fs.createWriteStream('test.pdf');
    const writeToLocalDisk = () => {
      return new Promise((resolve, reject) => {
        const isSecure = new URL(url)?.protocol === 'https:';
        if (useLocal !== 'true' || isSecure) {
          https.get(url, async function (response) {
            response.pipe(Pdf);
            response.on('end', () => resolve('success'));
          });
        } else {
          const path = new URL(url)?.pathname;
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
      const file = {
        filename: `${pdfName}.pdf` || 'exported.pdf',
        type: 'application/pdf',
        path: Pdf.path,
      };

      //  `certificateBuffer` used to create buffer from pdf file
      try {
        const certificate = {
          filename: 'certificate.pdf',
          type: 'application/pdf',
          path: './exports/certificate.pdf',
        };
        if (fs.existsSync(certificate.path)) {
          attachments = [file, certificate];
        } else {
          attachments = [file];
        }
      } catch (err) {
        attachments = [file];
        console.log('Err in read certificate sendmailv3', err);
      }
    }
    const attachmentParts = attachments.map(attachment => {
      const content = fs.readFileSync(attachment.path);
      const encodedContent = content.toString('base64');
      return [
        `Content-Type: ${attachment.type}\n`,
        'MIME-Version: 1.0\n',
        `Content-Disposition: attachment; filename="${attachment.filename}"\n`,
        `Content-Transfer-Encoding: base64\n\n`,
        `${encodedContent}\n`,
      ].join('');
    });

    const attachmentBody = attachmentParts.join(`\n--${boundary}\n`);

    str = [
      'Content-Type: multipart/mixed; boundary="' + boundary + '"\n',
      'MIME-Version: 1.0\n',
      `To: ${to}\n`,
      `From: ${from}\n`,
      `Subject: ${subject}\n\n`,
      '--' + boundary + '\n',
      'Content-Type: text/html; charset="UTF-8"\n',
      'MIME-Version: 1.0\n\n',
      `${htmlContent}\n\n`,
      `\n--${boundary}\n`,
      attachmentBody,
      '--' + boundary + '--',
    ].join('');
  } else {
    str = [
      'Content-Type: multipart/mixed; boundary="' + boundary + '"\n',
      'MIME-Version: 1.0\n',
      `To: ${to}\n`,
      `From: ${from}\n`,
      `Subject: ${subject}\n\n`,
      '--' + boundary + '\n',
      'Content-Type: text/html; charset="UTF-8"\n',
      'MIME-Version: 1.0\n\n',
      `${htmlContent}\n\n`,
      '--' + boundary + '--',
    ].join('');
  }

  const encodedMail = Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  return encodedMail;
};
export default async function sendMailGmailProvider(_extRes, template) {
  const { sender, receiver, subject, html, url, pdfName } = template;

  if (_extRes) {
    const refresh_token = _extRes.google_refresh_token;
    // generate access token
    const access_token = await refreshAccessToken(refresh_token);

    try {
      // Construct email message
      const from = sender || _extRes.Email || 'me';
      const to = receiver;
      const email = await makeEmail(to, from, subject, html, url, pdfName);
      // Update Gmail client with new access token
      const newGmail = createGmailClient(access_token);
      // sending email with new client
      const response = await newGmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: email,
        },
      });
      console.log('gmail provider res: ', response?.status);
      const certificatePath = './exports/certificate.pdf';
      if (fs.existsSync(certificatePath)) {
        try {
          fs.unlinkSync(certificatePath);
        } catch (err) {
          console.log('Err in unlink certificate sendmailgmail provider');
        }
      }
      return { code: 200, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Error sending email:', error);
      return { code: 500, message: 'Failed to send email ' + error };
    }
  }
}
