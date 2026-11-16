import { PDFDocument } from "pdf-lib";
import { readEnv } from "./env.js";
import { parseRequest } from "./parse.js";

/**
 * Build a PDF with a given number of pages.
 * @param {number} pages Page count.
 * @returns {Promise<Uint8Array>} PDF bytes.
 */
const buildPdf = async (pages) => {
  const pdf = await PDFDocument.create();
  for (let i = 1; i <= pages; i += 1) {
    pdf.addPage([612, 792]).drawText(`Page ${i}`, { x: 60, y: 700, size: 24 });
  }
  return pdf.save();
};

/**
 * Create a template that points to a freshly uploaded PDF with many pages.
 * The widgets of the first template are reused.
 * @param {number} pages Page count.
 * @returns {Promise<string>} Template object id.
 */
export const createLargeTemplate = async (pages) => {
  const env = readEnv();
  const name = `e2e-large-${Date.now()}.pdf`;
  const upload = await fetch(`${env.E2E_SERVER_URL}/files/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/pdf",
      "X-Parse-Application-Id": env.E2E_APP_ID,
      "X-Parse-Master-Key": env.E2E_MASTER_KEY
    },
    body: await buildPdf(pages)
  });
  if (!upload.ok) throw new Error(`PDF upload failed: ${upload.status}`);
  const { url } = await upload.json();
  const { results } = await parseRequest("classes/contracts_Template?limit=1");
  const { objectId, createdAt, updatedAt, className, ...base } = results[0];
  const created = await parseRequest("classes/contracts_Template", {
    method: "POST",
    body: { ...base, Name: `e2e large ${pages} pages`, URL: url }
  });
  return created.objectId;
};
