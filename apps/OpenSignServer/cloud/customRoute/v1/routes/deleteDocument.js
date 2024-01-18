export default async function deleteDocument(request, response) {
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
      const Document = new Parse.Query('contracts_Document');
      Document.equalTo('objectId', request.params.document_id);
      Document.equalTo('CreatedBy', userPtr);
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
            return response.json({
              objectId: request.params.document_id,
              deletedAt: deleteRes.get('updatedAt'),
            });
          }
        }
      } else {
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
