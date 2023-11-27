// API V1 file to handle all API calls
export default async function v1(request) {
  var reqToken = request.params.appToken;
  var action = request.params.action;
  if (!reqToken) {
    return { message: 'Please Provide API Token' };
  }
  const tokenQuery = new Parse.Query('appToken');
  tokenQuery.equalTo('token', reqToken);
  const token = await tokenQuery.first({ useMasterKey: true });
  if (token !== undefined) {
    // Valid Token then proceed request
    const userId = token.get('Id');
    var result;
    switch(action)  {
      case 'getUser':
        let query = new Parse.Query(Parse.User);
        query.equalTo("objectId", userId);
        let user = await query.first({ useMasterKey: true });
        result = user;
        break;
    }
    return { message: 'Token Valid', result: result };
  }
  return { message: 'Request Invalid Please validate API Token or Request' };
};