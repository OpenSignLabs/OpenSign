// Append-only PDFs: documents a BetterSign identity (VLAD) has signed.
//
// A VLAD signature (PAdES, from the desktop app via /api/v1) covers the exact
// bytes of the file as it was signed. Rewriting the file afterwards, as
// OpenSign normally does (pdf-lib re-saves the whole PDF for every online
// signer and again to flatten and seal at completion), breaks it. So once a
// document has a VLAD signature, every later change must be an incremental
// update: the earlier bytes stay byte-for-byte identical and the change is
// appended.
//
// @cantoo/pdf-lib (an API-compatible pdf-lib fork) does that when a file is
// loaded with { forIncrementalUpdate: true }: save() returns the original
// bytes plus one appended revision.

import axios from 'axios';
import * as cantoo from '@cantoo/pdf-lib';
import { SignPdf } from '@signpdf/signpdf';
import { Placeholder } from '../cloud/parsefunction/pdf/Placeholder.js';
import getPresignedUrl from '../cloud/parsefunction/getSignedUrl.js';

// A file URL without its query: contracts_Document's afterFind hands out
// URL/SignedUrl presigned (a fresh token each read), so compare by path.
export function fileKey(url) {
  return String(url || '').split('?')[0];
}

// The bytes of a stored document file (a contracts_Document URL or SignedUrl).
export async function readDocumentPdf(url) {
  const res = await axios.get(await getPresignedUrl(url), {
    responseType: 'arraybuffer',
    timeout: 60000,
  });
  return Buffer.from(res.data);
}

// True once any BetterSign identity has signed the document.
export function isAppendOnly(doc) {
  const sigs = typeof doc?.get === 'function' ? doc.get('VladSignatures') : doc?.VladSignatures;
  return Array.isArray(sigs) && sigs.length > 0;
}

// True if `next` is `base` with bytes appended (and at least one appended).
export function extendsPdf(base, next) {
  return (
    next.length > base.length &&
    Buffer.from(next.buffer, next.byteOffset, base.length).equals(Buffer.from(base))
  );
}

const BYTE_RANGE_RE = /\/ByteRange\s*\[\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\]/g;

// Every completed signature's ByteRange [a, b, c, d] in the file.
export function signatureByteRanges(bytes) {
  const text = Buffer.from(bytes).toString('latin1');
  return [...text.matchAll(BYTE_RANGE_RE)].map(m => m.slice(1, 5).map(Number));
}

// The signature an upload added on top of `base`: one whose signed segments
// start at 0, whose /Contents gap lies in the appended bytes, and which covers
// the whole file (allowing a trailing end-of-line). Null if there's none.
// Structure only: whether the CMS inside is valid is checked elsewhere.
export function appendedSignatureCoveringFile(base, next) {
  const end = next.length;
  for (const [a, b, c, d] of signatureByteRanges(next)) {
    const covered = c + d;
    if (a === 0 && b >= base.length && c > b && covered <= end && end - covered <= 2) {
      return { byteRange: [a, b, c, d] };
    }
  }
  return null;
}

// Seal an append-only document with OpenSign's certificate as one appended
// revision, without flattening (flattening removes signature fields).
export async function sealAppendOnly({ pdfBytes, p12Signer, reason, name, contactInfo }) {
  const pdfDoc = await cantoo.PDFDocument.load(pdfBytes, {
    forIncrementalUpdate: true,
    updateMetadata: false,
  });
  Placeholder({
    pdfDoc,
    reason,
    location: 'n/a',
    name,
    contactInfo,
    signatureLength: 16000,
    // A name no earlier signature field can have.
    fieldName: `OpenSign seal ${new Date().toISOString()}`,
    lib: cantoo,
  });
  const withPlaceholder = Buffer.from(await pdfDoc.save());
  if (!extendsPdf(pdfBytes, withPlaceholder)) {
    throw new Error('append-only seal: placeholder revision rewrote earlier bytes');
  }
  const sealed = await new SignPdf().sign(withPlaceholder, p12Signer);
  if (!extendsPdf(pdfBytes, sealed)) {
    throw new Error('append-only seal: signing rewrote earlier bytes');
  }
  return sealed;
}
