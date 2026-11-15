import { updateMailCount } from '../../Utils.js';
import { assertDocRecipient, issueEmailOtp } from './emailOtp.js';
async function getDocument(docId) {
  try {
    const query = new Parse.Query('contracts_Document');
    query.equalTo('objectId', docId);
    query.include('ExtUserPtr');
    query.notEqualTo('IsArchive', true);
    const res = await query.first({ useMasterKey: true });
    const _res = res?.toJSON();
    return _res?.ExtUserPtr?.objectId;
  } catch (err) {
    console.log('err ', err);
  }
}

// Emails a 6-digit one-time code (see emailOtp.js for the rules): to a
// signed-in user's own email, or to a recipient of `docId`.
// Returns { cooldownSec, expiresInMin }; throws during the resend cooldown.
async function sendMailOTPv1(request) {
  let email = request.params.email;
  if (request.user) {
    email = request.user.get('email');
  } else {
    await assertDocRecipient(request.params.docId, email);
  }
  const result = await issueEmailOtp(email, {
    tenantId: request.params.TenantId,
  });
  if (request.params?.docId) {
    const extUserId = await getDocument(request.params?.docId);
    if (extUserId) {
      updateMailCount(extUserId);
    }
  }
  return result;
}
export default sendMailOTPv1;
