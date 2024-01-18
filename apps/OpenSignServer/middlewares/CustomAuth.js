
import dotenv from 'dotenv';
dotenv.config();

import AWS from 'aws-sdk';

const checkValidity = async (access_token) =>  {
    let cognitoIdentityClient = new AWS.CognitoIdentityServiceProvider({
        accessKeyId: process.env.DO_ACCESS_KEY_ID,
        secretAccessKey: process.env.DO_SECRET_ACCESS_KEY,
        region: process.env.DO_REGION
    });
     
    const params = {
        AccessToken: access_token
    };

    return await cognitoIdentityClient.getUser(params).promise();

}

const validateToken = async (req) => {
    try {
        let access_token;
        const authHeader = req.get('Authorization');

        if (!authHeader) {
            throw new Error('Token Required');
        }

        const parts = authHeader.split(' ');

        if (parts.length !== 2) {
            throw new Error('Token is not valid');
        }
        const scheme = parts[0];
        const token = parts[1];
        if (/^Bearer$/i.test(scheme)) {
            access_token = token;
        } else {
            throw new Error('Token is not valid');
        }

       return await checkValidity(access_token);
    } catch (error) {
        throw error;
    }
}

// Returns a promise that fulfills if this user mail is valid.
export const validateAuthData = async (req, res, next) => {
    let pathsToIgnore = ['/app/health', '/app/classes/Migration', '/app/functions/login', '/app/functions/getTokens']
    try{
        if(!pathsToIgnore.includes(req.path)) {
           await validateToken(req, res, next)
        }
    } catch(err) {
        next(err)
    }
   
   next();
  }
  
  // Returns a promise that fulfills if this app id is valid.
export const validateAppId = () => {
    return Promise.resolve();
}
  