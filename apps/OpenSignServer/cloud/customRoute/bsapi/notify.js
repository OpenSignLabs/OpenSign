// "Your turn to sign" for documents sent in order. The browser sends this
// itself after an online signature (apps/OpenSign PdfRequestFiles.jsx, the
// sendInOrder branch); a desktop upload has no browser, so the server sends
// the same email.

import { mailTemplate, replaceMailVaribles } from '../../../Utils.js';
import sendmailv3 from '../../parsefunction/sendMailv3.js';
import { findPlaceholderIndex } from '../../../utils/workflowUtils.js';

// The sendmailv3 params for the next signer after `signedContactId`, or null
// when there's nobody to tell. `doc` is the document JSON (as before this
// signing), with ExtUserPtr.TenantId and Signers included; `siteOrigin` is the
// website the signing link opens (BS_API_ORIGIN).
export function nextSignerMail(doc, signedContactId, siteOrigin) {
  if (!doc?.SendinOrder || doc?.IsSendMail === false) return null;
  const placeholders = (doc.Placeholders || []).filter(p => p?.Role !== 'prefill');
  const idx = findPlaceholderIndex(placeholders, signedContactId);
  const next = idx === -1 ? null : placeholders[idx + 1];
  if (!next) return null;
  const nextId = next.signerObjId || next.signerPtr?.objectId;
  const contact = (doc.Signers || []).find(s => s?.objectId === nextId);
  const email = next.email || contact?.Email;
  if (!email) return null;

  const sender = doc.ExtUserPtr || {};
  const tenant = sender.TenantId || {};
  const senderEmail = doc.SenderMail || sender.Email || '';
  const senderName = doc.SenderName || sender.Name || '';
  const orgName = sender.Company || '';
  const expiry = doc.ExpiryDate?.iso || doc.ExpiryDate;
  const dateFormat = { day: 'numeric', month: 'long', year: 'numeric' };
  const localExpireDate = expiry ? new Date(expiry).toLocaleDateString('en-US', dateFormat) : '';
  const path = nextId ? `${doc.objectId}/${email}/${nextId}` : `${doc.objectId}/${email}`;
  const signingUrl = `${siteOrigin}/login/${Buffer.from(path).toString('base64')}`;

  const requestBody = doc.RequestBody || tenant.RequestBody;
  const requestSubject = doc.RequestSubject || tenant.RequestSubject;
  let custom;
  if (requestBody && requestSubject) {
    const html =
      "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>" +
      requestBody.replace(/"/g, "'") +
      '</body></html>';
    custom = replaceMailVaribles(requestSubject, html, {
      document_title: doc.Name,
      note: doc.Note,
      sender_name: senderName,
      sender_mail: senderEmail,
      sender_phone: sender.Phone,
      receiver_name: contact?.Name || '',
      receiver_email: email,
      receiver_phone: contact?.Phone || '',
      expiry_date: localExpireDate,
      company_name: orgName,
      signing_url: signingUrl,
    });
  }
  const standard = mailTemplate({
    note: doc.Note || '',
    senderName,
    senderMail: senderEmail,
    title: doc.Name,
    organization: orgName,
    localExpireDate,
    signingUrl,
  });
  return {
    replyto: senderEmail,
    extUserId: sender.objectId,
    recipient: email,
    subject: custom?.subject || standard.subject,
    from: senderName || senderEmail,
    html: custom?.body || standard.body,
  };
}

// How mail goes out; tests swap `send` to capture it.
export const mailer = { send: params => sendmailv3({ params }) };

// Send it; never fails the signing that triggered it.
export async function notifyNextSigner(doc, signedContactId, siteOrigin) {
  const params = nextSignerMail(doc, signedContactId, siteOrigin);
  if (!params) return null;
  try {
    await mailer.send(params);
  } catch (err) {
    console.log('bsapi: next-signer mail failed', err?.message);
  }
  return params.recipient;
}
