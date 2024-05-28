import axios from 'axios';
export default async function CreatePublicTemplate(request) {
  const templateId = request.params.templateId;
  const serverUrl = process.env.SERVER_URL;
  const appId = process.env.APP_ID;

  try {
    const userRes = await axios.get(serverUrl + '/users/me', {
      headers: {
        'X-Parse-Application-Id': appId,
        'X-Parse-Session-Token': request.headers['sessiontoken'],
      },
    });
    const userId = userRes.data && userRes.data.objectId;
    if (userId) {
      const Query = new Parse.Query('contracts_Template');
      Query.equalTo('CreatedBy', {
        __type: 'Pointer',
        className: '_User',
        objectId: userId,
      });
      const updateACL = await Query.get(templateId, { useMasterKey: true });
      const newACL = new Parse.ACL();
      newACL.setPublicReadAccess(true);
      newACL.setPublicWriteAccess(true);
      updateACL.setACL(newACL);
      updateACL.save(null, { useMasterKey: true });
      return {
        status: 'success',
      };
    }
  } catch (err) {
    if (err.code == 209) {
      return { error: 'Invalid session token' };
    } else {
      return { error: "You don't have access of this document!" };
    }
  }
}
