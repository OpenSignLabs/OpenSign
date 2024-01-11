export default async function getDocument(request, response) {
  try {
    const reqToken = request.headers['x-api-token'];
    if (!reqToken) {
      return response.json({ message: 'Please Provide API Token' });
    }
    const tokenQuery = new Parse.Query('appToken');
    tokenQuery.equalTo('token', reqToken);
    const token = await tokenQuery.first({ useMasterKey: true });
    if (token !== undefined) {
      // Valid Token then proceed request
      const id = token.get('Id');
      const userId = { __type: 'Pointer', className: '_User', objectId: id };
      const Document = new Parse.Query('contracts_Document');
      Document.equalTo('objectId', request.params.document_id);
      Document.equalTo('CreatedBy', userId);
      Document.notEqualTo('IsArchive', true);
      const res = await Document.first({ useMasterKey: true });
      if (res) {
        return response.json({ code: 200, result: res });
      } else {
        return response.json({ code: 404, message: 'Document not found!' });
      }
    } else {
      return response.json({ code: 405, message: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.json(err);
  }
}
