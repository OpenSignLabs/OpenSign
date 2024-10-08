export default async function getFileAdapter(request) {
  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  try {
    const extUserCls = new Parse.Query('contracts_Users');
    extUserCls.equalTo('UserId', request.user);
    extUserCls.include('TenantId');
    const extUser = await extUserCls.first({ useMasterKey: true });
    if (extUser) {
      const _extUser = JSON.parse(JSON.stringify(extUser));
      const isFileAdapter = _extUser?.TenantId?.FileAdapters?.length > 0 ? true : false;
      if (_extUser?.TenantId?.ActiveFileAdapter && isFileAdapter) {
        const lastIndex = _extUser?.TenantId?.FileAdapters?.length - 1;
        const lastObj = _extUser?.TenantId?.FileAdapters[lastIndex];
        if (lastIndex >= 0) {
          const adapterConfig = {
            id: lastObj?.id,
            fileAdapterName: lastObj?.fileAdapterName,
            bucketName: lastObj?.bucketName,
            region: lastObj?.region,
            endpoint: lastObj?.endpoint,
            baseUrl: lastObj?.baseUrl,
            accessKeyId: lastObj?.accessKeyId,
            secretAccessKey: lastObj?.secretAccessKey,
            fileAdapter: lastObj?.fileAdapter,
          };
          return adapterConfig;
        } else {
          return {};
        }
      } else {
        return {};
      }
    } else {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
    }
  } catch (err) {
    console.log('Err in add custom file adapter', err);
    const code = err.code || 400;
    const msg = err.message || 'Something went wrong.';
    throw new Parse.Error(code, msg);
  }
}
