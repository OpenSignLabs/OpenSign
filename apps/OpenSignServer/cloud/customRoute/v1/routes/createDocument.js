// import batchQuery from './batchquery.js';

// const randomId = () => Math.floor(1000 + Math.random() * 9000);
export default async function createDocument(request, response) {
  const name = request.body.Title;
  const note = request.body.Note;
  const description = request.body.Description;
  const signers = request.body.Signers;
  const folderId = request.body.FolderId;
  const base64File = request.body.File;
  const url = request?.get('host');
  const fileData = request.files?.[0] ? request.files[0].buffer : null;
  // console.log('fileData ', fileData);
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
      if (signers) {
        const userPtr = token.get('userId');
        let fileUrl;
        if (request.files?.[0]) {
          const file = new Parse.File(request.files?.[0]?.originalname, {
            base64: fileData?.toString('base64'),
          });
          await file.save({ useMasterKey: true });
          fileUrl = file.url();
        } else {
          const file = new Parse.File(`${name}.pdf`, {
            base64: base64File,
          });
          await file.save({ useMasterKey: true });
          fileUrl = file.url();
        }
        const contractsUser = new Parse.Query('contracts_Users');
        contractsUser.equalTo('UserId', userPtr);
        const extUser = await contractsUser.first({ useMasterKey: true });
        const extUserPtr = {
          __type: 'Pointer',
          className: 'contracts_Users',
          objectId: extUser.id,
        };

        const folderPtr = {
          __type: 'Pointer',
          className: 'contracts_Document',
          objectId: folderId,
        };

        const object = new Parse.Object('contracts_Document');
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
          contactbook.equalTo('UserId', userPtr);
          contactbook.notEqualTo('IsDeleted', true);
          contactbook.containedIn('Email', parseSigners);
          const contactbookRes = await contactbook.find({ useMasterKey: true });
          // console.log('contactbookRes ', contactbookRes);
          const parseContactbookRes = JSON.parse(JSON.stringify(contactbookRes));
          // console.log('userPtr ', userPtr);
          // const newContacts = parseSigners
          //   .filter(x => !parseContactbookRes.some(y => y.Email === x))
          //   .map(email => ({
          //     method: 'POST',
          //     path: '/app/classes/contracts_Contactbook',
          //     body: {
          //       Email: email,
          //       CreatedBy: { __type: 'Pointer', className: '_User', objectId: userPtr.id },
          //       UserId: { __type: 'Pointer', className: '_User', objectId: userPtr.id },
          //       Role: 'contracts_Guest',
          //       IsDeleted: false,
          //       ACL: {
          //         [userPtr.id]: { read: true, write: true },
          //       },
          //     },
          //   }));
          // console.log('newContacts', newContacts);
          let contactSigners = parseContactbookRes?.map(x => ({
            __type: 'Pointer',
            className: 'contracts_Contactbook',
            objectId: x.objectId,
          }));
          // if (newContacts.length > 0) {
          //   const batchRes = await batchQuery(newContacts);
          //   const contacts = batchRes?.map(x => ({
          //     __type: 'Pointer',
          //     className: 'contracts_Contactbook',
          //     objectId: x.success.objectId,
          //   }));
          //   contactSigners = [...contactSigners, ...contacts];
          // }
          // console.log('contactsigners', contactSigners);

          object.set('Signers', contactSigners);
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
          url: 'https://' + url + '/load/signmicroapp/placeholdersign/' + res.id,
        });
      } else {
        return response.status(400).json({ error: 'Please provide signers!' });
      }
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.status(400).json({ error: 'Something went wrong!' });
  }
}
