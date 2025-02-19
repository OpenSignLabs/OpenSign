import dotenv from 'dotenv';
import { format, toZonedTime } from 'date-fns-tz';
import { getSignedLocalUrl } from './cloud/parsefunction/getSignedUrl.js';
import { PDFDocument } from 'pdf-lib';
dotenv.config();

export const cloudServerUrl = 'http://localhost:8080/app';
export const appName = process.env.APP_NAME || 'OpenSign™';
export function customAPIurl() {
  const url = new URL(cloudServerUrl);
  return url.pathname === '/api/app' ? url.origin + '/api' : url.origin;
}

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
      const tenant = await tenantQuery.first();
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

export function formatWidgetOptions(type, options) {
  const colorsArr = ['red', 'black', 'blue', 'yellow'];
  const fontSizes = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28];
  const status = options?.required === true ? 'required' : 'optional' || 'required';
  const defaultValue = options?.default || '';
  const values = options?.values || [];
  const color = options?.color ? options.color : 'black';
  const fontColor = colorsArr.includes(color) ? color : 'black';
  const size = options?.fontsize ? parseInt(options.fontsize) : 12;
  const fontSize = fontSizes.includes(size) ? size : 12;
  switch (type) {
    case 'signature':
      return { name: 'signature', status: 'required' };
    case 'stamp':
      return { status: status, name: 'stamp' };
    case 'initials':
      return { status: status, name: options.name || 'initials' };
    case 'image':
      return { status: status, name: options.name || 'image' };
    case 'email':
      return {
        status: status,
        name: options.name || 'email',
        validation: { type: 'email' },
        fontColor: fontColor,
        fontSize: fontSize,
      };
    case 'name':
      return {
        status: status,
        name: options.name || 'name',
        fontColor: fontColor,
        fontSize: fontSize,
      };
    case 'job title':
      return {
        status: status,
        name: options.name || 'job title',
        fontColor: fontColor,
        fontSize: fontSize,
      };
    case 'company':
      return {
        status: status,
        name: options.name || 'company',
        fontColor: fontColor,
        fontSize: fontSize,
      };
    case 'date': {
      let today = new Date();
      let dd = String(today.getDate()).padStart(2, '0');
      let mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
      let yyyy = today.getFullYear();
      today = dd + '-' + mm + '-' + yyyy;
      let dateFormat = options?.format;
      dateFormat = dateFormat.replace(/m/g, 'M');
      return {
        status: status,
        name: options.name || 'date',
        response: defaultValue || today,
        validation: { format: dateFormat || 'dd-MM-yyyy', type: 'date-format' },
        fontColor: fontColor,
        fontSize: fontSize,
      };
    }
    case 'textbox':
      return {
        status: status,
        name: 'textbox',
        defaultValue: defaultValue,
        hint: options.hint,
        validation: { type: 'regex', pattern: options?.regularexpression || '/^[a-zA-Z0-9s]+$/' },
        fontColor: fontColor,
        fontSize: fontSize,
        isReadOnly: options?.readonly || false,
      };
    case 'checkbox': {
      const arr = options?.values;
      let selectedvalues = [];
      for (const obj of options.selectedvalues) {
        const index = arr.indexOf(obj);
        selectedvalues.push(index);
      }
      return {
        status: status,
        name: options.name || 'checkbox',
        values: values,
        isReadOnly: options?.readonly || false,
        isHideLabel: options?.hidelabel || false,
        validation: {
          minRequiredCount: options?.validation?.minselections || 0,
          maxRequiredCount: options?.validation?.maxselections || 0,
        },
        defaultValue: selectedvalues || [],
        fontColor: fontColor,
        fontSize: fontSize,
      };
    }
    case 'radio button': {
      return {
        status: status,
        name: options.name || 'radio',
        values: values,
        isReadOnly: options?.readonly || false,
        isHideLabel: options?.hidelabel || false,
        defaultValue: defaultValue,
        fontColor: fontColor,
        fontSize: fontSize,
      };
    }
    case 'dropdown':
      return {
        status: status,
        name: options.name || 'dropdown',
        values: values,
        defaultValue: defaultValue,
        fontColor: fontColor,
        fontSize: fontSize,
        isReadOnly: options?.readonly || false,
      };
    default:
      break;
  }
}

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
