export default async function deleteWebhook(request, response) {
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
    const user = await query.first({ useMasterKey: true });
    if (user) {
      const updateQuery = new Parse.Object('contracts_Users');
      updateQuery.id = user.id;
      updateQuery.unset('Webhook');
      const res = await updateQuery.save(null, { useMasterKey: true });
      if (res) {
        return response.json({
          result: 'Webhook deleted successfully!',
        });
      }
    } else {
      return response.status(404).json({ error: 'User not found!' });
    }
  } else {
    return response.status(405).json({ error: 'Invalid API Token!' });
  }
}
