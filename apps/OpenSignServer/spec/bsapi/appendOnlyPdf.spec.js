// Append-only signing (utils/appendOnlyPdf.js): an earlier signature (standing
// in for a desktop VLAD PAdES signature) survives an online signer and
// OpenSign's seal. No database: `npx jasmine --config=spec/support/bsapi.json`.
/* eslint-env jasmine */
import crypto from 'node:crypto';
import forge from 'node-forge';
import * as pdfLib from 'pdf-lib';
import * as cantoo from '@cantoo/pdf-lib';
import { P12Signer } from '@signpdf/signer-p12';
import { SignPdf } from '@signpdf/signpdf';
import { Placeholder } from '../../cloud/parsefunction/pdf/Placeholder.js';
import {
  appendedSignatureCoveringFile,
  extendsPdf,
  fileKey,
  sealAppendOnly,
  signatureByteRanges,
} from '../../utils/appendOnlyPdf.js';

// A throwaway self-signed signing certificate.
function testP12() {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date(Date.now() - 864e5);
  cert.validity.notAfter = new Date(Date.now() + 864e5);
  const attrs = [{ name: 'commonName', value: 'Test Signer' }];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey, forge.md.sha256.create());
  const asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], 'test', { algorithm: '3des' });
  return Buffer.from(forge.asn1.toDer(asn1).getBytes(), 'binary');
}

// Each signature: does its CMS messageDigest match the bytes its ByteRange covers?
function digestsMatch(bytes) {
  const text = bytes.toString('latin1');
  return signatureByteRanges(bytes).map(([a, b, c, d]) => {
    const covered = Buffer.concat([bytes.subarray(a, a + b), bytes.subarray(c, c + d)]);
    const hex = text.slice(b + 1, c - 1).replace(/(00)+$/, '');
    const p7 = forge.pkcs7.messageFromAsn1(forge.asn1.fromDer(forge.util.hexToBytes(hex)));
    const md = p7.rawCapture.authenticatedAttributes
      .map(
        x =>
          forge.asn1.derToOid(x.value[0].value) === forge.pki.oids.messageDigest &&
          x.value[1].value[0].value
      )
      .find(Boolean);
    return forge.util.bytesToHex(md) === crypto.createHash('sha256').update(covered).digest('hex');
  });
}

describe('append-only signing', () => {
  let p12;
  const signer = () => new P12Signer(p12, { passphrase: 'test' });

  beforeAll(() => {
    p12 = testP12();
  });

  for (const useObjectStreams of [false, true]) {
    it(`keeps an earlier signature valid (${useObjectStreams ? 'xref stream' : 'xref table'})`, async () => {
      const doc = await pdfLib.PDFDocument.create();
      const page = doc.addPage([600, 800]);
      doc.getForm().createTextField('company').addToPage(page, { x: 50, y: 600 });
      const base = Buffer.from(await doc.save({ useObjectStreams }));

      // The desktop signature, appended.
      const a = await cantoo.PDFDocument.load(base, {
        forIncrementalUpdate: true,
        updateMetadata: false,
      });
      Placeholder({
        pdfDoc: a,
        reason: 'VLAD',
        location: 'n/a',
        name: 'Alice',
        contactInfo: 'a',
        signatureLength: 8000,
        fieldName: 'BetterSign alice',
        lib: cantoo,
      });
      const signed = await new SignPdf().sign(Buffer.from(await a.save()), signer());
      expect(extendsPdf(base, signed)).toBe(true);
      expect(appendedSignatureCoveringFile(base, signed)).not.toBeNull();
      expect(appendedSignatureCoveringFile(base, base)).toBeNull();

      // An online signer, as the browser does it for append-only documents.
      const b = await cantoo.PDFDocument.load(signed, {
        forIncrementalUpdate: true,
        updateMetadata: false,
      });
      b.getPages()[0].drawText('Bob', { x: 300, y: 100, color: pdfLib.rgb(0, 0, 1) });
      const online = Buffer.from(await b.saveAsBase64({ useObjectStreams: false }), 'base64');
      expect(extendsPdf(signed, online)).toBe(true);

      // OpenSign's seal.
      const sealed = await sealAppendOnly({
        pdfBytes: online,
        p12Signer: signer(),
        reason: 'Digitally signed by OpenSign',
        name: 'OpenSign',
        contactInfo: 'x',
      });
      expect(extendsPdf(online, sealed)).toBe(true);
      expect(digestsMatch(sealed)).toEqual([true, true]);
      const ranges = signatureByteRanges(sealed);
      expect(sealed.length - (ranges[1][2] + ranges[1][3])).toBeLessThanOrEqual(2);
      expect((await pdfLib.PDFDocument.load(sealed)).getPageCount()).toBe(1);
    });
  }

  it("detects that a full re-save doesn't extend the file", async () => {
    const doc = await pdfLib.PDFDocument.create();
    doc.addPage();
    const base = Buffer.from(await doc.save());
    const again = await pdfLib.PDFDocument.load(base);
    again.getPages()[0].drawText('x');
    expect(extendsPdf(base, Buffer.from(await again.save()))).toBe(false);
    expect(extendsPdf(base, base)).toBe(false);
  });

  it('compares file URLs without their presigned query', () => {
    expect(fileKey('https://x/files/a/b.pdf?token=1')).toBe(
      fileKey('https://x/files/a/b.pdf?token=2')
    );
    expect(fileKey('https://x/files/a/b.pdf')).not.toBe(fileKey('https://x/files/a/c.pdf'));
  });
});
