import axios from 'axios';
import { customAPIurl, saveFileUsage } from '../../../../Utils.js';

// const randomId = () => Math.floor(1000 + Math.random() * 9000);
export default async function draftDocument(request, response) {
  const name = request.body.title;
  const note = request.body.note;
  const description = request.body.description;
  const signers = request.body.signers;
  const folderId = request.body.folderId;
  const base64File = request.body.file;
  const send_email = request.body.send_email || true;
  const fileData = request.files?.[0] ? request.files[0].buffer : null;
  const SendinOrder = request.body.sendInOrder || false;
  const isEnableOTP = request.body?.enableOTP === true ? true : false;

  // console.log('fileData ', fileData);
  const protocol = customAPIurl();
  const baseUrl = new URL(process.env.PUBLIC_URL);

  try {
    const reqToken = request.headers['x-api-token'];
    if (!reqToken) {
      return response.status(400).json({ error: 'Please Provide API Token' });
    }
    const tokenQuery = new Parse.Query('appToken');
    tokenQuery.equalTo('token', reqToken);
    tokenQuery.include('userId');
    const token = await tokenQuery.first({ useMasterKey: true });
    if (token !== undefined) {
      const parseUser = JSON.parse(JSON.stringify(token));
      const userPtr = {
        __type: 'Pointer',
        className: '_User',
        objectId: parseUser.userId.objectId,
      };
      // Valid Token then proceed request
      if (signers && signers.length > 0) {
        let fileUrl;
        if (request.files?.[0]) {
          const base64 = fileData?.toString('base64');
          const file = new Parse.File(request.files?.[0]?.originalname, {
            base64: base64,
          });
          await file.save({ useMasterKey: true });
          fileUrl = file.url();
          const buffer = Buffer.from(base64, 'base64');
          saveFileUsage(buffer.length, fileUrl, parseUser.userId.objectId);
        } else {
          const file = new Parse.File(`${name}.pdf`, {
            base64: base64File,
          });
          await file.save({ useMasterKey: true });
          fileUrl = file.url();
          const buffer = Buffer.from(base64File, 'base64');
          saveFileUsage(buffer.length, fileUrl, parseUser.userId.objectId);
        }
        const contractsUser = new Parse.Query('contracts_Users');
        contractsUser.equalTo('UserId', userPtr);
        const extUser = await contractsUser.first({ useMasterKey: true });
        const extUserPtr = {
          __type: 'Pointer',
          className: 'contracts_Users',
          objectId: extUser.id,
        };

        const folderPtr = {
          __type: 'Pointer',
          className: 'contracts_Document',
          objectId: folderId,
        };

        const object = new Parse.Object('contracts_Document');
        object.set('Name', name);
        if (note) {
          object.set('Note', note);
        }
        if (description) {
          object.set('Description', description);
        }
        if (SendinOrder) {
          object.set('SendinOrder', SendinOrder);
        }
        object.set('URL', fileUrl);
        object.set('CreatedBy', userPtr);
        object.set('ExtUserPtr', extUserPtr);
        object.set('IsSendMail', send_email);
        object.set('IsEnableOTP', isEnableOTP);
        if (signers && signers.length > 0) {
          let parseSigners;
          if (base64File) {
            parseSigners = signers;
          } else {
            parseSigners = JSON.parse(signers);
          }
          let createContactUrl = protocol + '/v1/createcontact';

          let contact = [];
          for (const obj of parseSigners) {
            const body = {
              name: obj?.name || '',
              email: obj?.email || '',
              phone: obj?.phone || '',
            };
            try {
              const res = await axios.post(createContactUrl, body, {
                headers: { 'Content-Type': 'application/json', 'x-api-token': reqToken },
              });
              // console.log('res ', res.data);
              contact.push({
                __type: 'Pointer',
                className: 'contracts_Contactbook',
                objectId: res.data?.objectId,
              });
            } catch (err) {
              // console.log('err ', err.response);
              if (err?.response?.data?.objectId) {
                contact.push({
                  __type: 'Pointer',
                  className: 'contracts_Contactbook',
                  objectId: err.response.data?.objectId,
                });
              }
            }
          }
          object.set('Signers', contact);
        }
        if (folderId) {
          object.set('Folder', folderPtr);
        }
        const newACL = new Parse.ACL();
        newACL.setPublicReadAccess(false);
        newACL.setPublicWriteAccess(false);
        newACL.setReadAccess(userPtr.objectId, true);
        newACL.setWriteAccess(userPtr.objectId, true);
        object.setACL(newACL);
        const res = await object.save(null, { useMasterKey: true });
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_draft_document',
            properties: { response_code: 200 },
          });
        }
        return response.json({
          objectId: res.id,
          url: `${baseUrl.origin}/placeholdersign/${res.id}`,
        });
      } else {
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_draft_document',
            properties: { response_code: 400 },
          });
        }
        return response.status(400).json({ error: 'Please provide signers!' });
      }
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}
