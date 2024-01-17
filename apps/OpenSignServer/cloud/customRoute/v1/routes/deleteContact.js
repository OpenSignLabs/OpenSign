export default async function deleteContact(request, response) {
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
      const id = token.get('Id');
      const userId = { __type: 'Pointer', className: '_User', objectId: id };
      const Contactbook = new Parse.Query('contracts_Contactbook');
      Contactbook.equalTo('objectId', request.params.contact_id);
      Contactbook.equalTo('CreatedBy', userId);
      const res = await Contactbook.first({ useMasterKey: true });
      if (res) {
        const isDeleted = res.get('IsDeleted');
        if (isDeleted && isDeleted) {
          return response.status(404).json({ error: 'Contact not found!' });
        } else {
          const Contactbook = Parse.Object.extend('contracts_Contactbook');
          const deleteQuery = new Contactbook();
          deleteQuery.id = request.params.contact_id;
          deleteQuery.set('IsDeleted', true);
          const deleteRes = await deleteQuery.save(null, { useMasterKey: true });
          if (deleteRes) {
            return response.json({
              objectId: request.params.contact_id,
              deletedAt: deleteRes.get('updatedAt'),
            });
          }
        }
      } else {
        return response.status(404).json({ error: 'Contact not found!' });
      }
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}
