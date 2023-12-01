import axios from 'axios';
import reportJson from '../../../parsefunction/reportsJson.js';
import dotenv from 'dotenv';
dotenv.config();

export default async function getDocumentList(request, response) {
  const reqToken = request.headers['x-api-token'];
  const appId = process.env.APP_ID;
  const serverUrl = process.env.SERVER_URL;
  if (!reqToken) {
    return response.json({ message: 'Please Provide API Token' });
  }
  const tokenQuery = new Parse.Query('appToken');
  tokenQuery.equalTo('token', reqToken);
  const token = await tokenQuery.first({ useMasterKey: true });
  if (token !== undefined) {
    // Valid Token then proceed request
    const userId = token.get('Id');
    const docType = request.body.doctype;
    const limit = request.body.limit;
    const skip = request.body.skip;
    let reportId;
    switch (docType) {
      case 'draftDocuments':
        reportId = 'ByHuevtCFY';
        break;
      case 'signatureRequest':
        reportId = '4Hhwbp482K';
        break;
      case 'inprogressDocuments':
        reportId = '1MwEuxLEkF';
        break;
      case 'completeDocuments':
        reportId = 'kQUoW4hUXz';
        break;
      case 'expiredDocuments':
        reportId = 'zNqBHXHsYH';
        break;
      case 'declinedDocuments':
        reportId = 'UPr2Fm5WY3';
        break;
    }
    const json = reportId && reportJson(reportId, userId);
    const clsName = 'contracts_Document';
    if (json) {
      const { params, keys } = json;
      const orderBy = '-updatedAt';
      const strParams = JSON.stringify(params);
      const strKeys = keys.join();
      const headers = {
        'Content-Type': 'application/json',
        'X-Parse-Application-Id': appId,
        'X-Parse-Master-Key': process.env.MASTER_KEY,
      };
      const url = `${serverUrl}/classes/${clsName}?where=${strParams}&keys=${strKeys}&order=${orderBy}&skip=${skip}&limit=${limit}&include=AuditTrail.UserPtr`;
      const res = await axios.get(url, { headers: headers });
      if (res.data && res.data.results) {
        return response.json({ code: 200, result: res.data.results });
      } else {
        return response.json({ code: 200, result: [] });
      }
    } else {
      return response.json({ code: 404, message: 'Report is not available!' });
    }
  }
  return response.json({ code: 404, message: 'Invalid API Token!' });
}
