export default async function getContact(request, response) {
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
      const Contactbook = new Parse.Query('contracts_Contactbook');
      Contactbook.equalTo('objectId', request.params.contact_id);
      Contactbook.equalTo('CreatedBy', userPtr);
      Contactbook.notEqualTo('IsDeleted', true);
      Contactbook.select('Name,Email,Phone');

      const res = await Contactbook.first({ useMasterKey: true });
      if (res) {
        const parseRes = JSON.parse(JSON.stringify(res));
        return response.json({
          objectId: parseRes.objectId,
          Name: parseRes.Name,
          Email: parseRes.Email,
          Phone: parseRes.Phone,
          createdAt: parseRes.createdAt,
          updatedAt: parseRes.updatedAt,
        });
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
