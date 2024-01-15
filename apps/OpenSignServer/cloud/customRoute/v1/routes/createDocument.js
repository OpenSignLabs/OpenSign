export default async function createDocument(request, response) {
  const name = request.body.name;
  const note = request.body.note;
  const description = request.body.description;
  const signers = request.body.signer;
  const folderId = request.body.folderId;
  const file = request.body.file;
  const url = process.env.SERVER_URL;

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
      const id = token.get('Id');
      const userId = { __type: 'Pointer', className: '_User', objectId: id };

      const contractsUser = new Parse.Query('contracts_Users');
      contractsUser.equalTo('UserId', userId);
      const extUser = await contractsUser.first({ useMasterKey: true });
      const extUserPtr = { __type: 'Pointer', className: 'contracts_Users', objectId: extUser.id };

      const folderPtr = { __type: 'Pointer', className: 'contracts_Document', objectId: folderId };

      const object = new Parse.Object('contracts_Document');
      object.set('Name', name);
      if (note) {
        object.set('Note', note);
      }
      if (description) {
        object.set('Description', description);
      }
      object.set('URL', file);
      object.set('CreatedBy', userId);
      object.set('ExtUserPtr', extUserPtr);
      if (signers) {
        object.set('Signers', signers);
      }
      if (folderId) {
        object.set('Folder', folderPtr);
      }
      const res = await object.save(null, { useMasterKey: true });
      return response.json({ objectId: res.id, url: url });
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.json(err);
  }
}
