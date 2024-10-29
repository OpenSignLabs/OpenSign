import { generateSessionTokenByUsername } from './login.js';
import { generateApiKey } from 'generate-api-key';

async function saveUser(userDetails) {
  const userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('username', userDetails.email);
  const userRes = await userQuery.first({ useMasterKey: true });

  if (userRes) {
    return userRes;
  }
  const user = new Parse.User();
  user.set('username', userDetails.email);
  user.set('password', userDetails.password);
  user.set('email', userDetails.email);
  user.set('name', userDetails.name);

  return await user.signUp();
}
export default async function createUser(request, response) {
    const reqToken = request.headers['x-api-token'];
    if (!reqToken) {
      return response.status(400).json({ error: 'Please Provide API Token' });
    }
    const tokenQuery = new Parse.Query('appToken');
    tokenQuery.equalTo('token', reqToken);
    tokenQuery.include('userId');
    const token = await tokenQuery.first({ useMasterKey: true });
    if(!token) {
        return response.status(405).json({ error: 'Invalid API Token!' });
    }
  const userDetails = request.body;
  const user = await saveUser(userDetails);
  const currentUser = token.get('userId');
  const contractsUsersQuery = new Parse.Query('contracts_Users');
  contractsUsersQuery.equalTo('UserId', {
    __type: 'Pointer',
    className: '_User',
    objectId: currentUser.id,
  });
  const contractsUser = await contractsUsersQuery.first({ useMasterKey: true });

  if (!contractsUser) {
    return response.status(404).json({ error: 'User data not found in contracts_Users' });
  }

  const organizationId = contractsUser.get('OrganizationId');
  const teamIds = contractsUser.get('TeamIds');

  if (!organizationId || !teamIds || teamIds.length === 0) {
    return response.status(404).json({ error: 'Organization or Team information is missing' });
  }

  try {
    const extClass = userDetails.role.split('_')[0];

    const extQuery = new Parse.Query(extClass + '_Users');
    extQuery.equalTo('UserId', {
      __type: 'Pointer',
      className: '_User',
      objectId: user.id,
    });
    const extUser = await extQuery.first({ useMasterKey: true });
    if (extUser) {
        return response.status(400).json({ error: 'User already exist' });
    } else {
      
      const extCls = Parse.Object.extend(extClass + '_Users');
      const newObj = new extCls();
      newObj.set('UserId', {
        __type: 'Pointer',
        className: '_User',
        objectId: user.id,
      });
      newObj.set('UserRole', userDetails.role);
      newObj.set('Email', userDetails.email);
      newObj.set('Name', userDetails.name);
      newObj.set('TenantId', contractsUser.get('TenantId'));
      newObj.set('OrganizationId', organizationId);
      newObj.set('TeamIds', teamIds); 

      await newObj.save(null, { useMasterKey: true });
      const api = await generateApiTokenForUser(userDetails.email);
      return response.status(201).json(api);
    }
  } catch (err) {
    console.log('Err ', err);
  }
}

async function generateApiTokenForUser(username) {
    try {
      const userQuery = new Parse.Query('_User');
      userQuery.equalTo('username', username);
      const user = await userQuery.first({ useMasterKey: true });
  
      if (user) {
        const userId = user.id;
  
        // Check if a token already exists for the user
        const tokenQuery = new Parse.Query('appToken');
        tokenQuery.equalTo('userId', { __type: 'Pointer', className: '_User', objectId: userId });
        const token = await tokenQuery.first({ useMasterKey: true });
  
        if (token) {
          // Regenerate the existing API token
          console.log('Regenerating API Token');
          const AppToken = Parse.Object.extend('appToken');
          const updateToken = new AppToken();
          updateToken.id = token.id;
          const newToken = generateApiKey({ method: 'base62', prefix: 'opensign' });
          updateToken.set('token', newToken);
          const updatedRes = await updateToken.save(null, { useMasterKey: true });
          return updatedRes;
        } else {
          // Generate a new API token
          console.log('Generating New API Token');
          const AppToken = Parse.Object.extend('appToken');
          const newTokenObj = new AppToken();
          const newToken = generateApiKey({ method: 'base62', prefix: 'opensign' });
          newTokenObj.set('token', newToken);
          newTokenObj.set('userId', { __type: 'Pointer', className: '_User', objectId: userId });
          const newRes = await newTokenObj.save(null, { useMasterKey: true });
          return newRes;
        }
      } else {
        return 'User not found!';
      }
    } catch (err) {
      console.error('Error generating API token:', err);
      throw err;
    }
  }
