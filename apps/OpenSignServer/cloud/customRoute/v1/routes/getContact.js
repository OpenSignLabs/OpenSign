export default async function getContact(request, response) {
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

      const Contactbook = new Parse.Query('contracts_Contactbook');
      Contactbook.equalTo('objectId', request.params.contact_id);
      Contactbook.equalTo('CreatedBy', userPtr);
      Contactbook.notEqualTo('IsDeleted', true);
      Contactbook.select('Name,Email,Phone');

      const res = await Contactbook.first({ useMasterKey: true });
      if (res) {
        const parseRes = JSON.parse(JSON.stringify(res));
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_get_contact',
            properties: { response_code: 200 },
          });
        }
        return response.json({
          objectId: parseRes.objectId,
          name: parseRes.Name,
          email: parseRes.Email,
          phone: parseRes?.Phone || '',
          createdAt: parseRes.createdAt,
          updatedAt: parseRes.updatedAt,
        });
      } else {
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_get_contact',
            properties: { response_code: 404 },
          });
        }
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
