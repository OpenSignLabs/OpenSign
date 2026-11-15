import fs from 'node:fs';
import dotenv from 'dotenv';
import GenerateCertificate from './pdf/GenerateCertificate.js';
import { getSecureUrl } from '../../Utils.js';
import { parseUploadFile } from '../../utils/fileUtils.js';
import { sealPdf, storeSeal } from '../../utils/seal.js';
dotenv.config({ quiet: true });

// `uploadFile` is used to create url in from pdfFile
async function uploadFile(pdfName, filepath) {
  try {
    const filedata = fs.readFileSync(filepath);
    let fileUrl;

    const fileRes = await parseUploadFile(pdfName, filedata, 'application/pdf');
    fileUrl = getSecureUrl(fileRes?.url)?.url;
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
  const certificatePath = `./exports/certificate_${docId}.pdf`;
  try {
    const getDocument = new Parse.Query('contracts_Document');
    getDocument.include(
      'ExtUserPtr,Signers,AuditTrail.UserPtr,Placeholders,ExtUserPtr.TenantId,ExtUserPtr.UserId'
    );
    const docRes = await getDocument.get(docId, { useMasterKey: true });

    if (docRes && docRes?.get('IsCompleted') && !docRes?.get('CertificateUrl')) {
      const _docRes = JSON.parse(JSON.stringify(docRes));
      const filteredaudit = _docRes?.AuditTrail?.filter(x => x?.UserPtr?.objectId);
      // Create a reversed copy of the array and find the last object with 'signedOn'
      const lastObj = [...filteredaudit].reverse().find(obj => obj.hasOwnProperty('SignedOn'));
      const completedAt = lastObj.SignedOn;
      const doc = { ..._docRes, completedAt: completedAt };
      const certificate = await GenerateCertificate(doc);
      // Sealed like the one made at completion (utils/seal.js), with the
      // tenant's certificate if it has one.
      const sealed = await sealPdf({
        pdfBytes: Buffer.from(certificate),
        doc,
        certificate: true,
        filename: 'certificate.pdf',
      });

      //below is used to save signed certificate in exports folder
      fs.writeFileSync(certificatePath, sealed.pdf);
      const file = await uploadFile('certificate.pdf', certificatePath);
      const updateDoc = new Parse.Object('contracts_Document');
      updateDoc.id = doc.objectId;
      updateDoc.set('CertificateUrl', file.imageUrl);
      updateDoc.set('CertificateSeal', await storeSeal(sealed, 'certificate.pdf'));
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
