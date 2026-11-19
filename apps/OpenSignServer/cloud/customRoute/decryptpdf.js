import fs from 'node:fs';
import multer from 'multer';
import crypto from 'node:crypto';
import axios from 'axios';
import Coherentpdf from 'coherentpdf';
import { cloudServerUrl, serverAppId } from '../../Utils.js';
import { logger } from '../../utils/logger.js';

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'exports');
  },
  // Never trust the client file name: two callers uploading the same name
  // would otherwise overwrite each other.
  filename(req, file, cb) {
    cb(null, `decrypt_${crypto.randomUUID()}.pdf`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (req, file, cb) => {
    const isPdfName = /\.pdf$/i.test(file.originalname || '');
    const isPdfMime =
      file.mimetype === 'application/pdf' || file.mimetype === 'application/octet-stream';
    if (isPdfName && isPdfMime) return cb(null, true);
    cb(new Error('Only PDF files are supported'));
  },
});

const safeUnlink = filePath => {
  if (!filePath) return;
  fs.unlink(filePath, () => {});
};

export default async function decryptpdf(req, res) {
  if (!req.file?.path) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  const inputPath = req.file.path;
  const password = req.body.password || '';

  // Only an authenticated user may use the server as a decryptor.
  const sessionToken = req.headers.sessiontoken;
  if (!sessionToken) {
    safeUnlink(inputPath);
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  try {
    await axios.get(`${cloudServerUrl}/users/me`, {
      headers: {
        'X-Parse-Application-Id': serverAppId,
        'X-Parse-Session-Token': sessionToken,
      },
    });
  } catch {
    safeUnlink(inputPath);
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const file = fs.readFileSync(inputPath);
    const pdf = await Coherentpdf.fromMemory(file, password);
    await Coherentpdf.decryptPdf(pdf, password);
    // Get decrypted buffer directly from memory (no file I/O)
    const buffer = await Coherentpdf.toMemory(pdf, false, false);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="decrypted.pdf"',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
    safeUnlink(inputPath);
  } catch (err) {
    safeUnlink(inputPath);
    logger.info('Error in decrypt file: ', err);
    let code = err?.code ? err.code : 400;
    let message = err?.[2]?.c ? err[2].c : 'Something went wrong.';
    if (err?.[2]?.c?.includes('Bad password') || err?.[2]?.c?.includes('decrypt_pdf_inner')) {
      code = 401;
      message = 'Incorrect password.';
    }
    return res.status(code).json({ error: message });
  }
}
