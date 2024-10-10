import axios from 'axios';
import { cloudServerUrl, customAPIurl, replaceMailVaribles } from '../../../../Utils.js';

// `sendDoctoWebhook` is used to send res data of document on webhook
async function sendDoctoWebhook(doc, WebhookUrl, userId) {
  if (WebhookUrl) {
    const params = { event: 'created', ...doc };
    await axios
      .post(WebhookUrl, params, { headers: { 'Content-Type': 'application/json' } })
      .then(res => {
        try {
          // console.log('res ', res);
          const webhook = new Parse.Object('contracts_Webhook');
          webhook.set('Log', res?.status);
          webhook.set('UserId', {
            __type: 'Pointer',
            className: '_User',
            objectId: userId,
          });
          webhook.save(null, { useMasterKey: true });
        } catch (err) {
          console.log('err save in contracts_Webhook', err);
        }
      })
      .catch(err => {
        console.log('Err send data to webhook', err);
        try {
          const webhook = new Parse.Object('contracts_Webhook');
          webhook.set('Log', err?.status);
          webhook.set('UserId', {
            __type: 'Pointer',
            className: '_User',
            objectId: userId,
          });
          webhook.save(null, { useMasterKey: true });
        } catch (err) {
          console.log('err save in contracts_Webhook', err);
        }
      });
    // console.log('res ', res.data);
  }
}
export default async function createDocumentWithTemplate(request, response) {
  const signers = request.body.signers;
  const folderId = request.body.folderId;
  const templateId = request.params.template_id;
  const protocol = customAPIurl();
  const baseUrl = new URL(process.env.PUBLIC_URL);
  const send_email = request.body.send_email;
  const email_subject = request.body.email_subject;
  const email_body = request.body.email_body;
  const sendInOrder = request.body.sendInOrder || false;
  const TimeToCompleteDays = request.body.timeToCompleteDays || 15;

  try {
    const reqToken = request.headers['x-api-token'];
    if (!reqToken) {
      return response.status(400).json({ error: 'Please Provide API Token' });
    }

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
      const extUsers = new Parse.Query('contracts_Users');
      extUsers.equalTo('UserId', userPtr);
      const extUser = await extUsers.first({ useMasterKey: true });

      const subscription = new Parse.Query('contracts_Subscriptions');
      subscription.equalTo('TenantId', {
        __type: 'Pointer',
        className: 'partners_Tenant',
        objectId: extUser.get('TenantId').id,
      });
      subscription.include('ExtUserPtr');
      subscription.greaterThanOrEqualTo('Next_billing_date', new Date());
      const resSub = await subscription.first({ useMasterKey: true });
      if (resSub) {
        const _resSub = JSON.parse(JSON.stringify(resSub));
        const allowedCredits = _resSub?.AllowedCredits || 0;
        const addonCredits = _resSub?.AddonCredits || 0;
        const totalcredits = allowedCredits + addonCredits;
        if (totalcredits > 0) {
          const templateQuery = new Parse.Query('contracts_Template');
          templateQuery.include('ExtUserPtr');
          templateQuery.include('ExtUserPtr.TenantId');
          const templateRes = await templateQuery.get(templateId, { useMasterKey: true });
          if (templateRes) {
            const template = JSON.parse(JSON.stringify(templateRes));
            if (template?.Placeholders?.length > 0) {
              const emptyplaceholder = template?.Placeholders.filter(x => !x.signerObjId);
              const isValid =
                signers.length >= emptyplaceholder.length &&
                signers.length <= template?.Placeholders?.length;
              const placeholder =
                signers.length > emptyplaceholder.length ? template.Placeholders : emptyplaceholder;
              const updateSigners = placeholder.every(y => signers?.some(x => x.role === y.Role));
              // console.log('isValid ', isValid);
              if (isValid && updateSigners) {
                //Check if every item's placeholders contain at least one placeholder with type 'signature'.
                let isSignature = template?.Placeholders?.every(item =>
                  item?.placeHolder.some(x => x?.pos.some(data => data?.type === 'signature'))
                );
                if (!isSignature) {
                  return response
                    .status(400)
                    .json({ error: 'Please add at least one signature widget for all signers' });
                }
                const folderPtr = {
                  __type: 'Pointer',
                  className: 'contracts_Document',
                  objectId: folderId,
                };
                const object = new Parse.Object('contracts_Document');
                object.set('Name', template.Name);
                if (template?.Note) {
                  object.set('Note', template.Note);
                }
                if (template?.Description) {
                  object.set('Description', template.Description);
                }
                object.set('IsSendMail', send_email);
                if (sendInOrder) {
                  object.set('SendinOrder', sendInOrder);
                } else if (template?.SendinOrder && template?.SendinOrder) {
                  object.set('SendinOrder', template?.SendinOrder);
                }
                let templateSigner = template?.Signers ? template?.Signers : [];
                let contact = [];
                if (signers && signers.length > 0) {
                  let parseSigners = [...signers];
                  let createContactUrl = protocol + '/v1/createcontact';

                  for (const obj of parseSigners) {
                    const body = {
                      name: obj?.name || '',
                      email: obj?.email || '',
                      phone: obj?.phone || '',
                    };
                    try {
                      const res = await axios.post(createContactUrl, body, {
                        headers: { 'Content-Type': 'application/json', 'x-api-token': reqToken },
                      });
                      const contactPtr = {
                        __type: 'Pointer',
                        className: 'contracts_Contactbook',
                        objectId: res.data?.objectId,
                      };
                      const newObj = { ...obj, contactPtr: contactPtr };
                      contact.push(newObj);
                    } catch (err) {
                      // console.log('err ', err);
                      if (err?.response?.data?.objectId) {
                        const contactPtr = {
                          __type: 'Pointer',
                          className: 'contracts_Contactbook',
                          objectId: err.response.data?.objectId,
                        };
                        const newObj = { ...obj, contactPtr: contactPtr };
                        contact.push(newObj);
                      } else {
                        console.log('err ', err);
                      }
                    }
                  }
                  const contactPtrs = contact.map(x => x.contactPtr);
                  object.set('Signers', [...templateSigner, ...contactPtrs]);

                  let updatedPlaceholder = template?.Placeholders?.map(x => {
                    let matchingSigner = contact.find(y => x.Role && x.Role === y.role);

                    if (matchingSigner) {
                      return {
                        ...x,
                        signerObjId: matchingSigner?.contactPtr?.objectId,
                        signerPtr: matchingSigner?.contactPtr,
                      };
                    } else {
                      return { ...x };
                    }
                  });
                  object.set('Placeholders', updatedPlaceholder);
                } else {
                  object.set('Signers', templateSigner);
                }
                object.set('URL', template.URL);
                object.set('SignedUrl', template.URL);
                object.set('SentToOthers', true);
                if (TimeToCompleteDays) {
                  object.set('TimeToCompleteDays', TimeToCompleteDays);
                }
                const enableOTP = request.body?.enableOTP;
                const IsEnableOTP =
                  enableOTP !== undefined ? enableOTP : template?.IsEnableOTP || false;
                const enableTour = request.body?.enableTour;
                const isTourEnabled =
                  enableTour !== undefined ? enableTour : template?.IsTourEnabled || false;
                object.set('IsTourEnabled', isTourEnabled);
                object.set('IsEnableOTP', IsEnableOTP);
                object.set('CreatedBy', template.CreatedBy);
                object.set('ExtUserPtr', {
                  __type: 'Pointer',
                  className: 'contracts_Users',
                  objectId: template.ExtUserPtr.objectId,
                });
                if (folderId) {
                  object.set('Folder', folderPtr);
                }
                if (template?.FileAdapterId) {
                  object.set('FileAdapterId', template?.FileAdapterId);
                }
                const newACL = new Parse.ACL();
                newACL.setPublicReadAccess(false);
                newACL.setPublicWriteAccess(false);
                newACL.setReadAccess(userPtr.objectId, true);
                newACL.setWriteAccess(userPtr.objectId, true);
                object.setACL(newACL);
                const res = await object.save(null, { useMasterKey: true });

                const newDate = new Date();
                newDate.setDate(newDate.getDate() + 15);
                const localExpireDate = newDate.toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                });
                let sender = template.ExtUserPtr.Email;
                let sendMail;
                if (send_email === false) {
                  console.log("don't send mail");
                } else {
                  let contactMail = contact;
                  if (sendInOrder) {
                    contactMail = contact.slice();
                    contactMail.splice(1);
                  }
                  for (let i = 0; i < contactMail.length; i++) {
                    try {
                      const imgPng = 'https://qikinnovation.ams3.digitaloceanspaces.com/logo.png';
                      let url = `${cloudServerUrl}/functions/sendmailv3/`;
                      const headers = {
                        'Content-Type': 'application/json',
                        'X-Parse-Application-Id': process.env.APP_ID,
                        'X-Parse-Master-Key': process.env.MASTER_KEY,
                      };

                      const objectId = contactMail[i].contactPtr.objectId;
                      const hostUrl = baseUrl.origin;
                      //encode this url value `${res.id}/${contactMail[i].email}/${objectId}` to base64 using `btoa` function
                      const encodeBase64 = btoa(`${res.id}/${contactMail[i].email}/${objectId}`);
                      let signPdf = `${hostUrl}/login/${encodeBase64}`;
                      const openSignUrl = 'https://www.opensignlabs.com/contact-us';
                      const orgName = template.ExtUserPtr.Company
                        ? template.ExtUserPtr.Company
                        : '';
                      const themeBGcolor = '#47a3ad';
                      const email_html =
                        "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /> </head>   <body> <div style='background-color: #f5f5f5; padding: 20px'> <div style='box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;background: white;padding-bottom: 20px;'> <div style='padding:10px 10px 0 10px'><img src='" +
                        imgPng +
                        "' height='50' style='padding:20px; width:170px; height:40px;' /></div><div style='padding: 2px;font-family: system-ui;background-color:" +
                        themeBGcolor +
                        ";'><p style='font-size: 20px;font-weight: 400;color: white;padding-left: 20px;' > Digital Signature Request</p></div><div><p style='padding: 20px;font-family: system-ui;font-size: 14px; margin-bottom: 10px;'> " +
                        template.ExtUserPtr.Name +
                        ' has requested you to review and sign <strong> ' +
                        template.Name +
                        "</strong>.</p><div style='padding: 5px 0px 5px 25px;display: flex;flex-direction: row;justify-content: space-around;'><table> <tr> <td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Sender</td> <td> </td> <td  style='color:#626363;font-weight:bold'>" +
                        sender +
                        "</td></tr><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Organization</td> <td> </td><td style='color:#626363;font-weight:bold'> " +
                        orgName +
                        "</td></tr> <tr> <td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Expires on</td><td> </td> <td style='color:#626363;font-weight:bold'>" +
                        localExpireDate +
                        "</td></tr><tr> <td></td> <td> </td></tr></table> </div> <div style='margin-left:70px'><a target=_blank href=" +
                        signPdf +
                        "> <button style='padding: 12px 12px 12px 12px;background-color: #d46b0f;color: white;  border: 0px;box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;font-weight:bold;margin-top:30px;'>Sign here</button></a> </div> <div style='display: flex; justify-content: center;margin-top: 10px;'> </div></div></div><div><p> This is an automated email from OpenSign™. For any queries regarding this email, please contact the sender " +
                        sender +
                        ' directly.If you think this email is inappropriate or spam, you may file a complaint with OpenSign™   <a href=' +
                        openSignUrl +
                        ' target=_blank>here</a>.</p> </div></div></body> </html>';

                      let replaceVar;
                      const variables = {
                        document_title: template.Name,
                        sender_name: template.ExtUserPtr.Name,
                        sender_mail: template.ExtUserPtr.Email,
                        sender_phone: template.ExtUserPtr?.Phone || '',
                        receiver_name: contactMail[i].name,
                        receiver_email: contactMail[i].email,
                        receiver_phone: contactMail[i]?.phone || '',
                        expiry_date: localExpireDate,
                        company_name: orgName,
                        signing_url: signPdf,
                      };
                      if (email_subject && email_body) {
                        replaceVar = replaceMailVaribles(email_subject, email_body, variables);
                      } else if (email_subject) {
                        replaceVar = replaceMailVaribles(email_subject, '', variables);
                        replaceVar = { subject: replaceVar.subject, body: email_html };
                      } else if (email_body) {
                        replaceVar = replaceMailVaribles(
                          `${template.ExtUserPtr.Name} has requested you to sign "${template.Name}"`,
                          email_body,
                          variables
                        );
                      } else {
                        replaceVar = {
                          subject: `${template.ExtUserPtr.Name} has requested you to sign "${template.Name}"`,
                          body: email_html,
                        };
                      }

                      const subject = replaceVar.subject;
                      const html = replaceVar.body;
                      let params = {
                        recipient: contactMail[i].email,
                        subject: subject,
                        from: sender,
                        html: html,
                        extUserId: template.ExtUserPtr.objectId,
                        mailProvider: template?.ExtUserPtr?.active_mail_adapter || '',
                      };
                      sendMail = await axios.post(url, params, { headers: headers });
                    } catch (error) {
                      console.log('error', error);
                    }
                  }
                }
                // if (sendMail.data.result.status === 'success') {
                try {
                  const doc = {
                    objectId: res.id,
                    file: template?.URL,
                    name: template?.Name,
                    note: template?.Note || '',
                    description: template?.Description || '',
                    signers: contact?.map(x => ({
                      name: x.name,
                      email: x.email,
                      phone: x?.phone || '',
                    })),
                    createdAt: res.createdAt,
                  };
                  if (template.ExtUserPtr && template.ExtUserPtr?.Webhook) {
                    sendDoctoWebhook(doc, template.ExtUserPtr?.Webhook, userPtr?.objectId);
                  }
                } catch (err) {
                  console.log('Err', err);
                }
                if (request.posthog) {
                  request.posthog?.capture({
                    distinctId: parseUser.userId.email,
                    event: 'api_create_document_with_templateid',
                    properties: { response_code: 200 },
                  });
                }

                const subscriptionCls = new Parse.Object('contracts_Subscriptions');
                subscriptionCls.id = resSub.id;
                if (allowedCredits > 0) {
                  const updateAllowedcredits = allowedCredits - 1 || 0;
                  subscriptionCls.set('AllowedCredits', updateAllowedcredits);
                } else {
                  const updateAddonCredits = addonCredits > 0 ? addonCredits - 1 : 0;
                  subscriptionCls.set('AddonCredits', updateAddonCredits);
                }
                const resSubcription = await subscriptionCls.save(null, { useMasterKey: true });
                // console.log("resSubcription ", resSubcription)
                return response.json({
                  objectId: res.id,
                  signurl: contact.map(x => ({
                    email: x.email,
                    url: `${baseUrl.origin}/login/${btoa(
                      `${res.id}/${x.email}/${x.contactPtr.objectId}`
                    )}`,
                  })),
                  message: 'Document sent successfully!',
                });
              } else {
                if (request.posthog) {
                  request.posthog?.capture({
                    distinctId: parseUser.userId.email,
                    event: 'api_create_document_with_templateid',
                    properties: { response_code: 400 },
                  });
                }
                return response.status(400).json({ error: 'Please provide signers properly!' });
              }
            } else {
              if (request.posthog) {
                request.posthog?.capture({
                  distinctId: parseUser.userId.email,
                  event: 'api_create_document_with_templateid',
                  properties: { response_code: 400 },
                });
              }
              return response.status(400).json({ error: 'Please setup template properly!' });
            }
          } else {
            if (request.posthog) {
              request.posthog?.capture({
                distinctId: parseUser.userId.email,
                event: 'api_create_document_with_templateid',
                properties: { response_code: 404 },
              });
            }
            return response.status(404).json({ error: 'Invalid template id!' });
          }
        } else {
          return response
            .status(429)
            .json({ error: 'Quota reached, Please buy credits and try again later.' });
        }
      } else {
        return response.status(400).json({
          error: 'Please purchase or renew your subscription.',
        });
      }
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    if (err.code === 101) {
      return response.status(404).json({ error: 'Invalid template id!' });
    }
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}
