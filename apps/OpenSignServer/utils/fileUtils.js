import axios from 'axios';
import { cloudServerUrl, serverAppId } from '../Utils.js';

function formatFixedDate(date = new Date()) {
  const dd = String(date.getDate()).padStart(2, '0');
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const mmm = months[date.getMonth()];
  const yyyy = String(date.getFullYear());
  let h = date.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const HH12 = String(h).padStart(2, '0');
  const MM = String(date.getMinutes()).padStart(2, '0');
  return `${dd}-${mmm}-${yyyy} ${HH12}:${MM} ${ampm}`;
}

/**
 * Remove characters not allowed in file names for major OSes.
 */
function sanitizeDownloadFilename(name) {
  return name
    .replace(/[\\/:*?"<>|\u0000-\u001F]/g, ' ') // reserved + control
    .replace(/\s+/g, ' ') // collapse spaces
    .trim();
}

/**
 * Build filename using the selected format ID and runtime values.
 * @param {string} formatId - One of FILENAME_FORMATS ids
 * @param {object} ctx - { docName, email, date, ext, isSigned, datePattern }
 * @returns {string}
 */
export function buildDownloadFilename(formatId, ctx) {
  const {
    docName = 'Document',
    email = 'user@example.com',
    date = new Date(),
    ext = 'pdf',
    isSigned = false,
  } = ctx || {};

  const base = sanitizeDownloadFilename(String(docName) || 'Document');
  const safeEmail = sanitizeDownloadFilename(String(email) || 'user@example.com');
  const dateStr = formatFixedDate(date);

  let stem;
  switch (formatId) {
    case 'DOCNAME':
      stem = base;
      break;
    case 'DOCNAME_SIGNED':
      stem = isSigned ? `${base} - Signed` : base; // if not signed, fallback to base
      break;
    case 'DOCNAME_EMAIL':
      stem = `${base} - ${safeEmail}`;
      break;
    case 'DOCNAME_EMAIL_DATE':
      stem = `${base} - ${safeEmail} - ${dateStr}`;
      break;
    default:
      stem = base; // safe default
  }

  const safeExt = ext.replace(/\.+/g, '').toLowerCase() || 'pdf';
  return `${stem}.${safeExt}`;
}

export async function parseUploadFile(fileName, fileData, mimeType) {
  try {
    const res = await axios.post(`${cloudServerUrl}/files/${fileName}`, fileData, {
      headers: {
        'X-Parse-Application-Id': serverAppId,
        'X-Parse-Master-Key': process.env.MASTER_KEY,
        'Content-Type': mimeType,
      },
    });

    // console.log('File uploaded:', res.data);
    return res.data;
  } catch (err) {
    const errorMessage = err?.response?.data?.error || 'Unknown error';
    const statusCode = err?.response?.status || 500;
    console.log('Err in parseUploadFile', errorMessage);
    throw { message: errorMessage, code: statusCode };
  }
}
