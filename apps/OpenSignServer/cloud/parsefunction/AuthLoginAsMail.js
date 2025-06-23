import axios from 'axios';
import {
  cloudServerUrl,
  getTimestampInTimezone,
  insertDocumentHistoryRecord,
} from '../../Utils.js';
import { STRINGS } from '../../constants/strings.js';
import geoip from 'geoip-lite';

async function getDocument(docId) {
  try {
    const query = new Parse.Query('contracts_Document');
    query.equalTo('objectId', docId);
    query.include('ExtUserPtr');
    query.include('DocUniqueId');
    query.include('OpenSignAuthToken');
    query.notEqualTo('IsArchive', true);
    const res = await query.first({ useMasterKey: true });
    const _res = res.toJSON();
    return _res;
  } catch (err) {
    console.log('err ', err);
  }
}

async function AuthLoginAsMail(request) {
  try {
    //function for login user using user objectId without touching user's password
    const serverUrl = cloudServerUrl; //process.env.SERVER_URL;
    const APPID = process.env.APP_ID;
    const masterKEY = process.env.MASTER_KEY;
    const ip = request.headers['x-real-ip'];
    const geo = geoip.lookup(
      process.env.NODE_ENV === STRINGS.ENVIRONMENT.DEVELOPMENT ? process.env.TEST_IP : ip
    );
    let otpN = request.params.otp;
    let otp = parseInt(otpN);
    let email = request.params.email;
    const docId = request.params.docId;
    const phoneNo = request.params.phoneNo;

    let message;
    //checking otp is correct or not which already save in defaultdata_Otp class
    const checkOtp = new Parse.Query('defaultdata_Otp');
    checkOtp.equalTo('Email', email);
    const res = await checkOtp.first({ useMasterKey: true });

    if (res !== undefined) {
      let resOtp = res.get('OTP');

      if (resOtp === otp) {
        var result = await getToken(request);
        if (result) {
          const docRes = await getDocument(docId);

          if (!result?.emailVerified) {
            const userQuery = new Parse.Query(Parse.User);
            const user = await userQuery.get(result?.objectId, {
              sessionToken: result.sessionToken,
            });

            // Update the emailVerified field to true
            user.set('emailVerified', true);
            const res = await user.save(null, { useMasterKey: true });

            if (!res) {
              reject('User not found!');
              return;
            }
          }

          // Common logic for document history
          await insertDocumentHistoryRecord(
            docRes?.DocUniqueId,
            STRINGS.STATUS.OTPAUTHENTICATED,
            STRINGS.OTP.AUTHENTICATED.replace('$phoneNo', phoneNo).replace('$ipAddress', ip),
            request,
            ip,
            docRes?.OpenSignAuthToken,
            getTimestampInTimezone(geo.timezone)
          );

          return result;
        } else {
          reject('Result not found!');
        }

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
                      reject('user not found!');
                    }
                  })
                  .catch(err => {
                    reject('user not found!');
                  });

                // user couldn't find lets sign up!
              })
              .catch(() => {
                reject('user not found!');
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
