import { useLocal } from '../../Utils.js';
import getPresignedUrl, { presignedlocalUrl } from './getSignedUrl.js';

const resolveUrl = async rawUrl => {
  const isLocal = useLocal == 'true';
  const shouldUsePresigned = useLocal !== 'true';
  if (!rawUrl) return rawUrl;
  if (shouldUsePresigned) {
    return await getPresignedUrl(rawUrl);
  } else if (isLocal) {
    return presignedlocalUrl(rawUrl);
  }
};

async function TenantAterFind(request) {
  if (request.objects.length === 1) {
    if (request.objects) {
      const obj = request.objects[0];
      const Logo = obj?.get('Logo') && obj?.get('Logo');
      const Favicon = obj?.get('Favicon') && obj?.get('Favicon');

      if (Logo) obj.set('Logo', await resolveUrl(Logo));
      if (Favicon) obj.set('Favicon', await resolveUrl(Favicon));
      return [obj];
    }
  }
}
export default TenantAterFind;
