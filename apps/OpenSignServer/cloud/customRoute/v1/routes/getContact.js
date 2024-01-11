export default async function getContact(request, response) {
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
      Contactbook.notEqualTo('IsDeleted', true);
      Contactbook.select('Name,Email,Phone');

      const res = await Contactbook.first({ useMasterKey: true });
      if (res) {
        const parseRes = JSON.parse(JSON.stringify(res));
        return response.json({
          code: 200,
          result: { objectId: parseRes.objectId, Name: parseRes.Name, Email: parseRes.Email },
        });
      } else {
        return response.json({ code: 404, message: 'Record not found!' });
      }
    } else {
      return response.json({ code: 405, message: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.json(err);
  }
}
