import { flattenPdf, getSecureUrl } from '../../Utils.js';
import { parseUploadFile } from '../../utils/fileUtils.js';

export default async function saveFile(request) {
  if (!request.params.fileBase64) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Please provide file.');
  }
  const fileBase64 = request.params.fileBase64;
  const id = request.params.id;
  try {
    if (request.user) {
      const extCls = new Parse.Query('contracts_Users');
      extCls.equalTo('UserId', request.user);
      extCls.include('TenantId');
      extCls.include('UserId');
      const resExt = await extCls.first({ useMasterKey: true });
      if (resExt) {
        const _resExt = JSON.parse(JSON.stringify(resExt));
        const fileName = request.params.fileName;
        const ext = request.params.fileName?.split('.')?.pop();
        let mimeType;
        let file;
        if (ext === 'pdf') {
          mimeType = 'application/pdf';
          const flatPdf = await flattenPdf(fileBase64);
          // file = [...flatPdf];
          file = flatPdf;
        } else if (ext === 'png' || ext === 'jpeg' || ext === 'jpg') {
          mimeType = `image/${ext}`;
          // file = { base64: fileBase64 };
          file = Buffer.from(fileBase64, 'base64');
        }
        // const pdfFile = new Parse.File(fileName, file, mimeType);
        // // Save the Parse File if needed
        // const pdfData = await pdfFile.save({ useMasterKey: true });
        // const presignedUrl = pdfData.url();
        // const fileRes = getSecureUrl(presignedUrl);
        // return { url: fileRes.url };
        try {
          const fileRes = await parseUploadFile(fileName, file, mimeType);
          fileUrl = getSecureUrl(fileRes?.url)?.url;
          return { url: fileUrl };
        } catch (err) {
          throw new Parse.Error(400, err?.message);
        }
      } else {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
      }
    } else {
      throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
    }
  } catch (err) {
    console.log('err in savetoS3', err);
    throw err;
  }
}
