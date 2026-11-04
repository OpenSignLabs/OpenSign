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
    const ipAddress = request.headers['x-real-ip'] || '';

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
        ipAddress,
        ViewedOn: date,
      };

      const existingIndex = auditTrail.findIndex(x => x?.UserPtr?.objectId === contactId);

      let updatedAuditTrail;

      // Do not overwrite a completion activity (e.g. 'Signed') with 'Viewed';
      // instead append a separate 'Viewed' entry to preserve audit integrity.
      const completionActivities = ['Signed'];
      if (existingIndex !== -1 && completionActivities.includes(auditTrail[existingIndex]?.Activity)) {
        updatedAuditTrail = [...auditTrail, newEntry];
      } else if (existingIndex !== -1) {
        updatedAuditTrail = [...auditTrail];
        updatedAuditTrail[existingIndex] = {
          ...updatedAuditTrail[existingIndex],
          SignedUrl: _docRes?.SignedUrl || updatedAuditTrail[existingIndex]?.SignedUrl || '',
          Activity: 'Viewed',
          ipAddress,
          ViewedOn: date,
        };
      } else {
        updatedAuditTrail = [...auditTrail, newEntry];
      }

      // save only once
      const updateDoc = new Parse.Object('contracts_Document');
      updateDoc.id = docRes.id;
      updateDoc.set('AuditTrail', updatedAuditTrail);
      await updateDoc.save(null, { useMasterKey: true });
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
