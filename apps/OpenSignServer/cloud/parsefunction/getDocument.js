import axios from 'axios';
import { cloudServerUrl } from '../../Utils.js';

export default async function getDocument(request) {
  const serverUrl = cloudServerUrl; //process.env.SERVER_URL;
  const docId = request.params.docId;

  try {
    if (docId) {
      try {
        const query = new Parse.Query('contracts_Document');
        query.equalTo('objectId', docId);
        query.include('ExtUserPtr');
        query.include('ExtUserPtr.TenantId');
        query.include('CreatedBy');
        query.include('Signers');
        query.include('AuditTrail.UserPtr');
        query.include('Placeholders');
        query.include('DeclineBy');
        query.notEqualTo('IsArchive', true);
        const res = await query.first({ useMasterKey: true });
        if (res) {
          const IsEnableOTP = res?.get('IsEnableOTP') || false;
          const document = JSON.parse(JSON.stringify(res));
          delete document.ExtUserPtr.TenantId.FileAdapters;
          if (!IsEnableOTP) {
            return document;
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
                  return document;
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
