// Append-only signing for documents a BetterSign identity (VLAD) has signed.
//
// That signature (PAdES, made on the desktop) covers the exact bytes of the
// file. pdf-lib's save() rewrites the whole file, which would break it, so for
// these documents the signing page loads the PDF with @cantoo/pdf-lib (an
// API-compatible pdf-lib fork) in incremental mode: save() then returns the
// original bytes with this signer's changes appended. The server refuses
// anything else (OpenSignServer utils/appendOnlyPdf.js).
import { PDFDocument } from "pdf-lib";
import {
  PDFDocument as IncrementalPDFDocument,
  PDFSignature
} from "@cantoo/pdf-lib";

// True once any BetterSign identity has signed the document.
export const isAppendOnlyDoc = (doc) =>
  Array.isArray(doc?.VladSignatures) && doc.VladSignatures.length > 0;

// The PDF to draw this signer's widgets on.
export const loadPdfForSigning = (bytes, appendOnly) =>
  appendOnly
    ? IncrementalPDFDocument.load(bytes, {
        forIncrementalUpdate: true,
        updateMetadata: false
      })
    : PDFDocument.load(bytes);

export const isAppendOnlyPdf = (pdfDoc) =>
  pdfDoc instanceof IncrementalPDFDocument;

// form.flatten() removes every field, signature fields included, which would
// delete the BetterSign signature from later revisions. Flatten the rest.
export const flattenExceptSignatures = (form) => {
  form.updateFieldAppearances();
  for (const field of form.getFields()) {
    if (field instanceof PDFSignature) continue;
    for (const widget of field.acroField.getWidgets()) {
      form.flattenWidgetOntoPage(
        form.findWidgetPage(widget),
        widget,
        form.findWidgetAppearanceRef(field, widget)
      );
    }
    form.removeField(field);
  }
};
