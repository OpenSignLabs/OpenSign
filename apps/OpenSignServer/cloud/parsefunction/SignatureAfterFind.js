import getPresignedUrl from './getSignedUrl.js';

async function SignatureAfterFind(request) {
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
}
export default SignatureAfterFind;
