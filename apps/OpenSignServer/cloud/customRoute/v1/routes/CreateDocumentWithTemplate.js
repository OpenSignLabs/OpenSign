const randomId = () => Math.floor(1000 + Math.random() * 9000);
export default async function createDocumentWithTemplate(request, response) {
  const signers = request.body.signers;
  const folderId = request.body.folderId;
  const templateId = request.params.template_id;
  const url = request?.get('host');
  let protocol = 'https://' + url;
  if (request.hostname === 'localhost') {
    // console.log('Running in development environment');
    protocol = 'http://' + url;
  } else {
    // console.log('Running in production environment');
    protocol = 'https://' + url;
  }
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

      const templateQyuery = new Parse.Query('contracts_Template');
      const templateRes = await templateQyuery.get(templateId, { useMasterKey: true });
      if (templateRes) {
        const template = JSON.parse(JSON.stringify(templateRes));
        if (template?.Placeholders?.length > 0) {
          let isValid = template?.Placeholders?.length <= signers?.length;
          let updateSigners = template?.Placeholders?.every(y =>
            signers?.some(x => x.Role === y.Role)
          );
          if (isValid && updateSigners) {
            const folderPtr = {
              __type: 'Pointer',
              className: 'contracts_Document',
              objectId: folderId,
            };
            const template = JSON.parse(JSON.stringify(templateRes));
            const object = new Parse.Object('contracts_Document');
            object.set('Name', template.Name);
            if (template?.Note) {
              object.set('Note', template.Note);
            }
            if (template?.Description) {
              object.set('Description', template.Description);
            }
            let templateSigner = template?.Signers ? template?.Signers : [];
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
              object.set('Signers', [...templateSigner, ...contact]);
            } else {
              object.set('Signers', templateSigner);
            }

            object.set('URL', template.URL);
            object.set('CreatedBy', template.CreatedBy);
            object.set('ExtUserPtr', template.ExtUserPtr);
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
              url: protocol + '/load/signmicroapp/placeholdersign/' + res.id,
            });
          } else {
            return response.status(400).json({ error: 'Please provide signers properly!' });
          }
        } else {
          return response.status(400).json({ error: 'Please setup template properly!' });
        }
      } else {
        return response.status(404).json({ error: 'Invalid template id!' });
      }
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    if (err.code === 101) {
      return response.status(404).json({ error: 'Invalid template id!' });
    }
    return response.status(400).json({ error: 'Something went wrong!' });
  }
}
