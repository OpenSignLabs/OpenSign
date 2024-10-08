import AWS from 'aws-sdk';
import { useLocal } from '../../Utils.js';
export default function getPresignedUrl(url, adapter) {
  const credentials = {
    accessKeyId: adapter?.accessKeyId || process.env.DO_ACCESS_KEY_ID,
    secretAccessKey: adapter?.secretAccessKey || process.env.DO_SECRET_ACCESS_KEY,
  };
  AWS.config.update({ credentials: credentials, region: adapter?.region || process.env.DO_REGION });
  const spacesEndpoint = adapter?.endpoint || new AWS.Endpoint(process.env.DO_ENDPOINT);

  const s3 = new AWS.S3({ endpoint: spacesEndpoint });

  // Create a new URL object
  const parsedUrl = new URL(url);
  // Get the pathname of the URL
  const pathname = parsedUrl.pathname;
  // Extract the filename from the pathname
  const filename = pathname.substring(pathname.lastIndexOf('/') + 1);

  // presignedGETURL return presignedUrl with expires time
  const presignedGETURL = s3.getSignedUrl('getObject', {
    Bucket: adapter?.bucketName || process.env.DO_SPACE,
    Key: filename, //filename
    Expires: 160, //time to expire in seconds
  });
  return presignedGETURL;
}

export async function getSignedUrl(request) {
  try {
    const docId = request.params.docId || '';
    const templateId = request.params.templateId || '';
    const url = request.params.url;
    const fileAdapterId = request.params.fileAdapterId || '';
    if (docId || templateId) {
      try {
        if (fileAdapterId || useLocal !== 'true') {
          const query = new Parse.Query(docId ? 'contracts_Document' : 'contracts_Template');
          query.equalTo('objectId', docId ? docId : templateId);
          query.include('ExtUserPtr.TenantId');
          query.notEqualTo('IsArchive', true);
          const res = await query.first({ useMasterKey: true });
          if (res) {
            const _resDoc = JSON.parse(JSON.stringify(res));
            if (_resDoc?.IsEnableOTP) {
              if (!request?.user) {
                throw new Parse.Error(
                  Parse.Error.INVALID_SESSION_TOKEN,
                  'User is not authenticated.'
                );
              } else {
                let adapterConfig = {};
                if (fileAdapterId) {
                  // `adapterConfig` is used to get file in user's fileAdapter
                  adapterConfig =
                    _resDoc?.ExtUserPtr?.TenantId?.FileAdapters?.find(
                      x => x.id === fileAdapterId
                    ) || {};
                }
                const presignedUrl = getPresignedUrl(url, adapterConfig);
                return presignedUrl;
              }
            } else {
              let adapterConfig = {};
              if (fileAdapterId) {
                // `adapterConfig` is used to get file in user's fileAdapter
                adapterConfig =
                  _resDoc?.ExtUserPtr?.TenantId?.FileAdapters?.find(x => x.id === fileAdapterId) ||
                  {};
              }
              const presignedUrl = getPresignedUrl(url, adapterConfig);
              return presignedUrl;
            }
          }
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
