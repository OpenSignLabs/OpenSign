export default async function GetTemplate(request) {
  const serverUrl = process.env.SERVER_URL;
  const templateId = request.params.templateId;

  try {
    const userRes = await axios.get(serverUrl + '/users/me', {
      headers: {
        'X-Parse-Application-Id': process.env.APP_ID,
        'X-Parse-Session-Token': request.headers['sessiontoken'],
      },
    });
    const userId = userRes.data && userRes.data.objectId;
    if (templateId && userId) {
      try {
        const template = new Parse.Query('contracts_Template');
        template.equalTo('objectId', templateId);
        template.include('ExtUserPtr');
        template.include('Signers');
        template.include('CreateBy');
        const res = template.first({ useMasterKey: true });
        if (res) {
          const acl = res.getACL();
          if (acl && acl.getReadAccess(userId)) {
            return res;
          } else {
            return { error: "You don't have access of this document!" };
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
