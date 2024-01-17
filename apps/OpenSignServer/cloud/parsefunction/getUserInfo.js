import qs from "qs";
import axios from 'axios';

async function GetUserInfo(request) {
  const { authorization } = request.headers;
  const { COGNITO_DOMAIN_NAME_URL } = process.env;
  try {
    let url = `${COGNITO_DOMAIN_NAME_URL}/oauth2/userinfo`;
    console.log(request)
    let { data } = await axios({
      url,
      method: "get",
      headers: {
        Authorization: authorization
      }
    });
    return data;
   
  } catch (err) {
    console.log('err in Auth', err.message);
    throw new Error(err)
  }
}
export default GetUserInfo;
