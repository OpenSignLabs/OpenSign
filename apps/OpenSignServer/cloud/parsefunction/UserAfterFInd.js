import { useLocal } from '../../Utils.js';
import getPresignedUrl, { presignedlocalUrl } from './getSignedUrl.js';

async function UserAfterFind(request) {
  if (useLocal !== 'true') {
    if (request.objects.length === 1) {
      if (request.objects) {
        const obj = request.objects[0];
        const ProfilePic = obj?.get('ProfilePic') && obj?.get('ProfilePic');
        if (ProfilePic) {
          obj.set('ProfilePic', getPresignedUrl(ProfilePic));
        }
        obj.unset('twoFactorSecret');
        obj.unset('twoFactorTempSecret');
        obj.unset('twoFactorPendingToken');
        obj.unset('twoFactorPendingSession');
        obj.unset('twoFactorPendingExpires');
        return [obj];
      }
    }
  } else if (useLocal == 'true') {
    if (request.objects.length === 1) {
      if (request.objects) {
        const obj = request.objects[0];
        const ProfilePic = obj?.get('ProfilePic') && obj?.get('ProfilePic');
        if (ProfilePic) {
          obj.set('ProfilePic', presignedlocalUrl(ProfilePic));
        }
        obj.unset('twoFactorSecret');
        obj.unset('twoFactorTempSecret');
        obj.unset('twoFactorPendingToken');
        obj.unset('twoFactorPendingSession');
        obj.unset('twoFactorPendingExpires');
        return [obj];
      }
    }
  }
}
export default UserAfterFind;
