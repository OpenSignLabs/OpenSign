import axios from 'axios';
export default async function callWebhook(request) {
  const event = request.params.event;
  const body = request.params.body;
  const docId = body.objectId;
  const contactId = request.params.contactId;
  const serverUrl = process.env.SERVER_URL;
  const appId = process.env.APP_ID;
  const userRes = await axios.get(serverUrl + '/users/me', {
    headers: {
      'X-Parse-Application-Id': appId,
      'X-Parse-Session-Token': request.headers['sessiontoken'],
    },
  });

  const userId = userRes.data && userRes.data.objectId;
  if (userId) {
    if (event === 'viewed' && contactId) {
      const docQuery = new Parse.Query('contracts_Document');
      const res = await docQuery.get(docId, { useMasterKey: true });
      if (res) {
        const _res = res.toJSON();
        const userPtr = {
          __type: 'Pointer',
          className: 'contracts_Contactbook',
          objectId: contactId,
        };
        const date = new Date().toISOString();
        const obj = {
          UserPtr: userPtr,
          SignedUrl: _res.SignedUrl,
          Activity: 'Viewed',
          ipAddress: request.headers['x-real-ip'],
          ViewedOn: date,
        };
        const isUserExist = _res?.AuditTrail?.some(
          x => x.UserPtr.objectId === contactId && x?.ViewedOn
        );
        if (!isUserExist) {
          const updateDoc = new Parse.Object('contracts_Document');
          updateDoc.id = res.id;
          if (_res?.AuditTrail && _res?.AuditTrail?.length > 0) {
            updateDoc.set('AuditTrail', [..._res?.AuditTrail, obj]);
          } else {
            updateDoc.set('AuditTrail', [obj]);
          }
          await updateDoc.save(null, { useMasterKey: true });
        }
      }
    }
    const extendcls = new Parse.Query('contracts_Users');
    extendcls.equalTo('UserId', { __type: 'Pointer', className: '_User', objectId: userId });
    const res = await extendcls.first({ useMasterKey: true });
    if (res) {
      const extUser = JSON.parse(JSON.stringify(res));
      if (extUser?.Webhook) {
        const params = {
          event: event,
          ...body,
        };
        await axios
          .post(extUser?.Webhook, params, {
            headers: { 'Content-Type': 'application/json' },
          })
          .then(res => {
            try {
              // console.log('res ', res);
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
}
