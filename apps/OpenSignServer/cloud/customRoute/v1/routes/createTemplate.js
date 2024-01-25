const randomId = () => Math.floor(1000 + Math.random() * 9000);
export default async function createTemplate(request, response) {
  const name = request.body?.Title;
  const note = request.body?.Note;
  const description = request.body?.Description;
  const signers = request.body?.Signers;
  const folderId = request.body?.FolderId;
  const url = request?.get('host');
  const base64File = request.body.File;
  const fileData = request.files?.[0] ? request.files[0].buffer : null;
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
      let fileUrl;
      if (base64File) {
        const file = new Parse.File(`${name}.pdf`, {
          base64: base64File,
        });
        await file.save({ useMasterKey: true });
        fileUrl = file.url();
      } else {
        const file = new Parse.File(request.files?.[0]?.originalname, {
          base64: fileData?.toString('base64'),
        });
        await file.save({ useMasterKey: true });
        fileUrl = file.url();
      }

      const contractsUser = new Parse.Query('contracts_Users');
      contractsUser.equalTo('UserId', userPtr);
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
      object.set('CreatedBy', userPtr);
      object.set('ExtUserPtr', extUserPtr);
      if (signers) {
        let parseSigners;
        if (base64File) {
          parseSigners = signers;
        } else {
          parseSigners = JSON.parse(signers);
        }

        const contactbook = new Parse.Query('contracts_Contactbook');
        contactbook.containedIn('Email', parseSigners);
        contactbook.equalTo('UserId', userPtr);
        contactbook.notEqualTo('IsDeleted', true);
        const contactbookRes = await contactbook.find({ useMasterKey: true });
        // console.log('contactbookRes ', contactbookRes);
        const parseContactbookRes = JSON.parse(JSON.stringify(contactbookRes));

        object.set(
          'Signers',
          parseContactbookRes?.map(x => ({
            __type: 'Pointer',
            className: 'contracts_Contactbook',
            objectId: x.objectId,
          }))
        );
      }
      if (folderId) {
        object.set('Folder', folderPtr);
      }
      const newACL = new Parse.ACL();
      newACL.setPublicReadAccess(false);
      newACL.setPublicWriteAccess(false);
      newACL.setReadAccess(userPtr.id, true);
      newACL.setWriteAccess(userPtr.id, true);
      object.setACL(newACL);
      const res = await object.save(null, { useMasterKey: true });
      return response.json({
        objectId: res.id,
        url: 'https://' + url + '/load/signmicroapp/template/' + res.id,
      });
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}
