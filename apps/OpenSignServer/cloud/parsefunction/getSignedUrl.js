import AWS from 'aws-sdk';
import { useLocal } from '../../Utils.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

export default function getPresignedUrl(url) {
  if (url?.includes('files')) {
    return presignedlocalUrl(url);
  } else {
    const credentials = {
      accessKeyId: process.env.DO_ACCESS_KEY_ID,
      secretAccessKey: process.env.DO_SECRET_ACCESS_KEY,
    };
    AWS.config.update({
      credentials: credentials,
      region: process.env.DO_REGION,
    });
    const spacesEndpoint = new AWS.Endpoint(process.env.DO_ENDPOINT);

    const s3 = new AWS.S3({ endpoint: spacesEndpoint, signatureVersion: 'v4' });

    // Create a new URL object
    const parsedUrl = new URL(url);
    // Get the pathname of the URL
    const pathname = parsedUrl.pathname;
    // Extract the filename from the pathname
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);

    // presignedGETURL return presignedUrl with expires time
    const presignedGETURL = s3.getSignedUrl('getObject', {
      Bucket: process.env.DO_SPACE,
      Key: filename, //filename
      Expires: 160, //time to expire in seconds
    });
    return presignedGETURL;
  }
}

export async function getSignedUrl(request) {
  try {
    const docId = request.params.docId || '';
    const templateId = request.params.templateId || '';
    const url = request.params.url;
    if (docId || templateId) {
      try {
        if (url?.includes('files')) {
          return presignedlocalUrl(url);
        } else if (useLocal !== 'true') {
          const query = new Parse.Query(docId ? 'contracts_Document' : 'contracts_Template');
          query.equalTo('objectId', docId ? docId : templateId);
          query.include('ExtUserPtr.TenantId');
          query.notEqualTo('IsArchive', true);
          const res = await query.first({ useMasterKey: true });
          if (!res) return url;

          const _resDoc = res?.toJSON();
          // Ensure user is authenticated if OTP is required
          if (_resDoc?.IsEnableOTP && !request?.user) {
            throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
          }

          const presignedUrl = getPresignedUrl(url);
          return presignedUrl;
        } else {
          return url;
        }
      } catch (err) {
        console.log('Err in presigned url', err);
        throw err;
      }
    } else {
      if (!request?.user) {
        throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
      } else {
        if (url?.includes('files')) {
          return presignedlocalUrl(url);
        } else if (useLocal !== 'true') {
          const presignedUrl = getPresignedUrl(url);
          return presignedUrl;
        } else {
          return url;
        }
      }
    }
  } catch (err) {
    console.log('error in getsignedurl', err);
    const code = err.code || 400;
    const msg = err.message;
    const error = new Parse.Error(code, msg);
    throw error;
  }
}

// Function to generate a signed URL with JWT
export function getSignedLocalUrl(fileUrl, expirationTimeInSeconds) {
  const secretKey = process.env.MASTER_KEY;
  const exp = expirationTimeInSeconds || 200;
  try {
    // Create the payload with the file URL and expiration time
    const payload = {
      fileUrl,
      exp: Math.floor(Date.now() / 1000) + exp, // Expiry time in seconds
    };

    // Generate the JWT token
    const token = jwt.sign(payload, secretKey);
    // Return the signed URL containing the token
    return `${fileUrl}?token=${token}`;
  } catch (err) {
    console.log('Err while siging local url', err);
    throw new Error('Invalid or expired token.');
  }
}

export function presignedlocalUrl(signedUrl, expirationTimeInSeconds) {
  if (signedUrl?.includes('files')) {
    const fileUrl = signedUrl.split('?')?.[0];
    const secretKey = process.env.MASTER_KEY;
    const exp = expirationTimeInSeconds || 200;
    try {
      // Create the payload with the file URL and expiration time
      const payload = {
        fileUrl,
        exp: Math.floor(Date.now() / 1000) + exp, // Expiry time in seconds
      };
      // Generate the JWT token
      const token = jwt.sign(payload, secretKey);
      // Return the signed URL containing the token
      return `${fileUrl}?token=${token}`;
    } catch (err) {
      throw new Error('Invalid or expired token.');
    }
  } else {
    return signedUrl;
  }
}

// Function to validate the signed URL
export async function validateSignedLocalUrl(signedUrl) {
  const urlParams = new URLSearchParams(signedUrl.split('?')[1]);
  const token = urlParams.get('token');
  try {
    if (!token) {
      throw new Error('No token provided.');
    }
    const secretKey = process.env.MASTER_KEY;
    // Now verify the token (validate signature and expiration automatically)
    const decoded = jwt.verify(token, secretKey);
    // Check if the file URL in the JWT matches the requested file URL
    const fileUrl = signedUrl.split('?')[0];
    if (decoded.fileUrl !== fileUrl) {
      throw new Error('Invalid file URL in token.');
    }
    // If the token is valid and not expired, return the file URL
    return signedUrl;
  } catch (error) {
    console.log('Error validating file', error.message);
    return 'Unauthorized';
  }
}
