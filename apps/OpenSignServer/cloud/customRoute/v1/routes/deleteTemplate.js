export default async function deletedTemplate(request, response) {
  try {
    const reqToken = request.headers['x-api-token'];
    if (!reqToken) {
      return response.status(400).json({ error: 'Please Provide API Token' });
    }
    const tokenQuery = new Parse.Query('appToken');
    tokenQuery.equalTo('token', reqToken);
    const token = await tokenQuery.first({ useMasterKey: true });
    if (token !== undefined) {
      // Valid Token then proceed request
      const userPtr = token.get('userId');
      const template = new Parse.Query('contracts_Template');
      template.equalTo('objectId', request.params.template_id);
      template.equalTo('CreatedBy', userPtr);
      const res = await template.first({ useMasterKey: true });
      if (res) {
        const isArchive = res.get('IsArchive');
        if (isArchive && isArchive) {
          return response.status(404).json({ error: 'Template not found!' });
        } else {
          const template = Parse.Object.extend('contracts_Template');
          const deleteQuery = new template();
          deleteQuery.id = request.params.template_id;
          deleteQuery.set('IsArchive', true);
          const deleteRes = await deleteQuery.save(null, { useMasterKey: true });
          if (deleteRes) {
            return response.json({
              objectId: request.params.template_id,
              deletedAt: deleteRes.get('updatedAt'),
            });
          }
        }
      } else {
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
