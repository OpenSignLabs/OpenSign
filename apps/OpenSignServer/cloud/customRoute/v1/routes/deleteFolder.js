export default async function deleteFolder(request, response) {
  const apiToken = request.headers['x-api-token'];
  const folderId = request.params.folder_id;
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

      const obj = new Parse.Query('contracts_Document');
      obj.equalTo('objectId', folderId);
      obj.equalTo('IsArchive', true);
      obj.equalTo('CreatedBy', userPtr);
      obj.include('ExtUserPtr.TenantId');
      const isFolderDeleted = await obj.first({ useMasterKey: true });
      if (!isFolderDeleted) {
        const folder = new Parse.Query('contracts_Document');
        folder.equalTo('Folder', {
          __type: 'Pointer',
          className: 'contracts_Document',
          objectId: folderId,
        });

        folder.notEqualTo('IsArchive', true);
        folder.equalTo('CreatedBy', userPtr);
        folder.equalTo('Type', 'Folder');
        folder.include('ExtUserPtr.TenantId');
        const isSubItems = await folder.first({ useMasterKey: true });
        // console.log('isSubItems ', isSubItems);
        if (isSubItems) {
          return response
            .status(400)
            .json({ error: 'folder is not empty, contains document or folder.' });
        } else {
          const deleteFolder = new Parse.Object('contracts_Document');
          deleteFolder.id = folderId;
          deleteFolder.set('IsArchive', true);
          const deleteRes = await deleteFolder.save(null, { useMasterKey: true });
          if (request.posthog) {
            request.posthog?.capture({
              distinctId: parseUser.userId.email,
              event: 'api_delete_folder',
              properties: { response_code: 200 },
            });
          }
          return response.json({ objectId: deleteRes.id, deletedAt: deleteRes.updatedAt });
        }
      } else {
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_delete_folder',
            properties: { response_code: 404 },
          });
        }
        return response.status(404).json({ error: 'folder not found.' });
      }
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err is delete folder API', err);
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}
