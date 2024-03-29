import axios from 'axios';

const appId = process.env.APP_ID;
const serverUrl = process.env.SERVER_URL;
export function customAPIurl() {
  const url = new URL(process.env.SERVER_URL);
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

  const result = {
    subject: replacedSubject,
    body: replacedBody,
  };
  return result;
}

export const saveFileUsage = async (size, imageUrl, tenantId) => {
  //checking server url and save file's size
  const tenantPtr = {
    __type: 'Pointer',
    className: 'partners_Tenant',
    objectId: tenantId,
  };
  const _tenantPtr = JSON.stringify(tenantPtr);
  try {
    const res = await axios.get(
      `${serverUrl}classes/partners_TenantCredits?where={"PartnersTenant":${_tenantPtr}}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Parse-Application-Id': appId,
        },
      }
    );
    const response = res.data.results;

    let data;
    // console.log("response", response);
    if (response && response.length > 0) {
      data = {
        usedStorage: response[0].usedStorage ? response[0].usedStorage + size : size,
      };
      await axios.put(`${serverUrl}classes/partners_TenantCredits/${response[0].objectId}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'X-Parse-Application-Id': appId,
        },
      });
    } else {
      data = { usedStorage: size, PartnersTenant: tenantPtr };
      await axios.post(`${serverUrl}classes/partners_TenantCredits`, data, {
        headers: {
          'Content-Type': 'application/json',
          'X-Parse-Application-Id': parseAppId,
        },
      });
    }
  } catch (err) {
    console.log('err in save usage', err);
  }
  saveDataFile(size, imageUrl, tenantPtr);
};

//function for save fileUrl and file size in particular client db class partners_DataFiles
const saveDataFile = async (size, imageUrl, tenantPtr) => {
  const data = {
    FileUrl: imageUrl,
    FileSize: size,
    TenantPtr: tenantPtr,
  };

  // console.log("data save",file, data)
  try {
    await axios.post(`${serverUrl}classes/partners_DataFiles`, data, {
      headers: {
        'Content-Type': 'application/json',
        'X-Parse-Application-Id': parseAppId,
      },
    });
  } catch (err) {
    console.log('error in save usage ', err);
  }
};
