import dotenv from 'dotenv';
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
      contractUser.increment('EmailCount', 1);
      if (plan === 'freeplan') {
        if (monthchange) {
          contractUser.set('LastEmailCountReset', new Date());
          contractUser.set('MonthlyFreeEmails', 1);
        } else {
          if (contractUser?.get('MonthlyFreeEmails')) {
            contractUser.increment('MonthlyFreeEmails', 1);
            if (contractUser?.get('LastEmailCountReset')) {
              contractUser.set('LastEmailCountReset', new Date());
            }
          } else {
            contractUser.set('MonthlyFreeEmails', 1);
            contractUser.set('LastEmailCountReset', new Date());
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
  const status = options?.required === true ? 'required' : 'optional' || 'required';
  const defaultValue = options?.default || '';
  const values = options?.values || [];
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
      return { status: status, name: options.name || 'email', validation: { type: 'email' } };
    case 'name':
      return { status: status, name: options.name || 'name' };
    case 'job title':
      return { status: status, name: options.name || 'job title' };
    case 'company':
      return { status: status, name: options.name || 'company' };
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
      };
    }
    case 'textbox':
      return {
        status: status,
        name: 'textbox',
        defaultValue: defaultValue,
        hint: options.hint,
        validation: { type: 'regex', pattern: options?.regularexpression || '/^[a-zA-Z0-9s]+$/' },
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
      };
    }
    case 'dropdown':
      return {
        status: status,
        name: options.name || 'dropdown',
        values: values,
        defaultValue: defaultValue,
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

export const planCredits = {
  'pro-weekly': 100,
  'pro-yearly': 240,
  'professional-monthly': 100,
  'professional-yearly': 240,
  'team-weekly': 100,
  'team-yearly': 500,
  'teams-monthly': 100,
  'teams-yearly': 500,
};
