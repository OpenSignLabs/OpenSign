export default async function getTemplate(request, response) {
  try {
    const reqToken = request.headers['x-api-token'];
    if (!reqToken) {
      return response.status(400).json({ error: 'Please Provide API Token' });
    }
    const tokenQuery = new Parse.Query('appToken');
    tokenQuery.equalTo('token', reqToken);
    const token = await tokenQuery.first({ useMasterKey: true });
    if (token !== undefined) {
      // Valid Token then proceed request
      const userPtr = token.get('userId');
      const Template = new Parse.Query('contracts_Template');
      Template.equalTo('objectId', request.params.template_id);
      Template.equalTo('CreatedBy', userPtr);
      Template.notEqualTo('IsArchive', true);
      Template.include('Signers');
      Template.include('Folder');
      Template.include('ExtUserPtr');
      const res = await Template.first({ useMasterKey: true });
      if (res) {
        const template = JSON.parse(JSON.stringify(res));
        return response.json({
          objectId: template.objectId,
          title: template.Name,
          note: template.Note || '',
          folder: { objectId: template?.Folder?.objectId, name: template?.Folder?.Name } || '',
          file: template?.SignedUrl || x.URL,
          owner: template?.ExtUserPtr?.Name,
          signers:
            template?.Signers?.map(y => ({ name: y?.Name, email: y?.Email, phone: y?.Phone })) ||
            [],
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
        });
      } else {
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
