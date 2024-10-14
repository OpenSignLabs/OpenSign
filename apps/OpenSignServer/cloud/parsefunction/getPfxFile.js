export default async function getPfxFile(request) {
  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  try {
    const extUserCls = new Parse.Query('contracts_Users');
    extUserCls.equalTo('UserId', request.user);
    extUserCls.include('TenantId');
    const extUser = await extUserCls.first({ useMasterKey: true });
    if (extUser) {
      const _extUser = JSON.parse(JSON.stringify(extUser));
      const title = _extUser?.TenantId?.PfxFile?.title || '';
      const pfxBase64 = _extUser?.TenantId?.PfxFile?.base64 || '';
      const password = _extUser?.TenantId?.PfxFile?.password || '';
      return { title: title, password: password, base64: pfxBase64 };
    } else {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
    }
  } catch (err) {
    console.log('Err in add custom file adapter', err);
    const code = err.code || 400;
    const msg = err.message || 'Something went wrong.';
    throw new Parse.Error(code, msg);
  }
}
