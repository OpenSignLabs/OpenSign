import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export default async function getTemplatetList(request, response) {
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
    const limit = request?.body?.limit ? request.body.limit : 100;
    const skip = request?.body?.skip ? request.body.skip : 0;

    const clsName = 'contracts_Template';
    const params = {
      Type: { $ne: 'Folder' },
      CreatedBy: {
        __type: 'Pointer',
        className: '_User',
        objectId: userId,
      },
      IsArchive: { $ne: true },
    };
    const keys = [
      'Name',
      'Note',
      'Description',
      'Folder.Name',
      'URL',
      'ExtUserPtr.Name',
      'Signers.Name',
    ];
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
  }
  return response.json({ code: 404, message: 'Invalid API Token!' });
}
