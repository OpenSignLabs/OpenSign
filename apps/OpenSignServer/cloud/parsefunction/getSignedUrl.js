import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as presign } from '@aws-sdk/s3-request-presigner';
import { useLocal } from '../../Utils.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fileAccess, validateFileScope } from '../../utils/documentAccess.js';
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

export default async function getPresignedUrl(url, ttl = 160) {
  if (url?.includes('/files/')) {
    return presignedlocalUrl(url);
  } else {
    const client = makeS3Client();

    const bucket = process.env.DO_SPACE;

    const key = extractKeyFromUrl(url);

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    // Expires: 160 seconds
    const expiresIn = Math.min(160, ttl);

    // presignedGETURL return presignedUrl with expires time
    const presignedGETURL = await presign(client, command, { expiresIn });
    return presignedGETURL;
  }
}

export async function getSignedUrl(request) {
  const params = { ...request.params };
  try {
    const candidate = new URL(params.url);
    if (candidate.pathname.endsWith('/protected-document-file')) {
      // This decoded value is only a target selector; fileAccess still checks identity and ownership.
      params.url = jwt.decode(candidate.searchParams.get('token'))?.fileUrl;
    }
  } catch {
    /* fileAccess rejects malformed URL input */
  }
  const access = await fileAccess({ ...request, params });
  if (access.url.includes('/files/'))
    return getSignedLocalUrl(access.url, access.ttl, access.scope);
  if (useLocal !== 'true')
    return access.scope
      ? getProtectedDocumentFileUrl(access.url, access.ttl, access.scope)
      : getPresignedUrl(access.url, access.ttl);
  throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'File is unavailable.');
}

// Function to generate a signed URL with JWT
export function getSignedLocalUrl(fileUrl, expirationTimeInSeconds = 200, scope) {
  const secretKey = process.env.MASTER_KEY;
  const exp = expirationTimeInSeconds;
  if (!Number.isInteger(exp) || exp < 1 || exp > 200)
    throw new Error('Invalid file token lifetime.');
  try {
    // Create the payload with the file URL and expiration time
    const payload = {
      fileUrl,
      ...(scope ? { scope } : {}),
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
    const decoded = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
    // Check if the file URL in the JWT matches the requested file URL
    const fileUrl = signedUrl.split('?')[0];
    if (decoded.fileUrl !== fileUrl) {
      throw new Error('Invalid file URL in token.');
    }
    await validateFileScope(decoded.scope, fileUrl);
    // Scoped tokens are checked again at download time for revocation and expiry.
    // If the token is valid and not expired, return the file URL
    return signedUrl;
  } catch (error) {
    console.log('Error validating file', error.message);
    return 'Unauthorized';
  }
}

export function getProtectedDocumentFileUrl(fileUrl, ttl, scope) {
  if (!scope?.docId || !Number.isInteger(ttl) || ttl < 1 || ttl > 200)
    throw new Error('Invalid file capability.');
  const token = jwt.sign(
    { fileUrl, scope, purpose: 'document-file', exp: Math.floor(Date.now() / 1000) + ttl },
    process.env.MASTER_KEY,
    { algorithm: 'HS256' }
  );
  return process.env.SERVER_URL.replace(/\/$/, '') + '/protected-document-file?token=' + token;
}

export async function protectedDocumentFile(req, res) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const close = () => controller.abort();
  res.once('close', close);
  try {
    if (typeof req.query.token !== 'string' || req.query.token.length > 8192)
      throw new Error('Invalid capability');
    const decoded = jwt.verify(req.query.token, process.env.MASTER_KEY, { algorithms: ['HS256'] });
    if (decoded.purpose !== 'document-file' || !decoded.scope?.docId)
      throw new Error('Invalid capability');
    await validateFileScope(decoded.scope, decoded.fileUrl);
    const target = await getPresignedUrl(decoded.fileUrl, 30);
    const response = await fetch(target, { signal: controller.signal, redirect: 'error' });
    if (!response.ok || !response.body) throw new Error('File unavailable');
    await validateFileScope(decoded.scope, decoded.fileUrl);
    res.set('Cache-Control', 'private, no-store');
    res.set('Referrer-Policy', 'no-referrer');
    res.set('Content-Type', 'application/pdf');
    if (req.method === 'HEAD') {
      await response.body.cancel();
      res.end();
    } else {
      const { Readable } = await import('node:stream');
      const { pipeline } = await import('node:stream/promises');
      await pipeline(Readable.fromWeb(response.body), res);
    }
  } catch {
    if (!res.headersSent) res.status(403).json({ error: 'Document or file is unavailable.' });
    else res.destroy();
  } finally {
    clearTimeout(timeout);
    res.off('close', close);
  }
}
