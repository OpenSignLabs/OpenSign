import { useLocal } from '../../Utils.js';
import getPresignedUrl, { presignedlocalUrl } from './getSignedUrl.js';

async function SignatureAfterFind(request) {
  if (useLocal !== 'true') {
    if (request.objects.length === 1) {
      if (request.objects) {
        const obj = request.objects[0];
        const ImageURL = obj?.get('ImageURL') && obj?.get('ImageURL');
        const Initials = obj?.get('Initials') && obj?.get('Initials');
        if (ImageURL) {
          obj.set('ImageURL', getPresignedUrl(ImageURL));
        }
        if (Initials) {
          obj.set('Initials', getPresignedUrl(Initials));
        }
        return [obj];
      }
    }
  } else if (useLocal == 'true') {
    if (request.objects.length === 1) {
      if (request.objects) {
        const obj = request.objects[0];
        const ImageURL = obj?.get('ImageURL') && obj?.get('ImageURL');
        const Initials = obj?.get('Initials') && obj?.get('Initials');
        if (ImageURL) {
          obj.set('ImageURL', presignedlocalUrl(ImageURL));
        }
        if (Initials) {
          obj.set('Initials', presignedlocalUrl(Initials));
        }
        return [obj];
      }
    }
  }
}
export default SignatureAfterFind;
