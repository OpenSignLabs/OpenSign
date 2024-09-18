import { replaceMailVaribles } from '../../Utils.js';

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
      //update contact in placeholder, signers and update ACl in provide document
      const object = new Parse.Object('contracts_Document');
      object.set('Name', template?.Name);
      object.set('Description', template?.Description);
      object.set('Note', template?.Note);
      object.set('TimeToCompleteDays', template?.TimeToCompleteDays || 15);
      object.set('SendinOrder', template?.SendinOrder);
      object.set('AutomaticReminders', template?.AutomaticReminders || false);
      object.set('RemindOnceInEvery', template?.RemindOnceInEvery || 5);
      object.set('URL', template?.URL);
      object.set('CreatedBy', template?.CreatedBy);
      object.set('ExtUserPtr', template?.ExtUserPtr);
      object.set('OriginIp', template?.OriginIp || '');
      object.set('IsEnableOTP', template?.IsEnableOTP || false);
      let signers = template?.Signers || [];
      const signerobj = {
        __type: 'Pointer',
        className: 'contracts_Contactbook',
        objectId: existContact.id,
      };
      signers = [...signers.slice(0, index), signerobj, ...signers.slice(index)];
      object.set('Signers', signers);
      object.set('SignedUrl', template.URL || template.SignedUrl);
      const Placeholders = template?.Placeholders || [];
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
      object.set('SendMail', true);
      const resDoc = await object.save(null, { useMasterKey: true });
      return resDoc;
    }
  } catch (err) {
    console.log('err in create document from template', err);
  }
};

//`sendMailToAllSigners` is used to send email to all signers at a time if send-in-order false
const sendMailToAllSigners = async docId => {
  try {
    //get document details that recenlty created from public template
    const docQuery = new Parse.Query('contracts_Document');
    docQuery.include('ExtUserPtr');
    docQuery.include('Signers');
    const docRes = await docQuery.get(docId, { useMasterKey: true });
    const Doc = JSON.parse(JSON.stringify(docRes));
    const templateOwnerUserId = Doc?.CreatedBy?.objectId;
    const tenantCreditsQuery = new Parse.Query('partners_Tenant');
    tenantCreditsQuery.equalTo('UserId', {
      __type: 'Pointer',
      className: '_User',
      objectId: templateOwnerUserId,
    });
    const res = await tenantCreditsQuery.first();
    if (res) {
      const existUserId = Doc?.ExtUserPtr?.objectId;
      try {
        const getSubscriptionDetails = await Parse.Cloud.run('getsubscriptions', {
          extUserId: existUserId,
          ispublic: true,
        });
        if (getSubscriptionDetails) {
          const tenantRes = JSON.parse(JSON.stringify(res));
          const extUserDetails = Doc?.ExtUserPtr;
          const signerMail = Doc?.Signers;
          const requestBody = tenantRes?.RequestBody;
          const requestSubject = tenantRes?.RequestSubject;
          const subscription_json = JSON.parse(JSON.stringify(getSubscriptionDetails));
          const billingDate =
            subscription_json?.result?.Next_billing_date &&
            subscription_json?.result?.Next_billing_date?.iso;
          const isSubscribed = billingDate ? new Date(billingDate) > new Date() : false;
          for (let i = 0; i < signerMail.length; i++) {
            try {
              const senderEmail = Doc?.ExtUserPtr?.Email;
              const senderPhone = Doc?.ExtUserPtr?.Phone;
              const expireDate = Doc?.ExpiryDate?.iso || 15;
              const newDate = new Date(expireDate);
              const localExpireDate = newDate.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });
              const imgPng = 'https://qikinnovation.ams3.digitaloceanspaces.com/logo.png';
              const objectId = signerMail[i].objectId;
              const hostPublicUrl = 'https://app.opensignlabs.com';

              //encode this url value `${Doc.objectId}/${signerMail[i].Email}/${objectId}` to base64 using `btoa` function
              const encodeBase64 = btoa(`${Doc?.objectId}/${signerMail[i].Email}/${objectId}`);
              let signPdf = `${hostPublicUrl}/login/${encodeBase64}`;
              const openSignUrl = 'https://www.opensignlabs.com/';
              const orgName = Doc?.ExtUserPtr?.Company || '';
              const themeBGcolor = '#47a3ad';
              const senderName = `${Doc?.ExtUserPtr.Name}`;
              const documentName = `${Doc?.Name}`;
              let replaceVar;
              if (isSubscribed && requestBody && requestSubject) {
                const replacedRequestBody = requestBody.replace(/"/g, "'");
                htmlReqBody =
                  "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>" +
                  replacedRequestBody +
                  '</body> </html>';

                const variables = {
                  document_title: documentName,
                  sender_name: senderName,
                  sender_mail: senderEmail,
                  sender_phone: senderPhone || '',
                  receiver_name: signerMail[i].Name,
                  receiver_email: signerMail[i].Email,
                  receiver_phone: signerMail[i]?.Phone || '',
                  expiry_date: localExpireDate,
                  company_name: orgName,
                  signing_url: `<a href=${signPdf}>Sign here</a>`,
                };
                replaceVar = replaceMailVaribles(requestSubject, htmlReqBody, variables);
              }
              let params = {
                mailProvider: extUserDetails?.activeMailAdapter,
                extUserId: existUserId,
                recipient: signerMail[i].Email,
                subject:
                  replaceVar?.subject ||
                  `${senderName} has requested you to sign "${documentName}"`,
                from: senderEmail,
                html:
                  replaceVar?.body ||
                  "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /> </head>   <body> <div style='background-color: #f5f5f5; padding: 20px'=> <div   style=' box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;background: white;padding-bottom: 20px;'> <div style='padding:10px 10px 0 10px'><img src=" +
                    imgPng +
                    " height='50' style='padding: 20px,width:170px,height:40px' /></div>  <div  style=' padding: 2px;font-family: system-ui;background-color:" +
                    themeBGcolor +
                    ";'><p style='font-size: 20px;font-weight: 400;color: white;padding-left: 20px;' > Digital Signature Request</p></div><div><p style='padding: 20px;font-family: system-ui;font-size: 14px;   margin-bottom: 10px;'> " +
                    Doc?.ExtUserPtr.Name +
                    ' has requested you to review and sign <strong> ' +
                    Doc?.Name +
                    "</strong>.</p><div style='padding: 5px 0px 5px 25px;display: flex;flex-direction: row;justify-content: space-around;'><table> <tr> <td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Sender</td> <td> </td> <td  style='color:#626363;font-weight:bold'>" +
                    senderEmail +
                    "</td></tr><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Organization</td> <td> </td><td style='color:#626363;font-weight:bold'> " +
                    orgName +
                    "</td></tr> <tr> <td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Expire on</td><td> </td> <td style='color:#626363;font-weight:bold'>" +
                    localExpireDate +
                    "</td></tr><tr> <td></td> <td> </td></tr></table> </div> <div style='margin-left:70px'><a href=" +
                    signPdf +
                    "> <button style='padding: 12px 12px 12px 12px;background-color: #d46b0f;color: white;  border: 0px;box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;font-weight:bold;margin-top:30px'>Sign here</button></a> </div> <div style='display: flex; justify-content: center;margin-top: 10px;'> </div></div></div><div><p> This is an automated email from OpenSign™. For any queries regarding this email, please contact the sender " +
                    senderEmail +
                    ' directly.If you think this email is inappropriate or spam, you may file a complaint with OpenSign™   <a href= ' +
                    openSignUrl +
                    ' target=_blank>here</a>.</p> </div></div></body> </html>',
              };

              await Parse.Cloud.run('sendmailv3', params);
            } catch (error) {
              console.log('error', error);
            }
          }
        } else {
          throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
        }
      } catch (e) {
        console.log('error in get partners_Tenant class details', err);
      }
    }
  } catch (e) {
    console.log('error in sendMailToAllSigners function', err);
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
          const template_json = JSON.parse(JSON.stringify(tempRes));
          //update contact in placeholder, signers and update ACl in provide document
          const docRes = await createDocumentFromTemplate(template_json, existContact, index);
          if (docRes) {
            //condition will execute only if sendInOrder will be false for send email to all signers at a time.
            if (!template_json?.SendinOrder) {
              await sendMailToAllSigners(docRes.id);
            }
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
            const template_json = JSON.parse(JSON.stringify(tempRes));
            // if user present on platform create contact on the basis of extended user details
            const contactRes = await saveRoleContact(contact);
            const docRes = await createDocumentFromTemplate(template_json, contactRes, index);
            if (docRes) {
              //condition will execute only if sendInOrder will be false for send email to all signers at a time.
              if (!template_json?.SendinOrder) {
                await sendMailToAllSigners(docRes.id);
              }
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
                const template_json = JSON.parse(JSON.stringify(tempRes));
                // Create new contract on the basis provided contact details by user and userId from _User class
                const contactRes = await saveRoleContact(contact);
                //update contact in placeholder, signers and update ACl in provide document
                const docRes = await createDocumentFromTemplate(template_json, contactRes, index);
                if (docRes) {
                  //condition will execute only if sendInOrder will be false for send email to all signers at a time.
                  if (!template_json?.SendinOrder) {
                    await sendMailToAllSigners(docRes.id);
                  }
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
                const template_json = JSON.parse(JSON.stringify(tempRes));
                // Create new contract on the basis provided contact details by user and userId from _User class
                const contactRes = await saveRoleContact(contact);
                //update contact in placeholder, signers and update ACl in provide document
                const docRes = await createDocumentFromTemplate(template_json, contactRes, index);
                if (docRes) {
                  //condition will execute only if sendInOrder will be false for send email to all signers at a time.
                  if (!template_json?.SendinOrder) {
                    await sendMailToAllSigners(docRes.id);
                  }
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
