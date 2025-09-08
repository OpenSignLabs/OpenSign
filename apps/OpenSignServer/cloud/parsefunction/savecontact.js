export default async function savecontact(request) {
  const name = request.params.name;
  const phone = request.params.phone;
  const requestemail = request.params?.email;
  const email = requestemail?.toLowerCase()?.replace(/\s/g, '');
  const tenantId = request.params.tenantId;
  const company = request.params?.company;
  const jobTitle = request.params?.jobTitle;

  if (request.user) {
    const currentUser = request?.user;
    const currentUserPtr = { __type: 'Pointer', className: '_User', objectId: currentUser?.id };
    const query = new Parse.Query('contracts_Contactbook');
    query.equalTo('CreatedBy', currentUserPtr);
    query.notEqualTo('IsDeleted', true);
    query.equalTo('Email', email);
    const res = await query.first({ sessionToken: request.user.getSessionToken() });
    if (!res) {
      const contactQuery = new Parse.Object('contracts_Contactbook');
      contactQuery.set('Name', name);
      contactQuery.set('Email', email);
      contactQuery.set('UserRole', 'contracts_Guest');
      contactQuery.set('IsDeleted', false);
      if (phone) {
        contactQuery.set('Phone', phone);
      }
      if (company) {
        contactQuery.set('Company', company);
      }
      if (jobTitle) {
        contactQuery.set('JobTitle', jobTitle);
      }
      if (tenantId) {
        contactQuery.set('TenantId', {
          __type: 'Pointer',
          className: 'partners_Tenant',
          objectId: tenantId,
        });
      }
      try {
        const _users = Parse.Object.extend('User');
        const _user = new _users();
        _user.set('name', name);
        _user.set('username', email);
        _user.set('email', email);
        _user.set('password', email);
        if (phone) {
          _user.set('phone', phone);
        }
        const user = await _user.save();
        if (user) {
          contactQuery.set('CreatedBy', currentUserPtr);
          contactQuery.set('UserId', user);
          const acl = new Parse.ACL();
          acl.setReadAccess(user.id, true);
          acl.setWriteAccess(user.id, true);
          acl.setReadAccess(currentUser.id, true);
          acl.setWriteAccess(currentUser.id, true);
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
          contactQuery.set('CreatedBy', currentUserPtr);
          contactQuery.set('UserId', {
            __type: 'Pointer',
            className: '_User',
            objectId: userRes.id,
          });
          const acl = new Parse.ACL();
          acl.setReadAccess(userRes.id, true);
          acl.setWriteAccess(userRes.id, true);
          acl.setReadAccess(currentUser.id, true);
          acl.setWriteAccess(currentUser.id, true);
          contactQuery.setACL(acl);
          const res = await contactQuery.save(null, { useMasterKey: true });
          const parseData = JSON.parse(JSON.stringify(res));
          return parseData;
        }
      }
    } else {
      throw new Parse.Error(Parse.Error.DUPLICATE_VALUE, 'Contact already exists.');
    }
  }
}
