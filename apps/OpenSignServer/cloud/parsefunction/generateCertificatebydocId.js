import { SignPdf } from '@signpdf/signpdf';
import { P12Signer } from '@signpdf/signer-p12';
import { pdflibAddPlaceholder } from '@signpdf/placeholder-pdf-lib';
import { PDFDocument } from 'pdf-lib';
import Parse from 'parse/node.js';
import fs from 'node:fs';
import dotenv from 'dotenv';
import GenerateCertificate from './pdf/GenerateCertificate.js';
import { getSecureUrl } from '../../Utils.js';
dotenv.config({ quiet: true });
const eSignName = 'OpenSign';
const eSigncontact = 'hello@opensignlabs.com';

// `uploadFile` is used to create url in from pdfFile
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
    // `unlinkCertificate` is used to remove exported certificate file from exports folder
    unlinkCertificate(filepath);
  }
}

async function unlinkCertificate(path) {
  if (fs.existsSync(path)) {
    try {
      fs.unlinkSync(path);
    } catch (err) {
      console.log('Err in unlink certificate generatecertificatebydocid', err);
    }
  }
}

export default async function generateCertificatebydocId(req) {
  const docId = req.params.docId;
  // const userId = req.headers.userid;

  if (!docId) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'please provide parameter.');
  }
  //  `P12Buffer` used to create buffer from p12 certificate
  const pfxFile = process.env.PFX_BASE64;
  // const P12Buffer = fs.readFileSync();
  const P12Buffer = Buffer.from(pfxFile, 'base64');
  const certificatePath = `./exports/certificate_${docId}.pdf`;
  try {
    const getDocument = new Parse.Query('contracts_Document');
    getDocument.include('ExtUserPtr,Signers,AuditTrail.UserPtr,Placeholders,ExtUserPtr.TenantId');
    const docRes = await getDocument.get(docId, { useMasterKey: true });

    if (docRes && docRes?.get('IsCompleted') && !docRes?.get('CertificateUrl')) {
      const _docRes = JSON.parse(JSON.stringify(docRes));
      const filteredaudit = _docRes?.AuditTrail?.filter(x => x?.UserPtr?.objectId);
      // Create a reversed copy of the array and find the last object with 'signedOn'
      const lastObj = [...filteredaudit].reverse().find(obj => obj.hasOwnProperty('SignedOn'));
      const completedAt = lastObj.SignedOn;
      const doc = { ..._docRes, completedAt: completedAt };
      const certificate = await GenerateCertificate(doc);
      const certificatePdf = await PDFDocument.load(certificate);
      const p12 = new P12Signer(P12Buffer, { passphrase: process.env.PASS_PHRASE || null });
      //  `pdflibAddPlaceholder` is used to add code of only digital sign in certificate
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

      //below is used to save signed certificate in exports folder
      fs.writeFileSync(certificatePath, signedCertificate);
      const file = await uploadFile('certificate.pdf', certificatePath);
      const updateDoc = new Parse.Object('contracts_Document');
      updateDoc.id = doc.objectId;
      updateDoc.set('CertificateUrl', file.imageUrl);
      const updateDocRes = await updateDoc.save(null, { useMasterKey: true });
      unlinkCertificate(certificatePath);
      return { CertificateUrl: file.imageUrl };
    } else {
      return { CertificateUrl: '' };
    }
  } catch (error) {
    console.error('Error fetching or processing document:', error);
    const code = error?.code || 400;
    const message = error?.message || 'Something went wrong.';
    unlinkCertificate(certificatePath);
    throw new Parse.Error(code, message);
  }
}
