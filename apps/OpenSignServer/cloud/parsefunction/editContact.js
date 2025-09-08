export default async function editContact(request) {
  const { contactId, name, email, phone, tenantId } = request.params;
  const company = request.params?.company;
  const jobTitle = request.params?.jobTitle;
  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  const createdBy = { __type: 'Pointer', className: '_User', objectId: request.user.id };
  try {
    const contact = new Parse.Object('contracts_Contactbook');
    contact.id = contactId;
    contact.set('IsDeleted', true);
    const contactRes = await contact.save(null, {
      sessionToken: request?.user.getSessionToken(),
    });
    if (contactRes) {
      const query = new Parse.Query('contracts_Contactbook');
      query.equalTo('CreatedBy', createdBy);
      query.notEqualTo('IsDeleted', true);
      query.equalTo('Email', email?.toLowerCase()?.replace(/\s/g, ''));
      const isContactExist = await query.first({ useMasterKey: true });
      if (isContactExist) {
        throw new Parse.Error(Parse.Error.DUPLICATE_VALUE, 'Contact already exists.');
      }
      const contactQuery = new Parse.Object('contracts_Contactbook');
      contactQuery.set('Name', name);
      if (phone) {
        contactQuery.set('Phone', phone);
      }
      if (company) {
        contactQuery.set('Company', company);
      }
      if (jobTitle) {
        contactQuery.set('JobTitle', jobTitle);
      }
      contactQuery.set('Email', email?.toLowerCase()?.replace(/\s/g, ''));
      contactQuery.set('UserRole', 'contracts_Guest');
      contactQuery.set('IsDeleted', false);
      contactQuery.set('TenantId', {
        __type: 'Pointer',
        className: 'partners_Tenant',
        objectId: tenantId,
      });
      try {
        const _users = Parse.Object.extend('User');
        const _user = new _users();
        _user.set('name', name);
        _user.set('username', email?.toLowerCase()?.replace(/\s/g, ''));
        _user.set('email', email?.toLowerCase()?.replace(/\s/g, ''));
        _user.set('password', email?.toLowerCase()?.replace(/\s/g, ''));
        if (phone) {
          _user.set('phone', phone);
        }

        const user = await _user.save();
        if (user) {
          contactQuery.set('CreatedBy', createdBy);
          contactQuery.set('UserId', user);
          const acl = new Parse.ACL();
          acl.setReadAccess(user.id, true);
          acl.setWriteAccess(user.id, true);
          acl.setReadAccess(createdBy.objectId, true);
          acl.setWriteAccess(createdBy.objectId, true);
          contactQuery.setACL(acl);

          const res = await contactQuery.save(null, { useMasterKey: true });
          const parseData = JSON.parse(JSON.stringify(res));
          return parseData;
        }
      } catch (err) {
        console.log('err ', err);
        if (err.code === 202) {
          const params = { email: email };
          const userRes = await Parse.Cloud.run('getUserId', params);
          contactQuery.set('CreatedBy', createdBy);
          contactQuery.set('UserId', {
            __type: 'Pointer',
            className: '_User',
            objectId: userRes.id,
          });
          const acl = new Parse.ACL();
          acl.setReadAccess(userRes.id, true);
          acl.setWriteAccess(userRes.id, true);
          acl.setReadAccess(createdBy.objectId, true);
          acl.setWriteAccess(createdBy.objectId, true);
          contactQuery.setACL(acl);
          const res = await contactQuery.save(null, { useMasterKey: true });
          const parseData = JSON.parse(JSON.stringify(res));
          return parseData;
        }
      }
    } else {
      throw new Parse.Error(400, 'Something went wrong.');
    }
  } catch (err) {
    throw err;
  }
}
