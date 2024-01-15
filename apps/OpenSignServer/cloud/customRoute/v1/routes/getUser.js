import dotenv from 'dotenv';
dotenv.config();

export default async function getUser(request, response) {
  const reqToken = request.headers['x-api-token'];
  if (!reqToken) {
    return response.status(400).json({ error: 'Please Provide API Token' });
  }
  const tokenQuery = new Parse.Query('appToken');
  tokenQuery.equalTo('token', reqToken);
  const token = await tokenQuery.first({ useMasterKey: true });
  if (token !== undefined) {
    // Valid Token then proceed request
    const userId = token.get('Id');
    const query = new Parse.Query('contracts_Users');
    query.equalTo('UserId', { __type: 'Pointer', className: '_User', objectId: userId });
    query.exclude('IsContactEntry,TourStatus,UserRole,TenantId,UserId,CreatedBy,Plan');
    let user = await query.first({ useMasterKey: true });
    const result = user;
    if (result) {
      return response.json({ result: result });
    } else {
      return response.status(404).json({ error: 'User not found!' });
    }
  }
  return response.status(405).json({ error: 'Invalid API Token!' });
}
