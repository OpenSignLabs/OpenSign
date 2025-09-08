import { flattenPdf, getSecureUrl } from '../../Utils.js';
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
          file = [...flatPdf];
        } else if (ext === 'png' || ext === 'jpeg' || ext === 'jpg') {
          mimeType = `image/${ext}`;
          file = { base64: fileBase64 };
        }
        const pdfFile = new Parse.File(fileName, file, mimeType);
        // Save the Parse File if needed
        const pdfData = await pdfFile.save({ useMasterKey: true });
        const presignedUrl = pdfData.url();
        const fileRes = getSecureUrl(presignedUrl);
        return { url: fileRes.url };
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
