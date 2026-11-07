import { createHash, createPublicKey, generateKeyPairSync, verify } from 'node:crypto';
import forge from 'node-forge';
import { P12Signer } from '@signpdf/signer-p12';
import { IssuerPreservingP12Signer } from '../cloud/parsefunction/pdf/IssuerPreservingP12Signer.js';

const { asn1, pki } = forge;
const passphrase = 'spec-passphrase';
const content = Buffer.from('%PDF-1.7 signed content');
const generateKeyPair = () =>
  generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
const { publicKey, privateKey } = generateKeyPair();

const utf8Name = value => [{ shortName: 'CN', value, valueTagClass: asn1.Type.UTF8 }];

function createCertificate(subject, issuer, serialNumber, subjectPublicKey = publicKey) {
  const certificate = pki.createCertificate();
  certificate.publicKey = pki.publicKeyFromPem(subjectPublicKey);
  certificate.serialNumber = serialNumber;
  certificate.validity.notBefore = new Date('2026-01-01T00:00:00Z');
  certificate.validity.notAfter = new Date('2036-01-01T00:00:00Z');
  certificate.setSubject(subject);
  certificate.setIssuer(issuer);
  certificate.sign(pki.privateKeyFromPem(privateKey), forge.md.sha256.create());
  return certificate;
}

function createP12(...certificates) {
  const p12 = forge.pkcs12.toPkcs12Asn1(
    pki.privateKeyFromPem(privateKey),
    certificates,
    passphrase,
    { algorithm: '3des' }
  );
  return Buffer.from(asn1.toDer(p12).getBytes(), 'binary');
}

function parseCms(signature) {
  const contentInfo = asn1.fromDer(forge.util.createBuffer(signature.toString('binary')));
  const signedData = contentInfo.value[1].value[0].value;
  const signerInfo = signedData.at(-1).value[0];
  return {
    certificates: signedData
      .find(field => field.tagClass === asn1.Class.CONTEXT_SPECIFIC && field.type === 0)
      .value.map(certificate => asn1.toDer(certificate).getBytes()),
    signerIssuer: asn1.toDer(signerInfo.value[1].value[0]).getBytes(),
    signerInfo,
  };
}

const issuerDer = certificate =>
  asn1.toDer(pki.certificateToAsn1(certificate).value[0].value[3]).getBytes();

// Verifies the detached signature the way a CMS verifier does, without using forge's signing code.
function expectValidDetachedSignature(signerInfo) {
  const [, , , signedAttributes, , signatureValue] = signerInfo.value;
  const digestAttribute = signedAttributes.value.find(
    attribute => asn1.derToOid(attribute.value[0].value) === pki.oids.messageDigest
  );
  const expectedDigest = createHash('sha256').update(content).digest('binary');
  expect(digestAttribute.value[1].value[0].value).toBe(expectedDigest);

  const signedBytes = Buffer.from(asn1.toDer(signedAttributes).getBytes(), 'binary');
  signedBytes[0] = 0x31; // signed over as a SET OF, not as the [0] IMPLICIT tag stored in the CMS
  const isValid = verify(
    'sha256',
    signedBytes,
    createPublicKey(publicKey),
    Buffer.from(signatureValue.value, 'binary')
  );
  expect(isValid).toBeTrue();
}

describe('IssuerPreservingP12Signer', () => {
  const nonAsciiIssuers = {
    'an em dash': 'Synthetic OpenSign local acceptance — not trusted',
    'accented letters': 'Société Générale Österreich',
    'non-Latin script': '文書署名認証局',
  };

  Object.entries(nonAsciiIssuers).forEach(([description, commonName]) => {
    it(`matches the certificate issuer when it contains ${description}`, async () => {
      const name = utf8Name(commonName);
      const certificate = createCertificate(name, name, '0a1b2c');
      const p12 = createP12(certificate);

      const signature = await new IssuerPreservingP12Signer(p12, { passphrase }).sign(content);
      const { certificates, signerIssuer, signerInfo } = parseCms(signature);

      expect(signerIssuer).toBe(issuerDer(certificate));
      expect(certificates).toEqual([asn1.toDer(pki.certificateToAsn1(certificate)).getBytes()]);
      expectValidDetachedSignature(signerInfo);
    });
  });

  it('resolves the signer among chain certificates that share a serial number', async () => {
    const leafName = utf8Name('Signer — leaf');
    const intermediateName = utf8Name('Issuing CA — intermediate');
    const rootName = utf8Name('Root CA — root');
    const leaf = createCertificate(leafName, intermediateName, '01');
    const intermediate = createCertificate(
      intermediateName,
      rootName,
      '01',
      generateKeyPair().publicKey
    );

    for (const chain of [
      [intermediate, leaf],
      [leaf, intermediate],
    ]) {
      const signature = await new IssuerPreservingP12Signer(createP12(...chain), {
        passphrase,
      }).sign(content);

      expect(parseCms(signature).signerIssuer).toBe(issuerDer(leaf));
    }
  });

  it('leaves signatures with an ASCII issuer exactly as P12Signer builds them', async () => {
    const name = [{ shortName: 'CN', value: 'OpenSign ASCII issuer' }];
    const p12 = createP12(createCertificate(name, name, '0a1b2c'));
    const signingTime = new Date('2026-06-01T00:00:00Z');

    const expected = await new P12Signer(p12, { passphrase }).sign(content, signingTime);
    const signature = await new IssuerPreservingP12Signer(p12, { passphrase }).sign(
      content,
      signingTime
    );

    expect(signature.equals(expected)).toBeTrue();
  });
});
