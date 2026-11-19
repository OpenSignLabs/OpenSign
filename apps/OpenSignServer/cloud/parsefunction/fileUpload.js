import { getSignedLocalUrl } from './getSignedUrl.js';
import { logger } from '../../utils/logger.js';

export default async function fileUpload(request) {
  const url = request.params.url;

  try {
    const urlwithjwt = getSignedLocalUrl(url, 200);
    return { url: urlwithjwt };
  } catch (err) {
    logger.info('Err ', err);
    throw err;
  }
}
