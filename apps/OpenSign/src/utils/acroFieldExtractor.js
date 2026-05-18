import { PDFDocument } from "pdf-lib";

export const clearAcroFields = async (pdfFile) => {
  const pdfDoc = await PDFDocument.load(pdfFile, { ignoreEncryption: true });

  try {
    const acroFormEntry = pdfDoc.catalog.get(PDFName.of("AcroForm"));
    const acroForm = pdfDoc.context.lookupMaybe
      ? pdfDoc.context.lookupMaybe(acroFormEntry)
      : pdfDoc.context.lookup(acroFormEntry);

    if (acroForm && typeof acroForm.set === "function") {
      // Avoid pdf-lib form APIs here; some malformed PDFs crash while
      // iterating/removing fields. Clearing /Fields directly is safer.
      acroForm.set(PDFName.of("Fields"), pdfDoc.context.obj([]));
      acroForm.delete(PDFName.of("XFA"));
      acroForm.delete(PDFName.of("SigFlags"));
    }
  } catch {
    // If AcroForm is malformed, continue with page annotation cleanup.
  }

  for (const page of pdfDoc.getPages()) {
    try {
      const annotationsRef = page.node.get(PDFName.of("Annots"));
      if (!annotationsRef) continue;

      const annotations = pdfDoc.context.lookup(annotationsRef);
      if (!annotations || !annotations.asArray) continue;

      const filtered = annotations.asArray().filter((annotRef) => {
        try {
          const annot = pdfDoc.context.lookup(annotRef);
          const subtype = annot?.get(PDFName.of("Subtype"));
          return subtype?.toString() !== "/Widget";
        } catch {
          return true;
        }
      });

      if (filtered.length === 0) {
        page.node.delete(PDFName.of("Annots"));
      } else {
        page.node.set(PDFName.of("Annots"), pdfDoc.context.obj(filtered));
      }
    } catch {
      // best effort cleanup
    }
  }

  try {
    pdfDoc.catalog.delete(PDFName.of("AcroForm"));
  } catch {
    // best effort cleanup
  }

  return await pdfDoc.save({ useObjectStreams: false });
};

export async function isPdfPasswordProtected(pdfBytes) {
  try {
    await PDFDocument.load(pdfBytes);
    return false; // PDF opened normally
  } catch (error) {
    console.error("Error in isPdfPasswordProtected:", error);
    throw error; // Other error
  }
}
