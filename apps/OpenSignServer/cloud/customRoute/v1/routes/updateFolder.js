export default async function updateFolder(request, response) {
  const apiToken = request.headers['x-api-token'];
  const folderId = request.params.folder_id;
  const name = request.body.folderName;
  const parentFolderId = request.body.parentFolderId;
  if (!apiToken) {
    return response.status(400).json({ error: 'Please Provide API Token' });
  }
  try {
    const tokenQuery = new Parse.Query('appToken');
    tokenQuery.equalTo('token', apiToken);
    tokenQuery.include('userId');
    const token = await tokenQuery.first({ useMasterKey: true });
    if (token !== undefined) {
      // Valid Token then proceed request
      const parseUser = JSON.parse(JSON.stringify(token));
      const userPtr = {
        __type: 'Pointer',
        className: '_User',
        objectId: parseUser.userId.objectId,
      };

      const folderCls = new Parse.Query('contracts_Document');
      folderCls.equalTo('CreatedBy', userPtr);
      folderCls.equalTo('objectId', folderId);
      folderCls.equalTo('Type', 'Folder');
      folderCls.notEqualTo('IsArchive', true);
      folderCls.include('ExtUserPtr.TenantId');
      const res = await folderCls.first({ useMasterKey: true });
      if (res) {
        const updateFolder = new Parse.Object('contracts_Document');
        updateFolder.id = res.id;
        updateFolder.set('Name', name);
        if (parentFolderId) {
          updateFolder.set('Folder', {
            __type: 'Pointer',
            className: 'contracts_Document',
            objectId: parentFolderId,
          });
        }
        const updateRes = await updateFolder.save(null, { useMasterKey: true });
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_update_folder',
            properties: { response_code: 200 },
          });
        }
        return response.json({ objectId: updateRes.id, updatedAt: updateRes.updatedAt });
      } else {
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_update_folder',
            properties: { response_code: 404 },
          });
        }
        return response.status(404).json({ error: 'folder not found.' });
      }
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}
