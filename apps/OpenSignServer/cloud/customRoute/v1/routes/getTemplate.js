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
          Title: template.Name,
          Note: template.Note || '',
          Folder: template?.Folder?.Name || 'OpenSign™ Drive',
          File: template?.SignedUrl || x.URL,
          Owner: template?.ExtUserPtr?.Name,
          Signers: template?.Signers?.map(y => y?.Name) || '',
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
