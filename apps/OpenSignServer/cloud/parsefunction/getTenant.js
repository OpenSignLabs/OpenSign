async function getTenantByUserId(userId, contactId) {
  try {
    if (contactId) {
      const contactquery = new Parse.Query('contracts_Contactbook');
      contactquery.equalTo('objectId', contactId);
      const contactuser = await contactquery.first({ useMasterKey: true });
      if (contactuser) {
        const tenantId = contactuser?.get('TenantId')?.id;
        if (tenantId) {
          const tenantCreditsQuery = new Parse.Query('partners_Tenant');
          tenantCreditsQuery.equalTo('objectId', tenantId);
          tenantCreditsQuery.exclude('FileAdapters,PfxFile,ContactNumber');
          const res = await tenantCreditsQuery.first({ useMasterKey: true });
          return res;
        } else {
          return {};
        }
      } else {
        return {};
      }
    } else {
      const query = new Parse.Query('contracts_Users');
      query.equalTo('UserId', {
        __type: 'Pointer',
        className: '_User',
        objectId: userId,
      });
      const extuser = await query.first({ useMasterKey: true });
      if (extuser) {
        const user = extuser?.get('CreatedBy')?.id || userId;
        const tenantCreditsQuery = new Parse.Query('partners_Tenant');
        tenantCreditsQuery.equalTo('UserId', {
          __type: 'Pointer',
          className: '_User',
          objectId: user,
        });
        tenantCreditsQuery.exclude('FileAdapters,PfxFile');
        const res = await tenantCreditsQuery.first({ useMasterKey: true });
        return res;
      } else {
        return {};
      }
    }
  } catch (err) {
    console.log('err in getTenant ', err);
    return 'user does not exist!';
  }
}
export default async function getTenant(request) {
  const userId = request.params.userId || '';
  const contactId = request.params.contactId || '';

  if (userId || contactId) {
    return await getTenantByUserId(userId, contactId);
  } else {
    return {};
  }
}
