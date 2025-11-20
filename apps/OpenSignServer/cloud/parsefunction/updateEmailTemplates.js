export default async function updateEmailTemplates(request) {
  const { tenantId, details } = request.params;

  if (!tenantId || !details) {
    throw new Parse.Error(400, 'Missing tenantId or details.');
  }

  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'unauthorized');
  }

  try {
    const extUser = new Parse.Query('contracts_Users');
    extUser.equalTo('UserId', { __type: 'Pointer', className: '_User', objectId: request.user.id });
    extUser.include('TenantId');
    const extUserRes = await extUser.first({ useMasterKey: true });
    const mailKeys = ['CompletionBody', 'CompletionSubject', 'RequestBody', 'RequestSubject'];
    Object.keys(details).forEach(key => {
      if (mailKeys.includes(key)) {
        if (details?.[key]) {
          extUserRes.set(key, details?.[key]);
        } else {
          extUserRes.unset(key);
        }
      }
    });
    const updateExtRes = await extUserRes.save(null, { useMasterKey: true });
    if (updateExtRes) {
      const res = JSON.parse(JSON.stringify(updateExtRes));
      return res;
    }
  } catch (error) {
    console.log('error while updating email templates:', error);
    throw error;
  }
}
