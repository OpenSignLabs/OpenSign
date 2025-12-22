import { useLocal } from '../../Utils.js';
import getPresignedUrl, { presignedlocalUrl } from './getSignedUrl.js';

async function SignatureAfterFind(request) {
  if (useLocal !== 'true') {
    if (request.objects.length === 1) {
      if (request.objects) {
        const obj = request.objects[0];
        const ImageURL = obj?.get('ImageURL') && obj?.get('ImageURL');
        const Initials = obj?.get('Initials') && obj?.get('Initials');
        const Stamp = obj?.get('Stamp') && obj?.get('Stamp');
        if (ImageURL) {
          obj.set('ImageURL', getPresignedUrl(ImageURL));
        }
        if (Initials) {
          obj.set('Initials', getPresignedUrl(Initials));
        }
        if (Stamp) {
          obj.set('Stamp', getPresignedUrl(Stamp));
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
        const Stamp = obj?.get('Stamp') && obj?.get('Stamp');
        if (ImageURL) {
          obj.set('ImageURL', presignedlocalUrl(ImageURL));
        }
        if (Initials) {
          obj.set('Initials', presignedlocalUrl(Initials));
        }
        if (Stamp) {
          obj.set('Stamp', presignedlocalUrl(Stamp));
        }
        return [obj];
      }
    }
  }
}
export default SignatureAfterFind;
