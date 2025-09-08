import { handleValidImage, useLocal } from '../../Utils.js';
import getPresignedUrl, { presignedlocalUrl } from './getSignedUrl.js';

async function TemplateAfterFind(request) {
  if (request.objects.length === 1) {
    if (request.objects) {
      const obj = request.objects[0];
      const SignedUrl = obj?.get('SignedUrl') && obj?.get('SignedUrl');
      const Url = obj?.get('URL') && obj?.get('URL');
      const certificateUrl = obj.get('CertificateUrl') && obj?.get('CertificateUrl');
      const isPrefillExist = obj?.get('Placeholders')?.some(x => x.Role === 'prefill');
      const Placeholder = obj?.get('Placeholders') || [];
      if (useLocal !== 'true') {
        if (isPrefillExist) {
          const updatedPlaceHolder = await handleValidImage(Placeholder);
          obj.set('Placeholders', updatedPlaceHolder);
        }
        if (SignedUrl) {
          obj.set('SignedUrl', getPresignedUrl(SignedUrl));
        }
        if (Url) {
          obj.set('URL', getPresignedUrl(Url));
        }
        if (certificateUrl) {
          obj.set('CertificateUrl', getPresignedUrl(certificateUrl));
        }
        return [obj];
      } else if (useLocal == 'true') {
        if (isPrefillExist) {
          const updatedPlaceHolder = await handleValidImage(Placeholder);
          obj.set('Placeholders', updatedPlaceHolder);
        }
        if (SignedUrl) {
          obj.set('SignedUrl', presignedlocalUrl(SignedUrl));
        }
        if (Url) {
          obj.set('URL', presignedlocalUrl(Url));
        }
        if (certificateUrl) {
          obj.set('CertificateUrl', presignedlocalUrl(certificateUrl));
        }
        return [obj];
      }
    }
  }
}
export default TemplateAfterFind;
