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

// `getExtUser` get ext user details
async function getExtUser(request) {
  const extUserCls = new Parse.Query('contracts_Users');
  extUserCls.equalTo('UserId', request.user);
  extUserCls.include('TenantId');
  return await extUserCls.first({ useMasterKey: true });
}

// `saveTenant` save file adapter details in tenant class
async function saveTenant(tenantId, fileAdapters, activeAdapter) {
  const tenantCls = new Parse.Object('partners_Tenant');
  tenantCls.id = tenantId;
  if (fileAdapters?.length > 0) {
    tenantCls.set('FileAdapters', fileAdapters);
  }
  if (activeAdapter) {
    tenantCls.set('ActiveFileAdapter', activeAdapter);
  } else {
    tenantCls.unset('ActiveFileAdapter');
  }
  return await tenantCls.save(null, { useMasterKey: true });
}

// `updateTenantSchema` is used add FileAdapter in protected fields
async function updateTenantSchema() {
  const tenantSchema = new Parse.Schema('partners_Tenant');
  const currentSchema = await tenantSchema.get();
  let clp = currentSchema.classLevelPermissions;
  // Public permission ("*")
  const role = '*';
  if (!clp.protectedFields || Object.keys(clp.protectedFields).length === 0) {
    // Initialize protectedFields if it doesn't exist
    clp.protectedFields = { [role]: [] };
  }
  // save FileAdapters field is in protectedFields if not exists
  if (!clp.protectedFields[role]?.includes('FileAdapters')) {
    clp.protectedFields[role].push('FileAdapters');
    // Update the class schema with the modified CLP
    tenantSchema.setCLP(clp);
    await tenantSchema.update();
  }
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
      const extUser = await getExtUser(request);
      if (extUser) {
        const _extUser = JSON.parse(JSON.stringify(extUser));
        const tenantId = extUser?.get('TenantId')?.id;
        // assign existing file adapters or empty array
        let fileAdapters = _extUser?.TenantId?.FileAdapters || [];
        const uniqueId = generateId(10);
        let id = extUser?.get('TenantId')?.id + '_' + uniqueId;
        const index = fileAdapters?.findIndex(x => x.fileAdapterName === fileAdapterName);
        if (index !== -1) {
          // If an object with the same fileAdapterName exists, update it
          if (bucketName || region || endpoint || baseUrl) {
            throw new Parse.Error(
              Parse.Error.INVALID_QUERY,
              'Cannot update bucketName, region, endpoint, baseUrl.'
            );
          } else {
            const adapterConfig = { accessKeyId: accessKeyId, secretAccessKey: secretAccessKey };
            fileAdapters[index] = { ...fileAdapters[index], ...adapterConfig };
            id = fileAdapters[index].id;
          }
        } else {
          if (bucketName && region && endpoint && baseUrl) {
            // If the object with the given fileAdapterName doesn't exist, add a new one
            fileAdapters.push({
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
        const updateTenant = await saveTenant(tenantId, fileAdapters, id);
        await updateTenantSchema();
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
      const extUser = await getExtUser(request);
      if (extUser) {
        const tenantId = extUser?.get('TenantId')?.id;
        const updateTenant = await saveTenant(tenantId);
        await updateTenantSchema();
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
