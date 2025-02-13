export default async function createDuplicate(request) {
  const templateId = request.params.templateId;

  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }

  if (templateId) {
    try {
      const templateQuery = new Parse.Query('contracts_Template');
      templateQuery.equalTo('objectId', templateId);
      templateQuery.equalTo('CreatedBy', {
        __type: 'Pointer',
        className: '_User',
        objectId: request.user.id,
      });
      templateQuery.notEqualTo('IsArchive', true);
      const templateRes = await templateQuery.first({ useMasterKey: true });
      if (templateRes?.id) {
        const _templateRes = JSON.parse(JSON.stringify(templateRes));
        const newTemplate = new Parse.Object('contracts_Template');

        let signers = [];
        if (_templateRes.Signers?.length > 0) {
          _templateRes.Signers?.forEach(x => {
            if (x.objectId) {
              const obj = {
                __type: 'Pointer',
                className: 'contracts_Contactbook',
                objectId: x.objectId,
              };
              signers.push(obj);
            }
          });
        }
        newTemplate.set('Name', _templateRes.Name);
        newTemplate.set('URL', _templateRes.URL);
        newTemplate.set('SignedUrl', _templateRes.SignedUrl);
        newTemplate.set('SentToOthers', _templateRes?.SentToOthers || false);
        newTemplate.set('SendinOrder', _templateRes?.SendinOrder || false);
        newTemplate.set('AutomaticReminders', _templateRes?.AutomaticReminders || false);
        newTemplate.set('RemindOnceInEvery', _templateRes?.RemindOnceInEvery || 5);
        newTemplate.set('IsEnableOTP', _templateRes?.IsEnableOTP || false);
        newTemplate.set('AllowModifications', _templateRes?.AllowModifications || false);
        newTemplate.set('Signers', signers);
        newTemplate.set('ExtUserPtr', {
          __type: 'Pointer',
          className: 'contracts_Users',
          objectId: _templateRes.ExtUserPtr.objectId,
        });
        newTemplate.set('CreatedBy', {
          __type: 'Pointer',
          className: '_User',
          objectId: _templateRes.CreatedBy.objectId,
        });
        if (_templateRes?.Note) {
          newTemplate.set('Note', _templateRes?.Note);
        }
        if (_templateRes?.Description) {
          newTemplate.set('Description', _templateRes?.Description);
        }
        if (_templateRes?.Placeholders?.length > 0) {
          newTemplate.set('Placeholders', _templateRes.Placeholders);
        }
        if (_templateRes?.SignatureType?.length > 0) {
          newTemplate.set('SignatureType', _templateRes?.SignatureType);
        }
        if (_templateRes?.NotifyOnSignatures !== undefined) {
          newTemplate.set('NotifyOnSignatures', _templateRes.NotifyOnSignatures);
        }
        if (_templateRes?.SharedWith?.length > 0) {
          newTemplate.set('SharedWith', _templateRes.SharedWith);
        }
        if (_templateRes?.IsTourEnabled) {
          newTemplate.set('IsTourEnabled', _templateRes?.IsTourEnabled);
        }
        if (_templateRes?.Bcc?.length) {
          newTemplate.set('Bcc', _templateRes?.Bcc);
        }
        const OriginIp = _templateRes?.OriginIp || request?.headers?.['x-real-ip'] || '';

        if (OriginIp) {
          newTemplate.set('OriginIp', OriginIp);
        }
        if (_templateRes?.RedirectUrl) {
          newTemplate.set('RedirectUrl', _templateRes?.RedirectUrl);
        }
        if (_templateRes?.TimeToCompleteDays) {
          newTemplate.set('TimeToCompleteDays', parseInt(_templateRes?.TimeToCompleteDays));
        }
        const acl = templateRes.getACL();
        if (acl) {
          newTemplate.setACL(acl);
        }
        const newTemplateRes = await newTemplate.save(null, { useMasterKey: true });
        const _newTemplateRes = JSON.parse(JSON.stringify(newTemplateRes));
        return _newTemplateRes;
      } else {
        throw new Parse.Error(
          Parse.Error.INVALID_QUERY,
          'You cannot create duplicate of this template.'
        );
      }
    } catch (err) {
      console.log('err while creating duplicate', err);
      throw err;
    }
  }
}
