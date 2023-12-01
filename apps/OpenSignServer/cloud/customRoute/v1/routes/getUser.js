import dotenv from 'dotenv';
dotenv.config();

export default async function getUser(request, response) {
  const reqToken = request.headers['x-api-token'];
  if (!reqToken) {
    return response.json({ message: 'Please Provide API Token' });
  }
  const tokenQuery = new Parse.Query('appToken');
  tokenQuery.equalTo('token', reqToken);
  const token = await tokenQuery.first({ useMasterKey: true });
  if (token !== undefined) {
    // Valid Token then proceed request
    const userId = token.get('Id');
    const query = new Parse.Query(Parse.User);
    query.equalTo('objectId', userId);
    query.exclude('authData');
    let user = await query.first({ useMasterKey: true });
    const result = user;
    if (result) {
      return response.json({ code: 200, result: result });
    } else {
      return response.json({ code: 404, message: 'Record not found!' });
    }
  }
  return response.json({ code: 404, message: 'Invalid API Token!' });
}
