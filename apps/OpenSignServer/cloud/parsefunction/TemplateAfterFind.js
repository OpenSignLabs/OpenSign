import { useLocal } from '../../Utils.js';
import getPresignedUrl from './getSignedUrl.js';

async function TemplateAfterFind(request) {
  if (request.objects.length === 1) {
    if (request.objects) {
      const obj = request.objects[0];
      const FileAdapterId = obj?.get('FileAdapterId') || '';
      if (FileAdapterId || useLocal !== 'true') {
        const SignedUrl = obj?.get('SignedUrl') && obj?.get('SignedUrl');
        const Url = obj?.get('URL') && obj?.get('URL');
        const certificateUrl = obj.get('CertificateUrl') && obj.get('CertificateUrl');
        let fileAdapter = {};
        if (FileAdapterId) {
          const tenantId = obj?.get('ExtUserPtr')?.get('TenantId');
          if (tenantId) {
            const _tenantId = JSON.parse(JSON.stringify(obj?.get('ExtUserPtr')?.get('TenantId')));
            fileAdapter = _tenantId?.FileAdapters?.find(x => x.id === FileAdapterId) || {};
          }
        }
        if (SignedUrl) {
          obj.set('SignedUrl', getPresignedUrl(SignedUrl, fileAdapter));
        }
        if (Url) {
          obj.set('URL', getPresignedUrl(Url, fileAdapter));
        }
        if (certificateUrl) {
          obj.set('CertificateUrl', getPresignedUrl(certificateUrl, fileAdapter));
        }
        return [obj];
      }
    }
  }
}
export default TemplateAfterFind;
