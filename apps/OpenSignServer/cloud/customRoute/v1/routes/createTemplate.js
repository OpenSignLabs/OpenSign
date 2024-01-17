const randomId = () => Math.floor(1000 + Math.random() * 9000);
export default async function createTemplate(request, response) {
  const name = request.body.Title;
  const note = request.body.Note;
  const description = request.body.Description;
  const signers = request.body.Signers;
  const folderId = request.body.FolderId;
  // const file = request.body.file;
  const url = process.env.SERVER_URL;
  const fileData = request.files[0] ? request.files[0].buffer : null;
  try {
    const file = new Parse.File(request.files[0].originalname, {
      base64: fileData.toString('base64'),
    });
    await file.save({ useMasterKey: true });
    const fileUrl = file.url();
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

      const folderPtr = { __type: 'Pointer', className: 'contracts_Template', objectId: folderId };

      const object = new Parse.Object('contracts_Template');
      object.set('Name', name);
      if (note) {
        object.set('Note', note);
      }
      if (description) {
        object.set('Description', description);
      }
      object.set('URL', fileUrl);
      object.set('CreatedBy', userId);
      object.set('ExtUserPtr', extUserPtr);
      if (signers) {
        const placeholders = signers.map((x, i) => ({
          email: x,
          Id: randomId(),
          Role: 'User ' + (i + 1),
          blockColor: '',
          signerObjId: '',
          signerPtr: {},
          placeHolder: [],
        }));
        object.set('Placeholders', placeholders);
      }
      if (folderId) {
        object.set('Folder', folderPtr);
      }
      const newACL = new Parse.ACL();
      newACL.setPublicReadAccess(false);
      newACL.setPublicWriteAccess(false);
      newACL.setReadAccess(id, true);
      newACL.setWriteAccess(id, true);
      object.setACL(newACL);
      const res = await object.save(null, { useMasterKey: true });
      return response.json({ objectId: res.id, url: url });
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}
