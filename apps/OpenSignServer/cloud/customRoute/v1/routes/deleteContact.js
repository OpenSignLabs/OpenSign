export default async function deleteContact(request, response) {
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
      const Contactbook = new Parse.Query('contracts_Contactbook');
      Contactbook.equalTo('objectId', request.params.contact_id);
      Contactbook.equalTo('CreatedBy', userId);
      const res = await Contactbook.first({ useMasterKey: true });
      if (res) {
        const isDeleted = res.get('IsDeleted');
        if (isDeleted && isDeleted) {
          return response.json({ code: 404, message: 'Record not found!' });
        } else {
          const Contactbook = Parse.Object.extend('contracts_Contactbook');
          const deleteQuery = new Contactbook();
          deleteQuery.id = request.params.contact_id;
          deleteQuery.set('IsDeleted', true);
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
