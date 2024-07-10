// `saveRoleContact` is used to save user in contracts_Guest role and create contact
const saveRoleContact = async contact => {
  try {
    const Role = new Parse.Query(Parse.Role);
    const guestRole = await Role.equalTo('name', 'contracts_Guest').first();
    if (guestRole) {
      // Check if the user is already in the role
      const relation = guestRole.relation('users');
      const usersInRoleQuery = relation.query();
      usersInRoleQuery.equalTo('objectId', contact.UserId.objectId);
      const usersInRole = await usersInRoleQuery.find();
      if (usersInRole.length > 0) {
        console.log('User already added to Guest role.');
      } else {
        relation.add({ __type: 'Pointer', className: '_User', id: contact.UserId.objectId });
        await guestRole.save(null, { useMasterKey: true });
        // console.log('User added to Guest role successfully.');
      }
    }
  } catch (err) {
    console.log('err in role save', err);
  }
  const contactQuery = new Parse.Object('contracts_Contactbook');
  contactQuery.set('Name', contact.Name);
  contactQuery.set('Email', contact.Email);
  if (contact?.Phone) {
    contactQuery.set('Phone', contact.Phone);
  }
  contactQuery.set('CreatedBy', contact.CreatedBy);
  contactQuery.set('UserId', contact.UserId);
  contactQuery.set('UserRole', 'contracts_Guest');
  contactQuery.set('TenantId', contact.TenantId);
  contactQuery.set('IsDeleted', false);
  const acl = new Parse.ACL();
  acl.setReadAccess(contact.CreatedBy.objectId, true);
  acl.setWriteAccess(contact.CreatedBy.objectId, true);
  acl.setReadAccess(contact.UserId.objectId, true);
  acl.setWriteAccess(contact.UserId.objectId, true);
  contactQuery.setACL(acl);
  const contactRes = await contactQuery.save();
  if (contactRes) {
    return contactRes;
  }
};

// `createDocumentFromTemplate` is used to create document from template
const createDocumentFromTemplate = async (template, existContact, index) => {
  try {
    if (template) {
      const Doc = JSON.parse(JSON.stringify(template));
      //update contact in placeholder, signers and update ACl in provide document
      const object = new Parse.Object('contracts_Document');
      object.set('Name', Doc?.Name);
      object.set('Description', Doc?.Description);
      object.set('Note', Doc?.Note);
      object.set('TimeToCompleteDays', Doc.TimeToCompleteDays || 15);
      object.set('SendinOrder', Doc?.SendinOrder);
      object.set('AutomaticReminders', Doc.AutomaticReminders);
      object.set('RemindOnceInEvery', Doc?.RemindOnceInEvery);
      object.set('URL', Doc?.URL);
      object.set('CreatedBy', Doc?.CreatedBy);
      object.set('ExtUserPtr', Doc?.ExtUserPtr);
      let signers = Doc?.Signers || [];
      const signerobj = {
        __type: 'Pointer',
        className: 'contracts_Contactbook',
        objectId: existContact.id,
      };
      signers = [...signers.slice(0, index), signerobj, ...signers.slice(index)];
      object.set('Signers', signers);
      object.set('SignedUrl', Doc.URL || Doc.SignedUrl);
      const Placeholders = Doc?.Placeholders || [];
      Placeholders[index] = {
        ...Placeholders[index],
        signerObjId: existContact.id,
        signerPtr: {
          __type: 'Pointer',
          className: 'contracts_Contactbook',
          objectId: existContact.id,
        },
      };
      object.set('Placeholders', Placeholders);
      const resDoc = await object.save(null, { useMasterKey: true });
      return resDoc;
    }
  } catch (err) {
    console.log('err in create document from template', err);
  }
};

// `PublicUserLinkContactToDoc` cloud function is used to create contact, add this contact in contracts_Guest role and
// create new document from template and save contact pointer in placeholder, signers and ACL of Document
export default async function PublicUserLinkContactToDoc(req) {
  const email = req.params.email;
  const templateid = req.params.templateid;
  const name = req.params.name;
  const phone = req.params.phone;
  const role = req.params.role;
  try {
    if (templateid) {
      // Execute the query to get the template with the specified 'templateid'
      const docQuery = new Parse.Query('contracts_Template');
      docQuery.include('ExtUserPtr');
      const tempRes = await docQuery.get(templateid, { useMasterKey: true });
      // Check if the template was found; if not, throw an error indicating the template was not found
      if (!tempRes) {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Template not found.');
      }
      const _tempRes = JSON.parse(JSON.stringify(tempRes));
      const Placeholders = _tempRes?.Placeholders || [];
      let index;
      if (role) {
        index = Placeholders?.findIndex(x => x.Role && x.Role === role);
      } else {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, '');
      }
      if (index !== -1) {
        // Execute the query to check if a contact already exists in the 'contracts_Contactbook' class
        const contactCls = new Parse.Query('contracts_Contactbook');
        contactCls.equalTo('Email', email);
        contactCls.equalTo('CreatedBy', _tempRes.CreatedBy);
        contactCls.notEqualTo('IsDeleted', true);
        const existContact = await contactCls.first({ useMasterKey: true });
        if (existContact) {
          //update contact in placeholder, signers and update ACl in provide document
          const docRes = await createDocumentFromTemplate(tempRes, existContact, index);
          if (docRes) {
            return { contactId: existContact.id, docId: docRes.id };
          }
        } else {
          // Execute the query to check if a user already exists in the 'contracts_Users' class
          const extUserQuery = new Parse.Query('contracts_Users');
          extUserQuery.equalTo('Email', email);
          const extUser = await extUserQuery.first({ useMasterKey: true });
          if (extUser) {
            const _extUser = JSON.parse(JSON.stringify(extUser));
            const contact = {
              UserId: _extUser.UserId,
              Name: _extUser.Name,
              Email: email,
              Phone: _extUser?.Phone ? _extUser.Phone : '',
              CreatedBy: _tempRes.CreatedBy,
              TenantId: _tempRes.ExtUserPtr.TenantId,
            };
            // if user present on platform create contact on the basis of extended user details
            const contactRes = await saveRoleContact(contact);
            const docRes = await createDocumentFromTemplate(tempRes, contactRes, index);
            if (docRes) {
              return { contactId: contactRes.id, docId: docRes.id };
            }
          } else if (name) {
            try {
              // Execute the query to check if a user already exists in the '_User' class
              const userQuery = new Parse.Query(Parse.User);
              userQuery.equalTo('email', email);
              const userRes = await userQuery.first({ useMasterKey: true });
              if (userRes) {
                const contact = {
                  UserId: { __type: 'Pointer', className: '_User', objectId: userRes.id },
                  Name: name,
                  Email: email,
                  Phone: phone,
                  CreatedBy: _tempRes.CreatedBy,
                  TenantId: _tempRes.ExtUserPtr.TenantId,
                };
                // Create new contract on the basis provided contact details by user and userId from _User class
                const contactRes = await saveRoleContact(contact);
                //update contact in placeholder, signers and update ACl in provide document
                const docRes = await createDocumentFromTemplate(tempRes, contactRes, index);
                if (docRes) {
                  return { contactId: contactRes.id, docId: docRes.id };
                }
              } else {
                // create new user in _User class on the basis of details provide by user
                const _users = Parse.Object.extend('User');
                const _user = new _users();
                _user.set('name', name);
                _user.set('username', email);
                _user.set('email', email);
                _user.set('password', email);
                if (phone) {
                  _user.set('phone', phone);
                }
                const newUserRes = await _user.save();
                const contact = {
                  UserId: { __type: 'Pointer', className: '_User', objectId: newUserRes.id },
                  Name: name,
                  Email: email,
                  Phone: phone,
                  CreatedBy: _tempRes.CreatedBy,
                  TenantId: _tempRes.ExtUserPtr.TenantId,
                };
                // Create new contract on the basis provided contact details by user and userId from _User class
                const contactRes = await saveRoleContact(contact);
                //update contact in placeholder, signers and update ACl in provide document
                const docRes = await createDocumentFromTemplate(tempRes, contactRes, index);
                if (docRes) {
                  return { contactId: contactRes.id, docId: docRes.id };
                }
              }
            } catch (err) {
              console.log('Err', err);
            }
          } else {
            throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
          }
        }
      } else {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Please provide required parameters!');
      }
    } else {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Template not found.');
    }
  } catch (err) {
    console.log('err in publicuserlinkcontacttodoc', err);
    throw err;
  }
}
