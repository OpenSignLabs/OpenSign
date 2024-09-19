import fs from 'node:fs';
import axios from 'axios';
import { SignPdf } from '@signpdf/signpdf';
import { P12Signer } from '@signpdf/signer-p12';
import { pdflibAddPlaceholder } from '@signpdf/placeholder-pdf-lib';
import { PDFDocument } from 'pdf-lib';
import { cloudServerUrl, replaceMailVaribles, saveFileUsage } from '../../../Utils.js';
import GenerateCertificate from './GenerateCertificate.js';
const serverUrl = cloudServerUrl; // process.env.SERVER_URL;
const APPID = process.env.APP_ID;
const masterKEY = process.env.MASTER_KEY;
const eSignName = 'opensign';
const eSigncontact = 'hello@opensignlabs.com';
// `updateDoc` is used to create url in from pdfFile
async function uploadFile(pdfName, filepath) {
  try {
    const filedata = fs.readFileSync(filepath);
    const file = new Parse.File(pdfName, [...filedata], 'application/pdf');
    await file.save({ useMasterKey: true });
    const fileUrl = file.url();
    return { imageUrl: fileUrl };
  } catch (err) {
    console.log('Err ', err);
    // `fs.unlinkSync` is used to remove exported signed pdf file from exports folder
    fs.unlinkSync(filepath);
  }
}

// `updateDoc` is used to update signedUrl, AuditTrail, Iscompleted in document
async function updateDoc(docId, url, userId, ipAddress, data, className, sign) {
  try {
    const UserPtr = { __type: 'Pointer', className: className, objectId: userId };
    const obj = {
      UserPtr: UserPtr,
      SignedUrl: url,
      Activity: 'Signed',
      ipAddress: ipAddress,
      SignedOn: new Date(),
      Signature: sign,
    };
    let updateAuditTrail;
    if (data.AuditTrail && data.AuditTrail.length > 0) {
      const AuditTrail = JSON.parse(JSON.stringify(data.AuditTrail));
      const existingIndex = AuditTrail.findIndex(
        entry => entry.UserPtr.objectId === userId && entry.Activity !== 'Created'
      );
      existingIndex !== -1
        ? (AuditTrail[existingIndex] = { ...AuditTrail[existingIndex], ...obj })
        : AuditTrail.push(obj);

      updateAuditTrail = AuditTrail;
    } else {
      updateAuditTrail = [obj];
    }

    const auditTrail = updateAuditTrail.filter(x => x.Activity === 'Signed');
    let isCompleted = false;
    if (data.Signers && data.Signers.length > 0) {
      if (auditTrail.length === data.Placeholders.length) {
        isCompleted = true;
      }
    } else {
      isCompleted = true;
    }
    const body = { SignedUrl: url, AuditTrail: updateAuditTrail, IsCompleted: isCompleted };
    const signedRes = await axios.put(serverUrl + '/classes/contracts_Document/' + docId, body, {
      headers: {
        'Content-Type': 'application/json',
        'X-Parse-Application-Id': APPID,
        'X-Parse-Master-Key': masterKEY,
      },
    });
    return { isCompleted: isCompleted, message: 'success', AuditTrail: updateAuditTrail };
  } catch (err) {
    console.log('update doc err ', err);
    return 'err';
  }
}

// `sendCompletedMail` is used to send copy of completed document mail
async function sendCompletedMail(obj) {
  const url = obj.url;
  const doc = obj.doc;
  const sender = obj.doc.ExtUserPtr;
  const pdfName = doc.Name;
  const mailLogo = 'https://qikinnovation.ams3.digitaloceanspaces.com/logo.png';
  const recipient = sender.Email;
  let subject = `Document "${pdfName}" has been signed by all parties`;
  let body =
    "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>  <div style='background-color:#f5f5f5;padding:20px'>    <div style='box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;background-color:white;'> <div><img src=" +
    mailLogo +
    "  height='50' style='padding:20px'/> </div><div style='padding:2px;font-family:system-ui; background-color: #47a3ad;'>    <p style='font-size:20px;font-weight:400;color:white;padding-left:20px',> Document signed successfully</p></div><div><p style='padding:20px;font-family:system-ui;font-size:14px'>All parties have successfully signed the document " +
    `<b>"${pdfName}"</b>` +
    '. Kindly download the document from the attachment.</p></div> </div><div><p>This is an automated email from OpenSign™. For any queries regarding this email, please contact the sender ' +
    sender.Email +
    ' directly. If you think this email is inappropriate or spam, you may file a complaint with OpenSign™ <a href=www.opensignlabs.com target=_blank>here</a>.</p></div></div></body></html>';

  if (obj?.isCustomMail) {
    try {
      const tenantCreditsQuery = new Parse.Query('partners_Tenant');
      tenantCreditsQuery.equalTo('UserId', {
        __type: 'Pointer',
        className: '_User',
        objectId: sender.UserId.objectId,
      });
      const res = await tenantCreditsQuery.first();
      if (res) {
        const _res = JSON.parse(JSON.stringify(res));
        if (_res?.CompletionSubject) {
          subject = _res?.CompletionSubject;
        }
        if (_res?.CompletionBody) {
          body = _res?.CompletionBody;
        }
        const expireDate = doc.ExpiryDate.iso;
        const newDate = new Date(expireDate);
        const localExpireDate = newDate.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        const variables = {
          document_title: pdfName,
          sender_name: sender.Name,
          sender_mail: sender.Email,
          sender_phone: sender?.Phone || '',
          receiver_name: sender.Name,
          receiver_email: sender.Email,
          receiver_phone: sender?.Phone || '',
          expiry_date: localExpireDate,
          company_name: sender.Company,
        };
        const replaceVar = replaceMailVaribles(subject, body, variables);
        subject = replaceVar.subject;
        body = replaceVar.body;
      }
    } catch (err) {
      console.log('error in fetch tenant in signpdf', err.message);
    }
  }
  const params = {
    extUserId: sender.objectId,
    url: url,
    from: 'OpenSign™',
    recipient: recipient,
    subject: subject,
    pdfName: pdfName,
    html: body,
    mailProvider: obj.mailProvider,
  };
  const res = await axios.post(serverUrl + '/functions/sendmailv3', params, {
    headers: {
      'Content-Type': 'application/json',
      'X-Parse-Application-Id': APPID,
      'X-Parse-Master-Key': masterKEY,
    },
  });
}

// `sendDoctoWebhook` is used to send res data of document on webhook
async function sendDoctoWebhook(doc, Url, event, signUser, certificateUrl) {
  let signers = [];
  if (signUser) {
    signers = { name: signUser?.Name, email: signUser?.Email, phone: signUser?.Phone };
  } else {
    signers = doc?.Signers?.map(x => ({ name: x.Name, email: x.Email, phone: x.Phone })) || [
      { name: doc?.ExtUserPtr?.Name, email: doc?.ExtUserPtr?.Email, phone: doc?.ExtUserPtr?.Phone },
    ];
  }

  if (doc.ExtUserPtr?.Webhook) {
    const time =
      event === 'signed'
        ? { signer: signers, signedAt: new Date() }
        : { signers: signers, completedAt: new Date() };
    const certificate = certificateUrl ? { certificate: certificateUrl } : {};
    const params = {
      event: event,
      objectId: doc?.objectId,
      file: Url || '',
      ...certificate,
      name: doc?.Name,
      note: doc?.Note || '',
      description: doc?.Description || '',
      ...time,
      createdAt: doc?.createdAt,
    };
    axios
      .post(doc?.ExtUserPtr?.Webhook, params, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then(res => {
        try {
          const webhook = new Parse.Object('contracts_Webhook');
          webhook.set('Log', res?.status);
          webhook.set('UserId', {
            __type: 'Pointer',
            className: '_User',
            objectId: doc.ExtUserPtr.UserId.objectId,
          });
          webhook.save(null, { useMasterKey: true });
        } catch (err) {
          console.log('err save in contracts_Webhook', err.message);
        }
      })
      .catch(err => {
        console.log('Err send data to webhook', err.message);
        try {
          const webhook = new Parse.Object('contracts_Webhook');
          webhook.set('Log', err?.status);
          webhook.set('UserId', {
            __type: 'Pointer',
            className: '_User',
            objectId: doc.ExtUserPtr.UserId.objectId,
          });
          webhook.save(null, { useMasterKey: true });
        } catch (err) {
          console.log('err save in contracts_Webhook', err.message);
        }
      });
  }
}

// `sendMailsaveCertifcate` is used send completion mail and update complete status of document
const sendMailsaveCertifcate = async (doc, P12Buffer, url, isCustomMail, mailProvider, userId) => {
  const certificate = await GenerateCertificate(doc);
  const certificatePdf = await PDFDocument.load(certificate);
  const p12 = new P12Signer(P12Buffer, { passphrase: process.env.PASS_PHRASE || null });
  //  `pdflibAddPlaceholder` is used to add code of only digitial sign in certificate
  pdflibAddPlaceholder({
    pdfDoc: certificatePdf,
    reason: 'Digitally signed by OpenSign.',
    location: 'n/a',
    name: eSignName,
    contactInfo: eSigncontact,
    signatureLength: 15000,
  });
  const pdfWithPlaceholderBytes = await certificatePdf.save();
  const CertificateBuffer = Buffer.from(pdfWithPlaceholderBytes);
  //`new signPDF` create new instance of CertificateBuffer and p12Buffer
  const certificateOBJ = new SignPdf();
  // `signedCertificate` is used to sign certificate digitally
  const signedCertificate = await certificateOBJ.sign(CertificateBuffer, p12);

  //below is used to save signed certificate in exports folder
  fs.writeFileSync('./exports/certificate.pdf', signedCertificate);
  const file = await uploadFile('certificate.pdf', './exports/certificate.pdf');
  const body = { CertificateUrl: file.imageUrl };
  await axios.put(serverUrl + '/classes/contracts_Document/' + doc.objectId, body, {
    headers: {
      'Content-Type': 'application/json',
      'X-Parse-Application-Id': APPID,
      'X-Parse-Master-Key': masterKEY,
    },
  });
  // used in API only
  if (doc.IsSendMail === false) {
    console.log("don't send mail");
  } else {
    const mailObj = { url: url, isCustomMail: isCustomMail, doc: doc, mailProvider: mailProvider };
    sendCompletedMail(mailObj);
  }
  saveFileUsage(CertificateBuffer.length, file.imageUrl, userId);
  sendDoctoWebhook(doc, url, 'completed', '', file.imageUrl);
};
/**
 *
 * @param docId Id of Document in which user is signing
 * @param pdfFile base64 of pdfFile which you want sign
 * @returns if success {status, data} else {status, message}
 */
async function PDF(req) {
  try {
    const userIP = req.headers['x-real-ip']; // client IPaddress
    const docId = req.params.docId;
    const reqUserId = req.params.userId;
    const isCustomMail = req.params.isCustomCompletionMail || false;
    const mailProvider = req.params.mailProvider || '';
    const sign = req.params.signature || '';
    // below bode is used to get info of docId
    const docQuery = new Parse.Query('contracts_Document');
    docQuery.include('ExtUserPtr,Signers');
    docQuery.equalTo('objectId', docId);
    const resDoc = await docQuery.first({ useMasterKey: true });
    if (!resDoc) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Document not found.');
    }
    const IsEnableOTP = resDoc?.get('IsEnableOTP') || false;
    // if `IsEnableOTP` is false then we don't have to check authentication
    if (IsEnableOTP) {
      if (!req?.user) {
        throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
      }
    }
    const _resDoc = resDoc?.toJSON();
    let signUser;
    let className;
    // `reqUserId` is send throught pdfrequest signing flow
    if (reqUserId) {
      // to get contracts_Contactbook details for currentuser from reqUserId
      const _contractUser = _resDoc.Signers.find(x => x.objectId === reqUserId);
      if (_contractUser) {
        signUser = _contractUser;
        className = 'contracts_Contactbook';
      }
    } else {
      className = 'contracts_Users';
      signUser = _resDoc.ExtUserPtr;
    }

    const username = signUser.Name;
    const userEmail = signUser.Email;
    if (req.params.pdfFile) {
      //  `PdfBuffer` used to create buffer from pdf file
      let PdfBuffer = Buffer.from(req.params.pdfFile, 'base64');
      //  `P12Buffer` used to create buffer from p12 certificate
      const pfxFile = process.env.PFX_BASE64;
      // const P12Buffer = fs.readFileSync();
      const P12Buffer = Buffer.from(pfxFile, 'base64');
      const p12Cert = new P12Signer(P12Buffer, { passphrase: process.env.PASS_PHRASE || null });
      const UserPtr = { __type: 'Pointer', className: className, objectId: signUser.objectId };
      const obj = { UserPtr: UserPtr, SignedUrl: '', Activity: 'Signed', ipAddress: userIP };
      let updateAuditTrail;
      if (_resDoc.AuditTrail && _resDoc.AuditTrail.length > 0) {
        updateAuditTrail = [..._resDoc.AuditTrail, obj];
      } else {
        updateAuditTrail = [obj];
      }

      const auditTrail = updateAuditTrail.filter(x => x.Activity === 'Signed');
      let isCompleted = false;
      if (_resDoc.Signers && _resDoc.Signers.length > 0) {
        if (auditTrail.length === _resDoc.Signers.length) {
          isCompleted = true;
        }
      } else {
        isCompleted = true;
      }
      const randomNumber = Math.floor(Math.random() * 5000);
      const name = `exported_file_${randomNumber}.pdf`;
      const pdfName = `./exports/${name}`;
      let pdfSize = PdfBuffer.length;
      if (isCompleted) {
        const signersName = _resDoc.Signers?.map(x => x.Name + ' <' + x.Email + '>');
        if (signersName && signersName.length > 0) {
          //  `pdflibAddPlaceholder` is used to add code of only digitial sign without widget
          const pdfDoc = await PDFDocument.load(PdfBuffer);
          pdflibAddPlaceholder({
            pdfDoc: pdfDoc,
            reason: 'Digitally signed by OpenSign for ' + signersName?.join(', '),
            location: 'n/a',
            name: eSignName,
            contactInfo: eSigncontact,
            signatureLength: 15000,
          });
          const pdfWithPlaceholderBytes = await pdfDoc.save();
          PdfBuffer = Buffer.from(pdfWithPlaceholderBytes);
        } else {
          //  `pdflibAddPlaceholder` is used to add code of only digitial sign without widget (signyourself)
          const pdfDoc = await PDFDocument.load(PdfBuffer);
          pdflibAddPlaceholder({
            pdfDoc: pdfDoc,
            reason: 'Digitally signed by OpenSign for ' + username + ' <' + userEmail + '>',
            location: 'n/a',
            name: eSignName,
            contactInfo: eSigncontact,
            signatureLength: 15000,
          });
          const pdfWithPlaceholderBytes = await pdfDoc.save();
          PdfBuffer = Buffer.from(pdfWithPlaceholderBytes);
        }
        //`new signPDF` create new instance of pdfBuffer and p12Buffer
        const OBJ = new SignPdf();
        // `signedDocs` is used to signpdf digitally
        const signedDocs = await OBJ.sign(PdfBuffer, p12Cert);

        //`saveUrl` is used to save signed pdf in exports folder
        const saveUrl = fs.writeFileSync(pdfName, signedDocs);
        pdfSize = signedDocs.length;
      } else {
        //`saveUrl` is used to save signed pdf in exports folder
        const saveUrl = fs.writeFileSync(pdfName, PdfBuffer);
        pdfSize = PdfBuffer.length;
      }

      // `uploadFile` is used to upload pdf to aws s3 and get it's url
      const data = await uploadFile(name, pdfName);

      if (data && data.imageUrl) {
        // `axios` is used to update signed pdf url in contracts_Document classes for given DocId
        const updatedDoc = await updateDoc(
          req.params.docId, //docId
          data.imageUrl, // url
          signUser.objectId, // userID
          userIP, // client ipAddress,
          _resDoc, // auditTrail, signers, etc data
          className, // className based on flow
          sign // sign base64
        );
        sendDoctoWebhook(_resDoc, data.imageUrl, 'signed', signUser);
        saveFileUsage(pdfSize, data.imageUrl, _resDoc?.CreatedBy?.objectId);
        if (updatedDoc && updatedDoc.isCompleted) {
          const doc = { ..._resDoc, AuditTrail: updatedDoc.AuditTrail };
          sendMailsaveCertifcate(
            doc,
            P12Buffer,
            data.imageUrl,
            isCustomMail,
            mailProvider,
            _resDoc?.CreatedBy?.objectId
          );
        }
        // `fs.unlinkSync` is used to remove exported signed pdf file from exports folder
        fs.unlinkSync(pdfName);
        console.log(`New Signed PDF created called: ${pdfName}`);
        if (updatedDoc.message === 'success') {
          return { status: 'success', data: data.imageUrl };
        } else {
          const error = new Error('Please provide required parameters!');
          error.code = 400; // Set the error code (e.g., 400 for bad request)
          throw error;
        }
      }
    } else {
      const error = new Error('Pdf file not present!');
      error.code = 400; // Set the error code (e.g., 400 for bad request)
      throw error;
    }
  } catch (err) {
    console.log('Err in signpdf', err);
    throw err;
  }
}
export default PDF;
