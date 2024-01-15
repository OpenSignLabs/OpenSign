import axios from 'axios';
export default async function createContact(request, response) {
  const serverUrl = process.env.SERVER_URL;
  const appId = process.env.APP_ID;
  const name = request.body.name;
  const phone = request.body.phone;
  const email = request.body.email;

  const reqToken = request.headers['x-api-token'];
  if (!reqToken) {
    return response.status(400).json({ error: 'Please Provide API Token' });
  }
  const tokenQuery = new Parse.Query('appToken');
  tokenQuery.equalTo('token', reqToken);
  const token = await tokenQuery.first({ useMasterKey: true });
  if (token !== undefined) {
    // Valid Token then proceed request
    const id = token.get('Id');
    const userId = { __type: 'Pointer', className: '_User', objectId: id };
    try {
      const Tenant = new Parse.Query('partners_Tenant');
      Tenant.equalTo('UserId', userId);
      const tenantRes = Tenant.first({ useMasterKey: true });

      const contactQuery = new Parse.Object('contracts_Contactbook');
      contactQuery.set('Name', name);
      contactQuery.set('Phone', phone);
      contactQuery.set('Email', email);
      contactQuery.set('UserRole', 'contracts_Guest');

      if (tenantRes) {
        contactQuery.set('TenantId', {
          __type: 'Pointer',
          className: 'partners_Tenant',
          objectId: tenantRes.id,
        });
      }
      try {
        const _users = Parse.Object.extend('User');
        const _user = new _users();
        _user.set('name', name);
        _user.set('username', email);
        _user.set('email', email);
        _user.set('phone', phone);
        _user.set('password', phone);

        const user = await _user.save();
        if (user) {
          const roleurl = `${serverUrl}/functions/AddUserToRole`;
          const headers = {
            'Content-Type': 'application/json',
            'X-Parse-Application-Id': appId,
            // sessionToken: localStorage.getItem('accesstoken'),
          };
          const body = {
            appName: 'contracts',
            roleName: 'contracts_Guest',
            userId: user.id,
          };
          await axios.post(roleurl, body, { headers: headers });
          const currentUser = Parse.User.current();
          contactQuery.set('CreatedBy', Parse.User.createWithoutData(currentUser.id));

          contactQuery.set('UserId', user);
          const acl = new Parse.ACL();
          acl.setReadAccess(currentUser.id, true);
          acl.setWriteAccess(currentUser.id, true);
          acl.setReadAccess(user.id, true);
          acl.setWriteAccess(user.id, true);

          contactQuery.setACL(acl);

          const contactRes = await contactQuery.save();
          // const parseData = JSON.parse(JSON.stringify(res));
          return response.json({
            message: 'Contact created sucessfully!',
            result: { objectId: contactRes.id },
          });
        }
      } catch (err) {
        console.log('err ', err);
        if (err.code === 202) {
          const params = { email: email };
          const userRes = await Parse.Cloud.run('getUserId', params);
          const roleurl = `${parseBaseUrl}functions/AddUserToRole`;
          const headers = {
            'Content-Type': 'application/json',
            'X-Parse-Application-Id': parseAppId,
            // sessionToken: localStorage.getItem('accesstoken'),
          };
          const body = {
            appName: 'contracts',
            roleName: 'contracts_Guest',
            userId: userRes.id,
          };
          await axios.post(roleurl, body, { headers: headers });
          const currentUser = Parse.User.current();
          contactQuery.set('CreatedBy', Parse.User.createWithoutData(currentUser.id));

          contactQuery.set('UserId', {
            __type: 'Pointer',
            className: '_User',
            objectId: userRes.id,
          });
          const acl = new Parse.ACL();
          acl.setReadAccess(currentUser.id, true);
          acl.setWriteAccess(currentUser.id, true);
          acl.setReadAccess(userRes.id, true);
          acl.setWriteAccess(userRes.id, true);

          contactQuery.setACL(acl);
          const contactRes = await contactQuery.save();
          if (contactRes) {
            const parseRes = JSON.parse(JSON.stringify(contactRes));
            return response.json({
              objectId: parseRes.objectId,
              Name: parseRes.Name,
              Email: parseRes.Email,
              Phone: parseRes.Phone,
              createdAt: parseRes.createdAt,
              updateAt: parseRes.updateAt,
            });
          }
          //   const parseData = JSON.parse(JSON.stringify(res));
        }
      }
    } catch (err) {
      return response.status(404).json({ error: 'Something went wrong, please try again later!' });
    }
  } else {
    return response.status(405).json({ error: 'Invalid API Token!' });
  }
}
