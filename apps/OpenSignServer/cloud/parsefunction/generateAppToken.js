import { generateApiKey } from 'generate-api-key';

export default async function generateAppToken(request) {
    const tokenQuery = new Parse.Query('appToken');
    tokenQuery.equalTo('Id', request.user.id);
    const token = await tokenQuery.first({ useMasterKey: true });
    if (token !== undefined) {
      // return exsiting Token
      console.log("API Token Exist");
      return token;
    } else {
      // Create New Token
      console.log("New API Token Generation");
      const appToken = Parse.Object.extend('appToken');
      const appTokenQuery = new appToken();
      const token = generateApiKey({ method: 'base62', prefix: 'opensign' });;
      appTokenQuery.set('token', token);
      appTokenQuery.set('Id',request.user.id);
  
      const newRes = await appTokenQuery.save(null, { useMasterKey: true });
      return newRes;
    }
};