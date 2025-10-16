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
// -------------------- Concurrency limiter (no dependency) --------------------
const MAX_CONCURRENCY = Number(process.env.DOCX2PDF_CONCURRENCY || 2); // 1 for tiny droplets
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

// -------------------- Timeout helper (async version = no TS hint) --------------------
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

    // ---- DOCX -> PDF (buffer -> buffer), with concurrency + timeout ----
    const fileName = `${generatePdfName(16)}.pdf`;

    const pdfBuffer = await runWithLimit(() =>
      withTimeout(convertLibre(req.file.buffer, '.pdf', undefined), 60_000, 'DOCX->PDF')
    );

    // ---- Upload PDF (no disk IO) ----
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
    const msg =
      err?.response?.data?.error || err?.response?.data || err?.message || 'Something went wrong.';
    console.log(`Error in docxtopdf: ${msg}`);
    // Friendly message to the client
    const message =
      'We are currently experiencing some issues with processing DOCX files. Please upload the PDF version or contact us on support@opensignlabs.com';
    return res.status(400).json({ error: message });
  }
}
