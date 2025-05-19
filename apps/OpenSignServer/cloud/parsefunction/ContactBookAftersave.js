async function ContactbookAftersave(request) {
  /* In beforesave or aftersave if you want to check if an object is being inserted or updated 
    you can check as follows */
  if (!request.original) {
    const user = request.user;
    const object = request.object;
    if (object.get('UserId')) {
      // Retrieve the current ACL
      const acl = new Parse.ACL();
      // Ensure the current user has read access
      if (acl && request?.user) {
        const object = request.object;
        acl.setReadAccess(user, true);
        acl.setWriteAccess(user, true);
        acl.setReadAccess(object.get('UserId'), true);
        acl.setWriteAccess(object.get('UserId'), true);

        object.setACL(acl);
        object.set('IsDeleted', false);
        // Continue saving the object
        return object.save(null, { useMasterKey: true });
      }
    } else {
      const Name = object.get('Name');
      const Email = object.get('Email');
      const Phone = object.get('Phone');
      try {
        const _users = Parse.Object.extend('User');
        const _user = new _users();
        _user.set('name', Name);
        _user.set('username', Email);
        _user.set('email', Email);
        _user.set('password', Email);
        if (Email) {
          _user.set('phone', Phone);
        }
        const user = await _user.save();
        if (user) {
          object.set('UserId', user);
          const acl = object.getACL() || new Parse.ACL();
          acl.setReadAccess(user.id, true);
          acl.setWriteAccess(user.id, true);
          object.setACL(acl);
          await object.save(null, { useMasterKey: true });
          // console.log('res update new user with contac', res);
        }
      } catch (err) {
        // console.log('err ', err);
        if (err.code === 202) {
          const userQuery = new Parse.Query(Parse.User);
          userQuery.equalTo('email', Email);
          const userRes = await userQuery.first({ useMasterKey: true });
          object.set('UserId', {
            __type: 'Pointer',
            className: '_User',
            objectId: userRes.id,
          });
          const acl = object.getACL() || new Parse.ACL();
          acl.setReadAccess(userRes.id, true);
          acl.setWriteAccess(userRes.id, true);
          object.setACL(acl);
          await object.save(null, { useMasterKey: true });
          // console.log('res update existing user with contact', res);
        }
      }
    }
  } else {
    console.log('Object being update');
  }
}
export default ContactbookAftersave;
