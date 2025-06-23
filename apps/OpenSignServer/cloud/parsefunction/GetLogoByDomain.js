// `GetLogoByDomain` is used to get logo by domain as well as check any tenant exist or not in db
export default async function GetLogoByDomain(request) {
  const domain = request.params.domain;
  try {
    const tenantCreditsQuery = new Parse.Query('partners_Tenant');
    tenantCreditsQuery.equalTo('Domain', domain);
    const res = await tenantCreditsQuery.first();
    if (res) {
      const updateRes = JSON.parse(JSON.stringify(res));
      return { logo: updateRes?.Logo, user: 'exist' };
    } else {
      const tenantCreditsQuery = new Parse.Query('partners_Tenant');
      const tenantRes = await tenantCreditsQuery.first();
      if (tenantRes) {
        return { logo: '', user: 'exist' };
      } else {
        return { logo: '', user: 'not_exist' };
      }
    }
  } catch (err) {
    const code = err.code || 400;
    const msg = err.message || 'Something went wrong.';
    throw new Parse.Error(code, msg);
  }
}
