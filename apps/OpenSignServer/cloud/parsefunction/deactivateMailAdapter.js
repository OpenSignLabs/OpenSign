export default async function deactivateMailAdapter(request) {
  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  try {
    const extUserCls = new Parse.Query('contracts_Users');
    extUserCls.equalTo('UserId', request.user);
    const extUser = await extUserCls.first({ useMasterKey: true });
    if (extUser) {
      const extUserCls = new Parse.Object('contracts_Users');
      extUserCls.id = extUser.id;
      extUserCls.unset('active_mail_adapter');
      const updateExtUser = await extUserCls.save(null, { useMasterKey: true });
      // console.log('updateExtUser ', updateExtUser);
      return updateExtUser.updatedAt;
    }
    return extUser;
  } catch (err) {
    console.log('Err in add custom smtp', err);
    const code = err.code || 400;
    const msg = err.message || 'Something went wrong.';
    throw new Parse.Error(code, msg);
  }
}
