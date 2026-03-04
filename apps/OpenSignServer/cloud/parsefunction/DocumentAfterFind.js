import { handleValidImage, useLocal } from '../../Utils.js';
import getPresignedUrl, { presignedlocalUrl } from './getSignedUrl.js';

async function DocumentAfterFind(request) {
  if (request.objects.length === 1) {
    if (request.objects) {
      const obj = request.objects[0];
      const SignedUrl = obj?.get('SignedUrl') && obj?.get('SignedUrl');
      const Url = obj?.get('URL') && obj?.get('URL');
      const certificateUrl = obj.get('CertificateUrl') && obj.get('CertificateUrl');
      const isPrefillExist = obj?.get('Placeholders')?.some(x => x.Role === 'prefill');
      const Placeholder = obj?.get('Placeholders') || [];

      const shouldUsePresigned = useLocal !== 'true';
      const isLocal = useLocal == 'true';

      const resolveUrl = async rawUrl => {
        if (!rawUrl) return rawUrl;
        if (shouldUsePresigned) {
          return await getPresignedUrl(rawUrl);
        } else if (isLocal) {
          return presignedlocalUrl(rawUrl);
        }
      };

      if (isPrefillExist) {
        const updatedPlaceHolder = await handleValidImage(Placeholder);
        obj.set('Placeholders', updatedPlaceHolder);
      }

      if (SignedUrl) obj.set('SignedUrl', await resolveUrl(SignedUrl));
      if (Url) obj.set('URL', await resolveUrl(Url));
      if (certificateUrl) obj.set('CertificateUrl', await resolveUrl(certificateUrl));
      return [obj];
    }
  }
}
export default DocumentAfterFind;
