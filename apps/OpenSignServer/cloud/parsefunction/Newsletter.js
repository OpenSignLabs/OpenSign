import axios from 'axios';
export default async function Newsletter(request) {
  const name = request.params.name;
  const email = request.params.email;
  const domain = request.params.domain;
  try {
    const headers = {
      'Content-Type': 'application/json',
      'X-Parse-Application-Id': 'legadranaxn',
    };
    const newsletter = await axios.post(
      'https://effi.com.au/contact/',
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
