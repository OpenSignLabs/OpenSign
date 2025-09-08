export default async function updatePreferences(request) {
  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  const SignatureType = request.params.SignatureType || [];
  const NotifyOnSignatures = request.params.NotifyOnSignatures;
  const Timezone = request.params.Timezone;
  if (SignatureType?.length > 0 || NotifyOnSignatures !== undefined || Timezone) {
    try {
      const orgQuery = new Parse.Query('contracts_Users');
      orgQuery.equalTo('UserId', {
        __type: 'Pointer',
        className: '_User',
        objectId: request.user.id,
      });
      const resUser = await orgQuery.first({ useMasterKey: true });
      if (resUser) {
        const newOrg = new Parse.Object('contracts_Users');
        newOrg.id = resUser.id;
        if (NotifyOnSignatures !== undefined) {
          newOrg.set('NotifyOnSignatures', NotifyOnSignatures);
        }
        if (Timezone) {
          newOrg.set('Timezone', Timezone);
        }
        if (SignatureType.length > 0) {
          const enabledSignTypes = SignatureType?.filter(x => x.enabled);
          const isDefaultSignTypeOnly =
            enabledSignTypes?.length === 1 && enabledSignTypes[0]?.name === 'default';

          if (enabledSignTypes.length === 0) {
            throw new Parse.Error(
              Parse.Error.INVALID_QUERY,
              'At least one signature type should be enabled.'
            );
          } else if (isDefaultSignTypeOnly) {
            throw new Parse.Error(
              Parse.Error.INVALID_QUERY,
              'At least one signature type other than the default should be enabled.'
            );
          } else {
            newOrg.set('SignatureType', SignatureType);
          }
        }
        if (request.params.SendinOrder !== undefined) {
          newOrg.set('SendinOrder', request.params.SendinOrder);
        }
        if (request.params.IsTourEnabled !== undefined) {
          newOrg.set('IsTourEnabled', request.params.IsTourEnabled);
        }
        if (request.params.DateFormat) {
          newOrg.set('DateFormat', request.params.DateFormat);
        }
        if (request.params.Is12HourTime !== undefined) {
          newOrg.set('Is12HourTime', request.params.Is12HourTime);
        }
        if (request.params.IsLTVEnabled !== undefined) {
          newOrg.set('IsLTVEnabled', request.params.IsLTVEnabled);
        }
        if (request.params.DownloadFilenameFormat) {
          newOrg.set('DownloadFilenameFormat', request.params.DownloadFilenameFormat);
        }
        const updateUserRes = await newOrg.save(null, { useMasterKey: true });
        if (updateUserRes) {
          const _updateUserRes = JSON.parse(JSON.stringify(updateUserRes));
          return _updateUserRes;
        }
      } else {
        throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Premission denied.');
      }
    } catch (err) {
      console.log('err in addorganization', err);
      const code = err?.code || 400;
      const msg = err?.message || 'Something went wrong.';
      throw new Parse.Error(code, msg);
    }
  } else {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Please provide parameters.');
  }
}
