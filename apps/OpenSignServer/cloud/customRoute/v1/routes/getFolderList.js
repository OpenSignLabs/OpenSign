export default async function getFolderList(request, response) {
  const apiToken = request.headers['x-api-token'];
  const parentFolderId = request.query?.parentFolderId || '';
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
      const limit = request?.query?.limit ? parseInt(request.query.limit) : 100;
      const skip = request?.query?.skip ? parseInt(request.query.skip) : 0;
      const folderCls = new Parse.Query('contracts_Document');
      folderCls.equalTo('CreatedBy', userPtr);
      folderCls.equalTo('Type', 'Folder');
      folderCls.notEqualTo('IsArchive', true);
      folderCls.descending('createdAt');
      folderCls.include('Folder');
      if (parentFolderId) {
        folderCls.equalTo('Folder', {
          __type: 'Pointer',
          className: 'contracts_Document',
          objectId: parentFolderId,
        });
      } else {
        folderCls.doesNotExist('Folder');
      }
      folderCls.descending('createdAt');
      folderCls.include('ExtUserPtr.TenantId');
      folderCls.limit(limit);
      folderCls.skip(skip);
      const res = await folderCls.find({ useMasterKey: true });
      if (res && res.length > 0) {
        const parseRes = JSON.parse(JSON.stringify(res));
        const folderlist = parseRes.map(x => ({
          objectId: x.objectId,
          folderName: x.Name,
          parentFolderId: x?.Folder?.objectId || '',
          parentFolderName: x?.Folder?.Name || '',
          createdAt: x.createdAt,
          updatedAt: x.updatedAt,
        }));
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_get_Folder_list',
            properties: { response_code: 200 },
          });
        }
        return response.json({ result: folderlist });
      } else {
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_get_Folder_list',
            properties: { response_code: 200 },
          });
        }
        return response.json({ result: [] });
      }
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}
