export default async function updateTemplate(request, response) {
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
      // Valid Token then proceed request
      const allowedKeys = ['name', 'note', 'description', 'folderId', 'enableOTP'];
      const objectKeys = Object.keys(request.body);
      const isValid = objectKeys.every(key => allowedKeys.includes(key)) && objectKeys.length > 0;
      const parseUser = JSON.parse(JSON.stringify(token));
      const userPtr = {
        __type: 'Pointer',
        className: '_User',
        objectId: parseUser.userId.objectId,
      };
      if (isValid) {
        const template = new Parse.Query('contracts_Template');
        template.equalTo('objectId', request.params.template_id);
        template.equalTo('CreatedBy', userPtr);
        const res = await template.first({ useMasterKey: true });
        if (res) {
          const isArchive = res.get('IsArchive');
          if (isArchive && isArchive) {
            return response.status(404).json({ message: 'Template not found!' });
          } else {
            const template = Parse.Object.extend('contracts_Template');
            const updateQuery = new template();
            updateQuery.id = request.params.template_id;
            if (request?.body?.name) {
              updateQuery.set('Name', request?.body?.name);
            }
            if (request?.body?.note) {
              updateQuery.set('Note', request?.body?.note);
            }
            if (request?.body?.description) {
              updateQuery.set('Description', request?.body?.description);
            }
            if (request?.body?.folderId) {
              updateQuery.set('Folder', {
                __type: 'Pointer',
                className: 'contracts_Template',
                objectId: request?.body?.folderId,
              });
            }
            if (request.body?.enableOTP !== undefined) {
              updateQuery.set('IsEnableOTP', request.body?.enableOTP);
            }
            const updatedRes = await updateQuery.save(null, { useMasterKey: true });
            if (updatedRes) {
              if (request.posthog) {
                request.posthog?.capture({
                  distinctId: parseUser.userId.email,
                  event: 'api_update_template',
                  properties: { response_code: 200 },
                });
              }
              return response.json({
                objectId: updatedRes.id,
                updatedAt: updatedRes.get('updatedAt'),
              });
            }
          }
        } else {
          if (request.posthog) {
            request.posthog?.capture({
              distinctId: parseUser.userId.email,
              event: 'api_update_template',
              properties: { response_code: 404 },
            });
          }
          return response.status(404).json({ error: 'Template not found!' });
        }
      } else {
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_update_template',
            properties: { response_code: 400 },
          });
        }
        return response.status(400).json({ error: 'Please provide valid field names!' });
      }
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}
