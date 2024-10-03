import axios from 'axios';
import { cloudServerUrl } from '../../Utils.js';
export default async function getDrive(request) {
  const serverUrl = cloudServerUrl; //process.env.SERVER_URL;
  const appId = process.env.APP_ID;
  const limit = request.params.limit;
  const skip = request.params.skip;
  const classUrl = serverUrl + '/classes/contracts_Document';
  const docId = request.params.docId;
  try {
    const userRes = await axios.get(serverUrl + '/users/me', {
      headers: {
        'X-Parse-Application-Id': appId,
        'X-Parse-Session-Token': request.headers['sessiontoken'],
      },
    });
    const userId = userRes.data && userRes.data.objectId;
    if (userId) {
      let url;
      if (docId) {
        url = `${classUrl}?where={"Folder":{"__type":"Pointer","className":"contracts_Document","objectId":"${docId}"},"CreatedBy":{"__type":"Pointer","className":"_User","objectId":"${userId}"},"IsArchive":{"$ne":true}}&include=ExtUserPtr,Signers,Folder&order=-updatedAt&skip=${skip}&limit=${limit}`;
      } else {
        url = `${classUrl}?where={"Folder":{"$exists":false},"CreatedBy":{"__type":"Pointer","className":"_User","objectId":"${userId}"},"IsArchive":{"$ne":true}}&include=ExtUserPtr,Signers&order=-updatedAt&skip=${skip}&limit=${limit}`;
      }
      try {
        const res = await axios.get(url, {
          headers: {
            'X-Parse-Application-Id': appId,
            'X-Parse-Master-key': process.env.MASTER_KEY,
          },
        });
        // console.log('res.data.results ', res.data.results);
        if (res.data && res.data.results) {
          return res.data.results;
        } else {
          return [];
        }
      } catch (err) {
        console.log('err', err);
        return { error: "You don't have access to drive" };
      }
    } else {
      return { error: 'Please provide required parameter!' };
    }
  } catch (err) {
    console.log('err', err);
    if (err.code == 209) {
      return { error: 'Invalid session token' };
    } else {
      return { error: "You don't have access!" };
    }
  }
}
