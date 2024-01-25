const randomId = () => Math.floor(1000 + Math.random() * 9000);
export default async function createDocumentWithTemplate(request, response) {
  const signers = request.body.Signers;
  const folderId = request.body.FolderId;
  const templateId = request.params.template_id;
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
            if (template?.Signers) {
              object.set('Signers', template?.Signers);
            }
            object.set('URL', template.URL);
            object.set('CreatedBy', template.CreatedBy);
            object.set('ExtUserPtr', template.ExtUserPtr);
            if (signers) {
            const placeholders = template?.Placeholders?.map(placeholder => {
              let matchingSigner = signers.find(y => y.Role === placeholder.Role);
              if (matchingSigner) {
                return {
                  ...placeholder,
                  email: matchingSigner.Email,
                  signerObjId: '',
                  signerPtr: {},
                };
              } else {
                return {
                  ...placeholder,
                };
              }
            });
            console.log('placeholders ', placeholders);
              object.set('Placeholders', placeholders);
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
            return response.json({ objectId: res.id, url: url });
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
