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
      const id = token.get('Id');
      const userId = { __type: 'Pointer', className: '_User', objectId: id };
      const limit = request?.query?.limit ? request.query.limit : 100;
      const skip = request?.query?.skip ? request.query.skip : 0;
      const Contactbook = new Parse.Query('contracts_Contactbook');
      Contactbook.equalTo('CreatedBy', userId);
      Contactbook.notEqualTo('IsDeleted', true);
      Contactbook.limit(limit);
      Contactbook.skip(skip);
      const res = await Contactbook.find({ useMasterKey: true });
      if (res && res.length > 0) {
        return response.json({ result: res });
      } else {
        return response.json({ result: [] });
      }
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.json(err);
  }
}
