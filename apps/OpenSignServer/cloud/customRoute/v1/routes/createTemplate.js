const randomId = () => Math.floor(1000 + Math.random() * 9000);
export default async function createTemplate(request, response) {
  const name = request.body?.title;
  const note = request.body?.note;
  const description = request.body?.description;
  const signers = request.body?.signers;
  const folderId = request.body?.folderId;
  const base64File = request.body.file;
  const fileData = request.files?.[0] ? request.files[0].buffer : null;
  const url = new URL(process.env.SERVER_URL);
  let protocol = url.origin;

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
      if (signers && signers.length > 0) {
        let parseSigners;
        if (base64File) {
          parseSigners = signers;
        } else {
          parseSigners = JSON.parse(signers);
        }
        let createContactUrl = protocol + '/v1/createcontact';

        let contact = [];
        for (const obj of parseSigners) {
          const body = {
            name: obj?.name || '',
            email: obj?.email || '',
            phone: obj?.phone || '',
          };
          try {
            const res = await axios.post(createContactUrl, body, {
              headers: { 'Content-Type': 'application/json', 'x-api-token': reqToken },
            });
            // console.log('res ', res.data);
            contact.push({
              __type: 'Pointer',
              className: 'contracts_Contactbook',
              objectId: res.data?.objectId,
            });
          } catch (err) {
            // console.log('err ', err.response);
            if (err?.response?.data?.objectId) {
              contact.push({
                __type: 'Pointer',
                className: 'contracts_Contactbook',
                objectId: err.response.data?.objectId,
              });
            }
          }
        }
        object.set('Signers', contact);
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
        url: protocol + '/load/signmicroapp/template/' + res.id,
      });
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}