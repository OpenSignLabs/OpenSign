export default async function updateTenant(request) {
  const { tenantId, details } = request.params;

  if (!tenantId || !details) {
    throw new Parse.Error(400, 'Missing tenantId or details.');
  }

  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'unauthorized');
  }
  const validKeys = ['CompletionBody', 'CompletionSubject', 'RequestBody', 'RequestSubject'];
  try {
    const tenant = new Parse.Object('partners_Tenant');
    tenant.id = tenantId;
    // Update tenant details
    Object.keys(details).forEach(key => {
      if (validKeys.includes(key)) {
        if (details?.[key] !== undefined) {
          tenant.set(key, details?.[key]);
        } else {
          tenant.unset(key);
        }
      }
    });

    const tenantRes = await tenant.save(null, { useMasterKey: true });
    if (tenantRes) {
      const res = JSON.parse(JSON.stringify(tenantRes));
      return res;
    }
  } catch (error) {
    throw error;
  }
}
