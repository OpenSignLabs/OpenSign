import { PDFDict, PDFDocument, PDFObjectCopier } from "pdf-lib";

/**
 * Copies the document information dictionary (title, author, subject, keywords,
 * custom entries, ...) to a document that was rebuilt with `copyPages`, which
 * only carries over the pages.
 * @param {PDFDocument} sourceDoc - document to read the metadata from
 * @param {PDFDocument} targetDoc - document created with `PDFDocument.create()`
 */
export const copyPdfMetadata = (sourceDoc, targetDoc) => {
  // Strings in the information dictionary of an encrypted document are ciphertext.
  if (sourceDoc.isEncrypted) return;
  const { context: source } = sourceDoc;
  const { context: target } = targetDoc;
  const sourceInfo = source.lookup(source.trailerInfo.Info);
  if (!(sourceInfo instanceof PDFDict)) return;
  const targetInfo = target.lookup(target.trailerInfo.Info, PDFDict);
  const copier = PDFObjectCopier.for(source, target);
  for (const [key, value] of sourceInfo.entries()) {
    targetInfo.set(key, copier.copy(value));
  }
};

/**
 * Merges PDF files into one document that keeps the metadata of the first file.
 * @param {(ArrayBuffer | Uint8Array)[]} pdfBuffers - PDF files in merge order
 * @returns {Promise<PDFDocument>} merged document
 */
export const mergePdfBuffers = async (pdfBuffers) => {
  const merged = await PDFDocument.create();
  for (const [index, bytes] of pdfBuffers.entries()) {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
    if (index === 0) {
      copyPdfMetadata(doc, merged);
    }
  }
  return merged;
};
