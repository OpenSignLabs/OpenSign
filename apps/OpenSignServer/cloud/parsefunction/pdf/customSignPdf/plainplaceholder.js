import PDFObject from "./pdfObject.js";
import PDFKitReferenceMock from "./PDFKitReferenceMock.js";
import removeTrailingNewLine from "./removeTrailingNewLine.js";
import {
  DEFAULT_SIGNATURE_LENGTH,
  SUBFILTER_ADOBE_PKCS7_DETACHED,
} from "./const.js";
import pdfkitAddPlaceholder from "./pdfkitAddPlaceholder.js";

import getIndexFromRef from "./getIndexFromRef.js";
import readPdf from "./readPdf.js";
import getPageRef from "./getPageRef.js";
import createBufferRootWithAcroform from "./createBufferRootWithAcroform.js";
import createBufferPageWithAnnotation from "./createBufferPageWithAnnotation.js";
import createBufferTrailer from "./createBufferTrailer.js";

const isContainBufferRootWithAcroform = (pdf) => {
  const bufferRootWithAcroformRefRegex = /\/AcroForm\s+(\d+\s\d+\sR)/g;
  const match = bufferRootWithAcroformRefRegex.exec(pdf.toString());

  return match != null && match[1] != null && match[1] !== "";
};

// testing

const getAssembledPdf = (pdf, index, input, stream) => {
  let finalPdf = pdf;

  finalPdf = Buffer.concat([
    finalPdf,
    Buffer.from("\n"),
    Buffer.from(`${index} 0 obj\n`),
    Buffer.from(PDFObject.convert(input)),
  ]);

  if (stream) {
    finalPdf = Buffer.concat([
      finalPdf,
      Buffer.from("\nstream\n"),
      Buffer.from(stream),
      Buffer.from("\nendstream"),
    ]);
  }

  finalPdf = Buffer.concat([finalPdf, Buffer.from("\nendobj\n")]);

  return finalPdf;
};

//
/**
 * Adds a signature placeholder to a PDF Buffer.
 *
 * This contrasts with the default pdfkit-based implementation.
 * Parsing is done using simple string operations.
 * Adding is done with `Buffer.concat`.
 * This allows node-signpdf to be used on any PDF and
 * not only on a freshly created through PDFKit one.
 */
const plainAddPlaceholder = ({
  pdfBuffer,
  reason,
  contactInfo = "emailfromp1289@gmail.com",
  name = "Name from p12",
  location = "Location from p12",
  signatureLength = DEFAULT_SIGNATURE_LENGTH,
  subFilter = SUBFILTER_ADOBE_PKCS7_DETACHED,
  sign,
}) => {
  let pdf = removeTrailingNewLine(pdfBuffer);
  const info = readPdf(pdf);
  const pageRef = getPageRef(pdf, info, sign.Page);
  const pageIndex = getIndexFromRef(info.xref, pageRef);
  const addedReferences = new Map();

  const pdfKitMock = {
    ref: (input, additionalIndex, stream) => {
      info.xref.maxIndex += 1;

      const index =
        additionalIndex != null ? additionalIndex : info.xref.maxIndex;

      addedReferences.set(index, pdf.length + 1); // + 1 new line

      pdf = getAssembledPdf(pdf, index, input, stream);

      return new PDFKitReferenceMock(info.xref.maxIndex);
    },
    page: {
      dictionary: new PDFKitReferenceMock(pageIndex, {
        data: {
          Annots: [],
        },
      }),
    },
    _root: {
      data: {},
    },
  };

  const { form, widget } = pdfkitAddPlaceholder({
    pdf: pdfKitMock,
    pdfBuffer,
    reason,
    contactInfo,
    name,
    location,
    signatureLength,
    subFilter,
    sign,
  });

  if (!isContainBufferRootWithAcroform(pdf)) {
    const rootIndex = getIndexFromRef(info.xref, info.rootRef);
    addedReferences.set(rootIndex, pdf.length + 1);
    pdf = Buffer.concat([
      pdf,
      Buffer.from("\n"),
      createBufferRootWithAcroform(pdf, info, form),
    ]);
  }
  addedReferences.set(pageIndex, pdf.length + 1);
  pdf = Buffer.concat([
    pdf,
    Buffer.from("\n"),
    createBufferPageWithAnnotation(pdf, info, pageRef, widget),
  ]);

  pdf = Buffer.concat([
    pdf,
    Buffer.from("\n"),
    createBufferTrailer(pdf, info, addedReferences),
  ]);

  return pdf;
};

export default plainAddPlaceholder;
