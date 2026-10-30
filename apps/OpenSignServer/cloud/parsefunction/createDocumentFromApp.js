import { fileAccess } from '../../utils/documentAccess.js';
import { setDocumentCount } from '../../utils/CountUtils.js';

export async function getOwnedDocumentFolder(folder, user, extUser) {
  if (!folder) return null;
  const folderId = folder?.objectId || folder?.id;
  const isParsePointer = folder?.__type === 'Pointer' || typeof folder?.get === 'function';
  if (!isParsePointer || folder?.className !== 'contracts_Document' || !folderId) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Folder not found.');
  }

  const folderQuery = new Parse.Query('contracts_Document');
  folderQuery.equalTo('objectId', folderId);
  folderQuery.equalTo('Type', 'Folder');
  folderQuery.equalTo('CreatedBy', user);
  folderQuery.notEqualTo('IsArchive', true);
  const ownedFolder = await folderQuery.first({ useMasterKey: true });
  if (!ownedFolder) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Folder not found.');
  }

  // ExtUserPtr was added to folder records after production folders already
  // existed. CreatedBy is the canonical ownership check; only reject a
  // populated legacy pointer when it points at a different account.
  const folderExtUser =
    typeof ownedFolder.get === 'function' ? ownedFolder.get('ExtUserPtr') : ownedFolder.ExtUserPtr;
  const folderExtUserId = folderExtUser?.id || folderExtUser?.objectId;
  const extUserId = extUser?.id || extUser?.objectId;
  if (folderExtUserId && folderExtUserId !== extUserId) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Folder not found.');
  }
  return ownedFolder;
}

export function getDocumentSenderIdentity(extUser) {
  if (extUser?.get('UseNameAsSender') !== true) {
    return { senderName: '', senderMail: '' };
  }
  return {
    senderName: extUser.get('Name') || '',
    senderMail: extUser.get('Email') || '',
  };
}

export default async function createDocumentFromApp(request) {
  const doc = request.params?.document;

  if (!doc) {
    throw new Parse.Error(Parse.Error.INVALID_JSON, 'Missing document payload.');
  }

  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }

  // These URLs originate in a caller-supplied payload, even though the save uses the master key.
  if (doc.URL) await fileAccess({ ...request, params: { url: doc.URL } });
  if (doc.SignedUrl) await fileAccess({ ...request, params: { url: doc.SignedUrl } });

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
  let currentExtUser = null;

  try {
    const extUserQuery = new Parse.Query('contracts_Users');
    extUserQuery.equalTo('UserId', {
      __type: 'Pointer',
      className: '_User',
      objectId: request.user.id,
    });
    currentExtUser = await extUserQuery.first({ useMasterKey: true });
    if (!currentExtUser) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
    }
    const ownedFolder = await getOwnedDocumentFolder(doc.Folder, request.user, currentExtUser);
    const { senderName, senderMail } = getDocumentSenderIdentity(currentExtUser);

    const docCls = new Parse.Object('contracts_Document');

    docCls.set('Name', doc?.Name || 'untitled document');
    docCls.set('URL', doc?.URL);
    docCls.set('OriginIp', request?.headers?.['x-real-ip'] || '');
    docCls.set('ExtUserPtr', currentExtUser);
    docCls.set('CreatedBy', request.user);
    if (ownedFolder) {
      docCls.set('Folder', ownedFolder);
    }
    if (senderName) {
      docCls.set('SenderName', senderName);
    }
    if (senderMail) {
      docCls.set('SenderMail', senderMail);
    }

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
    setDocumentCount(currentExtUser.id);

    return docRes;
  } catch (error) {
    console.log('error in create document from app: ', error);
    throw error;
  }
}
