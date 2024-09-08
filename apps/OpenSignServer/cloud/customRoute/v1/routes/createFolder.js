export default async function createFolder(request, response) {
  const apiToken = request.headers['x-api-token'];
  const folderName = request.body.folderName;
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
      const userQuery = new Parse.Query('contracts_Users');
      userQuery.equalTo('UserId', userPtr);
      const extUser = await userQuery.first({ useMasterKey: true });

      const folderCls = new Parse.Object('contracts_Document');
      folderCls.set('Name', folderName);
      folderCls.set('CreatedBy', userPtr);
      folderCls.set('Type', 'Folder');
      folderCls.set('ExtUserPtr', {
        __type: 'Pointer',
        className: 'contracts_Users',
        objectId: extUser.id,
      });
      if (parentFolderId) {
        folderCls.set('Folder', {
          __type: 'Pointer',
          className: 'contracts_Document',
          objectId: parentFolderId,
        });
      }
      const acl = new Parse.ACL();
      acl.setReadAccess(parseUser.userId.objectId, true); // Allow read access to the userPtr
      acl.setWriteAccess(parseUser.userId.objectId, true); // Allow write access to the userPtr

      // Set the ACL to the document
      folderCls.setACL(acl);

      const _resFolder = await folderCls.save(null, { useMasterKey: true });
      if (_resFolder) {
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_create_folder',
            properties: { response_code: 200 },
          });
        }
        const parseRes = JSON.parse(JSON.stringify(_resFolder));
        return response.json({
          objectId: parseRes.objectId,
          folderName: parseRes.Name,
          parentFolderId: parseRes?.Folder?.objectId || '',
          createdAt: parseRes.createdAt,
          updatedAt: parseRes.updatedAt,
        });
      }
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}
