import axios from 'axios';
import dotenv from 'dotenv';
import { cloudServerUrl } from '../../../../Utils.js';
dotenv.config();
export async function generateSessionTokenByUsername(username) {
  try {
    // Query for the user by username
    const query = new Parse.Query(Parse.User);
    query.equalTo('username', username);
    const user = await query.first({ useMasterKey: true });

    if (user) {
      const userQuery = new Parse.Query(Parse.User);
      userQuery.equalTo('username', username);
      const userRes = await userQuery.first({ useMasterKey: true });

      if (userRes) {
        const url = `${cloudServerUrl}/loginAs`;
        const axiosRes = await axios({
          method: 'POST',
          url: url,
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'X-Parse-Application-Id': process.env.APP_ID,
            'X-Parse-Master-Key': process.env.MASTER_KEY,
          },
          params: {
            userId: userRes.id,
          },
        });
        const login = await axiosRes.data;
        // // console.log("login ", login);
        return { id: login.objectId, sessionToken: login.sessionToken };
      } else {
        throw new Error('User not found');
      }
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error generating session token:', error.message);
    throw error;
  }
}

export async function login(request, response) {
  try {
    const reqToken = request.headers['x-api-token'];
    if (!reqToken) {
      return response.status(400).json({ error: 'Please Provide API Token' });
    }
    const tokenQuery = new Parse.Query('appToken');
    tokenQuery.equalTo('token', reqToken);
    tokenQuery.include('userId');
    const token = await tokenQuery.first({ useMasterKey: true });
    if (token !== undefined) {
      const parseUser = JSON.parse(JSON.stringify(token));
      let result = await generateSessionTokenByUsername(parseUser.userId.username);
      result.url = `${process.env.PUBLIC_URL}/login/sender/${result.sessionToken}?goto=/report/6TeaPr321t`;
      return response.status(200).json(result);
      
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}

export async function getSignedUrlToDashboard(request, response) {
  try {
    const reqToken = request.headers['x-api-token'];
    if (!reqToken) {
      return response.status(400).json({ error: 'Please Provide API Token' });
    }
    const tokenQuery = new Parse.Query('appToken');
    tokenQuery.equalTo('token', reqToken);
    tokenQuery.include('userId');
    const token = await tokenQuery.first({ useMasterKey: true });
    if (token !== undefined) {
      const parseUser = JSON.parse(JSON.stringify(token));
      let result = await generateSessionTokenByUsername(parseUser.userId.username);
      result.url = `${process.env.PUBLIC_URL}/login/sender/${result.sessionToken}`;
      return response.status(200).json(result);
      
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}

export default login;
