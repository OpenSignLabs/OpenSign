import dotenv from 'dotenv';
dotenv.config({ quiet: true });
import express from 'express';
import cors from 'cors';
import { ParseServer } from 'parse-server';
import path from 'path';
const __dirname = path.resolve();
import http from 'http';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { ApiPayloadConverter } from 'parse-server-api-mail-adapter';
import S3Adapter from '@parse/s3-files-adapter';
import FSFilesAdapter from '@parse/fs-files-adapter';
import { app as customRoute } from './cloud/customRoute/customApp.js';
import { exec } from 'child_process';
import { createTransport } from 'nodemailer';
import { appName, cloudServerUrl, serverAppId, smtpenable, smtpsecure, useLocal } from './Utils.js';
import { REMINDER_INTERVAL_MS, resolveDeploymentBrand } from './utils/brandContext.js';
import { SSOAuth } from './auth/authadapter.js';
import runDbMigrations from './migrationdb/index.js';
import { validateSignedLocalUrl } from './cloud/parsefunction/getSignedUrl.js';
import { parseTrustProxy, resolveClientIp } from './utils/clientIp.js';
import { getServerConfig } from './utils/serverConfig.js';
import { getDatabaseUri, getSmtpPort } from './utils/envConfig.js';
import { parseOriginList, resolvePublicUrl } from './utils/publicUrl.js';
let fsAdapter;

if (useLocal !== 'true') {
  try {
    // const spacesEndpoint = new AWS.Endpoint(process.env.DO_ENDPOINT);
    const spacesEndpoint = process.env.DO_ENDPOINT?.includes('http')
      ? process.env.DO_ENDPOINT
      : `https://${process.env.DO_ENDPOINT}`; //"e.g https://blr1.digitaloceanspaces.com"
    const s3Options = {
      bucket: process.env.DO_SPACE,
      baseUrl: process.env.DO_BASEURL,
      fileAcl: 'none',
      region: process.env.DO_REGION,
      directAccess: true,
      preserveFileName: true,
      presignedUrl: true,
      presignedUrlExpires: 900,
      s3overrides: {
        credentials: {
          accessKeyId: process.env.DO_ACCESS_KEY_ID,
          secretAccessKey: process.env.DO_SECRET_ACCESS_KEY,
        },
        endpoint: spacesEndpoint,
        signatureVersion: 'v4',
      },
    };
    fsAdapter = new S3Adapter(s3Options);
  } catch (err) {
    console.log('Please provide AWS credintials in env file! Defaulting to local storage.');
    fsAdapter = new FSFilesAdapter({
      filesSubDirectory: 'files', // optional, defaults to ./files
    });
  }
} else {
  fsAdapter = new FSFilesAdapter({
    filesSubDirectory: 'files', // optional, defaults to ./files
  });
}

let transporterMail;
let mailgunClient;
let mailgunDomain;
let isMailAdapter = false;
if (smtpenable) {
  try {
    let transporterConfig = {
      host: process.env.SMTP_HOST,
      port: getSmtpPort(process.env),
      secure: smtpsecure,
    };

    // ✅ Add auth only if BOTH username & password exist
    const smtpUser = process.env.SMTP_USERNAME || process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

    if (smtpUser && smtpPass) {
      transporterConfig.auth = {
        user: process.env.SMTP_USERNAME ? process.env.SMTP_USERNAME : process.env.SMTP_USER_EMAIL,
        pass: smtpPass,
      };
    }
    transporterMail = createTransport(transporterConfig);
    await transporterMail.verify();
    isMailAdapter = true;
  } catch (err) {
    isMailAdapter = false;
    console.log(`Please provide valid SMTP credentials: ${err}`);
  }
} else if (process.env.MAILGUN_API_KEY) {
  try {
    const mailgun = new Mailgun(formData);
    mailgunClient = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
    });
    mailgunDomain = process.env.MAILGUN_DOMAIN;
    isMailAdapter = true;
  } catch (error) {
    isMailAdapter = false;
    console.log('Please provide valid Mailgun credentials');
  }
}
const mailsender = smtpenable ? process.env.SMTP_USER_EMAIL : process.env.MAILGUN_SENDER;
const deploymentSenderName = resolveDeploymentBrand().senderName;
export const config = {
  databaseURI: getDatabaseUri(process.env),
  cloud: function () {
    import('./cloud/main.js');
  },
  appId: serverAppId,
  logLevel: ['error'],
  maxLimit: 500,
  maxUploadSize: '100mb',
  masterKey: process.env.MASTER_KEY, //Add your master key here. Keep it secret!
  // The master key overrides every ACL, so it is only accepted from the
  // addresses that actually need it: loopback by default, overridable for
  // deployments that run the API in a separate container network.
  masterKeyIps: (process.env.MASTER_KEY_IPS || '127.0.0.1,::1')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean),
  serverURL: cloudServerUrl, // Don't forget to change to https if needed
  verifyUserEmails: false,
  publicServerURL: process.env.SERVER_URL || cloudServerUrl,
  // Your apps name. This will appear in the subject and body of the emails that are sent.
  appName: appName,
  // Reject trivially weak passwords at signup and at password change.
  // This Parse Server release accepts only these two keys.
  passwordPolicy: {
    validatorPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
  },
  allowClientClassCreation: false,
  allowExpiredAuthDataToken: false,
  enableInsecureAuthAdapters: false,
  databaseOptions: { allowPublicExplain: false },
  // encodeParseObjectInCloudFunction removed (unsupported in this parse-server version)
  ...(isMailAdapter === true
    ? {
        emailAdapter: {
          module: 'parse-server-api-mail-adapter',
          options: {
            // The email address from which emails are sent.
            sender: deploymentSenderName + ' <' + mailsender + '>',
            // The email templates.
            templates: {
              // The template used by Parse Server to send an email for password
              // reset; this is a reserved template name.
              passwordResetEmail: {
                subjectPath: './email-templates/password_reset_email_subject.txt',
                textPath: './email-templates/password_reset_email.txt',
                htmlPath: './email-templates/password_reset_email.html',
              },
              // The template used by Parse Server to send an email for email
              // address verification; this is a reserved template name.
              verificationEmail: {
                subjectPath: './email-templates/verification_email_subject.txt',
                textPath: './email-templates/verification_email.txt',
                htmlPath: './email-templates/verification_email.html',
              },
            },
            apiCallback: async ({ payload, locale }) => {
              if (mailgunClient) {
                const mailgunPayload = ApiPayloadConverter.mailgun(payload);
                await mailgunClient.messages.create(mailgunDomain, mailgunPayload);
              } else if (transporterMail) await transporterMail.sendMail(payload);
            },
          },
        },
      }
    : {}),
  filesAdapter: fsAdapter,
  auth: { google: { clientId: process.env.GOOGLE_CLIENT_ID }, sso: SSOAuth },
  // for fix Adapter prototype don't match expected prototype
  push: { queueOptions: { disablePushWorker: true } },
};
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

export const app = express();
// Only the configured public origins may call the API from a browser.
// Requests without an Origin header (server to server, curl) keep working.
const corsAllowlist = (
  process.env.CORS_ORIGINS ||
  [process.env.SERVER_URL, process.env.PUBLIC_URL, process.env.HOST_URL]
    .filter(Boolean)
    .join(',')
)
  .split(',')
  .map(origin => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsAllowlist.length === 0) return callback(null, true);
      return callback(null, corsAllowlist.includes(origin.replace(/\/$/, '')));
    },
  })
);


// Baseline security headers. A CSP is added at the reverse proxy, where the
// asset and font origins are known.
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  next();
});app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
/**
 * Base URL for email links: PUBLIC_URL, else the origin of SERVER_URL.
 * Extra custom domains come from PUBLIC_URL_ALLOWLIST.
 */
const publicUrlConfig = {
  baseUrl:
    process.env.PUBLIC_URL ||
    (process.env.SERVER_URL ? new URL(process.env.SERVER_URL).origin : ''),
  allowlist: parseOriginList(process.env.PUBLIC_URL_ALLOWLIST),
};
app.use(function (req, res, next) {
  req.headers['x-real-ip'] = getUserIP(req);
  req.headers['public_url'] = resolvePublicUrl(
    { host: req?.get('host'), origin: req.headers.origin },
    publicUrlConfig
  );
  next();
});
/**
 * Client IP for the audit trail. Proxy headers are used only as configured
 * by TRUST_PROXY (hop count or "cloudflare").
 */
const trustProxy = parseTrustProxy(process.env.TRUST_PROXY);
function getUserIP(request) {
  return resolveClientIp(request.headers, request.socket?.remoteAddress, trustProxy);
}

app.use(async function (req, res, next) {
  const isFilePath = req.path?.includes('/files/') || false;
  if (isFilePath && req.method.toLowerCase() === 'get') {
    const serverUrl = new URL(process.env.SERVER_URL);
    const origin = serverUrl.pathname === '/api/app' ? serverUrl.origin + '/api' : serverUrl.origin;
    const fileUrl = origin + req.originalUrl;
    const params = fileUrl?.split('?')?.[1];
    if (params) {
      const fileRes = await validateSignedLocalUrl(fileUrl);
      if (fileRes === 'Unauthorized') {
        return res.status(400).json({ message: 'unauthorized' });
      }
    } else {
      return res.status(400).json({ message: 'unauthorized' });
    }
    next();
  } else {
    next();
  }
});

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
if (!process.env.TESTING) {
  const mountPath = process.env.PARSE_MOUNT || '/app';
  try {
    const server = new ParseServer(config);
    await server.start();
    app.use(mountPath, server.app);
  } catch (err) {
    console.log(err);
    process.exit();
  }
}
// Mount your custom express app
app.use('/', customRoute);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function (req, res) {
  res.status(200).send('opensign-server is running !!!');
});

if (!process.env.TESTING) {
  const { port, bindHost } = getServerConfig(process.env);
  const httpServer = http.createServer(app);
  // Set the Keep-Alive and headers timeout to 100 seconds
  httpServer.keepAliveTimeout = 100000; // in milliseconds
  httpServer.headersTimeout = 100000; // in milliseconds
  try {
    await runDbMigrations();
  } catch (error) {
    // Don't let a migration failure prevent the server from listening,
    // otherwise the platform's readiness probe never succeeds and the deploy is killed.
    console.error('Database migration failed:', error);
  }
  httpServer.listen(port, bindHost, function () {
    console.log('opensign-server running on port ' + port + '.');
    const isWindows = process.platform === 'win32';
    // console.log('isWindows', isWindows);
    const migrate = isWindows
      ? `set APPLICATION_ID=${serverAppId}&& set SERVER_URL=${cloudServerUrl}&& set MASTER_KEY=${process.env.MASTER_KEY}&& npx parse-dbtool migrate`
      : `APPLICATION_ID=${serverAppId} SERVER_URL=${cloudServerUrl} MASTER_KEY=${process.env.MASTER_KEY} npx parse-dbtool migrate`;
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

    // Automatic reminders scheduler (issue #2268): runs hourly.
    const runReminders = async () => {
      try {
        const now = new Date();
        const q = new Parse.Query('contracts_Document');
        q.equalTo('AutomaticReminders', true);
        q.notEqualTo('IsCompleted', true);
        q.notEqualTo('IsDeclined', true);
        q.notEqualTo('IsArchive', true);
        q.lessThanOrEqualTo('NextReminderDate', now);
        q.limit(100);
        const docs = await q.find({ useMasterKey: true });
        for (const doc of docs) {
          try {
            const expiry = doc.get('ExpiryDate');
            if (expiry && new Date(expiry) < now) {
              doc.set('AutomaticReminders', false);
              await doc.save(null, { useMasterKey: true });
              continue;
            }
            const creator = doc.get('ExtUserPtr');
            const creatorEmail = creator?.get?.('Email') || doc.get('SenderMail');
            const pdfName = doc.get('Name') || 'Document';
            if (creatorEmail) {
              await Parse.Cloud.sendEmail({
                sender: `${appName} <${process.env.SMTP_USER_EMAIL || process.env.MAILGUN_SENDER || ''}>`,
                recipient: creatorEmail,
                subject: `Reminder: "${pdfName}" is still pending signature`,
                text: `Reminder: "${pdfName}" is still pending signature.`,
                html: `<p>Reminder: "${pdfName}" is still pending signature.</p>`,
              });
            }
            const every = doc.get('RemindOnceInEvery') || 5;
            const next = new Date(doc.get('NextReminderDate') || now);
            next.setDate(next.getDate() + every);
            if (expiry && next > new Date(expiry)) {
              doc.set('AutomaticReminders', false);
            } else {
              doc.set('NextReminderDate', next);
            }
            await doc.save(null, { useMasterKey: true });
          } catch (e) {
            console.log('reminder error for doc', doc?.id, e?.message);
          }
        }
      } catch (e) {
        console.log('reminder scheduler error', e?.message);
      }
    };
    // run once after startup (delayed) then hourly
    setTimeout(runReminders, 60000);
    setInterval(runReminders, REMINDER_INTERVAL_MS);
  });
}
