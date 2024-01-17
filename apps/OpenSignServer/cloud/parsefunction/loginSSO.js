import qs from "qs";
async function LoginSSO() {

  const { COGNITO_LOGIN_REDIRECT_URL, COGNITO_CLIENT_ID, COGNITO_LOGIN_RESPONSE_TYPE, COGNITO_LOGIN_SCOPE, COGNITO_DOMAIN_NAME_URL } = process.env;
  try {
    const uri = COGNITO_LOGIN_REDIRECT_URL;
    let client_id = COGNITO_CLIENT_ID;
    let params = {
        client_id,
        response_type: COGNITO_LOGIN_RESPONSE_TYPE,
        scope: COGNITO_LOGIN_SCOPE,
        redirect_uri: uri,
    }
  
  let url = `${COGNITO_DOMAIN_NAME_URL}/login?${qs.stringify(params, { encode: false })}`;
  console.log(url)
  return url;
   
  } catch (err) {
    console.log('err in Auth');
    console.log(err);
    return 'Result not found', err;
  }
}
export default LoginSSO;
