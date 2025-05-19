import axios from 'axios';
import { appName, cloudServerUrl } from '../../Utils.js';

export default async function forwardDoc(request) {
  try {
    if (!request.user) {
      throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'unauthorized.');
    }
    const { docId, recipients } = request.params;
    const isReceipents = recipients?.length > 0 && recipients?.length <= 10;
    if (docId && isReceipents) {
      const userPtr = { __type: 'Pointer', className: '_User', objectId: request.user.id };
      const docQuery = new Parse.Query('contracts_Document');
      docQuery
        .equalTo('objectId', docId)
        .equalTo('CreatedBy', userPtr)
        .notEqualTo('IsArchive', true)
        .notEqualTo('IsDeclined', true)
        .include('Signers')
        .include('ExtUserPtr')
        .include('Placeholders.signerPtr')
        .include('ExtUserPtr.TenantId');
      const docRes = await docQuery.first({ useMasterKey: true });
      if (!docRes) {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Document not found.');
      }
      const _docRes = docRes?.toJSON();
      const docName = _docRes.Name;
      const fileAdapterId = _docRes?.FileAdapterId || '';
      const extUserId = _docRes?.ExtUserPtr?.objectId;
      const TenantAppName = appName;
      const from = _docRes?.ExtUserPtr?.Email;
      const replyTo = _docRes?.ExtUserPtr?.Email;
      const senderName = _docRes?.ExtUserPtr?.Name;

      try {
        let mailRes;
        for (let i = 0; i < recipients.length; i++) {
          const logo = `<img src='https://qikinnovation.ams3.digitaloceanspaces.com/logo.png' height='50' style='padding:20px'/>`;
          const opurl = ` <a href='www.opensignlabs.com' target=_blank>here</a>`;
          const themeColor = '#47a3ad';

          let params = {
            extUserId: extUserId,
            pdfName: docName,
            url: _docRes?.SignedUrl || '',
            recipient: recipients[i],
            subject: `${senderName} has signed the doc - ${docName}`,
            replyto: replyTo || '',
            from: from,
            html:
              `<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'/></head><body><div style='background-color:#f5f5f5;padding:20px'><div style='background-color:white'><div>` +
              `${logo}</div><div style='padding:2px;font-family:system-ui;background-color:${themeColor}'><p style='font-size:20px;font-weight:400;color:white;padding-left:20px'>Document Copy</p></div><div>` +
              `<p style='padding:20px;font-family:system-ui;font-size:14px'>A copy of the document <strong>${docName}</strong> is attached to this email. Kindly download the document from the attachment.</p>` +
              `</div></div><div><p>This is an automated email from ${TenantAppName}. For any queries regarding this email, please contact the sender ${replyTo} directly. ` +
              `If you think this email is inappropriate or spam, you may file a complaint with ${TenantAppName}${opurl}.</p></div></div></body></html>`,
          };
          mailRes = await axios.post(`${cloudServerUrl}/functions/sendmailv3`, params, {
            headers: {
              'Content-Type': 'application/json',
              'X-Parse-Application-Id': process.env.APP_ID,
              'X-Parse-Master-Key': process.env.MASTER_KEY,
            },
          });
        }
        return mailRes.data?.result;
      } catch (error) {
        const msg =
          error?.response?.data?.error ||
          error?.response?.data ||
          error?.message ||
          'Something went wrong.';
        throw new Parse.Error(400, msg);
      }
    } else {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, 'please provide parameters.');
    }
  } catch (err) {
    console.log('Err in forwardDoc', err);
    throw err;
  }
}
