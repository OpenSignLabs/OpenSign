export default async function createContact(request, response) {
  const name = request.body.name;
  const phone = request.body?.phone;
  const email = request.body.email;
  const reqToken = request.headers['x-api-token'];
  if (!reqToken) {
    return response.status(400).json({ error: 'Please Provide API Token' });
  }
  try {
    const tokenQuery = new Parse.Query('appToken');
    tokenQuery.equalTo('token', reqToken);
    tokenQuery.include('userId');
    const token = await tokenQuery.first({ useMasterKey: true });
    if (token !== undefined) {
      // Valid Token then proceed request
      const parseUser = JSON.parse(JSON.stringify(token));
      const userPtr = {
        __type: 'Pointer',
        className: '_User',
        objectId: parseUser.userId.objectId,
      };

      try {
        const contactbook = new Parse.Query('contracts_Contactbook');
        contactbook.equalTo('Email', email);
        contactbook.equalTo('CreatedBy', userPtr);
        contactbook.notEqualTo('IsDeleted', true);
        const userExists = await contactbook.first({ useMasterKey: true });

        if (userExists) {
          if (request.posthog) {
            request.posthog?.capture({
              distinctId: parseUser.userId.email,
              event: 'api_create_contact',
              properties: { response_code: 401 },
            });
          }
          // The try/catch block retrieves Contactbook info and updates the name.
          try {
            const contractsQuery = new Parse.Query('contracts_Contactbook');
            contractsQuery.equalTo('Email', email);
            const contractsArr = await contractsQuery.first({ useMasterKey: true });

            const contactQuery = new Parse.Object('contracts_Contactbook');
            contactQuery.id = contractsArr.id;
            contactQuery.set('Name', name);
            const contactRes = await contactQuery.save(null, { useMasterKey: true });
            const parseRes = JSON.parse(JSON.stringify(contactRes));
            console.log('\n----parseRes--------', parseRes);
          } catch (err) {
            console.log('err ', err);
          }

          return response
            .status(401)
            .json({ error: 'Contact already exists!', objectId: userExists.id });
        } else {
          try {
            const Tenant = new Parse.Query('partners_Tenant');
            Tenant.equalTo('UserId', userPtr);
            const tenantRes = await Tenant.first({ useMasterKey: true });

            const contactQuery = new Parse.Object('contracts_Contactbook');
            contactQuery.set('Name', name);
            if (phone) {
              contactQuery.set('Phone', phone);
            }
            contactQuery.set('Email', email);
            contactQuery.set('UserRole', 'contracts_Guest');
            if (tenantRes && tenantRes.id) {
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
              _user.set('password', email);
              if (phone) {
                _user.set('phone', phone);
              }

              const user = await _user.save();
              if (user) {
                const currentUser = userPtr;
                contactQuery.set('CreatedBy', currentUser);
                contactQuery.set('UserId', user);

                const acl = new Parse.ACL();
                acl.setReadAccess(userPtr.objectId, true);
                acl.setWriteAccess(userPtr.objectId, true);
                acl.setReadAccess(user.id, true);
                acl.setWriteAccess(user.id, true);
                contactQuery.setACL(acl);

                const contactRes = await contactQuery.save();
                const parseRes = JSON.parse(JSON.stringify(contactRes));
                if (request.posthog) {
                  request.posthog?.capture({
                    distinctId: parseUser.userId.email,
                    event: 'api_create_contact',
                    properties: { response_code: 200 },
                  });
                }
                return response.json({
                  objectId: parseRes.objectId,
                  name: parseRes.Name,
                  email: parseRes.Email,
                  phone: parseRes?.Phone || '',
                  createdAt: parseRes.createdAt,
                  updatedAt: parseRes.updatedAt,
                });
              }
            } catch (err) {
              console.log('err in', err);
              if (err.code === 202) {
                const params = { email: email };
                const userRes = await Parse.Cloud.run('getUserId', params);
                contactQuery.set('CreatedBy', userPtr);
                contactQuery.set('UserId', {
                  __type: 'Pointer',
                  className: '_User',
                  objectId: userRes.id,
                });
                const acl = new Parse.ACL();
                acl.setReadAccess(userPtr.objectId, true);
                acl.setWriteAccess(userPtr.objectId, true);
                acl.setReadAccess(userRes.id, true);
                acl.setWriteAccess(userRes.id, true);

                contactQuery.setACL(acl);
                const contactRes = await contactQuery.save();
                if (contactRes) {
                  const parseRes = JSON.parse(JSON.stringify(contactRes));
                  if (request.posthog) {
                    request.posthog?.capture({
                      distinctId: parseUser.userId.email,
                      event: 'api_create_contact',
                      properties: { response_code: 200 },
                    });
                  }
                  return response.json({
                    objectId: parseRes.objectId,
                    name: parseRes.Name,
                    email: parseRes.Email,
                    phone: parseRes?.Phone || '',
                    createdAt: parseRes.createdAt,
                    updatedAt: parseRes.updatedAt,
                  });
                }
              } else {
                if (err.code === 137) {
                  return response.status(401).json({ error: 'Contact already exists!' });
                }
                return response
                  .status(400)
                  .json({ error: 'Something went wrong, please try again later!' });
              }
            }
          } catch (err) {
            console.log('err ', err);
            if (err.code === 137) {
              if (request.posthog) {
                request.posthog?.capture({
                  distinctId: parseUser.userId.email,
                  event: 'api_create_contact',
                  properties: { response_code: 401 },
                });
              }
              return response.status(401).json({ error: 'Contact already exists!' });
            } else {
              if (request.posthog) {
                request.posthog?.capture({
                  distinctId: parseUser.userId.email,
                  event: 'api_create_contact',
                  properties: { response_code: 400 },
                });
              }
              return response
                .status(400)
                .json({ error: 'Something went wrong, please try again later!' });
            }
          }
        }
      } catch (err) {
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_create_contact',
            properties: { response_code: 400 },
          });
        }
        return response
          .status(400)
          .json({ error: 'Something went wrong, please try again later!' });
      }
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('Err ', err);
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}
