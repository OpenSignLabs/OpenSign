import axios from 'axios';

const serverUrl = process.env.SERVER_URL;
const APPID = process.env.APP_ID;
const masterKEY = process.env.MASTER_KEY;
const clientUrl = process.env.PUBLIC_URL;
const ssoApiUrl = process.env.SSO_API_URL || 'https://sso.opensignlabs.com/api'; //'https://osl-jacksonv2.vercel.app/api';
/**
 * ssoSign is function which is used to sign up/sign in with SSO
 * @param code It is code return by jackson using authorize endpoint
 * @param email It is user's email with user sign in/sign up
 * @returns if success {email, name, phone message, sessiontoken} else on reject error {code, message}
 */

export default async function ssoSignin(request) {
  const code = request.params.code;
  const userEmail = request.params.email;
  try {
    const headers = { 'content-type': 'application/x-www-form-urlencoded' };
    const axiosRes = await axios.post(
      ssoApiUrl + '/oauth/token',
      {
        grant_type: 'authorization_code',
        client_id: 'dummy',
        tenant: 'Okta-dev-nxglabs-in',
        product: 'OpenSign',
        client_secret: 'dummy',
        redirect_uri: clientUrl + '/sso',
        code: code,
      },
      { headers: headers }
    );
    const ssoAccessToken = axiosRes.data && axiosRes.data.access_token;
    const authData = { sso: { id: userEmail, access_token: ssoAccessToken } };
    const userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo('username', userEmail);
    const res = await userQuery.first({ useMasterKey: true });
    if (res) {
      try {
        const SignIn = await axios.put(
          serverUrl + '/users/' + res.id,
          { authData: authData },
          {
            headers: {
              'X-Parse-Application-Id': APPID,
              'X-Parse-Master-key': masterKEY,
            },
          }
        );

        if (SignIn.data) {
          const response = await axios.get(ssoApiUrl + '/oauth/userinfo', {
            headers: {
              Authorization: `Bearer ${ssoAccessToken}`,
            },
          });
          const sessiontoken = SignIn.data.sessionToken;
          //   console.log('sso sessiontoken', sessiontoken);
          const payload = {
            email: userEmail,
            name: response.data?.firstName + ' ' + response.data?.lastName,
            phone: response?.data?.phone || '',
            message: 'User Sign In',
            sessiontoken: sessiontoken,
          };
          return payload;
        }
      } catch (err) {
        const errCode = err?.response?.data?.code || err?.response?.status || err?.code || 400;
        const message =
          err?.response?.data?.error ||
          err?.response?.data ||
          err?.message ||
          'Internal server error.';
        console.log('err in user sso sign in', errCode, message);
        throw new Parse.Error(errCode, message);
      }
    } else {
      // console.log("in sign up condition");
      const response = await axios.get('ttps://sso.opensignlabs.com/api/oauth/userinfo', {
        headers: {
          Authorization: `Bearer ${ssoAccessToken}`,
        },
      });
      if (response.data && response.data.id) {
        try {
          const SignUp = await axios.post(
            serverUrl + '/users',
            {
              authData: authData,
              username: response.data.email,
              email: response.data.email,
              phone: response.data?.phone,
              name: response.data?.firstName + ' ' + response.data?.lastName,
            },
            {
              headers: {
                'X-Parse-Application-Id': APPID,
                'X-Parse-Revocable-Session': '1',
              },
            }
          );
          if (SignUp.data) {
            const sessiontoken = SignUp.data.sessionToken;
            const payload = {
              email: userEmail,
              name: SignUp?.data?.name,
              phone: SignUp?.data?.phone || '',
              message: 'User Sign Up',
              sessiontoken: sessiontoken,
            };
            return payload;
          }
        } catch (err) {
          const errCode = err?.response?.data?.code || err?.response?.status || err?.code || 400;
          const message =
            err?.response?.data?.error ||
            err?.response?.data ||
            err?.message ||
            'Internal server error.';
          console.log('err in user sso sign up', errCode, message);
          throw new Parse.Error(errCode, message);
        }
      }
    }
  } catch (err) {
    const errCode = err?.response?.status || err?.code || 400;
    const message = err?.response?.data || err?.message || 'Internal server error.';
    console.log('err in ssoSign', errCode, message);
    throw new Parse.Error(errCode, message);
  }
}
