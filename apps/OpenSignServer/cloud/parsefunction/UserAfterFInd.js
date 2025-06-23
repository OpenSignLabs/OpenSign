import { useLocal } from '../../Utils.js';
import getPresignedUrl from './getSignedUrl.js';

async function UserAfterFind(request) {
  if (useLocal !== 'true') {
    if (request.objects.length === 1) {
      if (request.objects) {
        const obj = request.objects[0];
        const ProfilePic = obj?.get('ProfilePic') && obj?.get('ProfilePic');
        if (ProfilePic) {
          obj.set('ProfilePic', getPresignedUrl(ProfilePic));
        }
        return [obj];
      }
    }
  }
}
export default UserAfterFind;
