import fs from 'node:fs';
import axios from 'axios';
import { SignPdf } from '@signpdf/signpdf';
import { P12Signer } from '@signpdf/signer-p12';
import { pdflibAddPlaceholder } from '@signpdf/placeholder-pdf-lib';
import { PDFDocument } from 'pdf-lib';
import { cloudServerUrl, replaceMailVaribles, saveFileUsage } from '../../../Utils.js';
import GenerateCertificate from './GenerateCertificate.js';
import uploadFileToS3 from '../uploadFiletoS3.js';
const serverUrl = cloudServerUrl; // process.env.SERVER_URL;
const APPID = process.env.APP_ID;
const masterKEY = process.env.MASTER_KEY;
const eSignName = 'effisign';
const eSigncontact = 'https://effi.com.au/contact/';
// `updateDoc` is used to create url in from pdfFile
async function uploadFile(pdfName, filepath, adapter) {
  try {
    const filedata = fs.readFileSync(filepath);
    let fileUrl;
    if (adapter?.bucketName) {
      const adapterConfig = {
        id: adapter?.id,
        fileAdapter: adapter?.fileAdapter,
        bucketName: adapter?.bucketName,
        region: adapter?.region,
        endpoint: adapter?.endpoint,
        accessKeyId: adapter?.accessKeyId,
        secretAccessKey: adapter?.secretAccessKey,
        baseUrl: adapter?.baseUrl,
      };
      // `uploadFileToS3` is used to save document in user's file storage
      fileUrl = await uploadFileToS3(filedata, pdfName, 'application/pdf', adapterConfig);
    } else {
      const file = new Parse.File(pdfName, [...filedata], 'application/pdf');
      await file.save({ useMasterKey: true });
      fileUrl = file.url();
    }

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
  const url = obj.doc?.SignedUrl;
  const doc = obj.doc;
  const sender = obj.doc.ExtUserPtr;
  const pdfName = doc.Name;

  const mailLogo = 'https://raw.githubusercontent.com/EFFI-Technologies/OpenSign/refs/heads/main/apps/OpenSign/src/assets/images/logo.png';
  //const recipient =
  //  doc?.Signers?.length > 0 ? doc?.Signers?.map(x => x?.Email)?.join(',') : sender.Email;

  let signersMail;
  if (doc?.Signers?.length > 0) {
    const isOwnerExistsinSigners = doc?.Signers?.find(x => x.Email === sender.Email);
    signersMail = isOwnerExistsinSigners
      ? doc?.Signers?.map(x => x?.Email)?.join(',')
      : [...doc?.Signers?.map(x => x?.Email), sender.Email]?.join(',');
  } else {
    signersMail = sender.Email;
  }
  const recipient = signersMail;

  let subject = `Document "${pdfName}" has been signed by all parties`;
  let body =
    "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>  <div style='background-color:#f5f5f5;padding:20px'>    <div style='box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;background-color:white;'> <div><img src=" +
    mailLogo +
    "  height='50' style='padding:20px'/> </div><div style='padding:2px;font-family:system-ui; background-color: #47a3ad;'>    <p style='font-size:20px;font-weight:400;color:white;padding-left:20px',> Document signed successfully</p></div><div><p style='padding:20px;font-family:system-ui;font-size:14px'>All parties have successfully signed the document " +
    `<b>"${pdfName}"</b>` +
    '. Kindly download the document from the attachment.</p></div> </div><div><p>This is an automated email from EffiSign. For any queries regarding this email, please contact the sender ' +
    sender.Email +
    ' directly. If you think this email is inappropriate or spam, you may file a complaint with EffiSign <a href=esign.effi.com.au target=_blank>here</a>.</p></div></div></body></html>';

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
    from: 'EffiSign',
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
async function sendMailsaveCertifcate(doc, P12Buffer, isCustomMail, mailProvider, adapterConfig) {
  const certificate = await GenerateCertificate(doc);
  const certificatePdf = await PDFDocument.load(certificate);
  let passphrase = process.env.PASS_PHRASE;
  if (doc?.ExtUserPtr?.TenantId?.PfxFile?.password) {
    passphrase = doc?.ExtUserPtr?.TenantId?.PfxFile?.password;
  }
  const p12 = new P12Signer(P12Buffer, { passphrase: passphrase || null });
  //  `pdflibAddPlaceholder` is used to add code of only digitial sign in certificate
  pdflibAddPlaceholder({
    pdfDoc: certificatePdf,
    reason: 'Digitally signed by EffiSign.',
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
  const file = await uploadFile('certificate.pdf', './exports/certificate.pdf', adapterConfig);
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
    sendCompletedMail({ isCustomMail, doc, mailProvider });
  }
  saveFileUsage(CertificateBuffer.length, file.imageUrl, doc?.CreatedBy?.objectId);
  sendDoctoWebhook(doc, doc?.SignedUrl, 'completed', '', file.imageUrl);
}
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
    docQuery.include('ExtUserPtr,Signers,ExtUserPtr.TenantId');
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
    // `fileAdapterId` is used check document uploaded in custom file adapter and get customFileAdapter id
    const fileAdapterId = _resDoc?.FileAdapterId || '';
    let adapterConfig = {};
    if (fileAdapterId) {
      // `FileAdapter` is used to credintials of file adapter
      const FileAdapter =
        _resDoc?.ExtUserPtr?.TenantId?.FileAdapters?.find(x => x.id === fileAdapterId) || {};
      if (FileAdapter) {
        adapterConfig = FileAdapter;
      }
    }
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
            let pfxFile = process.env.PFX_BASE64;
      pfxFile = `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
3pXAXxZuvVvv9tsb4bdrBAhyb+KCIjp/gAICCAA=`;
      let passphrase = process.env.PASS_PHRASE;
      console.log('pfxFile',passphrase,pfxFile);
      if (_resDoc?.ExtUserPtr?.TenantId?.PfxFile?.base64) {
        pfxFile = _resDoc?.ExtUserPtr?.TenantId?.PfxFile?.base64;
        passphrase = _resDoc?.ExtUserPtr?.TenantId?.PfxFile?.password;
      }
      // const P12Buffer = fs.readFileSync();
      const P12Buffer = Buffer.from(pfxFile, 'base64');
      const p12Cert = new P12Signer(P12Buffer, { passphrase: passphrase || null });
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
      const docName = _resDoc?.Name?.replace(/\s+/g, '_')?.toLowerCase();
      const name = `signed_${docName}_${randomNumber}.pdf`;
      const filePath = `./exports/${name}`;
      let pdfSize = PdfBuffer.length;
      if (isCompleted) {
        const signersName = _resDoc.Signers?.map(x => x.Name + ' <' + x.Email + '>');
        if (signersName && signersName.length > 0) {
          //  `pdflibAddPlaceholder` is used to add code of only digitial sign without widget
          const pdfDoc = await PDFDocument.load(PdfBuffer);
          pdflibAddPlaceholder({
            pdfDoc: pdfDoc,
            reason: 'Digitally signed by EffiSign for ' + signersName?.join(', '),
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
            reason: 'Digitally signed by EffiSign for ' + username + ' <' + userEmail + '>',
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
        fs.writeFileSync(filePath, signedDocs);
        pdfSize = signedDocs.length;
      } else {
        //`saveUrl` is used to save signed pdf in exports folder
        fs.writeFileSync(filePath, PdfBuffer);
        pdfSize = PdfBuffer.length;
      }

      // `uploadFile` is used to upload pdf to aws s3 and get it's url
      const data = await uploadFile(name, filePath, adapterConfig);

      if (data && data.imageUrl) {
        // `axios` is used to update signed pdf url in contracts_Document classes for given DocId
        const updatedDoc = await updateDoc(
          req.params.docId, //docId
          data.imageUrl, // SignedUrl
          signUser.objectId, // userID
          userIP, // client ipAddress,
          _resDoc, // auditTrail, signers, etc data
          className, // className based on flow
          sign // sign base64
        );
        sendDoctoWebhook(_resDoc, data.imageUrl, 'signed', signUser);
        saveFileUsage(pdfSize, data.imageUrl, _resDoc?.CreatedBy?.objectId);
        if (updatedDoc && updatedDoc.isCompleted) {
          const doc = { ..._resDoc, AuditTrail: updatedDoc.AuditTrail, SignedUrl: data.imageUrl };
          sendMailsaveCertifcate(doc, P12Buffer, isCustomMail, mailProvider, adapterConfig);
        }
        // `fs.unlinkSync` is used to remove exported signed pdf file from exports folder
        fs.unlinkSync(filePath);
        console.log(`New Signed PDF created called: ${filePath}`);
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
