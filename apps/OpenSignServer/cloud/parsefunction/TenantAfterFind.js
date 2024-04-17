import getPresignedUrl from './getSignedUrl.js';

async function TenantAterFind(request) {
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
}
export default TenantAterFind;
