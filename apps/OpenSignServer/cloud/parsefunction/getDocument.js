import { documentAccess, sanitiseDocument, canonicalFileUrl } from '../../utils/documentAccess.js';
import { getSignedLocalUrl, getProtectedDocumentFileUrl } from './getSignedUrl.js';
export default async function getDocument(request) {
  const access = await documentAccess(request);
  const document = sanitiseDocument(access.document);
  if (access.grant) {
    const ttl = Math.min(160, Math.floor((access.expiresAt - Date.now()) / 1000));
    if (ttl < 1) throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Document is unavailable.');
    const scope = {
      docId: document.objectId,
      grantId: access.grant.id,
      recipientId: access.recipientId,
    };
    for (const key of ['URL', 'SignedUrl', 'CertificateUrl']) {
      if (!document[key]) continue;
      const url = canonicalFileUrl(document[key]);
      document[key] = url.includes('/files/')
        ? getSignedLocalUrl(url, ttl, scope)
        : getProtectedDocumentFileUrl(url, ttl, scope);
    }
    // Do not pass through other recipients' historical download capabilities.
    for (const event of document.AuditTrail || []) delete event.SignedUrl;
    }
  return document;
    }
