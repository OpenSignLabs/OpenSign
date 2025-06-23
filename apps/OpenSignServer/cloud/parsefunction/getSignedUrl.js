import AWS from 'aws-sdk';
import { azureOptions, useLocal } from '../../Utils.js';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from '@azure/storage-blob';
import { URL } from 'url';

export default function getPresignedUrl(url) {
  // // Azure Storage configuration
  // const accountName = azureOptions.accountName;
  // const accountKey = azureOptions.accessKey;
  // const containerName = azureOptions.container;

  // if (!accountName || !accountKey || !containerName) {
  //   throw new Error('Azure Storage credentials are not configured properly.');
  // }

  // // Parse the URL to extract the blob name
  // const parsedUrl = new URL(url);
  // const blobName = parsedUrl.pathname.substring(parsedUrl.pathname.lastIndexOf('/') + 1);

  // // Azure Storage credentials
  // const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
  // const blobServiceClient = new BlobServiceClient(
  //   `https://${accountName}.blob.core.windows.net`,
  //   sharedKeyCredential
  // );

  // // Generate SAS token for the blob
  // const blobClient = blobServiceClient.getContainerClient(containerName).getBlobClient(blobName);

  // // Define the SAS token permissions and expiry
  // const permissions = BlobSASPermissions.parse('r'); // "r" -> Read-only access
  // const expiryTime = new Date(new Date().valueOf() + 3600 * 1000); // Expires in 160 seconds

  // const sasToken = generateBlobSASQueryParameters(
  //   {
  //     containerName,
  //     blobName,
  //     permissions: permissions,
  //     expiresOn: expiryTime,
  //   },
  //   sharedKeyCredential
  // ).toString();

  // // Combine blob URL with SAS token
  // const presignedUrl = `${blobClient.url}?${sasToken}`;
  // return presignedUrl;
  return url;
}

// export default function getPresignedUrl(url) {
//   // const credentials = {
//   //   accessKeyId: process.env.DO_ACCESS_KEY_ID,
//   //   secretAccessKey: process.env.DO_SECRET_ACCESS_KEY,
//   // };
//   // AWS.config.update({ credentials: credentials, region: process.env.DO_REGION });
//   // const spacesEndpoint = new AWS.Endpoint(process.env.DO_ENDPOINT);

//   // const s3 = new AWS.S3({ endpoint: spacesEndpoint });

//   // // Create a new URL object
//   // const parsedUrl = new URL(url);
//   // // Get the pathname of the URL
//   // const pathname = parsedUrl.pathname;
//   // // Extract the filename from the pathname
//   // const filename = pathname.substring(pathname.lastIndexOf('/') + 1);

//   // // presignedGETURL return presignedUrl with expires time
//   // const presignedGETURL = s3.getSignedUrl('getObject', {
//   //   Bucket: process.env.DO_SPACE,
//   //   Key: filename, //filename
//   //   Expires: 160, //time to expire in seconds
//   // });
//   return url;
// }

export async function getSignedUrl(request) {
  try {
    const docId = request.params.docId || '';
    const url = request.params.url;
    if (docId) {
      try {
        const query = new Parse.Query('contracts_Document');
        query.equalTo('objectId', docId);
        // query.notEqualTo('IsEnableOTP', true);
        query.include('CreatedBy');
        query.include('Signers');
        query.include('AuditTrail.UserPtr');
        query.include('Placeholders');
        query.include('DeclineBy');
        query.notEqualTo('IsArchive', true);
        const res = await query.first({ useMasterKey: true });
        if (res) {
          if (useLocal !== 'true') {
            const presignedUrl = getPresignedUrl(url);
            return presignedUrl;
          } else {
            return url;
          }
        }
      } catch (err) {
        console.log('Err in presigned url', err);
        throw err;
      }
    } else {
      if (!request?.user) {
        throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
      } else {
        if (useLocal !== 'true') {
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
