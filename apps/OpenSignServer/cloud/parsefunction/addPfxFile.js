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
  // save PfxFile field is in protectedFields if not exists
  if (!clp.protectedFields[role]?.includes('PfxFile')) {
    clp.protectedFields[role].push('PfxFile');
    // Update the class schema with the modified CLP
    tenantSchema.setCLP(clp);
    await tenantSchema.update();
  }
}

export default async function addPfxFile(request) {
  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  const pfxBase64 = request.params.pfxBase64;
  const title = request.params.title;
  const password = request.params.password;
  const provider = request.params.provider;
  if (provider === 'opensign' || (pfxBase64 && password)) {
    try {
      const extUserCls = new Parse.Query('contracts_Users');
      extUserCls.equalTo('UserId', request.user);
      extUserCls.include('TenantId');
      const extUser = await extUserCls.first({ useMasterKey: true });
      if (extUser) {
        const tenantCls = new Parse.Object('partners_Tenant');
        tenantCls.id = extUser?.get('TenantId')?.id;
        if (provider === 'opensign') {
          tenantCls.unset('PfxFile');
        } else {
          tenantCls.set('PfxFile', { title: title, password: password, base64: pfxBase64 });
        }
        const updateTenant = await tenantCls.save(null, { useMasterKey: true });
        await updateTenantSchema();
        return { updateAt: updateTenant.updatedAt };
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
