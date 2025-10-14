import { useLocal } from '../../Utils.js';
import getPresignedUrl, { presignedlocalUrl } from './getSignedUrl.js';

const scrubTwoFactorFields = obj => {
  obj.unset('twoFactorSecret');
  obj.unset('twoFactorTempSecret');
  obj.unset('twoFactorPendingToken');
  obj.unset('twoFactorPendingSession');
  obj.unset('twoFactorPendingExpires');
  obj.unset('twoFactorTempSecretCreatedAt');
};

async function UserAfterFind(request) {
  const shouldPreserveTwoFactorFields = request?.context?.preserveTwoFactorFields === true;

  if (request.objects.length === 1 && request.objects) {
    const obj = request.objects[0];
    const profilePic = obj?.get('ProfilePic') && obj?.get('ProfilePic');

    if (profilePic) {
      if (useLocal !== 'true') {
        obj.set('ProfilePic', getPresignedUrl(profilePic));
      } else if (useLocal == 'true') {
        obj.set('ProfilePic', presignedlocalUrl(profilePic));
      }
    }

    if (!shouldPreserveTwoFactorFields) {
      scrubTwoFactorFields(obj);
    }

    return [obj];
  }
}
export default UserAfterFind;
