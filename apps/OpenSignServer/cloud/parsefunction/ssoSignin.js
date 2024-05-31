import axios from 'axios';

const serverUrl = process.env.SERVER_URL;
const APPID = process.env.APP_ID;
const masterKEY = process.env.MASTER_KEY;

/**
 * ssoSign is function which is used to sign up/sign in with SSO
 * @param code It is code return by jackson using authorize endpoint
 * @param email It is user's email with user sign in/sign up
 * @returns if success {email, message, sessiontoken} else on reject {message}
 */

export default async function ssoSignin(request) {
  const code = request.params.code;
  const userEmail = request.params.email;

  //   console.log('code ', code);
  try {
    const headers = { 'content-type': 'application/x-www-form-urlencoded' };
    const axiosRes = await axios.post(
      'https://osl-jacksonv2.vercel.app/api/oauth/token',
      {
        grant_type: 'authorization_code',
        client_id: 'dummy',
        tenant: 'Okta-dev-nxglabs-in',
        product: 'OpenSign',
        client_secret: 'dummy',
        redirect_uri: 'http://localhost:3000/sso',
        code: code,
      },
      { headers: headers }
    );
    const ssoAccessToken = axiosRes.data && axiosRes.data.access_token;
    // console.log('ssoAccessToken ', ssoAccessToken);
    const authData = { sso: { id: userEmail, access_token: ssoAccessToken } };
    const userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo('email', userEmail);
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
          const sessiontoken = SignIn.data.sessionToken;
          //   console.log('sso sessiontoken', sessiontoken);
          return {
            email: userEmail,
            message: 'User Sign In',
            sessiontoken: sessiontoken,
          };
        }
      } catch (err) {
        console.log('err in user sso sign in', err);
        throw new Parse.Error(Parse.Error.INTERNAL_SERVER_ERROR, 'Internal server error.');
      }
    } else {
      // console.log("in sign up condition");
      const response = await axios.get('https://osl-jacksonv2.vercel.app/api/oauth/userinfo', {
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
              name: response.data?.firstName + response.data?.lastName,
            },
            {
              headers: {
                'X-Parse-Application-Id': APPID,
                'X-Parse-Revocable-Session': '1',
              },
            }
          );

          // console.log("SignUp", SignUp);

          if (SignUp.data) {
            const sessiontoken = SignUp.data.sessionToken;
            const payload = {
              email: userEmail,
              message: 'User Sign Up',
              sessiontoken: sessiontoken,
            };
            return payload;
          }
        } catch (err) {
          console.log('err in user sso sign up', err);
          throw new Parse.Error(Parse.Error.INTERNAL_SERVER_ERROR, 'Internal server error.');
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
