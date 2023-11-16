// Example express application adding the parse-server module to expose Parse
// compatible API routes.

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { ParseServer } from 'parse-server';
import path from 'path';
const __dirname = path.resolve();
import http from 'http';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { ApiPayloadConverter } from 'parse-server-api-mail-adapter';
import S3Adapter from 'parse-server-s3-adapter';
import FSFilesAdapter from 'parse-server-fs-adapter';
import AWS from 'aws-sdk';
import { app as customRoute } from './cloud/customRoute/customApp.js';
import { exec } from 'child_process';

const spacesEndpoint = new AWS.Endpoint(process.env.DO_ENDPOINT);
// console.log("configuration ", configuration);
if (process.env.USE_LOCAL !== "TRUE") {
  const s3Options = {
    bucket: process.env.DO_SPACE, // globalConfig.S3FilesAdapter.bucket,
    baseUrl: process.env.DO_BASEURL,
    region: process.env.DO_REGION,
    directAccess: true,
    preserveFileName: true,
    s3overrides: {
      accessKeyId: process.env.DO_ACCESS_KEY_ID,
      secretAccessKey: process.env.DO_SECRET_ACCESS_KEY,
      endpoint: spacesEndpoint,
    },
  };
  var fsAdapter = new S3Adapter(s3Options);
} else {
  var fsAdapter = new FSFilesAdapter({
    filesSubDirectory: 'files', // optional, defaults to ./files
  });
}

let transporterMail;
let mailgunClient;
let mailgunDomain;

if (process.env.SMTP_ENABLE) {
  transporterMail = createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 465,
    secure: process.env.SMTP_SECURE || true,
    auth: {
      user: process.env.SMTP_USER_EMAIL,
      pass: process.env.SMTP_PASS,
    },
  });
} else if (process.env.MAILGUN_API_KEY) {
  const mailgun = new Mailgun(formData);
  mailgunClient = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
  });

  mailgunDomain = process.env.MAILGUN_DOMAIN;
}

export const config = {
  databaseURI:
    process.env.DATABASE_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  masterKeyIps: ['0.0.0.0/0', '::1'], // '::1'
  serverURL: process.env.SERVER_URL || 'http://localhost:8080/app', // Don't forget to change to https if needed
  // verifyUserEmails: true,
  publicServerURL: process.env.SERVER_URL || 'http://localhost:8080/app',
  // Your apps name. This will appear in the subject and body of the emails that are sent.
  appName: 'Open Sign',
  allowClientClassCreation: false,
  emailAdapter:
    process.env.SMTP_ENABLE || process.env.MAILGUN_API_KEY
      ? {
          module: 'parse-server-api-mail-adapter',
          options: {
            // The email address from which emails are sent.
            sender:  process.env.SMTP_ENABLE ? process.env.SMTP_USER_EMAIL : process.env.MAILGUN_SENDER,
            // The email templates.
            templates: {
              // The template used by Parse Server to send an email for password
              // reset; this is a reserved template name.
              passwordResetEmail: {
                subjectPath: './files/password_reset_email_subject.txt',
                textPath: './files/password_reset_email.txt',
                htmlPath: './files/password_reset_email.html',
              },
              // The template used by Parse Server to send an email for email
              // address verification; this is a reserved template name.
              verificationEmail: {
                subjectPath: './files/verification_email_subject.txt',
                textPath: './files/verification_email.txt',
                htmlPath: './files/verification_email.html',
              },
            },
            apiCallback: async ({ payload, locale }) => {
              if (mailgunClient) {
                const mailgunPayload = ApiPayloadConverter.mailgun(payload);
                await mailgunClient.messages.create(mailgunDomain, mailgunPayload);
              } else if (transporterMail) await transporterMail.sendMail(payload);
            },
          },
        }
      : null,
  filesAdapter: fsAdapter,
  auth: {
    google: {
      enabled: true,
    },
  },
};
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

export const app = express();
app.use(cors());

app.use(function (req, res, next) {
  // console.log("req ", req.headers);
  // console.log("x-forwarded-for", req.headers["x-forwarded-for"]);
  // console.log("req.ip", req.ip);
  // console.log("req.socket.remoteAddress; ", req.socket.remoteAddress);
  // console.log("ip", ip.address());
  req.headers['x-real-ip'] = getUserIP(req);
  next();
});
function getUserIP(request) {
  let forwardedFor = request.headers['x-forwarded-for'];
  if (forwardedFor) {
    if (forwardedFor.indexOf(',') > -1) {
      return forwardedFor.split(',')[0];
    } else {
      return forwardedFor;
    }
  } else {
    return request.socket.remoteAddress;
  }
}
// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
if (!process.env.TESTING) {
  const mountPath = process.env.PARSE_MOUNT || '/app';
  const server = new ParseServer(config);
  await server.start();
  app.use(mountPath, server.app);
}
// Mount your custom express app
app.use('/', customRoute);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function (req, res) {
  // res.statusCode = 200;
  // res.setHeader('Content-Type', 'text/plain');
  // res.end('I dream of being a website.  Please star the parse-server repo on GitHub!');
  res.status(200).send('open-sign-server is running !!!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

if (!process.env.TESTING) {
  const port = process.env.PORT || 8080;
  const httpServer = http.createServer(app);
  // Set the Keep-Alive and headers timeout to 100 seconds
  httpServer.keepAliveTimeout = 100000; // in milliseconds
  httpServer.headersTimeout = 100000; // in milliseconds
  httpServer.listen(port, function () {
    console.log('parse-server-example running on port ' + port + '.');
  });
  // This will enable the Live Query real-time server
  await ParseServer.createLiveQueryServer(httpServer);

  const migrate =
    'APPLICATION_ID=legadranaxn SERVER_URL=http://localhost:8080/app MASTER_KEY=XnAwPDRQQyMr npx parse-dbtool migrate';
  // `APPLICATION_ID=${process.env.APP_ID} SERVER_URL=${process.env.SERVER_URL} MASTER_KEY=${process.env.MASTER_KEY} npx parse-dbtool migrate`;

  exec(migrate, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`Error: ${stderr}`);
      return;
    }

    console.log(`Command output: ${stdout}`);
  });
}
