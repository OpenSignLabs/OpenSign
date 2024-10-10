import axios from 'axios';
import dotenv from 'dotenv';
import { cloudServerUrl } from '../../../../Utils.js';
dotenv.config();
export default async function getTemplatetList(request, response) {
  const reqToken = request.headers['x-api-token'];
  const appId = process.env.APP_ID;
  const serverUrl = cloudServerUrl; //process.env.SERVER_URL;
  if (!reqToken) {
    return response.status(400).json({ error: 'Please Provide API Token' });
  }
  try {
    const tokenQuery = new Parse.Query('appToken');
    tokenQuery.equalTo('token', reqToken);
    tokenQuery.include('userId');
    const token = await tokenQuery.first({ useMasterKey: true });
    if (token !== undefined) {
      // Valid Token then proceed request
      const parseUser = JSON.parse(JSON.stringify(token));
      const userPtr = {
        __type: 'Pointer',
        className: '_User',
        objectId: parseUser.userId.objectId,
      };

      const limit = request?.query?.limit ? request.query.limit : 100;
      const skip = request?.query?.skip ? request.query.skip : 0;

      const clsName = 'contracts_Template';
      const params = {
        Type: { $ne: 'Folder' },
        CreatedBy: userPtr,
        IsArchive: { $ne: true },
      };
      const keys = [
        'Name',
        'Note',
        'Description',
        'Folder.Name',
        'URL',
        'SignedUrl',
        'ExtUserPtr.Name',
        'Signers.Name',
        'Signers.Email',
        'Signers.Phone',
        'Placeholders',
      ];
      const orderBy = '-updatedAt';
      const strParams = JSON.stringify(params);
      const strKeys = keys.join();
      const headers = {
        'Content-Type': 'application/json',
        'X-Parse-Application-Id': appId,
        'X-Parse-Master-Key': process.env.MASTER_KEY,
      };
      const url = `${serverUrl}/classes/${clsName}?where=${strParams}&keys=${strKeys}&order=${orderBy}&skip=${skip}&limit=${limit}&include=AuditTrail.UserPtr,Placeholders.signerPtr,ExtUserPtr.TenantId`;
      const res = await axios.get(url, { headers: headers });
      if (res.data && res.data.results.length > 0) {
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_get_template_list',
            properties: { response_code: 200 },
          });
        }
        const updateRes = res.data.results.map(template => ({
          objectId: template.objectId,
          title: template.Name,
          note: template.Note || '',
          folder: { objectId: template?.Folder?.objectId, name: template?.Folder?.Name } || '',
          file: template?.SignedUrl || template.URL,
          owner: template?.ExtUserPtr?.Name,
          signers:
            template?.Placeholders?.map(y => ({
              role: y.Role,
              name: y?.signerPtr?.Name || '',
              email: y?.signerPtr?.Email || '',
              phone: y?.signerPtr?.Phone || '',
              widgets: y.placeHolder?.flatMap(x =>
                x?.pos.map(w => ({
                  type: w?.type ? w.type : w.isStamp ? 'stamp' : 'signature',
                  x: w.xPosition,
                  y: w.yPosition,
                  w: w?.Width || 150,
                  h: w?.Height || 60,
                  page: x?.pageNumber,
                }))
              ),
            })) || [],
          sendInOrder: template?.SendinOrder || false,
          enableOTP: template?.IsEnableOTP || false,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
          enableTour: template?.IsTourEnabled || false,
        }));

        return response.json({ result: updateRes });
      } else {
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_get_template_list',
            properties: { response_code: 200 },
          });
        }
        return response.json({ result: [] });
      }
    }
    return response.status(405).json({ error: 'Invalid API Token!' });
  } catch (err) {
    console.log('err', err);
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}
