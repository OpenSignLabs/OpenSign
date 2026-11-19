/**
 * Download a PDF.
 * @param {string} url PDF URL (already carries its access token).
 * @returns {Promise<Uint8Array>} PDF bytes.
 * @throws {Error} When the download fails.
 */
export const readPdfBytes = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`PDF download failed: ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
};

/**
 * Whether a PDF carries a digital signature dictionary.
 * @param {string} url PDF URL.
 * @returns {Promise<boolean>} True when /Type /Sig and /ByteRange are present.
 */
export const hasDigitalSignature = async (url) => {
  const text = Buffer.from(await readPdfBytes(url)).toString("latin1");
  return /\/Type\s*\/Sig/.test(text) && /\/ByteRange/.test(text);
};
