import SignPDF from './SignPDF.cjs';
import fs from 'node:fs';
import axios from 'axios';
import FormData from 'form-data';
import plainplaceholder from './customSignPdf/plainplaceholder.js';
import { plainAddPlaceholder } from 'node-signpdf/dist/helpers/index.js';
const serverUrl = process.env.SERVER_URL;
const APPID = process.env.APP_ID;
const masterKEY = process.env.MASTER_KEY;

// `uploadFile` is used to upload signed pdf on aws s3 and get file url
async function uploadFile(pdfFile) {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(pdfFile));
    const headers = {
      'content-type': 'multipart/form-data',
      'X-Parse-Application-Id': process.env.APP_ID,
    };
    const serverURL = process.env.SERVER_URL;
    // const split = serverURL.split('/');
    // const desiredUrl = serverURL.includes('/app')
    //   ? serverURL.replace('/app', '')
    //   : serverURL.replace('/' + split[3], '');
    const desiredUrl = serverURL.slice(0, -4);
    const url = desiredUrl + '/file_upload'; //process.env.SERVER_URL
    const res = await axios.post(url, formData, { headers: headers });
    // console.log("res ", res.data);
    return res.data;
  } catch (err) {
    console.log('err ', err);
    // `fs.unlinkSync` is used to remove exported signed pdf file from exports folder
    fs.unlinkSync(pdfFile);
  }
}
async function updateDoc(docId, url, userId, ipAddress, data, className) {
  try {
    const UserPtr = {
      __type: 'Pointer',
      className: className,
      objectId: userId,
    };
    const obj = {
      UserPtr: UserPtr,
      SignedUrl: url,
      Activity: 'Signed',
      ipAddress: ipAddress,
    };
    let updateAuditTrail;
    if (data.AuditTrail && data.AuditTrail.length > 0) {
      updateAuditTrail = [...data.AuditTrail, obj];
    } else {
      updateAuditTrail = [obj];
    }

    const auditTrail = updateAuditTrail.filter(x => x.Activity === 'Signed');
    let isCompleted = false;
    if (data.Signers && data.Signers.length > 0) {
      if (auditTrail.length === data.Signers.length) {
        isCompleted = true;
      }
    } else {
      isCompleted = true;
    }
    const body = {
      SignedUrl: url,
      AuditTrail: updateAuditTrail,
      IsCompleted: isCompleted,
    };
    const signedRes = await axios.put(serverUrl + '/classes/contracts_Document/' + docId, body, {
      headers: {
        'Content-Type': 'application/json',
        'X-Parse-Application-Id': APPID,
        'X-Parse-Master-Key': masterKEY,
      },
    });
    return { isCompleted: isCompleted, message: 'success' };
  } catch (err) {
    console.log('update doc err ', err);
    return 'err';
  }
}

// `sendMail` is used to send copy signed mail
async function sendMail(obj) {
  const url = obj.url;
  const sender = obj.sender;
  const pdfName = obj.pdfName;
  const mailLogo = 'https://qikinnovation.ams3.digitaloceanspaces.com/logo.png';
  const recipient = obj.receiver;
  const subject = `${sender.Name} has signed the doc - ${pdfName}`;
  const params = {
    url: url,
    from: 'Open sign',
    recipient: recipient,
    subject: subject,
    pdfName: pdfName,
    html:
      "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>  <div style='background-color:#f5f5f5;padding:20px'>    <div style='box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;background-color:white;'> <div><img src=" +
      mailLogo +
      "  height='50' style='padding:20px'/> </div><div style='padding:2px;font-family:system-ui; background-color: #47a3ad;'>    <p style='font-size:20px;font-weight:400;color:white;padding-left:20px',>  Document Copy</p></div><div><p style='padding:20px;font-family:system-ui;font-size:14px'>A copy of the document " +
      pdfName +
      ' Standard is attached to this email. Kindly download the document from the attachment.</p></div> </div><div><p>This is an automated email from Open Sign. For any queries regarding this email, please contact the sender ' +
      sender.Mail +
      ' directly. If you think this email is inappropriate or spam, you may file a complaint with Open Sign here.</p></div></div></body></html>',
  };

  const res = await axios.post(serverUrl + '/functions/sendmailv3', params, {
    headers: {
      'Content-Type': 'application/json',
      'X-Parse-Application-Id': APPID,
      'X-Parse-Master-Key': masterKEY,
    },
  });
  // console.log('Res ', res);
}

// `sendMail` is used to send copy signed mail
async function sendCompletedMail(obj) {
  const url = obj.url;
  const sender = obj.sender;
  const pdfName = obj.pdfName;
  const mailLogo = 'https://qikinnovation.ams3.digitaloceanspaces.com/logo.png';
  const recipient = obj.receiver;
  const subject = `Document ${pdfName} has beeen signed by all parties`;
  const params = {
    url: url,
    from: 'Open sign',
    recipient: recipient,
    subject: subject,
    pdfName: pdfName,
    html:
      "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>  <div style='background-color:#f5f5f5;padding:20px'>    <div style='box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;background-color:white;'> <div><img src=" +
      mailLogo +
      "  height='50' style='padding:20px'/> </div><div style='padding:2px;font-family:system-ui; background-color: #47a3ad;'>    <p style='font-size:20px;font-weight:400;color:white;padding-left:20px',> Document sign successfully</p></div><div><p style='padding:20px;font-family:system-ui;font-size:14px'>All parties have successfully signed the document" +
      pdfName +
      '. Kindly download the document from the attachment.</p></div> </div><div><p>This is an automated email from Open Sign. For any queries regarding this email, please contact the sender ' +
      sender.Mail +
      ' directly. If you think this email is inappropriate or spam, you may file a complaint with Open Sign here.</p></div></div></body></html>',
  };

  const res = await axios.post(serverUrl + '/functions/sendmailv3', params, {
    headers: {
      'Content-Type': 'application/json',
      'X-Parse-Application-Id': APPID,
      'X-Parse-Master-Key': masterKEY,
    },
  });
  // console.log('Res ', res);
}
/**
 *
 * @param sign base64 sign of user
 * @param docId Id of Document in which user is signing
 * @param pdfFile base64 of pdfFile which you want sign
 * @returns if success {status, data} else {status, message}
 */
async function PDF(req, res) {
  try {
    const sign = req.params.sign;
    const data = '?include=ExtUserPtr';
    const docId = req.params.docId;

    // below bode is used to get info of docId
    const resDoc = await axios.get(serverUrl + '/classes/contracts_Document/' + docId + data, {
      headers: {
        'Content-Type': 'application/json',
        'X-Parse-Application-Id': APPID,
        'X-Parse-Session-Token': req.headers['sessiontoken'],
      },
    });

    // to get user from session token
    const user = await axios.get(serverUrl + '/users/me', {
      headers: {
        'X-Parse-Application-Id': APPID,
        'X-Parse-Session-Token': req.headers['sessiontoken'],
      },
    });
    if (user.data && user.data.objectId) {
      const userPtr = JSON.stringify({
        UserId: {
          __type: 'Pointer',
          className: '_User',
          objectId: user.data.objectId,
        },
      });
      let signUser;
      let className;
      // to get contracts_Users Id from _User ptr
      const contractUser = await axios.get(
        serverUrl + '/classes/contracts_Users?where=' + userPtr,
        {
          headers: {
            'X-Parse-Application-Id': APPID,
            'X-Parse-Session-Token': req.headers['sessiontoken'],
          },
        }
      );
      if (contractUser.data && contractUser.data.results.length > 0) {
        signUser = contractUser;
        className = 'contracts_Users';
      } else {
        // to get contracts_Contactbook Id from _User ptr
        signUser = await axios.get(serverUrl + '/classes/contracts_Contactbook?where=' + userPtr, {
          headers: {
            'X-Parse-Application-Id': APPID,
            'X-Parse-Session-Token': req.headers['sessiontoken'],
          },
        });
        className = 'contracts_Contactbook';
      }
      // console.log("signUser ", signUser.data.results[0].objectId);
      // console.log("resDoc ", resDoc);
      const username = signUser.data.results[0].Name; // resDoc.data.ExtUserPtr.Name;
      const userEmail = signUser.data.results[0].Email; //resDoc.data.ExtUserPtr.Email;
      if (req.params.pdfFile) {
        //  `PdfBuffer` used to create buffer from pdf file
        let PdfBuffer = Buffer.from(req.params.pdfFile, 'base64');
        // let PdfBuffer = fs.readFileSync("exports/exported_file_688.pdf");
        // let PdfBuffer = fs.readFileSync("exports/simple.pdf");

        //  `P12Buffer` used to create buffer from p12 certificate
        const P12Buffer = fs.readFileSync(`pdfFile/emudhra-test-class2.pfx`);

        if (sign) {
          //  `plainAddPlaceholder` is used to add code of digitial sign in pdf file
          PdfBuffer = plainplaceholder({
            pdfBuffer: PdfBuffer,
            reason: 'Digitally signed by Open sign for ' + username + ' <' + userEmail + '>',
            location: 'test location',
            signatureLength: 10000,
            sign: sign,
          });
        } else {
          //  `plainAddPlaceholder` is used to add code of only digitial sign without widget
          PdfBuffer = plainAddPlaceholder({
            pdfBuffer: PdfBuffer,
            reason: 'Digitally signed by Open sign for ' + username + ' <' + userEmail + '>',
            location: 'test location',
            signatureLength: 10000,
          });
        }

        // console.log("PdfBuffer ", PdfBuffer);
        // const clientIP = req.headers["x-real-ip"];
        // console.log("req.ip", clientIP);

        //`new signPDF` create new instance of pdfBuffer and p12Buffer
        const OBJ = new SignPDF(PdfBuffer, P12Buffer);

        // `signedDocs` is used to signpdf digitally
        const signedDocs = await OBJ.signPDF();

        const randomNumber = Math.floor(Math.random() * 5000);
        const pdfName = `./exports/exported_file_${randomNumber}.pdf`;

        //`saveUrl` is used to save signed pdf in exports folder
        const saveUrl = fs.writeFileSync(pdfName, signedDocs);

        // `uploadFile` is used to upload pdf to aws s3 and get it's url
        const data = await uploadFile(pdfName);
        if (data && data.imageUrl) {
          // `axios` is used to update signed pdf url in contracts_Document classes for given DocId
          const res = await updateDoc(
            req.params.docId, //docId
            data.imageUrl, // url
            signUser.data.results[0].objectId, // userID
            req.headers['x-real-ip'], // client ipAddress,
            resDoc.data, // auditTrail, signers, etc data
            className
          );
          const obj = {
            url: data.imageUrl,
            sender: {
              Mail: resDoc.data.ExtUserPtr.Email,
              Name: resDoc.data.ExtUserPtr.Name,
            },
            pdfName: resDoc.data.Name,
            receiver: userEmail,
          };
          sendMail(obj);
          // console.log("res ", res);
          if (res && res.isCompleted) {
            // console.log("res.IsCompleted ", res.isCompleted);
            const mailObj = {
              url: data.imageUrl,
              sender: {
                Mail: resDoc.data.ExtUserPtr.Email,
                Name: 'Open sign',
              },
              pdfName: resDoc.data.Name,
              receiver: resDoc.data.ExtUserPtr.Email,
            };
            sendCompletedMail(mailObj);
          }
          // `fs.unlinkSync` is used to remove exported signed pdf file from exports folder
          fs.unlinkSync(pdfName);
          console.log(`New Signed PDF created called: ${pdfName}`);
          if (res.message === 'success') {
            return { status: 'success', data: data.imageUrl };
          } else {
            return {
              status: 'error',
              message: 'please provide required parameters!',
            };
          }
        }
      } else {
        return { status: 'error', message: 'pdf file not present!' };
      }
    } else {
      return { status: 'error', message: 'this user not allowed!' };
    }
  } catch (err) {
    console.log('Err ', err);
    if (err.code === 'ERR_BAD_REQUEST') {
      return {
        status: 'error',
        message: 'Invalid session token!',
      };
    } else {
      return {
        status: 'error',
        message: 'Encrypted files are currently not supported!',
      };
    }
  }
}
export default PDF;
