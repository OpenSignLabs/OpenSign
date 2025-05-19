const randomId = () => Math.floor(1000 + Math.random() * 9000);
export default async function saveAsTemplate(request) {
  const docId = request.params.docId;
  const Ip = request?.headers?.['x-real-ip'] || '';

  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'user is not authenticated.');
  }
  try {
    const docQuery = new Parse.Query('contracts_Document');
    docQuery.equalTo('objectId', docId);
    docQuery.equalTo('CreatedBy', request.user);
    docQuery.include('ExtUserPtr');
    docQuery.include('ExtUserPtr.TenantId');
    docQuery.notEqualTo('IsArchive', true);
    const docRes = await docQuery.first({ useMasterKey: true });
    if (docRes) {
      const _docRes = docRes?.toJSON();
      const templateCls = new Parse.Object('contracts_Template');
      templateCls.set('URL', _docRes?.URL);
      templateCls.set('Name', _docRes?.Name);
      templateCls.set('Note', _docRes?.Note);
      templateCls.set('Description', _docRes?.Description);
      templateCls.set('OriginIp', Ip);
      templateCls.set('SendinOrder', _docRes?.SendinOrder || false);
      templateCls.set('AutomaticReminders', _docRes?.AutomaticReminders || false);
      templateCls.set('ExtUserPtr', _docRes?.ExtUserPtr);
      templateCls.set('CreatedBy', _docRes?.CreatedBy);
      templateCls.set('IsEnableOTP', _docRes?.IsEnableOTP === true ? true : false);
      templateCls.set('IsTourEnabled', _docRes?.IsTourEnabled === true ? true : false);
      templateCls.set('AllowModifications', _docRes?.AllowModifications || false);
      templateCls.set('EmailSenderName', _docRes?.EmailSenderName);
      templateCls.set('SenderName', _docRes?.SenderName);
      templateCls.set('SenderMail', _docRes?.SenderMail);
      templateCls.set('FileAdapterId', _docRes?.FileAdapterId);
      templateCls.set('RequestBody', _docRes?.RequestBody);
      templateCls.set('RequestSubject', _docRes?.RequestSubject);
      templateCls.set('NextReminderDate', _docRes?.NextReminderDate);
      templateCls.set('RedirectUrl', _docRes?.RedirectUrl);
      templateCls.set(
        'NotifyOnSignatures',
        _docRes?.NotifyOnSignatures !== undefined ? _docRes?.NotifyOnSignatures : false
      );
      templateCls.set(
        'TimeToCompleteDays',
        _docRes?.TimeToCompleteDays ? parseInt(_docRes?.TimeToCompleteDays) : 15
      );
      if (_docRes?.RemindOnceInEvery) {
        templateCls.set('RemindOnceInEvery', parseInt(_docRes?.RemindOnceInEvery));
      }

      if (_docRes?.Placeholders?.length > 0) {
        if (_docRes?.IsSignyourself) {
          const placeHolders = {
            signerObjId: '',
            signerPtr: {},
            Id: randomId(),
            blockColor: '#93a3db',
            Role: 'Role 1',
            email: '',
            placeHolder: _docRes?.Placeholders,
          };
          templateCls.set('Placeholders', [placeHolders]);
        } else {
          const placeHolders = _docRes?.Placeholders?.map((x, i) => {
            const email = x.email ? { email: '' } : {};
            return { ...x, signerObjId: '', signerPtr: {}, Role: 'Role ' + (i + 1), ...email };
          });
          templateCls.set('Placeholders', placeHolders);
        }
      }
      if (_docRes?.SignatureType?.length > 0) {
        templateCls.set('SignatureType', _docRes?.SignatureType);
      }
      if (_docRes?.Bcc?.length > 0) {
        templateCls.set('Bcc', _docRes?.Bcc);
      }
      const res = await templateCls.save(null, { useMasterKey: true });
      return res;
    } else {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'document not found.');
    }
  } catch (err) {
    console.log('Err in save as template', err);
    throw err;
  }
}
