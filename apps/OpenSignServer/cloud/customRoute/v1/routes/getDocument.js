export default async function getDocument(request, response) {
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
      Document.notEqualTo('IsArchive', true);
      Document.include('Signers');
      Document.include('Folder');
      Document.include('ExtUserPtr');
      const res = await Document.first({ useMasterKey: true });
      if (res) {
        const document = JSON.parse(JSON.stringify(res));
        return response.json({
          objectId: document.objectId,
          title: document.Name,
          note: document.Note || '',
          folder: { objectId: document?.Folder?.objectId, name: document?.Folder?.Name } || '',
          file: document?.SignedUrl || document.URL,
          owner: document?.ExtUserPtr?.Name,
          signers:
            document?.Signers?.map(y => ({ name: y?.Name, email: y?.Email, phone: y?.Phone })) ||
            [],
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
        });
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
