import qs from "qs";
import axios from 'axios';

async function GetTokens(request) {
  const { code } = request.params;
  const { COGNITO_LOGIN_REDIRECT_URL, COGNITO_CLIENT_ID, COGNITO_DOMAIN_NAME_URL, COGNITO_LOGIN_GRANT_TYPE } = process.env;
  try {
    let url = `${COGNITO_DOMAIN_NAME_URL}/oauth2/token`;
    let params = {
      grant_type: COGNITO_LOGIN_GRANT_TYPE,
      client_id: COGNITO_CLIENT_ID,
      redirect_uri: COGNITO_LOGIN_REDIRECT_URL,
      code,
    };
    let { data } = await axios({
      url,
      method: "post",
      data: qs.stringify(params),
    });
    return data;
   
  } catch (err) {
    console.log('err in Auth');
    throw new Error(err)
  }
}
export default GetTokens;
