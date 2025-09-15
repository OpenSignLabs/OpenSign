import fs from 'node:fs';
import axios from 'axios';
import { PDFDocument } from 'pdf-lib';
import {
  cloudServerUrl,
  replaceMailVaribles,
  saveFileUsage,
  getSecureUrl,
  appName,
  serverAppId,
} from '../../../Utils.js';
import GenerateCertificate from './GenerateCertificate.js';
import { pdflibAddPlaceholder } from '@signpdf/placeholder-pdf-lib';
import { Placeholder } from './Placeholder.js';
import { SignPdf } from '@signpdf/signpdf';
import { P12Signer } from '@signpdf/signer-p12';
import { buildDownloadFilename } from '../../../utils/fileUtils.js';

const serverUrl = cloudServerUrl; // process.env.SERVER_URL;
const APPID = serverAppId;
const masterKEY = process.env.MASTER_KEY;
const eSignName = 'OpenSign';
const eSigncontact = 'hello@opensignlabs.com';
const docUrl = `${serverUrl}/classes/contracts_Document`;
const headers = {
  'Content-Type': 'application/json',
  'X-Parse-Application-Id': APPID,
  'X-Parse-Master-Key': masterKEY,
};

async function unlinkFile(path) {
  if (fs.existsSync(path)) {
    try {
      fs.unlinkSync(path);
    } catch (err) {
      console.log('Err in unlink file: ', path);
    }
  }
}

// `updateDoc` is used to create url in from pdfFile
async function uploadFile(pdfName, filepath) {
  try {
    const filedata = fs.readFileSync(filepath);
    let fileUrl;
    const file = new Parse.File(pdfName, [...filedata], 'application/pdf');
    await file.save({ useMasterKey: true });
    const fileRes = getSecureUrl(file.url());
    fileUrl = fileRes.url;

    return { imageUrl: fileUrl };
  } catch (err) {
    console.log('Err ', err);
    // below line of code is used to remove exported signed pdf file from exports folder
    unlinkFile(filepath);
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
      //'removePrefill' is used to remove prefill role from placeholders filed then compare length to change status of document
      const removePrefill =
        data.Placeholders.length > 0 && data.Placeholders.filter(x => x.Role !== 'prefill');
      if (auditTrail.length === removePrefill?.length) {
        isCompleted = true;
      }
    } else {
      isCompleted = true;
    }
    const body = { SignedUrl: url, AuditTrail: updateAuditTrail, IsCompleted: isCompleted };
    const signedRes = await axios.put(`${docUrl}/${docId}`, body, { headers });
    return { isCompleted: isCompleted, message: 'success', AuditTrail: updateAuditTrail };
  } catch (err) {
    console.log('update doc err ', err);
    return 'err';
  }
}

// `sendNotifyMail` is used to send notification mail of signer signed the document
async function sendNotifyMail(doc, signUser, mailProvider, publicUrl) {
  try {
    const TenantAppName = appName;
    const logo =
      "<img src='https://qikinnovation.ams3.digitaloceanspaces.com/logo.png' height='50' style='padding:20px'/>";
    const opurl = ` <a href=www.opensignlabs.com target=_blank>here</a>`;
    const auditTrailCount = doc?.AuditTrail?.filter(x => x.Activity === 'Signed')?.length || 0;
    const removePrefill =
      doc?.Placeholders?.length > 0 && doc?.Placeholders?.filter(x => x?.Role !== 'prefill');
    const signersCount = removePrefill?.length;
    const remainingSign = signersCount - auditTrailCount;
    if (remainingSign > 1 && doc?.NotifyOnSignatures) {
      const sender = doc.ExtUserPtr;
      const pdfName = doc.Name;
      const creatorName = doc.ExtUserPtr.Name;
      const creatorEmail = doc.ExtUserPtr.Email;
      const signerName = signUser.Name;
      const signerEmail = signUser.Email;
      const viewDocUrl = `${publicUrl}/recipientSignPdf/${doc.objectId}`;
      const subject = `Document "${pdfName}" has been signed by ${signerName}`;
      const body =
        "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'/></head><body><div style='background-color:#f5f5f5;padding:20px'><div style='background-color:white'>" +
        `<div>${logo}</div><div style='padding:2px;font-family:system-ui;background-color:#47a3ad'><p style='font-size:20px;font-weight:400;color:white;padding-left:20px'>Document signed by ${signerName}</p>` +
        `</div><div style='padding:20px;font-family:system-ui;font-size:14px'><p>Dear ${creatorName},</p><p>${pdfName} has been signed by ${signerName} "${signerEmail}" successfully</p>` +
        `<p><a href=${viewDocUrl} target=_blank>View Document</a></p></div></div><div><p>This is an automated email from ${TenantAppName}. For any queries regarding this email, ` +
        `please contact the sender ${creatorEmail} directly. If you think this email is inappropriate or spam, you may file a complaint with ${TenantAppName}${opurl}.</p></div></div></body></html>`;

      const params = {
        extUserId: sender.objectId,
        from: TenantAppName,
        recipient: creatorEmail,
        subject: subject,
        pdfName: pdfName,
        html: body,
        mailProvider: mailProvider,
      };
      await axios.post(serverUrl + '/functions/sendmailv3', params, { headers });
    }
  } catch (err) {
    console.log('err in sendnotifymail', err);
  }
}

// `sendCompletedMail` is used to send copy of completed document mail
async function sendCompletedMail(obj) {
  const url = obj.doc?.SignedUrl;
  const doc = obj.doc;
  const sender = obj.doc.ExtUserPtr;
  const pdfName = doc.Name;
  const TenantAppName = appName;
  const logo =
    "<img src='https://qikinnovation.ams3.digitaloceanspaces.com/logo.png' height='50' style='padding:20px'/>";
  const opurl = ` <a href=www.opensignlabs.com target=_blank>here</a>`;
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
    "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body><div style='background-color:#f5f5f5;padding:20px'><div style='background-color:white'>" +
    `<div>${logo}</div><div style='padding:2px;font-family:system-ui;background-color:#47a3ad'><p style='font-size:20px;font-weight:400;color:white;padding-left:20px'>Document signed successfully</p></div><div>` +
    `<p style='padding:20px;font-family:system-ui;font-size:14px'>All parties have successfully signed the document <b>"${pdfName}"</b>. Kindly download the document from the attachment.</p>` +
    `</div></div><div><p>This is an automated email from ${TenantAppName}. For any queries regarding this email, please contact the sender ${sender.Email} directly.` +
    `If you think this email is inappropriate or spam, you may file a complaint with ${TenantAppName}${opurl}.</p></div></div></body></html>`;

  if (obj?.isCustomMail) {
    const tenant = sender?.TenantId;
    if (tenant) {
      subject = tenant?.CompletionSubject || '';
      body = tenant?.CompletionBody || '';
    } else {
      const userId = sender?.CreatedBy?.objectId || sender?.UserId?.objectId;
      if (userId) {
        try {
          const tenantQuery = new Parse.Query('partners_Tenant');
          tenantQuery.equalTo('UserId', {
            __type: 'Pointer',
            className: '_User',
            objectId: userId,
          });
          const tenantRes = await tenantQuery.first({ useMasterKey: true });
          if (tenantRes) {
            const _tenantRes = JSON.parse(JSON.stringify(tenantRes));
            subject = _tenantRes?.CompletionSubject || '';
            body = _tenantRes?.CompletionBody || '';
          }
        } catch (err) {
          console.log('error in fetch tenant in signpdf', err.message);
        }
      }
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
      sender_mail: doc?.SenderMail || sender.Email,
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
  const Bcc = doc?.Bcc?.length > 0 ? doc.Bcc.map(x => x.Email) : [];
  const updatedBcc = doc?.SenderMail ? [...Bcc, doc?.SenderMail] : Bcc;
  const formatId = doc?.ExtUserPtr?.DownloadFilenameFormat;
  const filename = pdfName?.length > 100 ? pdfName?.slice(0, 100) : pdfName;
  const docName = buildDownloadFilename(formatId, {
    docName: filename,
    email: doc?.ExtUserPtr?.Email,
    isSigned: true,
  });
  const params = {
    extUserId: sender.objectId,
    url: url,
    from: TenantAppName,
    replyto: doc?.ExtUserPtr?.Email || '',
    recipient: recipient,
    subject: subject,
    pdfName: pdfName,
    html: body,
    mailProvider: obj.mailProvider,
    bcc: updatedBcc?.length > 0 ? updatedBcc : '',
    certificatePath: `./exports/signed_certificate_${doc.objectId}.pdf`,
    filename: docName,
  };
  try {
    const res = await axios.post(serverUrl + '/functions/sendmailv3', params, { headers });
    // console.log('res', res.data.result);
    if (res.data?.result?.status !== 'success') {
      unlinkFile(`./exports/signed_certificate_${doc.objectId}.pdf`);
    }
  } catch (err) {
    unlinkFile(`./exports/signed_certificate_${doc.objectId}.pdf`);
  }
}

// `sendMailsaveCertifcate` is used send completion mail and update complete status of document
async function sendMailsaveCertifcate(doc, pfx, isCustomMail, mailProvider, filename) {
  const certificate = await GenerateCertificate(doc);
  const certificatePdf = await PDFDocument.load(certificate);
  const P12Buffer = fs.readFileSync(pfx.name);
  const p12 = new P12Signer(P12Buffer, { passphrase: pfx.passphrase || null });
  //  `pdflibAddPlaceholder` is used to add code of only digitial sign in certificate
  pdflibAddPlaceholder({
    pdfDoc: certificatePdf,
    reason: `Digitally signed by ${eSignName}.`,
    location: 'n/a',
    name: eSignName,
    contactInfo: eSigncontact,
    signatureLength: 16000,
  });
  const pdfWithPlaceholderBytes = await certificatePdf.save();
  const CertificateBuffer = Buffer.from(pdfWithPlaceholderBytes);
  //`new signPDF` create new instance of CertificateBuffer and p12Buffer
  const certificateOBJ = new SignPdf();
  // `signedCertificate` is used to sign certificate digitally
  const signedCertificate = await certificateOBJ.sign(CertificateBuffer, p12);
  const certificatePath = `./exports/signed_certificate_${doc.objectId}.pdf`;

  //below is used to save signed certificate in exports folder
  fs.writeFileSync(certificatePath, signedCertificate);
  const file = await uploadFile('certificate.pdf', certificatePath);
  const body = { CertificateUrl: file.imageUrl };
  await axios.put(`${docUrl}/${doc.objectId}`, body, { headers });
  // used in API only
  if (doc.IsSendMail === false) {
    console.log("don't send mail");
  } else {
    sendCompletedMail({ isCustomMail, doc, mailProvider, filename });
  }
  saveFileUsage(CertificateBuffer.length, file.imageUrl, doc?.CreatedBy?.objectId);
  unlinkFile(pfx.name);
  return file.imageUrl;
}

/**
 * Process a PDF for signing:
 * - updates audit trail, generates certificate.
 * - Optionally inserts a signature placeholder (Placeholder()).
 * - Otherwise (no merge + no placeholder), it flattens forms for finalization.
 *
 * @param {Object} _resDoc - Document details (expects AuditTrail, etc.)
 * @param {Buffer|Uint8Array} pdfBytes - Original PDF bytes
 * @param {string} [options.reason] - Reason text used in placeholder
 * @param {string} [options.UserPtr] -  user pointer (for audit trail)
 * @param {string} [options.ipAddress] - IP (for audit trail)
 * @param {string} [options.Signature] - Signature (for audit trail)
 * @returns {Promise<Buffer>} merged PDF Buffer
 */
async function processPdf(_resDoc, PdfBuffer, reason) {
  // No CC merge; operate directly on the original PDF
  const pdfDoc = await PDFDocument.load(PdfBuffer);
  const form = pdfDoc.getForm();
  // Updates the field appearances to ensure visual changes are reflected.
  form.updateFieldAppearances();
  // Flattens the form, converting all form fields into non-editable, static content
  form.flatten();
  Placeholder({
    pdfDoc: pdfDoc,
    reason: `Digitally signed by ${eSignName} for ${reason}`,
    location: 'n/a',
    name: eSignName,
    contactInfo: eSigncontact,
    signatureLength: 16000,
  });
  const pdfWithPlaceholderBytes = await pdfDoc.save();
  return Buffer.from(pdfWithPlaceholderBytes);
}
/**
 *
 * @param docId Id of Document in which user is signing
 * @param pdfFile base64 of pdfFile which you want sign
 * @returns if success {status, data} else {status, message}
 */
async function PDF(req) {
  const docId = req.params.docId;
  const randomNumber = Math.floor(Math.random() * 5000);
  const pfxname = `keystore_${randomNumber}.pfx`;
  try {
    const userIP = req.headers['x-real-ip']; // client IPaddress
    const reqUserId = req.params.userId;
    const isCustomMail = req.params.isCustomCompletionMail || false;
    const mailProvider = req.params.mailProvider || '';
    const sign = req.params.signature || '';
    const publicUrl = req.headers.public_url;
    // below bode is used to get info of docId
    const docQuery = new Parse.Query('contracts_Document');
    docQuery.include('ExtUserPtr,Signers,ExtUserPtr.TenantId,Bcc');
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
      let pfxFile = process.env.PFX_BASE64;
      let passphrase = process.env.PASS_PHRASE;
      if (_resDoc?.ExtUserPtr?.TenantId?.PfxFile?.base64) {
        pfxFile = _resDoc?.ExtUserPtr?.TenantId?.PfxFile?.base64;
        passphrase = _resDoc?.ExtUserPtr?.TenantId?.PfxFile?.password;
      }
      const pfx = { name: pfxname, passphrase: passphrase };
      const P12Buffer = Buffer.from(pfxFile, 'base64');
      fs.writeFileSync(pfxname, P12Buffer);
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
        const removePrefill =
          _resDoc?.Placeholders?.length > 0 &&
          _resDoc?.Placeholders?.filter(x => x?.Role !== 'prefill');
        if (auditTrail.length === removePrefill?.length) {
          // if (auditTrail.length === _resDoc.Signers.length) {
          isCompleted = true;
        }
      } else {
        isCompleted = true;
      }
      // below regex is used to replace all word with "_" except A to Z, a to z, numbers
      const docName = _resDoc?.Name?.replace(/[^a-zA-Z0-9._-]/g, '_')?.toLowerCase();
      const filename = docName?.length > 100 ? docName?.slice(0, 100) : docName;
      const name = `${filename}_${randomNumber}.pdf`;
      let filePath = `./exports/${name}`;
      let signedFilePath = `./exports/signed_${name}`;
      let pdfSize = PdfBuffer.length;
      if (isCompleted) {
        const signersName = _resDoc.Signers?.map(x => x.Name + ' <' + x.Email + '>');
        const reason =
          signersName && signersName.length > 0
            ? signersName?.join(', ')
            : username + ' <' + userEmail + '>';
        const p12Cert = new P12Signer(P12Buffer, { passphrase: passphrase || null });
        signedFilePath = `./exports/signed_${name}`;
        PdfBuffer = await processPdf(_resDoc, PdfBuffer, reason, UserPtr, userIP, sign);
        //`new signPDF` create new instance of pdfBuffer and p12Buffer
        const OBJ = new SignPdf();
        // `signedDocs` is used to signpdf digitally
        const signedDocs = await OBJ.sign(PdfBuffer, p12Cert);

        //`saveUrl` is used to save signed pdf in exports folder
        fs.writeFileSync(signedFilePath, signedDocs);
        pdfSize = signedDocs.length;
        console.log(`✅ PDF digitally signed created: ${signedFilePath} \n`);
      } else {
        //`saveUrl` is used to save signed pdf in exports folder
        fs.writeFileSync(signedFilePath, PdfBuffer);
        pdfSize = PdfBuffer.length;
        console.log(`New Signed PDF created called: ${signedFilePath}`);
      }

      // `uploadFile` is used to upload pdf to aws s3 and get it's url
      const data = await uploadFile(`signed_${name}`, signedFilePath);

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
        sendNotifyMail(_resDoc, signUser, mailProvider, publicUrl);
        saveFileUsage(pdfSize, data.imageUrl, _resDoc?.CreatedBy?.objectId);
        if (updatedDoc && updatedDoc.isCompleted) {
          const doc = { ..._resDoc, AuditTrail: updatedDoc.AuditTrail, SignedUrl: data.imageUrl };
          sendMailsaveCertifcate(doc, pfx, isCustomMail, mailProvider, `signed_${name}`);
        } else {
          unlinkFile(pfxname);
        }
        // below code is used to remove exported signed pdf file from exports folder
        unlinkFile(signedFilePath);
        // console.log(`New Signed PDF created called: ${filePath}`);
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
    const body = { DebugginLog: err?.message };
    try {
      await axios.put(`${docUrl}/${docId}`, body, { headers });
    } catch (err) {
      console.log('err in saving debugginglog', err);
    }
    unlinkFile(pfxname);
    throw err;
  }
}
export default PDF;
