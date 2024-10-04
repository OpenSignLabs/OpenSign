import uploadFileToS3 from './uploadFiletoS3.js';

export default async function saveToFileAdapter(request) {
  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }

  if (!request.params.fileBase64) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Please provide file.');
  }
  const fileBase64 = request.params.fileBase64;
  try {
    const extCls = new Parse.Query('contracts_Users');
    extCls.equalTo('UserId', request.user);
    extCls.include('TenantId');
    const resExt = await extCls.first({ useMasterKey: true });
    if (resExt) {
      const _resExt = JSON.parse(JSON.stringify(resExt));

      if (_resExt?.TenantId.FileAdapter?.accessKeyId) {
        const adapterConfig = {
          fileAdapter: _resExt?.TenantId?.ActiveFileAdapter,
          bucketName: _resExt?.TenantId?.FileAdapter?.bucketName,
          region: _resExt?.TenantId?.FileAdapter?.region,
          endpoint: _resExt?.TenantId?.FileAdapter?.endpoint,
          accessKeyId: _resExt?.TenantId?.FileAdapter?.accessKeyId,
          secretAccessKey: _resExt?.TenantId?.FileAdapter?.secretAccessKey,
          baseUrl: _resExt?.TenantId?.FileAdapter?.baseUrl,
        };
        const buffer = Buffer.from(fileBase64, 'base64');
        const fileName = request.params.fileName;
        const ext = request.params.fileName?.split('.')?.pop();
        let mimeType;
        if (ext === 'pdf') {
          mimeType = 'application/pdf';
        } else if (ext === 'png' || ext === 'jpeg' || ext === 'jpg') {
          mimeType = `image/${ext}`;
        }
        try {
          const presignedUrl = await uploadFileToS3(buffer, fileName, mimeType, adapterConfig);
          return { url: presignedUrl };
        } catch (err) {
          console.error('Error generate presigned url:', err);
          throw new Parse.Error(400, 'Something went wrong.');
        }
      } else {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'S3 credentials not found.');
      }
    } else {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
    }
  } catch (err) {
    console.log('err in savetoS3', err);
    throw err;
  }
}
