export default async function addFileAdapter(request) {
  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  const bucketName = request.params.bucketName;
  const region = request.params.region;
  const endpoint = request.params.endpoint;
  const baseUrl = request.params.baseUrl;
  const accessKeyId = request.params.accessKeyId;
  const secretAccessKey = request.params.secretAccessKey;
  const adapter = request.params.fileAdapter;

  if (bucketName && region && endpoint && accessKeyId && secretAccessKey && adapter) {
    try {
      const extUserCls = new Parse.Query('contracts_Users');
      extUserCls.equalTo('UserId', request.user);
      const extUser = await extUserCls.first({ useMasterKey: true });
      if (extUser) {
        const tenantCls = new Parse.Object('partners_Tenant');
        tenantCls.id = extUser?.get('TenantId')?.id;
        const adapterConfig = {
          bucketName: bucketName,
          region: region,
          endpoint: endpoint,
          baseUrl: baseUrl,
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey,
        };
        tenantCls.set('FileAdapter', adapterConfig);
        tenantCls.set('ActiveFileAdapter', adapter);
        const updateTenant = await tenantCls.save(null, { useMasterKey: true });
        const tenantSchema = new Parse.Schema('partners_Tenant');
        tenantSchema.setCLP({
          get: { '*': true },
          find: { '*': true },
          count: { '*': true },
          create: { '*': true },
          update: { '*': true },
          delete: { '*': true },
          addField: { '*': true },
          protectedFields: { '*': ['FileAdapter'] },
        });
        await tenantSchema.update();
        return updateTenant.updatedAt;
      }
      return extUser;
    } catch (err) {
      console.log('Err in add custom file adapter', err);
      const code = err.code || 400;
      const msg = err.message || 'Something went wrong.';
      throw new Parse.Error(code, msg);
    }
  } else {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Please provide all parameters.');
  }
}
