import axios from 'axios';
import {
  color,
  customAPIurl,
  replaceMailVaribles,
  saveFileUsage,
  formatWidgetOptions,
  sanitizeFileName,
  cloudServerUrl,
} from '../../../../Utils.js';
import uploadFileToS3 from '../../../parsefunction/uploadFiletoS3.js';

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
        console.log('Err send data to webhook', err?.message);
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
          console.log('err save in contracts_Webhook', err?.message);
        }
      });
    // console.log('res ', res.data);
  }
}
const randomId = () => Math.floor(1000 + Math.random() * 9000);
export default async function createDocumentwithCoordinate(request, response) {
  const name = request.body.title;
  const note = request.body.note;
  const description = request.body.description;
  const send_email = request.body.send_email;
  const signers = request.body.signers;
  const folderId = request.body.folderId;
  const base64File = request.body.file;
  const fileData = request.files?.[0] ? request.files[0].buffer : null;
  const email_subject = request.body.email_subject;
  const email_body = request.body.email_body;
  const sendInOrder = request.body.sendInOrder || false;
  const TimeToCompleteDays = request.body.timeToCompleteDays || 15;
  const IsEnableOTP = request.body?.enableOTP === true ? true : false;
  const isTourEnabled = request.body?.enableTour || false;
  // console.log('fileData ', fileData);
  const protocol = customAPIurl();
  const baseUrl = new URL(process.env.PUBLIC_URL);
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
      const extUsers = new Parse.Query('contracts_Users');
      extUsers.equalTo('UserId', userPtr);
      extUsers.include('TenantId');
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
          if (signers && signers.length > 0) {
            // Check if at least one signature exists among all items in the signers array
            let isSignExist = signers.every(item =>
              item.widgets.some(data => data?.type === 'signature')
            );
            if (!isSignExist) {
              return response
                .status(400)
                .json({ error: 'Please add at least one signature widget for all signers' });
            }
            const parseExtUser = JSON.parse(JSON.stringify(extUser));
            let fileUrl;
            if (request.files?.[0]) {
              const base64 = fileData?.toString('base64');
              const file = new Parse.File(request.files?.[0]?.originalname, {
                base64: base64,
              });
              await file.save({ useMasterKey: true });
              fileUrl = file.url();
              const buffer = Buffer.from(base64, 'base64');
              saveFileUsage(buffer.length, fileUrl, parseUser.userId.objectId);
            } else {
              const filename = sanitizeFileName(`${name}.pdf`);
              let adapter = {};
              const ActiveFileAdapter = parseExtUser?.TenantId?.ActiveFileAdapter || '';
              if (ActiveFileAdapter) {
                adapter =
                  parseExtUser?.TenantId?.FileAdapters?.find(x => (x.id = ActiveFileAdapter)) || {};
              }
              if (adapter?.id) {
                const filedata = Buffer.from(base64File, 'base64');
                // `uploadFileToS3` is used to save document in user's file storage
                fileUrl = await uploadFileToS3(filedata, filename, 'application/pdf', adapter);
              } else {
                const file = new Parse.File(filename, { base64: base64File }, 'application/pdf');
                await file.save({ useMasterKey: true });
                fileUrl = file.url();
              }
              const buffer = Buffer.from(base64File, 'base64');
              saveFileUsage(buffer.length, fileUrl, parseUser.userId.objectId);
            }
            const extUserPtr = {
              __type: 'Pointer',
              className: 'contracts_Users',
              objectId: extUser.id,
            };
            const object = new Parse.Object('contracts_Document');
            object.set('Name', name);

            if (note) {
              object.set('Note', note);
            }
            if (description) {
              object.set('Description', description);
            }
            if (sendInOrder) {
              object.set('SendinOrder', sendInOrder);
            }
            object.set('URL', fileUrl);
            object.set('SignedUrl', fileUrl);
            object.set('SentToOthers', true);
            object.set('CreatedBy', userPtr);
            object.set('ExtUserPtr', extUserPtr);
            if (TimeToCompleteDays) {
              object.set('TimeToCompleteDays', TimeToCompleteDays);
            }
            object.set('IsEnableOTP', IsEnableOTP);
            object.set('IsTourEnabled', isTourEnabled);
            object.set('IsSendMail', send_email);
            if (parseExtUser?.TenantId?.ActiveFileAdapter) {
              object.set('FileAdapterId', parseExtUser?.TenantId?.ActiveFileAdapter);
            }
            let contact = [];
            if (signers && signers.length > 0) {
              let parseSigners;
              if (base64File) {
                parseSigners = signers;
              } else {
                parseSigners = JSON.parse(signers);
              }
              let createContactUrl = protocol + '/v1/createcontact';

              for (const [index, element] of parseSigners.entries()) {
                const body = {
                  name: element?.name || '',
                  email: element?.email || '',
                  phone: element?.phone || '',
                };
                try {
                  const res = await axios.post(createContactUrl, body, {
                    headers: { 'Content-Type': 'application/json', 'x-api-token': reqToken },
                  });
                  // console.log('res ', res.data);
                  const contactPtr = {
                    __type: 'Pointer',
                    className: 'contracts_Contactbook',
                    objectId: res.data?.objectId,
                  };
                  const newObj = { ...element, contactPtr: contactPtr, index: index };
                  contact.push(newObj);
                } catch (err) {
                  // console.log('err ', err.response);
                  if (err?.response?.data?.objectId) {
                    const contactPtr = {
                      __type: 'Pointer',
                      className: 'contracts_Contactbook',
                      objectId: err.response.data?.objectId,
                    };
                    const newObj = { ...element, contactPtr: contactPtr, index: index };
                    contact.push(newObj);
                  }
                }
              }
              object.set(
                'Signers',
                contact?.map(x => x.contactPtr)
              );
              let updatePlaceholders = contact.map(signer => {
                const placeHolder = [];

                for (const widget of signer.widgets) {
                  const pageNumber = widget.page;
                  const options = formatWidgetOptions(widget.type, widget.options);
                  const page = placeHolder.find(page => page.pageNumber === pageNumber);
                  const widgetData = {
                    isStamp: widget.type === 'stamp' || widget.type === 'image',
                    key: randomId(),
                    isDrag: false,
                    scale: 1,
                    isMobile: false,
                    zIndex: 1,
                    type: widget.type === 'textbox' ? 'text input' : widget.type,
                    options: options,
                    Width: widget.w,
                    Height: widget.h,
                    xPosition: widget.x,
                    yPosition: widget.y,
                  };

                  if (page) {
                    page.pos.push(widgetData);
                  } else {
                    placeHolder.push({ pageNumber, pos: [widgetData] });
                  }
                }

                return {
                  signerObjId: signer?.contactPtr?.objectId,
                  signerPtr: signer?.contactPtr,
                  Role: signer.role,
                  Id: randomId(),
                  blockColor: color[signer?.index],
                  placeHolder,
                };
              });
              object.set('Placeholders', updatePlaceholders);
            }
            if (folderId) {
              object.set('Folder', {
                __type: 'Pointer',
                className: 'contracts_Document',
                objectId: folderId,
              });
            }
            const newACL = new Parse.ACL();
            newACL.setPublicReadAccess(false);
            newACL.setPublicWriteAccess(false);
            newACL.setReadAccess(userPtr.objectId, true);
            newACL.setWriteAccess(userPtr.objectId, true);
            object.setACL(newACL);
            const res = await object.save(null, { useMasterKey: true });
            const doc = {
              objectId: res.id,
              file: fileUrl,
              name: name,
              note: note || '',
              description: description || '',
              signers: contact?.map(x => ({ name: x.name, email: x.email, phone: x?.phone || '' })),
              createdAt: res.createdAt,
            };
            if (parseExtUser && parseExtUser.Webhook) {
              sendDoctoWebhook(doc, parseExtUser?.Webhook, userPtr?.objectId);
            }
            const newDate = new Date();
            newDate.setDate(newDate.getDate() + 15);
            const localExpireDate = newDate.toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
            let sender = parseExtUser.Email;
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
                  //encode this url value `${response.id}/${contactMail[i].email}/${objectId}` to base64 using `btoa` function
                  const encodeBase64 = btoa(`${res.id}/${contactMail[i].email}/${objectId}`);
                  let signPdf = `${hostUrl}/login/${encodeBase64}`;
                  const openSignUrl = 'https://www.opensignlabs.com/contact-us';
                  const orgName = parseExtUser.Company ? parseExtUser.Company : '';
                  const themeBGcolor = '#47a3ad';
                  const email_html =
                    "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /> </head>   <body> <div style='background-color: #f5f5f5; padding: 20px'> <div style=' box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;background: white;padding-bottom: 20px;'> <div style='padding:10px 10px 0 10px'><img src=" +
                    imgPng +
                    " height='50' style='padding:20px; width:170px; height:40px;' /></div>  <div  style='padding:2px; font-family: system-ui;background-color:" +
                    themeBGcolor +
                    ";'><p style='font-size: 20px;font-weight: 400;color: white;padding-left: 20px;' > Digital Signature Request</p></div><div><p style='padding: 20px;font-family: system-ui;font-size: 14px; margin-bottom: 10px;'> " +
                    parseExtUser.Name +
                    ' has requested you to review and sign <strong> ' +
                    name +
                    "</strong>.</p><div style='padding: 5px 0px 5px 25px;display: flex;flex-direction: row;justify-content: space-around;'><table> <tr> <td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Sender</td> <td> </td> <td  style='color:#626363;font-weight:bold'>" +
                    sender +
                    "</td></tr><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Organization</td> <td> </td><td style='color:#626363;font-weight:bold'> " +
                    orgName +
                    "</td></tr> <tr> <td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Expires on</td><td> </td> <td style='color:#626363;font-weight:bold'>" +
                    localExpireDate +
                    "</td></tr><tr> <td></td> <td> </td></tr></table> </div> <div style='margin-left:70px'><a target=_blank href=" +
                    signPdf +
                    "> <button style='padding: 12px 12px 12px 12px;background-color: #d46b0f;color: white;  border: 0px;box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;font-weight:bold;margin-top:30px'>Sign here</button></a> </div> <div style='display: flex; justify-content: center;margin-top: 10px;'> </div></div></div><div><p> This is an automated email from OpenSign™. For any queries regarding this email, please contact the sender " +
                    sender +
                    ' directly.If you think this email is inappropriate or spam, you may file a complaint with OpenSign™   <a href=' +
                    openSignUrl +
                    ' target=_blank>here</a>.</p> </div></div></body> </html>';
                  let replaceVar;
                  const variables = {
                    document_title: name,
                    sender_name: parseExtUser.Name,
                    sender_mail: parseExtUser.Email,
                    sender_phone: parseExtUser?.Phone || '',
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
                      `${parseExtUser.Name} has requested you to sign "${name}"`,
                      email_body,
                      variables
                    );
                  } else {
                    replaceVar = {
                      subject: `${parseExtUser.Name} has requested you to sign "${name}"`,
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
                    extUserId: extUser.id,
                    mailProvider: parseExtUser?.active_mail_adapter || '',
                  };

                  await axios.post(url, params, { headers: headers });
                } catch (error) {
                  console.log('error', error);
                }
              }
            }
            // if (sendMail.data.result.status === 'success') {
            if (request.posthog) {
              request.posthog?.capture({
                distinctId: parseUser.userId.email,
                event: 'api_create_document',
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
            // console.log('resSubcription ', resSubcription);
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
                event: 'api_create_document',
                properties: { response_code: 400 },
              });
            }
            return response.status(400).json({ error: 'Please provide signers!' });
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
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}
