export default async function deletedTemplate(request, response) {
  const reqToken = request.headers['x-api-token'];
  if (!reqToken) {
    return response.status(400).json({ error: 'Please Provide API Token' });
  }
  try {
    const tokenQuery = new Parse.Query('appToken');
    tokenQuery.equalTo('token', reqToken);
    tokenQuery.include('userId');
    const token = await tokenQuery.first({ useMasterKey: true });
    if (token !== undefined) {
      // Valid Token then proceed request
      const parseUser = JSON.parse(JSON.stringify(token));
      const userPtr = {
        __type: 'Pointer',
        className: '_User',
        objectId: parseUser.userId.objectId,
      };
      const template = new Parse.Query('contracts_Template');
      template.equalTo('objectId', request.params.template_id);
      template.equalTo('CreatedBy', userPtr);
      template.include('ExtUserPtr.TenantId');
      const res = await template.first({ useMasterKey: true });
      if (res) {
        const isArchive = res.get('IsArchive');
        if (isArchive && isArchive) {
          if (request.posthog) {
            request.posthog?.capture({
              distinctId: parseUser.userId.email,
              event: 'api_delete_template',
              properties: { response_code: 404 },
            });
          }
          return response.status(404).json({ error: 'Template not found!' });
        } else {
          const template = Parse.Object.extend('contracts_Template');
          const deleteQuery = new template();
          deleteQuery.id = request.params.template_id;
          deleteQuery.set('IsArchive', true);
          const deleteRes = await deleteQuery.save(null, { useMasterKey: true });
          if (deleteRes) {
            if (request.posthog) {
              request.posthog?.capture({
                distinctId: parseUser.userId.email,
                event: 'api_delete_template',
                properties: { response_code: 200 },
              });
            }
            return response.json({
              objectId: request.params.template_id,
              deletedAt: deleteRes.get('updatedAt'),
            });
          }
        }
      } else {
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_delete_template',
            properties: { response_code: 404 },
          });
        }
        return response.status(404).json({ error: 'Template not found!' });
      }
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}
