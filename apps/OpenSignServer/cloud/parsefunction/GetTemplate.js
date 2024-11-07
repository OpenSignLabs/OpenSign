import axios from 'axios';
import { cloudServerUrl, parseJwt } from '../../Utils.js';
import jwt from 'jsonwebtoken';

export default async function GetTemplate(request) {
  const serverUrl = cloudServerUrl; //process.env.SERVER_URL;
  const templateId = request.params.templateId;
  const ispublic = request.params.ispublic;
  const jwttoken = request.headers?.jwttoken;
  const sessiontoken = request.headers?.sessiontoken;
  try {
    if (!ispublic) {
      let userEmail;
      if (jwttoken) {
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
              userEmail = decoded?.user_email;
            } else {
              return { error: 'Invalid token!' };
            }
          } else {
            return { error: 'Invalid token!' };
          }
        } catch (err) {
          console.log('err in jwt', err);
          return { error: "You don't have access of this document!" };
        }
      } else if (sessiontoken) {
        const userRes = await axios.get(serverUrl + '/users/me', {
          headers: {
            'X-Parse-Application-Id': process.env.APP_ID,
            'X-Parse-Session-Token': sessiontoken,
          },
        });
        userEmail = userRes.data && userRes.data.email;
      }
      if (templateId && userEmail) {
        try {
          let template = new Parse.Query('contracts_Template');
          template.equalTo('objectId', templateId);
          template.include('ExtUserPtr');
          template.include('Signers');
          template.include('CreatedBy');
          template.include('ExtUserPtr.TenantId');
          const extUserQuery = new Parse.Query('contracts_Users');
          extUserQuery.equalTo('Email', userEmail);
          extUserQuery.include('TeamIds');
          const extUser = await extUserQuery.first({ useMasterKey: true });
          if (extUser) {
            const _extUser = JSON.parse(JSON.stringify(extUser));
            if (_extUser?.TeamIds && _extUser.TeamIds?.length > 0) {
              let teamsArr = [];
              _extUser?.TeamIds?.forEach(x => (teamsArr = [...teamsArr, ...x.Ancestors]));
              // Create the first query
              const sharedWithQuery = new Parse.Query('contracts_Template');
              sharedWithQuery.containedIn('SharedWith', teamsArr);

              // Create the second query
              const createdByQuery = new Parse.Query('contracts_Template');
              createdByQuery.equalTo('ExtUserPtr', {
                __type: 'Pointer',
                className: 'contracts_Users',
                objectId: extUser.id,
              });
              template = Parse.Query.or(sharedWithQuery, createdByQuery);
              template.equalTo('objectId', templateId);
              template.include('ExtUserPtr');
              template.include('Signers');
              template.include('CreatedBy');
              template.include('ExtUserPtr.TenantId');
              template.include('Placeholders.signerPtr');
            }
          }
          const res = await template.first({ useMasterKey: true });
          if (res) {
            const templateRes = JSON.parse(JSON.stringify(res));
            delete templateRes?.ExtUserPtr?.TenantId?.FileAdapters;
            delete templateRes?.ExtUserPtr?.TenantId?.PfxFile;
            return templateRes;
          } else {
            return { error: "You don't have access of this document!" };
          }
        } catch (err) {
          console.log('err', err);
          return err;
        }
      } else {
        return { error: "You don't have access of this document!" };
      }
    } else if (templateId && ispublic) {
      try {
        const template = new Parse.Query('contracts_Template');
        template.equalTo('objectId', templateId);
        template.include('ExtUserPtr');
        template.include('Signers');
        template.include('CreatedBy');
        template.include('ExtUserPtr.TenantId');
        const res = await template.first({ useMasterKey: true });
        // console.log("res ", res)
        if (res) {
          const templateRes = JSON.parse(JSON.stringify(res));
          delete templateRes?.ExtUserPtr?.TenantId?.FileAdapters;
          delete templateRes?.ExtUserPtr?.TenantId?.PfxFile;
          return templateRes;
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
    if (err?.response?.data?.code === 209 || err.code == 209) {
      return { error: 'Invalid session token' };
    } else {
      return { error: "You don't have access of this document!" };
    }
  }
}
