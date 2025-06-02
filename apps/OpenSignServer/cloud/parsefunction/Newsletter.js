import axios from 'axios';
export default async function Newsletter(request) {
  const name = request.params.name;
  const email = request.params?.email?.toLowerCase()?.replace(/\s/g, '');
  const domain = request.params.domain;
  try {
    const envAppId = 'opensign';
    const headers = { 'Content-Type': 'application/json', 'X-Parse-Application-Id': envAppId };
    const envProdServer = 'https://app.opensignlabs.com/api/app';
    const newsletter = await axios.post(
      `${envProdServer}/classes/Newsletter`,
      { Name: name, Email: email, Domain: domain },
      { headers: headers }
    );
    return 'success';
  } catch (err) {
    const code = err?.response?.data?.code || err?.response?.status || err?.code || 400;
    const message =
      err?.response?.data?.error || err?.response?.data || err?.message || 'Something went wrong.';
    console.log('err in savenewsletter', err);
    throw new Parse.Error(code, message);
  }
}
