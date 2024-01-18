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
    const userPtr = token.get('userId');
    const query = new Parse.Query('contracts_Users');
    query.equalTo('UserId', userPtr);
    query.exclude('IsContactEntry,TourStatus,UserRole,TenantId,UserId,CreatedBy,Plan');
    const user = await query.first({ useMasterKey: true });
    if (user) {
      const parseRes = JSON.parse(JSON.stringify(user));
      return response.json({
        objectId: parseRes.objectId,
        Name: parseRes.Name,
        Email: parseRes.Email,
        Phone: parseRes.Phone,
        JobTitle: parseRes.JobTitle,
        Company: parseRes.Company,
        createdAt: parseRes.createdAt,
        updatedAt: parseRes.updatedAt,
      });
    } else {
      return response.status(404).json({ error: 'User not found!' });
    }
  }
  return response.status(405).json({ error: 'Invalid API Token!' });
}
