import { setDocumentCount } from '../../utils/CountUtils.js';

export default async function createDocumentFromApp(request) {
  const doc = request.params?.document;

  if (!doc) {
    throw new Parse.Error(Parse.Error.INVALID_JSON, 'Missing document payload.');
  }

  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }

  const SentToOthers = doc.SentToOthers !== undefined ? doc.SentToOthers : false;
  const SendinOrder = doc.SendinOrder !== undefined ? doc.SendinOrder : false;
  const SendInOrderStrict = doc.SendInOrderStrict !== undefined ? !!doc.SendInOrderStrict : false;
  const IsEnableOTP = doc?.IsEnableOTP !== undefined ? doc?.IsEnableOTP : false;
  const IsTourEnabled = doc?.IsTourEnabled !== undefined ? doc?.IsTourEnabled : false;
  const AllowModifications =
    doc?.AllowModifications !== undefined ? doc?.AllowModifications : false;
  const AutomaticReminders =
    doc?.AutomaticReminders !== undefined ? doc?.AutomaticReminders : false;
  const NotifyOnSignatures = doc.NotifyOnSignatures !== undefined ? doc.NotifyOnSignatures : false;

  try {
    const docCls = new Parse.Object('contracts_Document');

    docCls.set('Name', doc?.Name || 'untitled document');
    docCls.set('URL', doc?.URL);
    docCls.set('ExtUserPtr', doc.ExtUserPtr);
    docCls.set('CreatedBy', doc.CreatedBy);

    if (doc.Description) {
      docCls.set('Description', doc.Description);
    }
    if (doc.Note) {
      docCls.set('Note', doc.Note);
    }
    if (doc.SignedUrl) {
      docCls.set('SignedUrl', doc.SignedUrl);
    }

    docCls.set('SentToOthers', SentToOthers);
    docCls.set('SendinOrder', SendinOrder);
    docCls.set('SendInOrderStrict', SendInOrderStrict);
    docCls.set('IsEnableOTP', IsEnableOTP);
    docCls.set('IsTourEnabled', IsTourEnabled);
    docCls.set('AllowModifications', AllowModifications);
    docCls.set('AutomaticReminders', AutomaticReminders);
    docCls.set('NotifyOnSignatures', NotifyOnSignatures);

    if (doc.TimeToCompleteDays !== undefined) {
      docCls.set('TimeToCompleteDays', Number(doc.TimeToCompleteDays));
    }
    if (doc.RemindOnceInEvery !== undefined) {
      docCls.set('RemindOnceInEvery', Number(doc.RemindOnceInEvery));
    }

    if (doc?.DocSentAt?.iso) {
      docCls.set('DocSentAt', new Date(doc?.DocSentAt?.iso));
    }

    if (doc.RedirectUrl) {
      docCls.set('RedirectUrl', doc.RedirectUrl);
    }
    if (doc.TemplateId) {
      docCls.set('TemplateId', doc.TemplateId);
    }

    if (Array.isArray(doc.Signers) && doc?.Signers?.length > 0) {
      docCls.set('Signers', doc.Signers);
    }
    if (Array.isArray(doc.Placeholders) && doc?.Placeholders?.length > 0) {
      docCls.set('Placeholders', doc.Placeholders);
    }
    if (Array.isArray(doc.SignatureType) && doc.SignatureType.length > 0) {
      docCls.set('SignatureType', doc.SignatureType);
    }
    if (Array.isArray(doc.Bcc) && doc?.Bcc?.length > 0) {
      docCls.set('Bcc', doc.Bcc);
    }
    if (Array.isArray(doc.Cc) && doc?.Cc?.length > 0) {
      docCls.set('Cc', doc.Cc);
    }
    if (Array.isArray(doc?.PenColors) && doc?.PenColors?.length > 0) {
      docCls.set('PenColors', doc.PenColors);
    }

    const docRes = await docCls.save(null, { useMasterKey: true });

    // update documentCount in Users and tenant account
    setDocumentCount(doc?.ExtUserPtr?.id);

    return docRes;
  } catch (error) {
    console.log('error in create document from app: ', error);
    throw error;
  }
}
