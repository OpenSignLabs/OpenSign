import axios from 'axios';
import { cloudServerUrl } from '../../Utils.js';
export default async function callWebhook(request) {
  const event = request.params.event;
  const body = request.params.body;
  const docId = body.objectId;
  const contactId = request.params.contactId;
  const serverUrl = cloudServerUrl; //process.env.SERVER_URL;
  const appId = process.env.APP_ID;
  try {
    const docQuery = new Parse.Query('contracts_Document');
    docQuery.include('ExtUserPtr.TenantId');
    const docRes = await docQuery.get(docId, { useMasterKey: true });
    const isEnableOTP = docRes?.get('IsEnableOTP') || false;
    let userId;
    if (isEnableOTP) {
      const userRes = await axios.get(serverUrl + '/users/me', {
        headers: {
          'X-Parse-Application-Id': appId,
          'X-Parse-Session-Token': request.headers['sessiontoken'],
        },
      });
      userId = userRes.data && userRes.data.objectId;
    }
    if (!isEnableOTP || userId) {
      if (event === 'viewed' && contactId) {
        if (docRes) {
          const _docRes = docRes.toJSON();
          const userPtr = {
            __type: 'Pointer',
            className: 'contracts_Contactbook',
            objectId: contactId,
          };
          const date = new Date().toISOString();
          const obj = {
            UserPtr: userPtr,
            SignedUrl: _docRes.SignedUrl,
            Activity: 'Viewed',
            ipAddress: request.headers['x-real-ip'],
            ViewedOn: date,
          };
          const isUserExist = _docRes?.AuditTrail?.some(
            x => x.UserPtr.objectId === contactId && x?.ViewedOn
          );
          if (!isUserExist) {
            const updateDoc = new Parse.Object('contracts_Document');
            updateDoc.id = docRes.id;
            if (_docRes?.AuditTrail && _docRes?.AuditTrail?.length > 0) {
              updateDoc.set('AuditTrail', [..._docRes?.AuditTrail, obj]);
            } else {
              updateDoc.set('AuditTrail', [obj]);
            }
            await updateDoc.save(null, { useMasterKey: true });
          }
        }
      }
      const extendcls = new Parse.Query('contracts_Users');
      extendcls.equalTo('objectId', docRes.get('ExtUserPtr')?.id);
      // extendcls.equalTo('UserId', { __type: 'Pointer', className: '_User', objectId: userId });
      const resExt = await extendcls.first({ useMasterKey: true });
      if (resExt) {
        const extUser = JSON.parse(JSON.stringify(resExt));
        if (extUser?.Webhook) {
          const params = { event: event, ...body };
          await axios
            .post(extUser?.Webhook, params, {
              headers: { 'Content-Type': 'application/json' },
            })
            .then(res => {
              try {
                const webhook = new Parse.Object('contracts_Webhook');
                webhook.set('Log', res?.status);
                webhook.set('UserId', {
                  __type: 'Pointer',
                  className: '_User',
                  objectId: userId,
                });
                webhook.save(null, { useMasterKey: true });
              } catch (err) {
                console.log('err save in contracts_Webhook', err.message);
              }
            })
            .catch(err => {
              console.log('Err send data to webhook', err.message);
              try {
                const webhook = new Parse.Object('contracts_Webhook');
                webhook.set('Log', err?.status);
                webhook.set('UserId', {
                  __type: 'Pointer',
                  className: '_User',
                  objectId: userId,
                });
                webhook.save(null, { useMasterKey: true });
              } catch (err) {
                console.log('err save in contracts_Webhook', err.message);
              }
            });
        }
        return { message: 'webhook called!' };
      }
    } else {
      return { message: 'User not found!' };
    }
  } catch (err) {
    console.log('Err in callwebhook', err);
    return { message: 'Something went wrong!' };
  }
}
