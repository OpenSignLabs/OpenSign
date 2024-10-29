import axios from 'axios';
import { cloudServerUrl, parseJwt } from '../../Utils.js';
import jwt from 'jsonwebtoken';

export default async function getDocument(request) {
  const serverUrl = cloudServerUrl; //process.env.SERVER_URL;
  const docId = request.params.docId;
  const jwttoken = request?.headers?.jwttoken || '';
  const sessiontoken = request?.headers?.sessiontoken || '';
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
          delete document?.ExtUserPtr?.TenantId?.PfxFile;
          if (!IsEnableOTP) {
            return document;
          } else {
            if (sessiontoken) {
              try {
                const userRes = await axios.get(serverUrl + '/users/me', {
                  headers: {
                    'X-Parse-Application-Id': process.env.APP_ID,
                    'X-Parse-Session-Token': sessiontoken,
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
            } else if (jwttoken) {
              try {
                const jwtDecode = parseJwt(jwttoken);
                if (jwtDecode?.user_email) {
                  const userCls = new Parse.Query(Parse.User);
                  userCls.equalTo('email', jwtDecode?.user_email);
                  const userRes = await userCls.first({ useMasterKey: true });
                  const userId = userRes?.id;
                  const tokenQuery = new Parse.Query('appToken');
                  tokenQuery.equalTo('userId', {
                    __type: 'Pointer',
                    className: '_User',
                    objectId: userId,
                  });
                  const appRes = await tokenQuery.first({ useMasterKey: true });
                  const decoded = jwt.verify(jwttoken, appRes?.get('token'));
                  if (decoded?.user_email) {
                    const acl = res.getACL();
                    if (userId && acl && acl.getReadAccess(userId)) {
                      return document;
                    } else {
                      return { error: "You don't have access of this document!" };
                    }
                  } else {
                    return { status: 'error', result: 'Invalid token!' };
                  }
                }
              } catch (err) {
                console.log('err in jwt', err);
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
