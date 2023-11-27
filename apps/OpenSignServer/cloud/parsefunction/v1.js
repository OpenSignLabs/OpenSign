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
    switch(action)  {
      case 'getUser':
        var username = request.params.username;
        var password = request.params.password;
        await Parse.User.logIn(username, password)
        .then(async (user) => {
          if (user) {
            return user;
          }
          console.log(user)
        });
        break;
    }
    return { message: 'Token Valid' };
  }
  return { message: 'Request Invalid Please validate API Token or Request' };
};