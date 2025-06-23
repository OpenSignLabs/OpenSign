import axios from 'axios';
import reportJson from '../../../parsefunction/reportsJson.js';
import dotenv from 'dotenv';
import { cloudServerUrl } from '../../../../Utils.js';
dotenv.config();

export default async function getDocumentList(request, response) {
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
      const docType = request.params.doctype;
      const limit = request?.query?.limit ? request.query.limit : 100;
      const skip = request?.query?.skip ? request.query.skip : 0;
      let reportId;
      switch (docType) {
        case 'draft':
          reportId = 'ByHuevtCFY';
          break;
        case 'signaturerequest':
          reportId = '4Hhwbp482K';
          break;
        case 'inprogress':
          reportId = '1MwEuxLEkF';
          break;
        case 'completed':
          reportId = 'kQUoW4hUXz';
          break;
        case 'expired':
          reportId = 'zNqBHXHsYH';
          break;
        case 'declined':
          reportId = 'UPr2Fm5WY3';
          break;
        default:
          reportId = '';
      }
      const json = reportId && reportJson(reportId, userPtr.objectId);
      const clsName = 'contracts_Document';
      if (reportId && json) {
        const { params, keys } = json;
        const orderBy = '-updatedAt';
        const strParams = JSON.stringify(params);
        const strKeys = keys.join();
        const headers = {
          'Content-Type': 'application/json',
          'X-Parse-Application-Id': appId,
          'X-Parse-Master-Key': process.env.MASTER_KEY,
        };
        const url = `${serverUrl}/classes/${clsName}?where=${strParams}&keys=${strKeys},Placeholders&order=${orderBy}&skip=${skip}&limit=${limit}&include=AuditTrail.UserPtr,Placeholders.signerPtr`;
        try {
          const res = await axios.get(url, { headers: headers });
          if (res.data && res.data.results.length > 0) {
            if (request.posthog) {
              request.posthog?.capture({
                distinctId: parseUser.userId.email,
                event: `api_get_document_list_${docType}`,
                properties: { response_code: 200, doc_type: docType },
              });
            }
            const updateRes = res.data.results.map(x => ({
              objectId: x.objectId,
              title: x.Name,
              note: x.Note || '',
              folder: { objectId: x?.Folder?.objectId, name: x?.Folder?.Name } || '',
              // file: x?.SignedUrl || x.URL,
              owner: x?.ExtUserPtr?.Name,
              signers:
                x?.Placeholders?.map(y => ({
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
                })) ||
                x?.Signers?.map(y => ({ name: y?.Name, email: y?.Email, phone: y?.Phone })) ||
                [],
              sendInOrder: x?.SendinOrder || false,
              enableOTP: x?.IsEnableOTP || false,
              createdAt: x.createdAt,
              updatedAt: x.updatedAt,
            }));
            return response.json({ result: updateRes });
          } else {
            return response.json({ result: [] });
          }
        } catch (err) {
          console.log('err in getdocument list', err);
          if (request.posthog) {
            request.posthog?.capture({
              distinctId: parseUser.userId.email,
              event: `api_get_document_list_${docType}`,
              properties: { response_code: 400, doc_type: docType },
            });
          }
          return response
            .status(400)
            .json({ error: 'Something went wrong, please try again later!' });
        }
      } else {
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: `api_get_document_list_${docType}`,
            properties: { response_code: 404, doc_type: docType },
          });
        }
        return response.status(404).json({ error: 'Report not available!' });
      }
    }
    return response.status(405).json({ error: 'Invalid API Token!' });
  } catch (err) {
    console.log('Err', err);
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}
