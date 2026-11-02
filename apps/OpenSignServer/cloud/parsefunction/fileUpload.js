import { getSignedUrl } from './getSignedUrl.js';

export default async function fileUpload(request) {
  return { url: await getSignedUrl(request) };
}
