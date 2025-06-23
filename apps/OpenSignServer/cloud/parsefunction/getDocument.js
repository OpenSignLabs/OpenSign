import axios from 'axios';
import { cloudServerUrl } from '../../Utils.js';

export default async function getDocument(request) {
  const serverUrl = cloudServerUrl; //process.env.SERVER_URL;
  const docId = request.params.docId;
  const contactId = request.params.contactId;

  try {
    if (docId) {
      try {
        const query = new Parse.Query('contracts_Document');
        query.equalTo('objectId', docId);
        query.include('ExtUserPtr');
        query.include('CreatedBy');
        query.include('Signers');
        query.include('AuditTrail.UserPtr');
        query.include('Placeholders');
        query.include('DeclineBy');
        query.notEqualTo('IsArchive', true);
        const res = await query.first({ useMasterKey: true });
        if (res) {
          const signersArr = res?.get('Signers');
          const signer1OTPRequired = res?.get('Signer1OTPRequired');
          const signer2OTPRequired = res?.get('Signer2OTPRequired');
          const enableOTP = signersArr[0].id == contactId ? signer1OTPRequired : signer2OTPRequired;
          // const IsEnableOTP = res?.get('IsEnableOTP') || false;
          const IsEnableOTP = enableOTP || false;
          if (!IsEnableOTP) {
            return res;
          } else {
            if (request?.headers?.['sessiontoken']) {
              try {
                const userRes = await axios.get(serverUrl + '/users/me', {
                  headers: {
                    'X-Parse-Application-Id': process.env.APP_ID,
                    'X-Parse-Session-Token': request.headers['sessiontoken'],
                  },
                });
                const userId = userRes.data && userRes.data?.objectId;
                const acl = res.getACL();
                if (userId && acl && acl.getReadAccess(userId)) {
                  return res;
                } else {
                  return { error: "You don't have access of this document!" };
                }
              } catch (err) {
                console.log('err user in not authenticated', err);
                return { error: "You don't have access of this document!" };
              }
            } else {
              return { error: "You don't have access of this document!" };
            }
          }
        } else {
          return { error: "You don't have access of this document!" };
        }
      } catch (err) {
        console.log('err', err);
        return err;
      }
    } else {
      return { error: 'Please pass required parameters!' };
    }
  } catch (err) {
    console.log('err', err);
    if (err.code == 209) {
      return { error: 'Invalid session token' };
    } else {
      return { error: "You don't have access of this document!" };
    }
  }
}
