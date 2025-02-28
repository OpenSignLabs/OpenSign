export default async function deleteDocument(request, response) {
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
      const parseUser = JSON.parse(JSON.stringify(token));
      const userPtr = {
        __type: 'Pointer',
        className: '_User',
        objectId: parseUser.userId.objectId,
      };

      const Document = new Parse.Query('contracts_Document');
      Document.equalTo('objectId', request.params.document_id);
      Document.equalTo('CreatedBy', userPtr);
      Document.include('ExtUserPtr.TenantId');
      const res = await Document.first({ useMasterKey: true });
      if (res) {
        const isArchive = res.get('IsArchive');
        if (isArchive && isArchive) {
          return response.status(404).json({ error: 'Document not found!' });
        } else {
          const Document = Parse.Object.extend('contracts_Document');
          const deleteQuery = new Document();
          deleteQuery.id = request.params.document_id;
          deleteQuery.set('IsArchive', true);
          const deleteRes = await deleteQuery.save(null, { useMasterKey: true });
          if (deleteRes) {
            if (request.posthog) {
              request.posthog?.capture({
                distinctId: parseUser.userId.email,
                event: 'api_delete_document',
                properties: { response_code: 200 },
              });
            }
            return response.json({
              objectId: request.params.document_id,
              deletedAt: deleteRes.get('updatedAt'),
            });
          }
        }
      } else {
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_delete_document',
            properties: { response_code: 404 },
          });
        }
        return response.status(404).json({ error: 'Document not found!' });
      }
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}
