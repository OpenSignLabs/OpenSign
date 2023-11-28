import reportJson from './reportsJson.js';
import axios from 'axios';

// API V1 file to handle all API calls
export default async function v1(request) {
  var reqToken = request.params.appToken;
  var action = request.params.action;
  const appId = process.env.APP_ID;
  const serverUrl = process.env.SERVER_URL;
  if (!reqToken) {
    return { message: 'Please Provide API Token' };
  }
  const tokenQuery = new Parse.Query('appToken');
  tokenQuery.equalTo('token', reqToken);
  const token = await tokenQuery.first({ useMasterKey: true });
  if (token !== undefined) {
    // Valid Token then proceed request
    const userId = token.get('Id');
    var result;
    switch(action)  {
      case 'getUser':
        let query = new Parse.Query(Parse.User);
        query.equalTo("objectId", userId);
        let user = await query.first({ useMasterKey: true });
        result = user;
        break;
      case 'getDocuments':
        const docType = request.params.docType;
        const limit = request.params.limit;
        const skip = request.params.skip;
        var reportId;
        switch(docType) {
          case 'draft':
            reportId = 'kC5mfynCi4';
            break;
          case 'signatureRequest':
            reportId = '5Go51Q7T8r';
            break;
          case 'signatureSent':
            reportId = 'd9k3UfYHBc';
            break;
          case 'signatureComplete':
            reportId = 'kQUoW4hUXz';
            break;
          case 'expiredDocument':
            reportId = 'zNqBHXHsYH';
            break;
          case 'declinedDocument':
            reportId = 'UPr2Fm5WY3';
            break;
          case 'inProgressDocument':
            reportId = '1MwEuxLEkF';
            break;
          case 'selfSignatureDocument':
            reportId = '4Hhwbp482K';
            break;
        }
        const json = reportId && reportJson(reportId, userId);
        const clsName = reportId === '5KhaPr482K' ? 'contracts_Contactbook' : 'contracts_Document';
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
            return res.data.results;
          } else {
            return [];
          }
        } else {
          return { error: 'Report is not available!' };
        }
        break;
    }
    return { message: 'Token Valid', result: result };
  }
  return { message: 'Request Invalid Please validate API Token or Request' };
};
