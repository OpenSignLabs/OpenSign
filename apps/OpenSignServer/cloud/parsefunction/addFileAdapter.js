// `generateId` is used to unique Id for fileAdapter
function generateId(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export default async function addFileAdapter(request) {
  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  const fileAdapterName = request.params.fileAdapterName;
  const bucketName = request.params.bucketName;
  const region = request.params.region;
  const endpoint = request.params.endpoint;
  const baseUrl = request.params.baseUrl;
  const accessKeyId = request.params.accessKeyId;
  const secretAccessKey = request.params.secretAccessKey;
  const adapter = request.params.fileAdapter;

  if (fileAdapterName && accessKeyId && secretAccessKey && adapter) {
    try {
      const extUserCls = new Parse.Query('contracts_Users');
      extUserCls.equalTo('UserId', request.user);
      extUserCls.include('TenantId');
      const extUser = await extUserCls.first({ useMasterKey: true });
      if (extUser) {
        const _extUser = JSON.parse(JSON.stringify(extUser));
        const tenantCls = new Parse.Object('partners_Tenant');
        tenantCls.id = extUser?.get('TenantId')?.id;
        const existsFileAdaptes = _extUser?.TenantId?.FileAdapters
          ? _extUser?.TenantId?.FileAdapters
          : [];

        // assign existing file adapters or empty array
        let updatedFileAdapters = existsFileAdaptes;
        const uniqueId = generateId(10);
        let id = extUser?.get('TenantId')?.id + '_' + uniqueId;
        const index = updatedFileAdapters?.findIndex(x => x.fileAdapterName === fileAdapterName);

        if (index !== -1) {
          // If an object with the same fileAdapterName exists, update it
          if (bucketName || region || endpoint || baseUrl) {
            throw new Parse.Error(
              Parse.Error.INVALID_QUERY,
              'Cannot update bucketName, region, endpoint, baseUrl.'
            );
          } else {
            const adapterConfig = { accessKeyId: accessKeyId, secretAccessKey: secretAccessKey };
            updatedFileAdapters[index] = { ...updatedFileAdapters[index], ...adapterConfig };
            id = updatedFileAdapters[index].id;
          }
        } else {
          if (bucketName && region && endpoint && baseUrl) {
            // If the object with the given fileAdapterName doesn't exist, add a new one
            updatedFileAdapters.push({
              id: id,
              fileAdapterName: fileAdapterName,
              fileAdapter: adapter,
              bucketName: bucketName,
              region: region,
              endpoint: endpoint,
              baseUrl: baseUrl,
              accessKeyId: accessKeyId,
              secretAccessKey: secretAccessKey,
            });
          } else {
            throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Please provide all parameters.');
          }
        }
        tenantCls.set('FileAdapters', updatedFileAdapters);
        if (adapter) {
          tenantCls.set('ActiveFileAdapter', id);
        } else {
          tenantCls.unset('ActiveFileAdapter');
        }
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
          protectedFields: { '*': ['FileAdapters'] },
        });
        await tenantSchema.update();
        const ActiveFileAdapter = adapter === 'opensign' ? 'opensign' : id;
        return { ActiveFileAdapter: ActiveFileAdapter, updateAt: updateTenant.updatedAt };
      } else {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
      }
    } catch (err) {
      console.log('Err in add custom file adapter', err);
      const code = err.code || 400;
      const msg = err.message || 'Something went wrong.';
      throw new Parse.Error(code, msg);
    }
  } else if (adapter === 'opensign') {
    try {
      const extUserCls = new Parse.Query('contracts_Users');
      extUserCls.equalTo('UserId', request.user);
      extUserCls.include('TenantId');
      const extUser = await extUserCls.first({ useMasterKey: true });
      if (extUser) {
        const tenantCls = new Parse.Object('partners_Tenant');
        tenantCls.id = extUser?.get('TenantId')?.id;
        tenantCls.unset('ActiveFileAdapter');
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
          protectedFields: { '*': ['FileAdapters'] },
        });
        await tenantSchema.update();
        return { ActiveFileAdapter: 'opensign', updateAt: updateTenant.updatedAt };
      } else {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
      }
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
