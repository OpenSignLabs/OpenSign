export default async function getTemplate(request, response) {
  try {
    const reqToken = request.headers['x-api-token'];
    if (!reqToken) {
      return response.status(400).json({ error: 'Please Provide API Token' });
    }
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

      const Template = new Parse.Query('contracts_Template');
      Template.equalTo('objectId', request.params.template_id);
      Template.equalTo('CreatedBy', userPtr);
      Template.notEqualTo('IsArchive', true);
      Template.include('Signers');
      Template.include('Folder');
      Template.include('ExtUserPtr');
      Template.include('Placeholders.signerPtr');
      const res = await Template.first({ useMasterKey: true });
      if (res) {
        const template = JSON.parse(JSON.stringify(res));

        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_get_template',
            properties: { response_code: 200 },
          });
        }
        return response.json({
          objectId: template.objectId,
          title: template.Name,
          note: template.Note || '',
          folder: { objectId: template?.Folder?.objectId, name: template?.Folder?.Name } || '',
          file: template?.SignedUrl || template?.URL,
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
        });
      } else {
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_get_template',
            properties: { response_code: 404 },
          });
        }
        return response.status(404).json({ error: 'Template not found!' });
      }
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}
