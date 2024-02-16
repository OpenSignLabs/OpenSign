export default async function getWebhook(request, response) {
  const reqToken = request.headers['x-api-token'];
  if (!reqToken) {
    return response.status(400).json({ error: 'Please Provide API Token' });
  }
  try {
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
      const query = new Parse.Query('contracts_Users');
      query.equalTo('UserId', userPtr);
      const user = await query.first({ useMasterKey: true });
      if (user) {
        const extUser = JSON.parse(JSON.stringify(user));
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_get_webhook',
            properties: { response_code: 200 },
          });
        }
        if (extUser && extUser.Webhook) {
          return response.json({
            webhook: extUser.Webhook,
          });
        } else {
          return response.json({});
        }
      } else {
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_get_webhook',
            properties: { response_code: 404 },
          });
        }
        return response.status(404).json({ error: 'User not found!' });
      }
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('Err ', err);
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}
