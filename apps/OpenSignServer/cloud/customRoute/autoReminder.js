import axios from 'axios';
import { cloudServerUrl } from '../../Utils.js';

// `replaceMailVaribles` is used to replace variables from mail with there actual values
function replaceMailVaribles(subject, body, variables) {
  let replacedSubject = subject;
  let replacedBody = body;

  for (const variable in variables) {
    const regex = new RegExp(`{{${variable}}}`, 'g');
    if (subject) {
      replacedSubject = replacedSubject.replace(regex, variables[variable]);
    }
    if (body) {
      replacedBody = replacedBody.replace(regex, variables[variable]);
    }
  }

  const result = {
    subject: replacedSubject,
    body: replacedBody,
  };
  return result;
}

// `sendmail` is used to signing reminder mail to signer
async function sendMail(doc, signer) {
  const subject = `{{sender_name}} has requested you to sign "{{document_title}}"`;
  const body = `<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body><p>Hi {{receiver_name}},</p><br><p>We hope this email finds you well. {{sender_name}}&nbsp;has requested you to review and sign&nbsp;<b>"{{document_title}}"</b>.</p><p>Your signature is crucial to proceed with the next steps as it signifies your agreement and authorization.</p><br><p>{{signing_url}}</p><br><p>If you have any questions or need further clarification regarding the document or the signing process,  please contact the sender.</p><br><p>Thanks</p><p> Team OpenSign™</p><br></body> </html>`;
  const url = `${cloudServerUrl}/functions/sendmailv3`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Parse-Application-Id': process.env.APP_ID,
  };

  const baseUrl = new URL(process.env.PUBLIC_URL);
  const encodeBase64 = btoa(`${doc.objectId}/${signer.Email}/${signer.objectId}`);
  const expireDate = doc?.ExpiryDate?.iso;
  const newDate = new Date(expireDate);
  const localExpireDate = newDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const signPdf = `${baseUrl.origin}/login/${encodeBase64}`;
  const variables = {
    document_title: doc.Name,
    sender_name: doc.ExtUserPtr.Name,
    sender_mail: doc.ExtUserPtr.Email,
    sender_phone: doc.ExtUserPtr?.Phone || '',
    receiver_name: signer.Name,
    receiver_email: signer.Email,
    receiver_phone: signer?.Phone || '',
    expiry_date: localExpireDate,
    company_name: doc?.ExtUserPtr?.Company || '',
    signing_url: `<a href=${signPdf} target=_blank>Sign here</a>`,
  };
  const mail = replaceMailVaribles(subject, body, variables);

  let params = {
    mailProvider: doc?.ExtUserPtr?.active_mail_adapter,
    extUserId: doc?.ExtUserPtr?.objectId,
    recipient: signer.Email,
    subject: mail.subject,
    from: doc?.ExtUserPtr?.Email,
    html: mail.body,
  };
  try {
    // The axios request is used to send a signing reminder email.
    const res = await axios.post(url, params, { headers: headers });
    // console.log('res ', res.data.result);
    if (res.data.result.status === 'success') {
      return { status: 'success' };
    }
  } catch (err) {
    console.log('err in mail of sendreminder api', err);
    return { status: 'error' };
  }
}
export default async function autoReminder(request, response) {
  // The query below is used to find documents where the reminder date is less than or equal to the current date, and which have existing signers and a signed URL.
  try {
    const docQuery = new Parse.Query('contracts_Document');
    docQuery.limit(2000);
    docQuery.lessThanOrEqualTo('NextReminderDate', new Date());
    docQuery.equalTo('AutomaticReminders', true);
    docQuery.exists('NextReminderDate');
    docQuery.exists('Signers');
    docQuery.exists('SignedUrl');
    docQuery.descending('createdAt');
    docQuery.include('Signers,AuditTrail.UserPtr,ExtUserPtr');
    docQuery.notEqualTo('IsCompleted', true);
    docQuery.notEqualTo('IsDeclined', true);
    docQuery.notEqualTo('IsArchive', true);
    docQuery.greaterThanOrEqualTo('ExpiryDate', new Date());

    const docsArr = await docQuery.find({ useMasterKey: true });

    if (docsArr && docsArr.length > 0) {
      const _docsArr = JSON.parse(JSON.stringify(docsArr));
      let mailCount = 0;
      let docCount = 0;
      for (const doc of _docsArr) {
        // The reminderDate variable is used to calculate the next reminder date.
        const RemindOnceInEvery = doc?.RemindOnceInEvery || 5;
        const ReminderDate = new Date();
        ReminderDate.setDate(ReminderDate.getDate() + RemindOnceInEvery);
        // The sendInOrder variable is used to determine whether to send emails in order or not.
        const SendInOrder = doc?.SendinOrder || false;
        if (SendInOrder) {
          // The auditTrail variable is used to get the count of how many users have already signed the document.
          const auditTrail = doc?.AuditTrail?.filter(x => x.Activity === 'Signed');
          const count = auditTrail?.length || 0;
          const signer = doc?.Signers?.[count];
          if (signer) {
            docCount += 1;
            const mailRes = await sendMail(doc, signer);
            if (mailRes && mailRes.status === 'success') {
              mailCount += 1;
            }
            try {
              // The code below is used to update the next reminder date of the document based on the "remind once every X days" setting.
              const updateDoc = new Parse.Object('contracts_Document');
              updateDoc.id = doc.objectId;
              updateDoc.set('NextReminderDate', ReminderDate);
              const updateRes = await updateDoc.save(null, { useMasterKey: true });
              // console.log('updateRes ', updateRes);
            } catch (err) {
              console.log('err in update document', err);
            }
          }
        } else {
          // The AuditTrail variable is used to check if there is any user who has already signed the document.
          const auditTrail = doc?.AuditTrail?.filter(x => x.Activity === 'Signed');
          if (auditTrail?.length > 0) {
            // The signers variable is used to get the signers who haven't signed the document.
            const signers = doc?.Signers.filter(signer => {
              const signedUser = auditTrail?.find(y => y.UserPtr.objectId === signer.objectId);
              if (!signedUser) {
                return signer;
              }
            });
            if (signers?.length > 0) {
              docCount += 1;
              // The for...of loop below is used to send a signing reminder to every signer who hasn't signed the document yet.
              for (const signer of signers) {
                const mailRes = await sendMail(doc, signer);
                if (mailRes && mailRes.status === 'success') {
                  mailCount += 1;
                }
              }
            }
          } else {
            // The for...of loop below is used to send a signing reminder to every signer who hasn't signed the document yet.
            const signers = doc?.Signers;
            if (signers?.length > 0) {
              docCount += 1;
              for (const signer of signers) {
                const mailRes = await sendMail(doc, signer);
                if (mailRes && mailRes.status === 'success') {
                  mailCount += 1;
                }
              }
            }
          }
          // The code below is used to update the next reminder date of the document based on the "remind once every X days" setting.
          try {
            const updateDoc = new Parse.Object('contracts_Document');
            updateDoc.id = doc.objectId;
            updateDoc.set('NextReminderDate', ReminderDate);
            const updateRes = await updateDoc.save(null, { useMasterKey: true });
            // console.log('updateRes ', updateRes);
          } catch (err) {
            console.log('err in sendmail', err);
          }
        }
      }
      if (docCount > 0) {
        response.json({ status: 'success', document_count: docCount, mail_count: mailCount });
      } else {
        response.json({ status: 'no record found' });
      }
    } else {
      response.json({ status: 'no record found' });
    }
  } catch (err) {
    console.log('err ', err);
    const code = err?.code || 400;
    const message = err?.message || 'Somehting went wrong!';
    response.status(code).json({ error: message });
  }
}
