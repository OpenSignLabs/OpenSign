export default async function updateDocument(request, response) {
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
      const allowedKeys = ['Name', 'Note', 'Description'];
      const objectKeys = Object.keys(request.body);
      const isValid = objectKeys.every(key => allowedKeys.includes(key)) && objectKeys.length > 0;
      if (isValid) {
        const userPtr = token.get('userId');
        const document = new Parse.Query('contracts_Document');
        document.equalTo('objectId', request.params.document_id);
        document.equalTo('CreatedBy', userPtr);
        const res = await document.first({ useMasterKey: true });
        if (res) {
          const isArchive = res.get('IsArchive');
          if (isArchive && isArchive) {
            return response.status(404).json({ message: 'Document not found!' });
          } else {
            const document = Parse.Object.extend('contracts_Document');
            const updateQuery = new document();
            updateQuery.id = request.params.document_id;
            if (request?.body?.name) {
              updateQuery.set('Name', request?.body?.name);
            }
            if (request?.body?.note) {
              updateQuery.set('Note', request?.body?.note);
            }
            if (request?.body?.description) {
              updateQuery.set('Name', request?.body?.description);
            }
            if (request?.body?.folderId) {
              updateQuery.set('Folder', {
                __type: 'Pointer',
                className: 'contracts_Document',
                objectId: request?.body?.folderId,
              });
            }
            const updatedRes = await updateQuery.save(null, { useMasterKey: true });
            if (updatedRes) {
              return response.json({
                objectId: updatedRes.id,
                updatedAt: updatedRes.get('updatedAt'),
              });
            }
          }
        } else {
          return response.status(404).json({ error: 'Document not found!' });
        }
      } else {
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
