import axios from 'axios';
import {
  color,
  customAPIurl,
  replaceMailVaribles,
  saveFileUsage,
  formatWidgetOptions,
  sanitizeFileName,
  cloudServerUrl,
  transporter,
  azureOptions,
  insertDocumentHistoryRecord,
  getTimestampInTimezone,
  sendSMS,
} from '../../../../Utils.js';
import { EmailClient, KnownEmailSendStatus } from '@azure/communication-email';
import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from '@azure/storage-blob';
import { STRINGS } from '../../../../constants/strings.js';
import geoip from 'geoip-lite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const connectionString = process.env.AZURE_EMAIL_CONNECTION_STRING;
const client = new EmailClient(connectionString);

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

async function getAzureFileUrl(filename, expiresInSeconds) {
  const { baseUrl, container, accountName, accessKey } = azureOptions;

  // Create a client for the Blob service
  const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accessKey);
  const blobServiceClient = new BlobServiceClient(`${baseUrl}`, sharedKeyCredential);

  // Get container and blob clients
  const containerClient = blobServiceClient.getContainerClient(container);
  const blobClient = containerClient.getBlobClient(filename);

  // Set the expiry time for the URL
  const expiresOn = new Date(new Date().valueOf() + expiresInSeconds * 1000); // Expires in `expiresInSeconds`

  // Define the permissions for the SAS token
  const permissions = BlobSASPermissions.parse('r'); // Read-only access

  // Generate SAS token
  const sasToken = generateBlobSASQueryParameters(
    {
      containerName: container,
      blobName: filename,
      permissions: permissions,
      expiresOn: expiresOn, // Expiry time
    },
    sharedKeyCredential
  ).toString();

  // Generate the full URL with SAS token
  const urlWithSAS = `${blobClient.url}?${sasToken}`;

  return urlWithSAS;
}

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
  const isSignerOneInOffice = request.body.isSignerOneInOffice || false;
  const isSignerTwoInOffice = request.body.isSignerTwoInOffice || false;
  const policyNumber = request.body.policyNumber;
  const docUniqueId = request.body.docUniqueId;
  const signerOneOTPRequired = request.body.signerOneOTPRequired;
  const signerTwoOTPRequired = request.body.signerTwoOTPRequired;
  const openSignAuthToken = request.body.opensignAuthToken;
  const TimeToCompleteDays = request.body.timeToCompleteDays || 15;
  const IsEnableOTP = request.body?.enableOTP === true ? true : false;
  const redirectURL = request.body?.redirectURL;
  // console.log('fileData ', fileData);
  const protocol = customAPIurl();
  const baseUrl = new URL(process.env.PUBLIC_URL);
  const reqToken = request.headers['x-api-token'];
  const ip = request.headers['x-real-ip'];
  const clientIp =
    request.headers['x-forwarded-for']?.split(',')[0] || request.socket.remoteAddress;
  console.log('\n----ip,clientIp--OpenSign---', ip, clientIp);
  const geo = geoip.lookup(
    process.env.NODE_ENV === STRINGS.ENVIRONMENT.DEVELOPMENT ? process.env.TEST_IP : ip
  );
  console.log('\n----geo-----', geo);
  // console.log('\n----getTimestampInTimezone------',getTimestampInTimezone(geo.timezone));
  // console.log('\n----new Date().toISOString()------',new Date().toISOString());
  // return;
  console.log('TZ Environment Variable OpenSign:', process.env.TZ);
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
      console.log('\n---resSub----', resSub);
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
              const file = new Parse.File(filename, { base64: base64File }, 'application/pdf');
              await file.save({ useMasterKey: true });
              fileUrl = file.url();
              // const str = file.url();
              // const getFileName = str.substring(str.lastIndexOf('/') + 1);
              // fileUrl = await getAzureFileUrl(getFileName, 3600);
              const buffer = Buffer.from(base64File, 'base64');
              saveFileUsage(buffer.length, fileUrl, parseUser.userId.objectId);
            }
            const contractsUser = new Parse.Query('contracts_Users');
            contractsUser.equalTo('UserId', userPtr);
            const extUser = await contractsUser.first({ useMasterKey: true });
            const parseExtUser = JSON.parse(JSON.stringify(extUser));

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
            object.set('OriginIp', ip);
            object.set('PolicyNumber', policyNumber);
            object.set('DocUniqueId', docUniqueId);
            object.set('Signer1OTPRequired', signerOneOTPRequired);
            object.set('Signer2OTPRequired', signerTwoOTPRequired);
            object.set('Signer1ContactNo', signers[0]?.phone?.length ? signers[0].phone : null);
            object.set('Signer2ContactNo', signers[1]?.phone?.length ? signers[1].phone : null);
            object.set('OpenSignAuthToken', openSignAuthToken);
            object.set('RedirectURL', redirectURL);
            object.set('IsSignerOneInOffice', isSignerOneInOffice);
            object.set('IsSignerTwoInOffice', isSignerTwoInOffice);
            if (TimeToCompleteDays) {
              object.set('TimeToCompleteDays', TimeToCompleteDays);
            }
            object.set('IsEnableOTP', IsEnableOTP);
            object.set('IsSendMail', send_email);
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
              object.set(
                'AdditionalUserInfo',
                contact.map(({ role, email, phone, contactPtr }) => ({
                  signerObjId: contactPtr?.objectId,
                  role,
                  email,
                  phone,
                }))
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
              if (isSignerOneInOffice || isSignerTwoInOffice) {
                // Create a shallow copy of the contact array
                contactMail = [...contact];
                // Remove insured and/or agent contact if they are in the office
                if (isSignerOneInOffice) {
                  contactMail.shift(); // Removes the first element
                }
                if (isSignerTwoInOffice) {
                  contactMail.splice(isSignerOneInOffice ? 0 : 1, 1); // Removes the appropriate element
                }
              }
              for (let i = 0; i < contactMail.length; i++) {
                try {
                  const imgPng = '../../../../../logo.png';
                  // const imagePath = path.join(__dirname, 'images', imgPng);
                  // Read the image file
                  // const imageBuffer = fs.readFileSync(imagePath);
                  // Convert the image to Base64
                  // const base64Image = imageBuffer.toString('base64');

                  let url = `${cloudServerUrl}/functions/sendmailv3/`;
                  const headers = {
                    'Content-Type': 'application/json',
                    'X-Parse-Application-Id': process.env.APP_ID,
                    'X-Parse-Master-Key': process.env.MASTER_KEY,
                  };

                  const objectId = contactMail[i].contactPtr.objectId;
                  const hostUrl = baseUrl.origin;
                  //encode this url value `${response.id}/${contactMail[i].email}/${objectId}` to base64 using `btoa` function
                  const encodeBase64 = btoa(
                    `${res.id}/${contactMail[i].email}/${objectId}/${contactMail[i].phone}`
                  );
                  let signPdf = `${hostUrl}/login/${encodeBase64}`;
                  const openSignUrl = 'https://www.opensignlabs.com/contact-us';
                  const orgName = parseExtUser.Company ? parseExtUser.Company : '';
                  const themeBGcolor = '#47a3ad';
                  const isInsured = contactMail[i].role == STRINGS.USER_ROLE.INSURED;
                  const email_html = `
                          <html>
                            <head>
                              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                            </head>
                            <body style="background-color:#f5f5f5; padding:20px; font-family:system-ui, sans-serif;">
                              <div style="max-width:600px; margin:auto; background:white; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                                
                                <div style="padding: 0px; text-align: center;">
                                  <img src="${imgPng}" alt="OpenSign Logo" style="width: 170px; max-width: 100%; height: auto; max-height: 120px; object-fit: contain; display: block; margin: 0 auto;" />
                                </div>

                                <div style="background-color:${themeBGcolor}; color:white; padding:10px 20px;">
                                  <p style="font-size:20px; font-weight:400; margin:0;">Digital Signature Request</p>
                                </div>

                                <div style="padding:20px; font-size:14px; color:#333;">
                                  <p><strong>${
                                    parseExtUser.Name
                                  }</strong> has requested you to review and sign <strong>${name}</strong>.
                                  </p>
                                  ${
                                    !isInsured
                                      ? '<p style="background-color:#fff8e1; padding:10px; border-left:4px solid #ffc107; font-weight:bold; margin:15px 0;">The insured must complete their signature first, after which you can go ahead and sign.</p>'
                                      : ''
                                  }
                                  
                                  <table style="margin:15px 0;">
                                    <tr>
                                      <td style="font-weight:bold;">Sender:</td>
                                      <td style="padding-left:10px;">${sender}</td>
                                    </tr>
                                    <tr>
                                      <td style="font-weight:bold;">Organization:</td>
                                      <td style="padding-left:10px;">${orgName}</td>
                                    </tr>
                                    <tr>
                                      <td style="font-weight:bold;">Expires on:</td>
                                      <td style="padding-left:10px;">${localExpireDate}</td>
                                    </tr>
                                  </table>

                                  <div style="text-align:center; margin-top:30px;">
                                    <a href="${signPdf}">
                                      <button style="padding:12px 24px; background-color:#d46b0f; color:white; border:none; font-weight:bold; cursor:pointer;">
                                        Sign here
                                      </button>
                                    </a>
                                  </div>
                                </div>
                              </div>

                              <p style="max-width:600px; margin:auto; margin-top:20px; font-size:12px; color:#555;">
                                This is an automated email from OpenSign. For queries, contact <strong>${sender}</strong>.
                                If you think this email is inappropriate or spam, you may report it 
                                <a href="${openSignUrl}" target="_blank">here</a>.
                              </p>
                            </body>
                          </html>`;

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

                  // await axios.post(url, params, { headers: headers });
                  const mailOptions = {
                    from: sender, // Sender address
                    to: contactMail[i].email, // List of recipients
                    subject: subject, // Subject line
                    text: 'Document Sign', // Plain text body
                    html: html, // HTML body
                  };
                  const emailMessage = {
                    senderAddress: process.env.AZURE_EMAIL_SENDER,
                    content: {
                      subject: subject,
                      plainText: 'Document e-Sign',
                      html: html,
                    },
                    recipients: {
                      to: [{ address: contactMail[i].email }],
                    },
                  };
                  const createdAtTimestamp = getTimestampInTimezone(geo.timezone);
                  if (contactMail[i].remoteSigningType) {
                    const poller = await client.beginSend(emailMessage);
                    const emailResponse = await poller.pollUntilDone();
                    console.log('\n-----emailResponse------', emailResponse);
                    if (emailResponse.status === KnownEmailSendStatus.Succeeded) {
                      console.log(
                        `Invite email sent successfully to ${emailMessage.recipients.to[0].address} at ${createdAtTimestamp}`
                      );
                      await insertDocumentHistoryRecord(
                        docUniqueId,
                        STRINGS.STATUS.EMAILSENT,
                        STRINGS.EMAIL.SENT.replace(
                          '$subject',
                          `${parseExtUser.Name} has requested you to sign -${name}`
                        )
                          .replace('$recipient', contactMail[i].email)
                          .replace('$ipAddress', ip),
                        request,
                        ip,
                        openSignAuthToken,
                        createdAtTimestamp
                      );
                    } else {
                      console.error(`Failed to send email: ${emailResponse.error}`);
                      await insertDocumentHistoryRecord(
                        docUniqueId,
                        STRINGS.STATUS.EMAILNOTSENT,
                        `Email intended for '${contactMail[i].email}' failed with reason '${emailResponse.error}'`,
                        request,
                        ip,
                        openSignAuthToken,
                        createdAtTimestamp
                      );
                    }
                  } else {
                    const smsSentRes = await sendSMS(
                      contactMail[i].phone,
                      STRINGS.SIGNING_SMS_MSG.replace('$url', signPdf)
                    );
                    if (smsSentRes) {
                      await insertDocumentHistoryRecord(
                        docUniqueId,
                        STRINGS.STATUS.SMS_LINK_SENT,
                        STRINGS.SIGNING_SMS_LINK.SENT.replace('$recipient', contactMail[i].phone),
                        request,
                        ip,
                        openSignAuthToken,
                        createdAtTimestamp
                      );
                    } else {
                      await insertDocumentHistoryRecord(
                        docUniqueId,
                        STRINGS.STATUS.EMAILNOTSENT,
                        STRINGS.SIGNING_SMS_LINK.NOT_SENT.replace(
                          '$recipient',
                          contactMail[i].phone
                        ),
                        request,
                        ip,
                        openSignAuthToken,
                        createdAtTimestamp
                      );
                    }
                  }
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
            console.log('resSubcription ', resSubcription);
            return response.json({
              objectId: res.id,
              docName: name,
              orgName: parseExtUser.Company ? parseExtUser.Company : '',
              docExpireDate: localExpireDate,
              senderEmail: sender,
              signurl: contact.map(x => ({
                email: x.email,
                role: x.role,
                url: `${baseUrl.origin}/login/${btoa(
                  `${res.id}/${x.email}/${x.contactPtr.objectId}/${x.phone}`
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
