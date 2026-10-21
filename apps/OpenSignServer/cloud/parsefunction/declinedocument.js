import sendSystemMail from './sendSystemMail.js';
import { escapeHtml, renderDocumentEmail, resolveBrandContext } from '../../utils/brandContext.js';

async function sendDeclineMail(doc, publicUrl, userId, reason) {
  try {
    const brand = resolveBrandContext({});
    const removePrefill =
      doc?.Placeholders?.length > 0 && doc?.Placeholders?.filter(x => x?.Role !== 'prefill');
    const signUser =
      removePrefill?.length > 0 &&
      removePrefill?.find(x => x?.signerPtr?.UserId?.objectId === userId);

    const sender = doc.ExtUserPtr;
    const pdfName = doc.Name;
    const creatorName = doc.ExtUserPtr.Name;
    const creatorEmail = doc.ExtUserPtr.Email;
    const signerName = signUser?.signerPtr?.Name || '';
    const signerEmail = signUser?.signerPtr?.Email || signUser?.email || '';
    const viewDocUrl = `${publicUrl}/recipientSignPdf/${doc.objectId}`;
    const subject = `Document "${pdfName}" has been declined by ${signerName}`;
    const body = renderDocumentEmail({
      context: brand,
      heading: `Document declined by ${signerName}`,
      contentHtml:
        `<div style='padding:20px;font-family:system-ui;font-size:14px'><p>Dear ${escapeHtml(creatorName)},</p>` +
        `<p>${escapeHtml(pdfName)} has been declined by ${escapeHtml(signerName)} "${escapeHtml(signerEmail)}" on ${new Date().toLocaleDateString()}.</p>` +
        `<p>Decline Reason: ${escapeHtml(reason || 'Not specified')}</p>` +
        `<p><a href='${escapeHtml(viewDocUrl)}' target=_blank>View Document</a></p></div>`,
      senderEmail: creatorEmail,
    });

    const params = {
      extUserId: sender.objectId,
      from: brand.senderName,
      recipient: creatorEmail,
      subject: subject,
      pdfName: pdfName,
      html: body,
    };
    await sendSystemMail({ params });
  } catch (err) {
    console.log('err in sendnotifymail', err);
  }
}
export default async function declinedocument(request) {
  const docId = request.params.docId;
  const reason = request.params?.reason || '';
  const userId = request.params.userId;
  const declineBy = { __type: 'Pointer', className: '_User', objectId: userId };
  let publicUrl = request.headers.public_url;
  if (!docId) {
    throw new Parse.Error(Parse.Error.SCRIPT_FAILED, 'missing parameter docId.');
  }
  try {
    const docCls = new Parse.Query('contracts_Document');
    docCls.include('ExtUserPtr.TenantId,Placeholders.signerPtr,Signers');
    docCls.notEqualTo('IsCompleted', true);
    docCls.notEqualTo('IsArchive', true);
    const updateDoc = await docCls.get(docId, { useMasterKey: true });
    if (updateDoc) {
      const _doc = JSON.parse(JSON.stringify(updateDoc));
      const isEnableOTP = updateDoc?.get('IsEnableOTP') || false;
      const isCreator = _doc?.CreatedBy?.objectId === userId;
      if (!isEnableOTP) {
        updateDoc.set('IsDeclined', true);
        updateDoc.set('DeclineReason', reason);
        updateDoc.set('DeclineBy', declineBy);
        await updateDoc.save(null, { useMasterKey: true });
        if (!isCreator) {
          sendDeclineMail(_doc, publicUrl, userId, reason);
        }
        return 'document declined';
      } else {
        if (!request?.user) {
          throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
        }
        updateDoc.set('IsDeclined', true);
        updateDoc.set('DeclineReason', reason);
        updateDoc.set('DeclineBy', declineBy);
        await updateDoc.save(null, { useMasterKey: true });
        const isCreator = _doc?.CreatedBy?.objectId === request?.user?.id;
        if (!isCreator) {
          sendDeclineMail(_doc, publicUrl, userId, reason);
        }
        return 'document declined';
      }
    } else {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Document not found.');
    }
  } catch (err) {
    console.log('err while decling doc', err);
    throw err;
  }
}
