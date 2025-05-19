import { useLocal } from '../../Utils.js';
import getPresignedUrl, { presignedlocalUrl } from './getSignedUrl.js';

async function TenantAterFind(request) {
  if (useLocal !== 'true') {
    if (request.objects.length === 1) {
      if (request.objects) {
        const obj = request.objects[0];
        const Logo = obj?.get('Logo') && obj?.get('Logo');
        if (Logo) {
          obj.set('Logo', getPresignedUrl(Logo));
        }
        return [obj];
      }
    }
  } else if (useLocal == 'true') {
    if (request.objects.length === 1) {
      if (request.objects) {
        const obj = request.objects[0];
        const Logo = obj?.get('Logo') && obj?.get('Logo');
        if (Logo) {
          obj.set('Logo', presignedlocalUrl(Logo));
        }
        return [obj];
      }
    }
  }
}
export default TenantAterFind;
