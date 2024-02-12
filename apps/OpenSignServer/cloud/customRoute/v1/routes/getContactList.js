export default async function getContactList(request, response) {
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
      const limit = request?.query?.limit ? parseInt(request.query.limit) : 100;
      const skip = request?.query?.skip ? parseInt(request.query.skip) : 0;
      const Contactbook = new Parse.Query('contracts_Contactbook');
      Contactbook.equalTo('CreatedBy', userPtr);
      Contactbook.notEqualTo('IsDeleted', true);
      Contactbook.limit(limit);
      Contactbook.skip(skip);
      Contactbook.descending('createdAt');
      const res = await Contactbook.find({ useMasterKey: true });
      if (res && res.length > 0) {
        const parseRes = JSON.parse(JSON.stringify(res));
        const contactlist = parseRes.map(x => ({
          objectId: x.objectId,
          name: x.Name,
          email: x.Email,
          phone: x.Phone,
          createdAt: x.createdAt,
          updatedAt: x.updatedAt,
        }));
        return response.json({ result: contactlist });
      } else {
        return response.json({ result: [] });
      }
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}
