export default async function getFolder(request, response) {
  const apiToken = request.headers['x-api-token'];
  const folder_id = request.params.folder_id;
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
      folderCls.equalTo('objectId', folder_id);
      folderCls.equalTo('Type', 'Folder');
      folderCls.notEqualTo('IsArchive', true);
      folderCls.descending('createdAt');
      folderCls.include('Folder');
      folderCls.include('ExtUserPtr.TenantId');
      const res = await folderCls.first({ useMasterKey: true });
      if (res) {
        const parseRes = JSON.parse(JSON.stringify(res));
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_get_folder',
            properties: { response_code: 200 },
          });
        }
        return response.json({
          objectId: parseRes.objectId,
          folderName: parseRes.Name,
          parentFolderId: parseRes?.Folder?.objectId || '',
          parentFolderName: parseRes?.Folder?.Name || '',
          createdAt: parseRes.createdAt,
          updatedAt: parseRes.updatedAt,
        });
      } else {
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_get_folder',
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
