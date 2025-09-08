// `saveRoleContact` is used to save user in contracts_Guest role and create contact
const saveRoleContact = async contact => {
  const contactQuery = new Parse.Object('contracts_Contactbook');
  contactQuery.set('Name', contact.Name);
  contactQuery.set('Email', contact.Email);
  if (contact?.Phone) {
    contactQuery.set('Phone', contact.Phone);
  }
  if (contact?.JobTitle) {
    contactQuery.set('JobTitle', contact.JobTitle);
  }
  if (contact?.Company) {
    contactQuery.set('Company', contact.Company);
  }
  contactQuery.set('CreatedBy', contact.CreatedBy);
  contactQuery.set('UserId', contact.UserId);
  contactQuery.set('UserRole', 'contracts_Guest');
  if (contact?.TenantId) {
    contactQuery.set('TenantId', {
      __type: 'Pointer',
      className: 'partners_Tenant',
      objectId: contact.TenantId,
    });
  }
  contactQuery.set('IsDeleted', false);
  const acl = new Parse.ACL();
  acl.setReadAccess(contact.CreatedBy.objectId, true);
  acl.setWriteAccess(contact.CreatedBy.objectId, true);
  acl.setReadAccess(contact.UserId.objectId, true);
  acl.setWriteAccess(contact.UserId.objectId, true);
  contactQuery.setACL(acl);
  const contactRes = await contactQuery.save(null, { useMasterKey: true });
  if (contactRes) {
    return contactRes;
  }
};

// `linkContactToDoc` cloud function is used to create contact, add this contact in contracts_Guest role and
// save contact pointer in placeholder, signers and ACL of Document
export default async function linkContactToDoc(req) {
  const requestemail = req.params?.email;
  const email = requestemail?.toLowerCase()?.replace(/\s/g, '');
  const docId = req.params.docId;
  const name = req.params.name;
  const phone = req.params.phone;
  const jobTitle = req.params.jobTitle;
  const company = req.params.company;
  try {
    if (docId) {
      // Execute the query to get the document with the specified 'docId'
      const docQuery = new Parse.Query('contracts_Document');
      docQuery.include('ExtUserPtr,ExtUserPtr.TenantId');
      const docRes = await docQuery.get(docId, { useMasterKey: true });
      // Check if the document was found; if not, throw an error indicating the document was not found
      if (!docRes) {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Document not found.');
      }
      const _docRes = JSON.parse(JSON.stringify(docRes));
      const Placeholders = _docRes?.Placeholders || [];
      const index = Placeholders?.findIndex(x => x.email && x.email === email);
      if (index !== -1) {
        // `signerObjectId` holds the value of `signerObjId` from the `Placeholders` array at the current index.
        // This value is used to check if `signerObjId` is present or not.
        const signerObjectId = Placeholders[index]?.signerObjId;
        if (signerObjectId) {
          return { contactId: signerObjectId };
        }
        // Execute the query to check if a contact already exists in the 'contracts_Contactbook' class
        const contactCls = new Parse.Query('contracts_Contactbook');
        contactCls.equalTo('Email', email);
        contactCls.equalTo('CreatedBy', _docRes.CreatedBy);
        contactCls.notEqualTo('IsDeleted', true);
        const existContact = await contactCls.first({ useMasterKey: true });
        if (existContact) {
          //update contact in placeholder, signers and update ACl in provide document
          const updateDoc = new Parse.Object('contracts_Document');
          updateDoc.id = docId;
          const signers = _docRes?.Signers || [];
          const signerobj = {
            __type: 'Pointer',
            className: 'contracts_Contactbook',
            objectId: existContact.id,
          };
          // The splice method is used to add a signer at the desired index
          // index is the variable where the signer needs to be added
          // 0 indicates that no elements should be deleted
          // signerobj is the reference to the signer object
          signers.splice(index, 0, signerobj);
          updateDoc.set('Signers', signers);

          Placeholders[index] = {
            ...Placeholders[index],
            signerObjId: existContact.id,
            signerPtr: {
              __type: 'Pointer',
              className: 'contracts_Contactbook',
              objectId: existContact.id,
            },
          };
          updateDoc.set('Placeholders', Placeholders);
          const Acl = docRes.getACL();
          Acl.setReadAccess(existContact.get('UserId').id, true);
          Acl.setWriteAccess(existContact.get('UserId').id, true);
          updateDoc.setACL(Acl);
          //   const parseData = JSON.parse(JSON.stringify(res));
          const resDoc = await updateDoc.save(null, { useMasterKey: true });
          if (resDoc) {
            return { contactId: existContact.id };
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
              JobTitle: _extUser?.JobTitle || '',
              Company: _extUser?.Company || '',
              Phone: _extUser?.Phone ? _extUser.Phone : '',
              CreatedBy: _docRes.CreatedBy,
              TenantId: _docRes.ExtUserPtr?.TenantId?.objectId,
            };
            // if user present on platform create contact on the basis of extended user details
            const contactRes = await saveRoleContact(contact);
            //update contact in placeholder, signers and update ACl in provide document
            const updateDoc = new Parse.Object('contracts_Document');
            updateDoc.id = docId;
            const signers = _docRes?.Signers || [];
            const signerobj = {
              __type: 'Pointer',
              className: 'contracts_Contactbook',
              objectId: contactRes.id,
            };
            // The splice method is used to add a signer at the desired index
            // index is the variable where the signer needs to be added
            // 0 indicates that no elements should be deleted
            // signerobj is the reference to the signer object
            signers.splice(index, 0, signerobj);
            updateDoc.set('Signers', signers);

            Placeholders[index] = {
              ...Placeholders[index],
              signerObjId: contactRes.id,
              signerPtr: {
                __type: 'Pointer',
                className: 'contracts_Contactbook',
                objectId: contactRes.id,
              },
            };
            updateDoc.set('Placeholders', Placeholders);
            const Acl = docRes.getACL();
            Acl.setReadAccess(_extUser.UserId.objectId, true);
            Acl.setWriteAccess(_extUser.UserId.objectId, true);
            updateDoc.setACL(Acl);
            //   const parseData = JSON.parse(JSON.stringify(res));
            const resDoc = await updateDoc.save(null, { useMasterKey: true });
            if (resDoc) {
              return { contactId: contactRes.id };
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
                  JobTitle: jobTitle,
                  Company: company,
                  CreatedBy: _docRes.CreatedBy,
                  TenantId: _docRes.ExtUserPtr?.TenantId?.objectId,
                };
                // Create new contract on the basis provided contact details by user and userId from _User class
                const contactRes = await saveRoleContact(contact);
                //update contact in placeholder, signers and update ACl in provide document
                const updateDoc = new Parse.Object('contracts_Document');
                updateDoc.id = docId;
                const signers = _docRes?.Signers || [];
                const signerobj = {
                  __type: 'Pointer',
                  className: 'contracts_Contactbook',
                  objectId: contactRes.id,
                };
                // The splice method is used to add a signer at the desired index
                // index is the variable where the signer needs to be added
                // 0 indicates that no elements should be deleted
                // signerobj is the reference to the signer object
                signers.splice(index, 0, signerobj);
                updateDoc.set('Signers', signers);

                Placeholders[index] = {
                  ...Placeholders[index],
                  signerObjId: contactRes.id,
                  signerPtr: {
                    __type: 'Pointer',
                    className: 'contracts_Contactbook',
                    objectId: contactRes.id,
                  },
                };
                updateDoc.set('Placeholders', Placeholders);
                const Acl = docRes.getACL();
                Acl.setReadAccess(userRes.id, true);
                Acl.setWriteAccess(userRes.id, true);
                updateDoc.setACL(Acl);
                //   const parseData = JSON.parse(JSON.stringify(res));
                const resDoc = await updateDoc.save(null, { useMasterKey: true });
                if (resDoc) {
                  return { contactId: contactRes.id };
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
                  JobTitle: jobTitle,
                  Company: company,
                  CreatedBy: _docRes.CreatedBy,
                  TenantId: _docRes.ExtUserPtr?.TenantId?.objectId,
                };
                // Create new contract on the basis provided contact details by user and userId from _User class
                const contactRes = await saveRoleContact(contact);
                //update contact in placeholder, signers and update ACl in provide document
                const updateDoc = new Parse.Object('contracts_Document');
                updateDoc.id = docId;
                const signers = _docRes?.Signers || [];
                const signerobj = {
                  __type: 'Pointer',
                  className: 'contracts_Contactbook',
                  objectId: contactRes.id,
                };
                // The splice method is used to add a signer at the desired index
                // index is the variable where the signer needs to be added
                // 0 indicates that no elements should be deleted
                // signerobj is the reference to the signer object
                signers.splice(index, 0, signerobj);
                updateDoc.set('Signers', signers);
                Placeholders[index] = {
                  ...Placeholders[index],
                  signerObjId: contactRes.id,
                  signerPtr: {
                    __type: 'Pointer',
                    className: 'contracts_Contactbook',
                    objectId: contactRes.id,
                  },
                };
                updateDoc.set('Placeholders', Placeholders);
                const Acl = docRes.getACL();
                Acl.setReadAccess(newUserRes.id, true);
                Acl.setWriteAccess(newUserRes.id, true);
                updateDoc.setACL(Acl);
                //   const parseData = JSON.parse(JSON.stringify(res));
                const resDoc = await updateDoc.save(null, { useMasterKey: true });
                if (resDoc) {
                  return { contactId: contactRes.id };
                }
              }
            } catch (err) {
              console.log('Err while creating contact link to doc', err);
            }
          } else {
            throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
          }
        }
      } else {
        throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'unauthorized');
      }
    } else {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Document not found.');
    }
  } catch (err) {
    console.log('err in linkcontacttodoc', err);
    throw err;
  }
}
