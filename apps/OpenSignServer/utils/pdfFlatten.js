import { PDFDict, PDFDocument, PDFName } from 'pdf-lib';

/**
 * FlattenPdf renders field values as static content and removes the interactive
 * form layer. Signatures are stripped entirely. Non-widget annotations (links,
 * comments, stamps) are preserved.
 * @param {string | Uint8Array | ArrayBuffer} pdfFile - pdf file.
 * @returns {Promise<Uint8Array>} flatPdf - pdf file in Uint8Array
 */
// Keeps the binary contract of flattenPdf: callers upload the result as a PDF,
// so a base64 string has to be decoded instead of being returned as text.
const toPdfBytes = input => {
  if (typeof input === 'string') return Buffer.from(input, 'base64');
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  return input;
};

// Walks the complete field tree: a signature can sit under nested /Kids.
const hasSignatureField = (context, node, visited = new Set()) => {
  if (!node) return false;
  if (visited.has(node)) return false;
  visited.add(node);
  const ft = node.get?.(PDFName.of('FT'));
  if (ft && ft.toString() === '/Sig') return true;
  const kidsRef = node.get?.(PDFName.of('Kids'));
  const kids = kidsRef ? context.lookup(kidsRef) : null;
  if (kids && typeof kids.asArray === 'function') {
    for (const kidRef of kids.asArray()) {
      const kid = context.lookup(kidRef);
      if (hasSignatureField(context, kid, visited)) return true;
    }
  }
  return false;
};

export const flattenPdf = async pdfFile => {
  const inputBytes = toPdfBytes(pdfFile);
  const pdfDoc = await PDFDocument.load(inputBytes, { ignoreEncryption: true });

  // Preserve existing digital signatures: if the document contains a
  // signature field (SigFlags or /FT /Sig), skip flattening to avoid
  // invalidating the signature or dropping signature widgets.
  try {
    const acroFormEntry = pdfDoc.catalog.get(PDFName.of('AcroForm'));
    const acroForm = pdfDoc.context.lookupMaybe
      ? pdfDoc.context.lookupMaybe(acroFormEntry, PDFDict)
      : pdfDoc.context.lookup(acroFormEntry);
    if (acroForm) {
      const sigFlags = acroForm.get(PDFName.of('SigFlags'));
      if (sigFlags && Number(sigFlags) > 0) {
        return inputBytes;
      }
      const fieldsRef = acroForm.get(PDFName.of('Fields'));
      const fields = fieldsRef ? pdfDoc.context.lookup(fieldsRef) : null;
      if (fields && typeof fields.asArray === 'function') {
        for (const fRef of fields.asArray()) {
          const field = pdfDoc.context.lookup(fRef);
          if (hasSignatureField(pdfDoc.context, field)) {
            return inputBytes;
          }
        }
      }
    }
  } catch {
    // If AcroForm inspection fails, continue with normal flatten.
  }

  // Preserve existing digital signatures: if the document contains a
  // signature field (SigFlags or /FT /Sig), skip flattening to avoid
  // invalidating the signature or dropping signature widgets.
  try {
    const acroFormEntry = pdfDoc.catalog.get(PDFName.of('AcroForm'));
    const acroForm = pdfDoc.context.lookupMaybe
      ? pdfDoc.context.lookupMaybe(acroFormEntry)
      : pdfDoc.context.lookup(acroFormEntry);
    if (acroForm) {
      const sigFlags = acroForm.get(PDFName.of('SigFlags'));
      if (sigFlags && Number(sigFlags) > 0) {
        return pdfFile;
      }
      const fieldsRef = acroForm.get(PDFName.of('Fields'));
      const fields = fieldsRef ? pdfDoc.context.lookup(fieldsRef) : null;
      if (fields && fields.asArray) {
        for (const fRef of fields.asArray()) {
          const f = pdfDoc.context.lookup(fRef);
          const ft = f?.get(PDFName.of('FT'));
          if (ft && ft.toString() === '/Sig') {
            return pdfFile;
          }
          const kidsRef = f?.get(PDFName.of('Kids'));
          const kids = kidsRef ? pdfDoc.context.lookup(kidsRef) : null;
          if (kids && kids.asArray) {
            for (const kRef of kids.asArray()) {
              const k = pdfDoc.context.lookup(kRef);
              const kft = k?.get(PDFName.of('FT'));
              if (kft && kft.toString() === '/Sig') {
                return pdfFile;
              }
            }
          }
        }
      }
    }
  } catch {
    // If AcroForm inspection fails, continue with normal flatten.
  }

  try {
    const acroFormEntry = pdfDoc.catalog.get(PDFName.of('AcroForm'));
    const acroForm = pdfDoc.context.lookupMaybe
      ? pdfDoc.context.lookupMaybe(acroFormEntry)
      : pdfDoc.context.lookup(acroFormEntry);

    if (acroForm && typeof acroForm.set === 'function') {
      // Avoid pdf-lib form APIs here; some malformed PDFs crash while
      // iterating/removing fields. Clearing /Fields directly is safer.
      acroForm.set(PDFName.of('Fields'), pdfDoc.context.obj([]));
      acroForm.delete(PDFName.of('XFA'));
      acroForm.delete(PDFName.of('SigFlags'));
    }
  } catch {
    // If AcroForm is malformed, continue with page annotation cleanup.
  }

  for (const page of pdfDoc.getPages()) {
    try {
      const annotationsRef = page.node.get(PDFName.of('Annots'));
      if (!annotationsRef) continue;

      const annotations = pdfDoc.context.lookup(annotationsRef);
      if (!annotations || !annotations.asArray) continue;

      const filtered = annotations.asArray().filter(annotRef => {
        try {
          const annot = pdfDoc.context.lookup(annotRef);
          const subtype = annot?.get(PDFName.of('Subtype'));
          return subtype?.toString() !== '/Widget';
        } catch {
          return true;
        }
      });

      if (filtered.length === 0) {
        page.node.delete(PDFName.of('Annots'));
      } else {
        page.node.set(PDFName.of('Annots'), pdfDoc.context.obj(filtered));
      }
    } catch {
      // best effort cleanup
    }
  }

  try {
    pdfDoc.catalog.delete(PDFName.of('AcroForm'));
  } catch {
    // best effort cleanup
  }

  return await pdfDoc.save({ useObjectStreams: false });
};

/** Remove only Widget annotations; preserve links, stamps, comments, etc. */
function _removeWidgetAnnotationsServer(pdfDoc) {
  for (const page of pdfDoc.getPages()) {
    try {
      const annotationsRef = page.node.get(PDFName.of('Annots'));
      if (!annotationsRef) continue;

      const annotations = pdfDoc.context.lookup(annotationsRef);
      if (!annotations || !annotations.asArray) continue;

      const filtered = annotations.asArray().filter(annotRef => {
        try {
          const annot = pdfDoc.context.lookup(annotRef);
          const subtype = annot?.get(PDFName.of('Subtype'));
          return subtype?.toString() !== '/Widget';
        } catch {
          return true;
        }
      });

      if (filtered.length === 0) {
        page.node.delete(PDFName.of('Annots'));
      } else {
        page.node.set(PDFName.of('Annots'), pdfDoc.context.obj(filtered));
      }
    } catch {
      /* best effort */
    }
  }

  try {
    pdfDoc.catalog.delete(PDFName.of('AcroForm'));
  } catch {
    /* best effort */
  }
}
