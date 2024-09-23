import axios from 'axios';
import { cloudServerUrl, replaceMailVaribles } from '../../../../Utils.js';

export default async function resendMail(request, response) {
  try {
    const reqToken = request.headers['x-api-token'];
    const docId = request.body.document_id;
    const userMail = request.body.email;
    const email_subject = request.body.email_subject;
    const email_body = request.body.email_body;
    const baseUrl = new URL(process.env.SERVER_URL);

    if (!reqToken) {
      return response.status(400).json({ error: 'Please Provide API Token' });
    }
    const tokenQuery = new Parse.Query('appToken');
    tokenQuery.equalTo('token', reqToken);
    tokenQuery.include('userId');
    const token = await tokenQuery.first({ useMasterKey: true });
    if (token !== undefined) {
      // Valid Token then proceed request
      const parseUser = JSON.parse(JSON.stringify(token));
      const userPtr = {
        __type: 'Pointer',
        className: '_User',
        objectId: parseUser.userId.objectId,
      };

      const docQuery = new Parse.Query('contracts_Document');
      docQuery.equalTo('objectId', docId);
      docQuery.equalTo('CreatedBy', userPtr);
      docQuery.include('Signers,ExtUserPtr');
      docQuery.notEqualTo('IsCompleted', true);
      docQuery.notEqualTo('IsDeclined', true);
      docQuery.notEqualTo('IsArchive', true);
      docQuery.greaterThanOrEqualTo('ExpiryDate', new Date());
      docQuery.exists('SignedUrl');

      const resDoc = await docQuery.first({ useMasterKey: true });
      // console.log("resDoc ",resDoc)
      if (resDoc) {
        const _resDoc = resDoc.toJSON();
        const contact = _resDoc.Signers.find(x => x.Email === userMail);
        const activeMailAdapter = _resDoc?.ExtUserPtr?.active_mail_adapter || '';
        if (contact) {
          try {
            const imgPng = 'https://qikinnovation.ams3.digitaloceanspaces.com/logo.png';
            let url = `${cloudServerUrl}/functions/sendmailv3/`;
            const headers = {
              'Content-Type': 'application/json',
              'X-Parse-Application-Id': process.env.APP_ID,
              'X-Parse-Master-Key': process.env.MASTER_KEY,
            };

            const objectId = contact.objectId;
            const hostUrl = baseUrl.origin;
            const title = _resDoc.Name;
            const receiverMail = contact.Email;
            //encode this url value `${response.id}/${receiverMail}/${objectId}` to base64 using `btoa` function
            const encodeBase64 = btoa(`${_resDoc.objectId}/${receiverMail}/${objectId}`);
            let signPdf = `${hostUrl}/login/${encodeBase64}`;
            const openSignUrl = 'https://www.opensignlabs.com/contact-us';
            const orgName = _resDoc.ExtUserPtr.Company ? _resDoc.ExtUserPtr.Company : '';
            const newDate = new Date(_resDoc.ExpiryDate.iso);
            newDate.setDate(newDate.getDate() + 15);
            const sender = _resDoc.ExtUserPtr.Email;
            const localExpireDate = newDate.toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });

            const themeBGcolor = '#47a3ad';
            const email_html =
              "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /> </head>   <body> <div style='background-color: #f5f5f5; padding: 20px'> <div style=' box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;background: white;padding-bottom: 20px;'> <div style='padding:10px 10px 0 10px'><img src=" +
              imgPng +
              " height='50' style='padding:20px; width:170px; height:40px;' /></div>  <div  style='padding:2px; font-family: system-ui;background-color:" +
              themeBGcolor +
              ";'><p style='font-size: 20px;font-weight: 400;color: white;padding-left: 20px;' > Digital Signature Request</p></div><div><p style='padding: 20px;font-family: system-ui;font-size: 14px; margin-bottom: 10px;'> " +
              _resDoc.ExtUserPtr.Name +
              ' has requested you to review and sign <strong> ' +
              title +
              "</strong>.</p><div style='padding: 5px 0px 5px 25px;display: flex;flex-direction: row;justify-content: space-around;'><table> <tr> <td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Sender</td> <td> </td> <td  style='color:#626363;font-weight:bold'>" +
              sender +
              "</td></tr><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Organization</td> <td> </td><td style='color:#626363;font-weight:bold'> " +
              orgName +
              "</td></tr> <tr> <td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Expires on</td><td> </td> <td style='color:#626363;font-weight:bold'>" +
              localExpireDate +
              "</td></tr><tr> <td></td> <td> </td></tr></table> </div> <div style='margin-left:70px'><a href=" +
              signPdf +
              "> <button style='padding: 12px 12px 12px 12px;background-color: #d46b0f;color: white;  border: 0px;box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;font-weight:bold;margin-top:30px'>Sign here</button></a> </div> <div style='display: flex; justify-content: center;margin-top: 10px;'> </div></div></div><div><p> This is an automated email from OpenSign™. For any queries regarding this email, please contact the sender " +
              sender +
              ' directly.If you think this email is inappropriate or spam, you may file a complaint with OpenSign™   <a href=' +
              openSignUrl +
              ' target=_blank>here</a>.</p> </div></div></body> </html>';
            let replaceVar;
            const variables = {
              document_title: title,
              sender_name: _resDoc.ExtUserPtr.Name,
              sender_mail: _resDoc.ExtUserPtr.Email,
              sender_phone: _resDoc.ExtUserPtr?.Phone || '',
              receiver_name: contact.Name,
              receiver_email: contact.Email,
              receiver_phone: contact?.Phone || '',
              expiry_date: localExpireDate,
              company_name: orgName,
              signing_url: signPdf,
            };
            if (email_subject && email_body) {
              replaceVar = replaceMailVaribles(email_subject, email_body, variables);
            } else if (email_subject) {
              replaceVar = replaceMailVaribles(email_subject, '', variables);
              replaceVar = { subject: replaceVar.subject, body: email_html };
            } else if (email_body) {
              replaceVar = replaceMailVaribles(
                `${_resDoc.ExtUserPtr.Name} has requested you to sign "${title}"`,
                email_body,
                variables
              );
            } else {
              replaceVar = {
                subject: `${_resDoc.ExtUserPtr.Name} has requested you to sign "${title}"`,
                body: email_html,
              };
            }
            const subject = replaceVar.subject;
            const html = replaceVar.body;

            let params = {
              recipient: contact.Email,
              subject: subject,
              from: sender,
              html: html,
              extUserId: _resDoc.ExtUserPtr.objectId,
              mailProvider: activeMailAdapter,
            };

            const res = await axios.post(url, params, { headers: headers });
            if (res.data.result && res.data.result.status === 'success') {
              return response.json({ result: 'mail sent successfully.' });
            }
          } catch (error) {
            console.log('error', error);
            return response.status(400).json({ error: error.message });
          }
        } else {
          return response.status(404).json({ error: 'user not found.' });
        }
      } else {
        return response.status(404).json({ error: 'document not found.' });
      }
    } else {
      return response.status(405).json({ error: 'Invalid API Token.' });
    }
  } catch (err) {
    console.log('err in resendmail', err);
    return response.status(400).json({ error: err.message || 'Something went wrong.' });
  }
}
