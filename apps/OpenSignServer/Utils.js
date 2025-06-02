import dotenv from 'dotenv';
import { format, toZonedTime } from 'date-fns-tz';
import { getSignedLocalUrl } from './cloud/parsefunction/getSignedUrl.js';
import { PDFDocument } from 'pdf-lib';
import crypto from 'node:crypto';
import axios from 'axios';
dotenv.config();

export const cloudServerUrl = 'http://localhost:8080/app';
export const appName = 'OpenSign™';

export const MAX_NAME_LENGTH = 250;
export const MAX_NOTE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 500;
export const color = [
  '#93a3db',
  '#e6c3db',
  '#c0e3bc',
  '#bce3db',
  '#b8ccdb',
  '#ceb8db',
  '#ffccff',
  '#99ffcc',
  '#cc99ff',
  '#ffcc99',
  '#66ccff',
  '#ffffcc',
];

export function replaceMailVaribles(subject, body, variables) {
  let replacedSubject = subject;
  let replacedBody = body;

  for (const variable in variables) {
    const regex = new RegExp(`{{${variable}}}`, 'g');
    if (subject) {
      replacedSubject = replacedSubject.replace(regex, variables[variable]);
    }
    if (body) {
      replacedBody = replacedBody.replace(regex, variables[variable]);
    }
  }
  const result = { subject: replacedSubject, body: replacedBody };
  return result;
}

export const saveFileUsage = async (size, fileUrl, userId) => {
  //checking server url and save file's size
  try {
    if (userId) {
      const tenantQuery = new Parse.Query('partners_Tenant');
      tenantQuery.equalTo('UserId', {
        __type: 'Pointer',
        className: '_User',
        objectId: userId,
      });
      const tenant = await tenantQuery.first({ useMasterKey: true });
      if (tenant) {
        const tenantPtr = { __type: 'Pointer', className: 'partners_Tenant', objectId: tenant.id };
        try {
          const tenantCredits = new Parse.Query('partners_TenantCredits');
          tenantCredits.equalTo('PartnersTenant', tenantPtr);
          const res = await tenantCredits.first({ useMasterKey: true });
          if (res) {
            const response = JSON.parse(JSON.stringify(res));
            const usedStorage = response?.usedStorage ? response.usedStorage + size : size;
            const updateCredit = new Parse.Object('partners_TenantCredits');
            updateCredit.id = res.id;
            updateCredit.set('usedStorage', usedStorage);
            await updateCredit.save(null, { useMasterKey: true });
          } else {
            const newCredit = new Parse.Object('partners_TenantCredits');
            newCredit.set('usedStorage', size);
            newCredit.set('PartnersTenant', tenantPtr);
            await newCredit.save(null, { useMasterKey: true });
          }
        } catch (err) {
          console.log('err in save usage', err);
        }
        saveDataFile(size, fileUrl, tenantPtr);
      }
    }
  } catch (err) {
    console.log('err in fetch tenant Id', err);
  }
};

//function for save fileUrl and file size in particular client db class partners_DataFiles
const saveDataFile = async (size, fileUrl, tenantPtr) => {
  try {
    const newDataFiles = new Parse.Object('partners_DataFiles');
    newDataFiles.set('FileUrl', fileUrl);
    newDataFiles.set('FileSize', size);
    newDataFiles.set('TenantPtr', tenantPtr);
    await newDataFiles.save(null, { useMasterKey: true });
  } catch (err) {
    console.log('error in save usage ', err);
  }
};

export const updateMailCount = async (extUserId, plan, monthchange) => {
  // Update count in contracts_Users class
  const query = new Parse.Query('contracts_Users');
  query.equalTo('objectId', extUserId);

  try {
    const contractUser = await query.first({ useMasterKey: true });
    if (contractUser) {
      const _extRes = JSON.parse(JSON.stringify(contractUser));
      let updateDate = new Date();
      if (_extRes?.LastEmailCountReset?.iso) {
        updateDate = new Date(_extRes?.LastEmailCountReset?.iso);
        const newDate = new Date();
        // Update the month while keeping the same day and year
        updateDate.setMonth(newDate.getMonth());
        updateDate.setFullYear(newDate.getFullYear());
      }
      contractUser.increment('EmailCount', 1);
      if (plan === 'freeplan') {
        if (monthchange) {
          contractUser.set('LastEmailCountReset', updateDate);
          contractUser.set('MonthlyFreeEmails', 1);
        } else {
          if (contractUser?.get('MonthlyFreeEmails')) {
            contractUser.increment('MonthlyFreeEmails', 1);
            if (contractUser?.get('LastEmailCountReset')) {
              contractUser.set('LastEmailCountReset', updateDate);
            }
          } else {
            contractUser.set('MonthlyFreeEmails', 1);
            contractUser.set('LastEmailCountReset', updateDate);
          }
        }
      }
      await contractUser.save(null, { useMasterKey: true });
    }
  } catch (error) {
    console.log('Error updating EmailCount in contracts_Users: ' + error.message);
  }
};

export function sanitizeFileName(fileName) {
  // Remove spaces and invalid characters
  const file = fileName.replace(/[^a-zA-Z0-9._-]/g, '');
  const removedot = file.replace(/\.(?=.*\.)/g, '');
  return removedot.replace(/[^a-zA-Z0-9._-]/g, '');
}

export const useLocal = process.env.USE_LOCAL ? process.env.USE_LOCAL.toLowerCase() : 'false';
export const smtpsecure = process.env.SMTP_PORT && process.env.SMTP_PORT !== '465' ? false : true;
export const smtpenable =
  process.env.SMTP_ENABLE && process.env.SMTP_ENABLE.toLowerCase() === 'true' ? true : false;
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// `generateId` is used to unique Id for fileAdapter
export function generateId(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Format date and time for the selected timezone
export const formatTimeInTimezone = (date, timezone) => {
  const nyDate = timezone && toZonedTime(date, timezone);
  const generatedDate = timezone
    ? format(nyDate, 'EEE, dd MMM yyyy HH:mm:ss zzz', { timeZone: timezone })
    : new Date(date).toUTCString();
  return generatedDate;
};

// `getSecureUrl` is used to return local secure url if local files
export const getSecureUrl = url => {
  const fileUrl = new URL(url)?.pathname?.includes('files');
  if (fileUrl) {
    try {
      const file = getSignedLocalUrl(url);
      if (file) {
        return { url: file };
      } else {
        return { url: '' };
      }
    } catch (err) {
      console.log('err while fileupload ', err);
      return { url: '' };
    }
  } else {
    return { url: url };
  }
};

/**
 * FlattenPdf is used to remove existing widgets if present any and flatten pdf.
 * @param {string | Uint8Array | ArrayBuffer} pdfFile - pdf file.
 * @returns {Promise<Uint8Array>} flatPdf - pdf file in unit8arry
 */
export const flattenPdf = async pdfFile => {
  try {
    const pdfDoc = await PDFDocument.load(pdfFile);
    // Get the form
    const form = pdfDoc.getForm();
    // fetch form fields
    const fields = form.getFields();
    // remove form all existing fields and their widgets
    if (fields && fields?.length > 0) {
      try {
        for (const field of fields) {
          while (field.acroField.getWidgets().length) {
            field.acroField.removeWidget(0);
          }
          form.removeField(field);
        }
      } catch (err) {
        console.log('err while removing field from pdf', err);
      }
    }
    // Updates the field appearances to ensure visual changes are reflected.
    form.updateFieldAppearances();
    // Flattens the form, converting all form fields into non-editable, static content
    form.flatten();
    const flatPdf = await pdfDoc.save({ useObjectStreams: false });
    return flatPdf;
  } catch (err) {
    throw new Error('error in pdf');
  }
};

export const mailTemplate = param => {
  const themeColor = '#47a3ad';
  const subject = `${param.senderName} has requested you to sign "${param.title}"`;
  const AppName = appName;
  const logo = `<img src='https://qikinnovation.ams3.digitaloceanspaces.com/logo.png' height='50' />`;

  const opurl = ` <a href='www.opensignlabs.com' target=_blank>here</a>`;

  const body =
    "<html><head><meta http-equiv='Content-Type' content='text/html;charset=UTF-8' /></head><body><div style='background-color:#f5f5f5;padding:20px'><div style='background:white;padding-bottom:20px'><div style='padding:10px'>" +
    logo +
    `</div><div style='padding:2px;font-family:system-ui;background-color:${themeColor}'><p style='font-size:20px;font-weight:400;color:white;padding-left:20px'>Digital Signature Request</p></div><div><p style='padding:20px;font-size:14px;margin-bottom:10px'>` +
    param.senderName +
    ' has requested you to review and sign <strong>' +
    param.title +
    "</strong>.</p><div style='padding: 5px 0px 5px 25px;display:flex;flex-direction:row;justify-content:space-around'><table><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Sender</td><td></td><td style='color:#626363;font-weight:bold'>" +
    param.senderMail +
    "</td></tr><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Organization</td><td></td><td style='color:#626363;font-weight:bold'> " +
    param.organization +
    "</td></tr><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Expires on</td><td></td><td style='color:#626363;font-weight:bold'>" +
    param.localExpireDate +
    "</td></tr><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Note</td><td></td><td style='color:#626363;font-weight:bold'>" +
    param.note +
    "</td></tr><tr><td></td><td></td></tr></table></div> <div style='margin-left:70px'><a target=_blank href=" +
    param.signingUrl +
    "><button style='padding:12px;background-color:#d46b0f;color:white;border:0px;font-weight:bold;margin-top:30px'>Sign here</button></a></div><div style='display:flex;justify-content:center;margin-top:10px'></div></div></div><div><p> This is an automated email from " +
    AppName +
    '. For any queries regarding this email, please contact the sender ' +
    param.senderMail +
    ` directly. If you think this email is inappropriate or spam, you may file a complaint with ${AppName}${opurl}.</p></div></div></body></html>`;

  return { subject, body };
};

export const selectFormat = data => {
  switch (data) {
    case 'L':
      return 'MM/dd/yyyy';
    case 'MM/DD/YYYY':
      return 'MM/dd/yyyy';
    case 'DD-MM-YYYY':
      return 'dd-MM-yyyy';
    case 'DD/MM/YYYY':
      return 'dd/MM/yyyy';
    case 'LL':
      return 'MMMM dd, yyyy';
    case 'DD MMM, YYYY':
      return 'dd MMM, yyyy';
    case 'YYYY-MM-DD':
      return 'yyyy-MM-dd';
    case 'MM-DD-YYYY':
      return 'MM-dd-yyyy';
    case 'MM.DD.YYYY':
      return 'MM.dd.yyyy';
    case 'MMM DD, YYYY':
      return 'MMM dd, yyyy';
    case 'MMMM DD, YYYY':
      return 'MMMM dd, yyyy';
    case 'DD MMMM, YYYY':
      return 'dd MMMM, yyyy';
    default:
      return 'MM/dd/yyyy';
  }
};

export function formatDateTime(date, dateFormat, timeZone, is12Hour) {
  const zonedDate = toZonedTime(date, timeZone); // Convert date to the given timezone
  const timeFormat = is12Hour ? 'hh:mm:ss a' : 'HH:mm:ss';
  return dateFormat
    ? format(zonedDate, `${selectFormat(dateFormat)}, ${timeFormat} 'GMT' XXX`, { timeZone })
    : formatTimeInTimezone(date, timeZone);
}

// Utility: Convert base64 to buffer
export const base64ToBuffer = base64 => Buffer.from(base64, 'base64');

// Utility: Generate SHA-256 hash from PDF page metadata
const getPdfMetadataHash = async pdfBytes => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const metaString = pdfDoc
    .getPages()
    .map((page, index) => {
      const { width, height } = page.getSize();
      return `${index + 1}:${Math.round(width)}x${Math.round(height)}`;
    })
    .join('|');

  return crypto.createHash('sha256').update(metaString).digest('hex');
};
// Utility: Validate if uploaded file matches original template PDF
export const handleReplaceFileValidation = async (baseFileUrl, newFileBase64) => {
  try {
    const { data } = await axios.get(baseFileUrl, { responseType: 'arraybuffer' });
    const basePdfBytes = Buffer.from(data);
    const uploadedPdfBytes = base64ToBuffer(newFileBase64);

    const baseHash = await getPdfMetadataHash(basePdfBytes);
    const uploadedHash = await getPdfMetadataHash(uploadedPdfBytes);

    if (baseHash === uploadedHash) {
      return { base64: newFileBase64 };
    }
    return { error: 'PDFs do NOT match based on page number, width, and height' };
  } catch (err) {
    console.error('Validation Error:', err.message);
    return { error: err.message };
  }
};
