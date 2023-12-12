export default async function deletedTemplate(request, response) {
  try {
    const reqToken = request.headers['x-api-token'];
    if (!reqToken) {
      return response.json({ message: 'Please Provide API Token' });
    }
    const tokenQuery = new Parse.Query('appToken');
    tokenQuery.equalTo('token', reqToken);
    const token = await tokenQuery.first({ useMasterKey: true });
    if (token !== undefined) {
      // Valid Token then proceed request
      const id = token.get('Id');
      const userId = { __type: 'Pointer', className: '_User', objectId: id };
      const template = new Parse.Query('contracts_Template');
      template.equalTo('objectId', request.params.template_id);
      template.equalTo('CreatedBy', userId);
      const res = await template.first({ useMasterKey: true });
      if (res) {
        const isDeleted = res.get('IsArchive');
        if (isDeleted && isDeleted) {
          return response.json({ code: 404, message: 'Record not found!' });
        } else {
          const template = Parse.Object.extend('contracts_Template');
          const deleteQuery = new template();
          deleteQuery.id = request.params.template_id;
          deleteQuery.set('IsArchive', true);
          const deleteRes = await deleteQuery.save(null, { useMasterKey: true });
          if (deleteRes) {
            return response.json({ code: 200, result: 'Record delete successfully!' });
          }
        }
      } else {
        return response.json({ code: 404, message: 'Record not found!' });
      }
    } else {
      return response.json({ code: 404, message: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.json(err);
  }
}
