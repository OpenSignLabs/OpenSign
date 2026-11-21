import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as presign } from '@aws-sdk/s3-request-presigner';
import { useLocal } from '../../Utils.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { isAuthenticated } from '../../utils/AuthUtils.js';
dotenv.config({ quiet: true });

function extractKeyFromUrl(url) {
  // Create a new URL object
  const parsedUrl = new URL(url);
  // Get the pathname of the URL
  const pathname = parsedUrl.pathname; // e.g. /mybucket/path/to/file.pdf (depends on baseUrl style)
  // Extract the filename from the pathname
  const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
  return filename;
}

function makeEndpoint(endpoint) {
  if (!endpoint) return '';

  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  return `https://${endpoint}`;
}

function makeS3Client() {
  const accessKeyId = process.env.DO_ACCESS_KEY_ID;

  const secretAccessKey = process.env.DO_SECRET_ACCESS_KEY;

  const region = process.env.DO_REGION;

  const endpoint = makeEndpoint(process.env.DO_ENDPOINT);

  return new S3Client({
    region,
    endpoint, // endpoint should be Url e.g. https://blr1.digitaloceanspaces.com)
    credentials: { accessKeyId, secretAccessKey },
  });
}

export default async function getPresignedUrl(url) {
  if (url?.includes('/files/')) {
    return presignedlocalUrl(url);
  } else {
    const client = makeS3Client();

    const bucket = process.env.DO_SPACE;

    const key = extractKeyFromUrl(url);

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    // Expires: 160 seconds
    const expiresIn = 160;

    // presignedGETURL return presignedUrl with expires time
    const presignedGETURL = await presign(client, command, { expiresIn });
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
        const query = new Parse.Query(docId ? 'contracts_Document' : 'contracts_Template');
        query.equalTo('objectId', docId ? docId : templateId);
        query.include('ExtUserPtr.TenantId');
        if (templateId) {
          // Widget assets (image/draw) live inside the template placeholders.
          query.include('Placeholders');
        }
        query.notEqualTo('IsArchive', true);
        const res = await query.first({ useMasterKey: true });
        if (!res) {
          throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Document not found.');
        }

        const _resDoc = res?.toJSON();
        // Ensure user is authenticated if OTP is required
        if (_resDoc?.IsEnableOTP) {
          const isAuth = await isAuthenticated(request?.user);
          if (!isAuth) {
            throw new Parse.Error(
              Parse.Error.INVALID_SESSION_TOKEN,
              'User is not authenticated.'
            );
          }
        }

        // Bind the requested URL to the fetched document/template to prevent
        // arbitrary-object presigning (including /files/ token minting).
        // Compare by basename to tolerate query strings / trailing slashes.
        const basename = (u) => String(u || '').split('?')[0].split('/').pop();
        const allowedUrls = [
          _resDoc?.URL,
          _resDoc?.SignedUrl,
          _resDoc?.CertificateUrl,
        ].filter(Boolean);
        // Templates also keep image/draw widget assets inside their placeholders,
        // and the bulk-send flow asks for a signed URL of those assets.
        if (templateId && Array.isArray(_resDoc?.Placeholders)) {
          _resDoc.Placeholders.forEach((holder) => {
            const pages = Array.isArray(holder?.placeHolder) ? holder.placeHolder : [];
            pages.forEach((page) => {
              const widgets = Array.isArray(page?.pos) ? page.pos : [];
              widgets.forEach((widget) => {
                [widget?.options?.response, widget?.options?.defaultValue].forEach(
                  (value) => {
                    if (typeof value === 'string' && value && !value.startsWith('data:')) {
                      allowedUrls.push(value);
                    }
                  }
                );
              });
            });
          });
        }
        // A record with no allowed URL must deny, otherwise any /files/ path
        // could be signed through a folder record.
        const urlBase = basename(url);
        const isAllowed = allowedUrls.some((u) => basename(u) === urlBase);
        if (!isAllowed) {
          throw new Parse.Error(
            Parse.Error.OPERATION_FORBIDDEN,
            'URL not associated with this document.'
          );
        }

        if (url?.includes('/files/')) {
          return presignedlocalUrl(url);
        } else if (useLocal !== 'true') {
          const presignedUrl = await getPresignedUrl(url);
          return presignedUrl;
        } else {
          return url;
        }
      } catch (err) {
        console.log('Err in presigned url', err);
        throw err;
      }
    } else {
      const isAuth = await isAuthenticated(request?.user);
      if (!isAuth) {
        throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
      } else {
        if (url?.includes('/files/')) {
          const presignedUrl = await getPresignedUrl(url);
          return presignedUrl;
        } else if (useLocal !== 'true') {
          const presignedUrl = await getPresignedUrl(url);
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
  const exp = expirationTimeInSeconds || 3600;
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
  if (signedUrl?.includes('/files/')) {
    const fileUrl = signedUrl.split('?')?.[0];
    const secretKey = process.env.MASTER_KEY;
    const exp = expirationTimeInSeconds || 3600;
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
    // Check if the file URL in the token matches the requested file URL
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