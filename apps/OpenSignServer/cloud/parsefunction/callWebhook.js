import axios from 'axios';
export default async function callWebhook(request) {
  const event = request.params.event;
  const body = request.params.body;
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
              console.log('err save in contracts_Webhook', err);
            }
          })
          .catch(err => {
            console.log('Err send data to webhook', err);
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
              console.log('err save in contracts_Webhook', err);
            }
          });
      }
      return { message: 'webhook called!' };
    }
  } else {
    return { message: 'User not found!' };
  }
}
