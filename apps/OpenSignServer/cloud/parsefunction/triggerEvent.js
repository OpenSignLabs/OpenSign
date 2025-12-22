import axios from 'axios';
import { cloudServerUrl, serverAppId } from '../../Utils.js';

export default async function triggerEvent(request) {
  const event = request.params.event;
  const body = request.params.body;
  const docId = body.objectId;
  const contactId = request.params.contactId;
  const serverUrl = cloudServerUrl; //process.env.SERVER_URL;
  const appId = serverAppId;
  const sessiontoken = request.headers?.sessiontoken;

  try {
    const docQuery = new Parse.Query('contracts_Document');
    docQuery.select(['Name', 'IsEnableOTP', 'SignedUrl', 'AuditTrail']);
    const docRes = await docQuery.get(docId, { useMasterKey: true });
    const _docRes = docRes && docRes?.toJSON();
    const isEnableOTP = docRes?.get('IsEnableOTP') || false;

    let userId;
    if (isEnableOTP) {
      let userId;
      if (sessiontoken) {
        const userRes = await axios.get(serverUrl + '/users/me', {
          headers: {
            'X-Parse-Application-Id': appId,
            'X-Parse-Session-Token': sessiontoken,
          },
        });
        userId = userRes.data && userRes.data.objectId;
      }
      if (!userId) {
        return { message: 'User not found!' };
      }
    }

    if (event === 'viewed' && contactId) {
      const auditTrail = Array.isArray(_docRes.AuditTrail) ? _docRes.AuditTrail : [];
      const isUserExist = auditTrail.some(x => x?.UserPtr?.objectId === contactId && x?.ViewedOn);
      if (!isUserExist) {
        const contactPtr = {
          __type: 'Pointer',
          className: 'contracts_Contactbook',
          objectId: contactId,
        };

        const date = new Date().toISOString();
        const newEntry = {
          UserPtr: contactPtr,
          SignedUrl: _docRes?.SignedUrl || '',
          Activity: 'Viewed',
          ipAddress: request.headers['x-real-ip'],
          ViewedOn: date,
        };

        // update Audit trail entry
        const updateDoc = new Parse.Object('contracts_Document');
        updateDoc.id = docRes.id;
        updateDoc.set('AuditTrail', [...auditTrail, newEntry]);
        await updateDoc.save(null, { useMasterKey: true });
      }
    }

    return { message: 'event called!' };
  } catch (err) {
    console.log(
      `triggerEvent error: `,
      err?.response?.data?.error || err?.message || 'Something went wrong!'
    );
    return { message: 'Something went wrong!' };
  }
}
