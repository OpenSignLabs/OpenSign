import forge from 'node-forge';
import { P12Signer } from '@signpdf/signer-p12';

const { asn1, pki } = forge;

const toDer = node => asn1.toDer(node).getBytes();

// TBSCertificate: [0] version (optional), serialNumber, signature, issuer, ...
function readIssuerAndSerial(certificate) {
  const tbsFields = certificate.value[0].value;
  const offset = tbsFields[0].tagClass === asn1.Class.CONTEXT_SPECIFIC ? 1 : 0;
  return { serial: tbsFields[offset], issuer: tbsFields[offset + 2] };
}

/**
 * Replaces the issuer in the CMS SignerInfo with the exact issuer of the signing certificate.
 * @param {Buffer} signature - DER encoded CMS ContentInfo with one SignerInfo, as built by forge
 * @returns {Buffer} the CMS, or the same buffer when the issuer was already encoded faithfully
 */
function restoreSignerIssuer(signature) {
  const contentInfo = asn1.fromDer(forge.util.createBuffer(signature.toString('binary')));
  const signedData = contentInfo.value[1].value[0].value;
  const certificates = signedData.find(
    field => field.tagClass === asn1.Class.CONTEXT_SPECIFIC && field.type === 0
  ).value;
  const signerIdentifier = signedData.at(-1).value[0].value[1];
  const [signerIssuer, signerSerial] = signerIdentifier.value;
  const signerIssuerDer = toDer(signerIssuer);

  // A chain can reuse a serial number across issuers, so also match on the issuer as forge wrote it.
  const signingCertificate = certificates.map(readIssuerAndSerial).find(({ issuer, serial }) => {
    const attributes = pki.RDNAttributesAsArray(issuer);
    return (
      serial.value === signerSerial.value &&
      toDer(pki.distinguishedNameToAsn1({ attributes })) === signerIssuerDer
    );
  });
  if (!signingCertificate || toDer(signingCertificate.issuer) === signerIssuerDer) {
    return signature;
  }
  signerIdentifier.value[0] = signingCertificate.issuer;
  return Buffer.from(toDer(contentInfo), 'binary');
}

/**
 * P12Signer whose SignerInfo always identifies the signing certificate.
 *
 * forge keeps certificate name values as raw bytes but UTF-8 encodes UTF8String values again when
 * it writes the SignerInfo, and it flattens multi-valued RDNs. A non-ASCII issuer therefore no
 * longer matches the embedded certificate, and verifiers reject the signature because they cannot
 * find the signer's certificate. The issuer is outside the signed attributes, so correcting it
 * after signing leaves the signature valid.
 */
export class IssuerPreservingP12Signer extends P12Signer {
  async sign(pdfBuffer, signingTime) {
    return restoreSignerIssuer(await super.sign(pdfBuffer, signingTime));
  }
}
