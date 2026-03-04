import axios from 'axios';
import { cloudServerUrl, mailTemplate, replaceMailVaribles, serverAppId } from '../../Utils.js';
import { setDocumentCount } from '../../utils/CountUtils.js';

import crypto from 'crypto';

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function mapWithConcurrency(items, concurrency, fn) {
  const results = new Array(items.length);
  let idx = 0;

  async function worker() {
    while (true) {
      const current = idx++;
      if (current >= items.length) return;
      results[current] = await fn(items[current], current);
    }
  }

  const workers = [];
  for (let i = 0; i < Math.min(concurrency, items.length); i++) {
    workers.push(worker());
  }
  await Promise.all(workers);
  return results;
}

function toBase64(str) {
  return Buffer.from(str, 'utf8').toString('base64');
}

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
}

const serverUrl = cloudServerUrl; //process.env.SERVER_URL;
const appId = serverAppId;

async function sendOwnerSummaryEmail({
  ownerEmail,
  ownerName,
  total,
  created,
  failed,
  failedList,
}) {
  try {
    const url = `${serverUrl}/functions/sendmailv3`;
    const headers = { 'Content-Type': 'application/json', 'X-Parse-Application-Id': appId };

    const subject = `Bulk send finished: ${failed} of ${total} failed to create`;

    const failureHtml = failedList?.length
      ? `<ul>${failedList
          .slice(0, 50)
          .map(f => `<li>#${f.index + 1}: ${String(f.error).slice(0, 200)}</li>`)
          .join('')}</ul>
         ${failedList.length > 50 ? `<p>…and ${failedList.length - 50} more.</p>` : ''}`
      : `<p>No failures.</p>`;

    const html = `
      <p>Hi ${ownerName || ''},</p>
      <p>Your bulk send processing is complete.</p>
      <p><b>Total requested:</b> ${total}<br/>
         <b>Created:</b> ${created}<br/>
         <b>Failed to create:</b> ${failed}</p>
      <h4>Failure details</h4>
      ${failureHtml}
    `;

    const params = {
      // keep provider selection consistent with your system; if you can’t decide, omit it.
      isbulksend: true,
      recipient: ownerEmail,
      subject,
      from: ownerEmail, // or use a tenant/from address if required by your provider
      replyto: ownerEmail,
      html,
    };

    await axios.post(url, params, { headers });
  } catch (e) {
    console.log('batchdoc Failed to send owner summary email:', e?.message || e);
  }
}

async function deductcount(docsCount, extUserId) {
  try {
    if (extUserId) {
      setDocumentCount(extUserId);
    }
  } catch (err) {
    console.log('batchdoc deductcount error: ', err);
  }
}
async function sendMail(document, publicUrl) {
  const baseUrl = new URL(publicUrl);
  const timeToCompleteDays = document?.TimeToCompleteDays || 15;
  const ExpireDate = new Date(document.createdAt);
  ExpireDate.setDate(ExpireDate.getDate() + timeToCompleteDays);
  const newDate = ExpireDate;
  const localExpireDate = newDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  let signerMail = document.Placeholders?.filter(x => x?.Role !== 'prefill');
  const senderName = document.ExtUserPtr.Name;
  const senderEmail = document.ExtUserPtr.Email;

  if (document.SendinOrder) {
    signerMail = signerMail.slice();
    signerMail.splice(1);
  }
  for (let i = 0; i < signerMail.length; i++) {
    try {
      let url = `${serverUrl}/functions/sendmailv3`;
      const headers = { 'Content-Type': 'application/json', 'X-Parse-Application-Id': appId };
      const objectId = signerMail[i]?.signerObjId;
      const hostUrl = baseUrl.origin;
      let encodeBase64;
      let existSigner = {};
      if (objectId) {
        existSigner = document?.Signers?.find(user => user.objectId === objectId);
        encodeBase64 = toBase64(`${document.objectId}/${existSigner?.Email}/${objectId}`);
      } else {
        encodeBase64 = toBase64(`${document.objectId}/${signerMail[i].email}`);
      }
      let signPdf = `${hostUrl}/login/${encodeBase64}`;
      const orgName = document.ExtUserPtr.Company ? document.ExtUserPtr.Company : '';
      const senderObj = document?.ExtUserPtr;
      let mailBody = senderObj?.TenantId?.RequestBody || '';
      let mailSubject = senderObj?.TenantId?.RequestSubject || '';
      let replaceVar;
      if (mailBody && mailSubject) {
        const replacedRequestBody = mailBody.replace(/"/g, "'");
        const htmlReqBody =
          "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>" +
          replacedRequestBody +
          '</body></html>';
        const variables = {
          document_title: document?.Name,
          note: document?.Note || '',
          sender_name: senderName,
          sender_mail: senderEmail,
          sender_phone: senderObj?.Phone || '',
          receiver_name: existSigner?.Name || '',
          receiver_email: existSigner?.Email || signerMail[i].email,
          receiver_phone: existSigner?.Phone || '',
          expiry_date: localExpireDate,
          company_name: orgName,
          signing_url: signPdf,
        };
        replaceVar = replaceMailVaribles(mailSubject, htmlReqBody, variables);
      }
      const mailparam = {
        note: document?.Note || '',
        senderName: senderName,
        senderMail: senderEmail,
        title: document.Name,
        organization: orgName,
        localExpireDate: localExpireDate,
        signingUrl: signPdf,
      };
      let params = {
        extUserId: document.ExtUserPtr.objectId,
        recipient: existSigner?.Email || signerMail[i].email,
        subject: replaceVar?.subject ? replaceVar?.subject : mailTemplate(mailparam).subject,
        from: document.ExtUserPtr.Email,
        replyto: senderEmail || '',
        html: replaceVar?.body ? replaceVar?.body : mailTemplate(mailparam).body,
      };
      await axios.post(url, params, { headers: headers });
    } catch (error) {
      console.log('batchdoc sendmail error: ', error);
    }
  }
}

async function startBulkSendInBackground(userId, Documents, Ip, parseConfig, type, publicUrl) {
  const BATCH_LIMIT = 50; // Parse batch limit (safe)
  const DOC_MAIL_CONCURRENCY = 5;

  // Find ext user
  const extCls = new Parse.Query('contracts_Users');
  extCls.equalTo('UserId', { __type: 'Pointer', className: '_User', objectId: userId });
  const resExt = await extCls.first({ useMasterKey: true });
  if (!resExt) throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');

  const _resExt = JSON.parse(JSON.stringify(resExt));

  // Build Parse /batch requests from your existing mapping (same as your current code)
  const requests = Documents.map(x => {
    const Signers = x.Signers;
    const placeholders = x?.Placeholders?.filter(p => p?.Role !== 'prefill');
    const allSigner = placeholders
      ?.map(
        item => Signers?.find(e => item?.signerPtr?.objectId === e?.objectId) || item?.signerPtr
      )
      .filter(signer => signer && Object.keys(signer).length > 0);
    const date = new Date();
    const isoDate = date.toISOString();
    let Acl = { [x.CreatedBy.objectId]: { read: true, write: true } };
    if (allSigner && allSigner.length > 0) {
      allSigner.forEach(x => {
        if (x?.CreatedBy?.objectId) {
          Acl = { ...Acl, [x.CreatedBy.objectId]: { read: true, write: true } };
        }
      });
    }
    let mailBody = x?.ExtUserPtr?.TenantId?.RequestBody || '';
    let mailSubject = x?.ExtUserPtr?.TenantId?.RequestSubject || '';
    return {
      method: 'POST',
      path: '/app/classes/contracts_Document',
      body: {
        Name: x.Name,
        URL: x.URL,
        Note: x.Note,
        Description: x.Description,
        CreatedBy: x.CreatedBy,
        SendinOrder: x.SendinOrder || true,
        ExtUserPtr: {
          __type: 'Pointer',
          className: x.ExtUserPtr.className,
          objectId: x.ExtUserPtr?.objectId,
        },
        Placeholders: placeholders.map(y =>
          y?.signerPtr?.objectId
            ? {
                ...y,
                signerPtr: {
                  __type: 'Pointer',
                  className: 'contracts_Contactbook',
                  objectId: y.signerPtr.objectId,
                },
                signerObjId: y.signerObjId,
                email: y?.signerPtr?.Email || y?.email || '',
              }
            : { ...y, signerPtr: {}, signerObjId: '', email: y.email || '' }
        ),
        SignedUrl: x.URL || x.SignedUrl,
        SentToOthers: true,
        Signers: allSigner?.map(y => ({
          __type: 'Pointer',
          className: 'contracts_Contactbook',
          objectId: y.objectId,
        })),
        ACL: Acl,
        SentToOthers: true,
        RemindOnceInEvery: x.RemindOnceInEvery ? parseInt(x.RemindOnceInEvery) : 5,
        AutomaticReminders: x.AutomaticReminders || false,
        TimeToCompleteDays: x.TimeToCompleteDays ? parseInt(x.TimeToCompleteDays) : 15,
        OriginIp: Ip,
        DocSentAt: { __type: 'Date', iso: isoDate },
        IsEnableOTP: x?.IsEnableOTP || false,
        IsTourEnabled: x?.IsTourEnabled || false,
        AllowModifications: x?.AllowModifications || false,
        ...(x?.SignatureType ? { SignatureType: x?.SignatureType } : {}),
        ...(x?.NotifyOnSignatures ? { NotifyOnSignatures: x?.NotifyOnSignatures } : {}),
        ...(x?.Bcc?.length > 0 ? { Bcc: x?.Bcc } : {}),
        ...(x?.RedirectUrl ? { RedirectUrl: x?.RedirectUrl } : {}),
        ...(mailBody ? { RequestBody: mailBody } : {}),
        ...(mailSubject ? { RequestSubject: mailSubject } : {}),
        ...(x?.objectId
          ? {
              TemplateId: {
                __type: 'Pointer',
                className: 'contracts_Template',
                objectId: x?.objectId,
              },
            }
          : {}),
        ...(x?.PenColors?.length > 0 ? { PenColors: x?.PenColors } : {}),
      },
    };
  });

  if (requests?.length > 0) {
    const newrequests = [requests?.[0]];
    const response = await axios.post('batch', { requests: newrequests }, parseConfig);
    // Handle the batch query response
    // console.log('Batch query response:', response.data);
    if (response.data && response.data.length > 0) {
      const document = Documents?.[0];
      const updateDocuments = {
        ...document,
        objectId: response.data[0]?.success?.objectId,
        createdAt: response.data[0]?.success?.createdAt,
      };
      deductcount(response.data.length, resExt.id);
      sendMail(updateDocuments, publicUrl); //sessionToken
      return { total: 1, created: 1, failed: 0 };
    }
  }
}

export default async function createBatchDocs(request) {
  const strDocuments = request.params.Documents;
  const sessionToken = request.headers?.sessiontoken;
  const type = request.headers?.type || 'quicksend';
  const Documents = JSON.parse(strDocuments);

  const Ip = request?.headers?.['x-real-ip'] || '';
  // Access the host from the headers
  const publicUrl = request.headers.public_url;
  const parseConfig = {
    baseURL: serverUrl,
    headers: {
      'X-Parse-Application-Id': appId,
      'X-Parse-Session-Token': sessionToken,
      'Content-Type': 'application/json',
    },
  };
  try {
    let userId = '';

    if (request?.user) {
      userId = request.user.id;
      // return await batchQuery(request.user.id, Documents, Ip, parseConfig, type, publicUrl);
    }
    if (!userId) {
      throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
    }

    // quicksend
    return await startBulkSendInBackground(userId, Documents, Ip, parseConfig, type, publicUrl);
  } catch (err) {
    console.log('createbatchdoc error: ', err);
    const code = err?.code || 400;
    const msg = err?.message || 'Something went wrong.';
    throw new Parse.Error(code, msg);
  }
}
