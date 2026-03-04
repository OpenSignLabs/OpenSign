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

async function UserAfterFind(request) {
  if (request.objects.length === 1) {
    if (request.objects) {
      const obj = request.objects[0];
      const ProfilePic = obj?.get('ProfilePic') && obj?.get('ProfilePic');
      if (ProfilePic) obj.set('ProfilePic', await resolveUrl(ProfilePic));
      return [obj];
    }
  }
}
export default UserAfterFind;
