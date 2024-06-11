import axios from "axios";

const serverUrl = process.env.SERVER_URL;
const APPID = process.env.APP_ID;
const masterKEY = process.env.MASTER_KEY;

/**
 * FacebookSign is function which is used to sign up/sign in with google
 * @param Id It is google Id
 * @param AccessToken It is facebook Access Token
 * @param Email It is user's email with user sign in/sign up
 * @param Phone It is user's Phone number
 * @param Name It is user's Name
 * @returns if success {email, message, sessiontoken} else on reject {message}
 */

export default async function FacebookSign(request) {
  const userGoogleId = request.params.Id;
  const userAccessToken = request.params.AccessToken;
  const userEmail = request.params.Email;
  const phone = request.params.Phone;
  const name = request.params.Name;
  const authData = {
    facebook: { id: userGoogleId, access_token: userAccessToken },
  };
  const userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo("email", userEmail);
  const res = await userQuery.first({ useMasterKey: true });
  if (res) {
    try {
      const SignIn = await axios.put(
        serverUrl + "/users/" + res.id,
        { authData: authData },
        {
          headers: {
            "X-Parse-Application-Id": APPID,
            "X-Parse-Master-key": masterKEY,
          },
        }
      );

      if (SignIn.data) {
        // console.log("google Sign in", SignIn);
        const sessiontoken = SignIn.data.sessionToken;
        console.log("Google sessiontoken", sessiontoken);
        return {
          email: userEmail,
          message: "User Sign In",
          sessiontoken: sessiontoken,
        };
      }
    } catch (err) {
      console.log("err in user google sign in", err);
      return { message: "Internal server error" };
    }
  } else {
    // console.log("in sign up condition");
    try {
      const SignUp = await axios.post(
        serverUrl + "/users",
        {
          authData: authData,
          username: userEmail,
          email: userEmail,
          phone: phone,
          name: name,
        },
        {
          headers: {
            "X-Parse-Application-Id": APPID,
            "X-Parse-Revocable-Session": "1",
          },
        }
      );

      // console.log("SignUp", SignUp);

      if (SignUp.data) {
        const sessiontoken = SignUp.data.sessionToken;
        const payload = {
          email: userEmail,
          message: "User Sign Up",
          sessiontoken: sessiontoken,
        };
        return payload;
      }
    } catch (err) {
      console.log("err in user google sign up", err);
      return { message: "Internal server err" };
    }
  }
}
