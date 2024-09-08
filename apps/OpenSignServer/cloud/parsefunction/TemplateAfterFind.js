import { useLocal } from '../../Utils.js';
import getPresignedUrl from './getSignedUrl.js';

async function TemplateAfterFind(request) {
  if (useLocal !== 'true') {
    if (request.objects.length === 1) {
      if (request.objects) {
        const obj = request.objects[0];
        const SignedUrl = obj?.get('SignedUrl') && obj?.get('SignedUrl');
        const Url = obj?.get('URL') && obj?.get('URL');
        const certificateUrl = obj.get('CertificateUrl') && obj.get('CertificateUrl');
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
      }
    }
  }
}
export default TemplateAfterFind;
