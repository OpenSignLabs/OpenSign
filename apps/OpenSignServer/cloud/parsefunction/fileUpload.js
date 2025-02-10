import { getSignedLocalUrl } from './getSignedUrl.js';

export default async function fileUpload(request) {
  const url = request.params.url;

  try {
    const urlwithjwt = getSignedLocalUrl(url, 200);
    return { url: urlwithjwt };
  } catch (err) {
    console.log('Err ', err);
    throw err;
  }
}
