import {
  DEFAULT_SIGNATURE_LENGTH,
  DEFAULT_BYTE_RANGE_PLACEHOLDER,
  SUBFILTER_ADOBE_PKCS7_DETACHED,
  ANNOTATION_FLAGS,
  SIG_FLAGS,
  SignPdfError,
} from '@signpdf/utils';
import {
  PDFArray,
  PDFNumber,
  PDFName,
  PDFHexString,
  PDFString,
  PDFInvalidObject,
  PDFDict,
} from 'pdf-lib';

export const Placeholder = ({
  pdfDoc,
  pdfPage,
  reason,
  contactInfo,
  name,
  location,
  signingTime = new Date(),
  signatureLength = DEFAULT_SIGNATURE_LENGTH,
  byteRangePlaceholder = DEFAULT_BYTE_RANGE_PLACEHOLDER,
  subFilter = SUBFILTER_ADOBE_PKCS7_DETACHED,
  widgetRect = [0, 0, 0, 0],
  appName,
}) => {
  if (!pdfDoc && !pdfPage) {
    throw new SignPdfError('PDFDoc or PDFPage must be set.', SignPdfError.TYPE_INPUT);
  }

  const doc = pdfDoc || pdfPage.doc;
  const page = pdfPage || doc.getPages()[0];

  const byteRange = PDFArray.withContext(doc.context);
  byteRange.push(PDFNumber.of(0));
  byteRange.push(PDFName.of(byteRangePlaceholder));
  byteRange.push(PDFName.of(byteRangePlaceholder));
  byteRange.push(PDFName.of(byteRangePlaceholder));

  const placeholder = PDFHexString.of(String.fromCharCode(0).repeat(signatureLength));

  const appBuild = appName ? { App: { Name: appName } } : {};
  const signatureDict = doc.context.obj({
    Type: 'Sig',
    Filter: 'Adobe.PPKLite',
    SubFilter: subFilter,
    ByteRange: byteRange,
    Contents: placeholder,
    Reason: PDFString.of(reason),
    M: PDFString.fromDate(signingTime),
    ContactInfo: PDFString.of(contactInfo),
    Name: PDFString.of(name),
    Location: PDFString.of(location),
    Prop_Build: {
      Filter: { Name: 'Adobe.PPKLite' },
      ...appBuild,
    },
  });

  const signatureBuffer = new Uint8Array(signatureDict.sizeInBytes());
  signatureDict.copyBytesInto(signatureBuffer, 0);
  const signatureObj = PDFInvalidObject.of(signatureBuffer);
  const signatureDictRef = doc.context.register(signatureObj);

  const rect = PDFArray.withContext(doc.context);
  widgetRect.forEach(c => rect.push(PDFNumber.of(c)));
  const apStream = doc.context.formXObject([], {
    BBox: widgetRect,
    Resources: {},
  });

  const widgetDict = doc.context.obj({
    Type: 'Annot',
    Subtype: 'Widget',
    FT: 'Sig',
    Rect: rect,
    V: signatureDictRef,
    T: PDFString.of('Signature1'),
    F: ANNOTATION_FLAGS.PRINT,
    P: page.ref,
    AP: { N: doc.context.register(apStream) },
  });

  const widgetDictRef = doc.context.register(widgetDict);

  let annotations = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
  if (!annotations) {
    annotations = doc.context.obj([]);
  }
  annotations.push(widgetDictRef);
  page.node.set(PDFName.of('Annots'), annotations);

  let acroForm = doc.catalog.lookupMaybe(PDFName.of('AcroForm'), PDFDict);
  if (!acroForm) {
    acroForm = doc.context.obj({ Fields: [] });
    const acroFormRef = doc.context.register(acroForm);
    doc.catalog.set(PDFName.of('AcroForm'), acroFormRef);
  }

  let sigFlags = acroForm.has(PDFName.of('SigFlags'))
    ? acroForm.get(PDFName.of('SigFlags'))
    : PDFNumber.of(0);

  const updatedFlags = PDFNumber.of(
    sigFlags.asNumber() | SIG_FLAGS.SIGNATURES_EXIST | SIG_FLAGS.APPEND_ONLY
  );
  acroForm.set(PDFName.of('SigFlags'), updatedFlags);

  let fields = acroForm.get(PDFName.of('Fields'));
  if (fields instanceof PDFArray) {
    fields.push(widgetDictRef);
  }
  // else if (fields) {
  //   const newFields = PDFArray.withContext(doc.context);
  //   fields.asArray().forEach(field => newFields.push(field));
  //   newFields.push(widgetDictRef);
  //   acroForm.set(PDFName.of('Fields'), newFields);
  // }
  else {
    const newFields = PDFArray.withContext(doc.context);
    newFields.push(widgetDictRef);
    acroForm.set(PDFName.of('Fields'), newFields);
  }
};
