import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import docxtopdf, { upload as docxUpload } from './docxtopdf.js';
import decryptpdf, { upload as decryptUpload } from './decryptpdf.js';
import { deleteUserByAdmin, deleteUserPost } from './deleteAccount/deleteUser.js';
import { deleteUserGet } from './deleteAccount/deleteUserGet.js';
import { deleteUserOtp } from './deleteAccount/deleteUserOtp.js';
export const app = express();

dotenv.config({ quiet: true });
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

app.post('/docxtopdf', docxUpload.single('file'), docxtopdf);
app.post('/decryptpdf', decryptUpload.single('file'), decryptpdf);
app.get('/delete-account/:userId', deleteUserGet);
app.post('/delete-account/:userId/otp', deleteUserOtp);
app.post('/delete-account/:userId', deleteUserPost);
app.post('/deleteuser/:userId', deleteUserByAdmin);
