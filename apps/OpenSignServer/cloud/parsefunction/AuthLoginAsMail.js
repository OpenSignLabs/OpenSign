import axios from 'axios';
async function AuthLoginAsMail(request) {
  try {
    //function for login user using user objectId without touching user's password
    const serverUrl = process.env.SERVER_URL;
    const APPID = process.env.APP_ID;
    const masterKEY = process.env.MASTER_KEY;

    let otpN = request.params.otp;
    let otp = parseInt(otpN);
    let email = request.params.email;

    let message;
    //checking otp is correct or not which already save in defaultdata_Otp class
    const checkOtp = new Parse.Query('defaultdata_Otp');
    checkOtp.equalTo('Email', email);
    const res = await checkOtp.first({ useMasterKey: true });

    if (res !== undefined) {
      let resOtp = res.get('OTP');

      if (resOtp === otp) {
        var result = await getToken(request);
        return result;

        async function getToken(request) {
          return new Promise(function (resolve, reject) {
            var query = new Parse.Query(Parse.User);
            query.equalTo('email', email);
            query
              .first({ useMasterKey: true })
              .then(user => {
                //call loginAs function to use login method passing user objectId as a userId

                const url = `${serverUrl}/loginAs`;
                axios({
                  method: 'POST',
                  url: url,
                  headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                    'X-Parse-Application-Id': APPID,
                    'X-Parse-Master-Key': masterKEY,
                  },
                  params: {
                    userId: user.id,
                  },
                })
                  .then(function (res) {
                    // console.log(res.data)
                    if (res.data) {
                      resolve(res.data);
                    } else {
                      reject('User not found!');
                    }
                  })
                  .catch(err => {
                    reject('user not found!');
                  });
                // user couldn't find lets sign up!
              })
              .catch(() => {
                let user = new Parse.User();
                user.set('username', email);
                user.set('email', email);
                user.set('password', '12345');
                user
                  .save()
                  .then(token => {
                    var error = token == '' ? true : false;
                    if (error) {
                      reject('result not found!');
                    } else {
                      resolve(token);
                    }
                  })
                  .catch(e => {
                    console.log('error in auth');
                    reject('user already exists!');
                    console.log(e);
                  });
              });
          });
        }
      } else {
        message = `Invalid Otp`;
        return message;
      }
    } else {
      message = 'user not found!';
      return message;
    }
  } catch (err) {
    console.log('err in Auth');
    console.log(err);
    return 'Result not found', err;
  }
}
export default AuthLoginAsMail;
