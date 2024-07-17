// `CheckAdminExist` is used to check is admin with org exist or not in db
export default async function CheckAdminExist() {
  try {
    const extClsQuery = new Parse.Query('contracts_Users');
    extClsQuery.equalTo('UserRole', 'contracts_Admin');
    extClsQuery.notEqualTo('IsDisabled', true);
    const extAdminRes = await extClsQuery.find({ useMasterKey: true });
    // must be only one admin
    if (extAdminRes && extAdminRes.length === 1 && extAdminRes?.[0]?.get('OrganizationId')) {
      return 'exist';
    } else {
      return 'not_exist';
    }
  } catch (err) {
    console.log('err in isAdminExist', err);
    const code = err?.code || 400;
    const msg = err?.message || 'something went wrong.';
    throw new Parse.Error(code, msg);
  }
}
