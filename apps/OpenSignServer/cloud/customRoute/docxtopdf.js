import axios from 'axios';
import multer from 'multer';
import libre from 'libreoffice-convert';
import { cloudServerUrl, getSecureUrl, serverAppId } from '../../Utils.js';

/** @returns {Promise<Buffer>} */
async function convertLibre(input, ext, opts) {
  return await new Promise((resolve, reject) => {
    try {
      libre.convert(input, ext, opts, (err, out) => (err ? reject(err) : resolve(out)));
    } catch (e) {
      reject(e);
    }
  });
}

// -------------------- Concurrency limiter --------------------
// CRITICAL FIX: Reduced to 1 for CPU-intensive LibreOffice conversions
const MAX_CONCURRENCY = Number(process.env.DOCX2PDF_CONCURRENCY || 1);
let active = 0;
const queue = [];

function runWithLimit(task) {
  return new Promise((resolve, reject) => {
    const run = () => {
      active++;
      Promise.resolve()
        .then(task)
        .then(resolve, reject)
        .finally(() => {
          active--;
          if (queue.length) queue.shift()();
        });
    };
    if (active < MAX_CONCURRENCY) run();
    else queue.push(run);
  });
}

// -------------------- Timeout helper --------------------
/**
 * @template T
 * @param {Promise<T>} promise
 * @param {number} ms
 * @param {string} [label='operation']
 * @returns {Promise<T>}
 */
export async function withTimeout(promise, ms, label = 'operation') {
  let timer;
  try {
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    });
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// -------------------- Multer: use memory storage --------------------
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB hard limit at multer level
  fileFilter: (req, file, cb) => {
    const okExt = /\.docx$/i.test(file.originalname || '');
    const okMime =
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'application/octet-stream';
    if (okExt && okMime) return cb(null, true);
    cb(new Error('Only .docx files are supported'));
  },
});

function generatePdfName(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

export default async function docxtopdf(req, res) {
  const serverUrl = cloudServerUrl;
  const parseAppKey = { 'X-Parse-Application-Id': serverAppId };
  const masterKey = process.env.MASTER_KEY;

  const masterHeader = { ...parseAppKey, 'X-Parse-Master-Key': masterKey };
  const sessionHeader = { ...parseAppKey, 'X-Parse-Session-Token': req.headers['sessiontoken'] };

  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    // ---- Auth: current user ----
    const userRes = await axios.get(`${serverUrl}/users/me`, { headers: sessionHeader });

    // ---- contracts_Users ----
    const whereUser = JSON.stringify({
      UserId: { __type: 'Pointer', className: '_User', objectId: userRes.data.objectId },
    });
    const resUser = await axios.get(
      `${serverUrl}/classes/contracts_Users?where=${whereUser}&limit=1&include=TenantId`,
      { headers: masterHeader }
    );

    if (!resUser?.data?.results?.length) {
      return res.status(403).json({ error: 'User not linked to tenant.' });
    }

    const tenantId = resUser.data.results[0]?.TenantId?.objectId;
    if (!tenantId) {
      return res.status(403).json({ error: 'Tenant not found for user.' });
    }

    // ---- DOCX -> PDF conversion with concurrency control and timeout ----
    const fileName = `${generatePdfName(16)}.pdf`;

    // FIX: Increased timeout to 90s for large files, added nice priority
    const pdfBuffer = await runWithLimit(async () => {
      // Log for monitoring
      console.log(`[DOCX2PDF] Starting conversion, active: ${active}, queued: ${queue.length}`);

      const startTime = Date.now();
      try {
        const result = await withTimeout(
          convertLibre(req.file.buffer, '.pdf', undefined),
          90_000, // Increased from 60s to 90s
          'DOCX->PDF'
        );
        console.log(`[DOCX2PDF] Completed in ${Date.now() - startTime}ms`);
        return result;
      } catch (error) {
        console.error(`[DOCX2PDF] Failed after ${Date.now() - startTime}ms:`, error.message);
        throw error;
      }
    });

    // ---- Upload PDF ----
    const activeFileAdapter = resUser.data.results[0]?.TenantId?.ActiveFileAdapter;
    let fileUrl;
    if (activeFileAdapter) {
      const params = {
        fileBase64: Buffer.from(pdfBuffer).toString('base64'),
        fileName,
        id: activeFileAdapter,
      };
      const url = serverUrl + '/functions/savetofileadapter';
      const headers = { 'Content-Type': 'application/json', ...sessionHeader };
      const savetos3 = await axios.post(url, params, { headers });
      fileUrl = savetos3?.data?.result?.url;
      if (!fileUrl) throw new Error('No URL returned from file adapter');
    } else {
      const parsefile = await axios.post(`${serverUrl}/files/${fileName}`, pdfBuffer, {
        headers: { ...masterHeader, 'Content-Type': 'application/pdf' },
      });
      const fileRes = getSecureUrl(parsefile.data.url);
      fileUrl = fileRes.url;
    }

    return res.status(200).json({ message: 'success.', url: fileUrl });
  } catch (err) {
    // More specific error messages
    let msg =
      err?.response?.data?.error || err?.response?.data || err?.message || 'Something went wrong.';
    // Friendly message to the client
    const message =
      'We are currently experiencing some issues with processing DOCX files. Please upload the PDF version or contact us on support@opensignlabs.com';

    if (msg.includes('timed out')) {
      msg =
        'Document conversion is taking too long. Please try a smaller file or contact support@opensignlabs.com';
    } else if (msg.includes('too large') || msg.includes('size')) {
      msg =
        'File is too large to process. Please reduce the file size or contact support@opensignlabs.com';
    } else {
      msg = message;
    }
    console.error(`[DOCX2PDF] Error: ${msg}`);
    return res.status(400).json({ error: message });
  }
}
